from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
import os

# --- 1. Конфигурация Базы Данных ---
load_dotenv()

# Формат: mysql+mysqlconnector://user:password@host/db_name
SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://schulte_user:6178@localhost/schulte_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- 2. Модель БД (SQLAlchemy) ---
class DiagnosticDB(Base):
    __tablename__ = "diagnostic_results"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    result_type = Column(String(20))
    attempts = Column(JSON)
    average_time = Column(Float)
    created_at = Column(DateTime)


# Создаем таблицу, если её нет
Base.metadata.create_all(bind=engine)


# --- 3. Схема данных (Pydantic) для валидации входящих JSON ---
class DiagnosticCreate(BaseModel):
    type: str  # 'primary' или 'secondary'
    first_name: str
    last_name: str
    attempts: List[float]
    average_time: float
    timestamp: Optional[str] = None


# --- 4. Настройка приложения FastAPI ---
app = FastAPI()

# Статические файлы (CSS, JS) и Шаблоны (HTML)
app.mount("/front", StaticFiles(directory="front"), name="static")
templates = Jinja2Templates(directory="front")

# CORS (на случай если фронт и бэк на разных портах)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- 5. API Эндпоинты (Логика данных) ---

@app.post("/api/diagnostics")
async def create_diagnostic(data: DiagnosticCreate, db: Session = Depends(get_db)):
    """
    Сохраняет результат диагностики (первичной или повторной).
    Принимает данные из diagnostics.js и re-diagnostics.js
    """
    # Обработка времени
    dt_obj = datetime.now()
    if data.timestamp:
        try:
            # Преобразуем ISO строку из JS в Python datetime
            dt_obj = datetime.fromisoformat(data.timestamp.replace('Z', '+00:00'))
        except ValueError:
            pass

    db_record = DiagnosticDB(
        first_name=data.first_name,
        last_name=data.last_name,
        result_type=data.type,
        attempts=data.attempts,  # Автоматически конвертируется в JSON
        average_time=data.average_time,
        created_at=dt_obj
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return {"status": "success", "id": db_record.id}


@app.get("/api/diagnostics")
async def get_diagnostics(db: Session = Depends(get_db)):
    """
    Отдает все результаты для построения графиков.
    Используется в results.js
    """
    results = db.query(DiagnosticDB).all()

    response_data = []
    for r in results:
        response_data.append({
            "type": r.result_type,
            "first_name": r.first_name,
            "last_name": r.last_name,
            "attempts": r.attempts,
            "average_time": r.average_time,
            "timestamp": r.created_at.isoformat() if r.created_at else None
        })
    return response_data


# --- 6. HTML Эндпоинты (Отображение страниц) ---

@app.get("/")
async def load_root(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    # Убедитесь, что файл существует по этому пути
    if os.path.exists("front/files/favicon.ico"):
        return FileResponse("front/files/favicon.ico")
    return ""


@app.get("/diagnostics")
async def load_diagnostics(request: Request):
    return templates.TemplateResponse("diagnostics.html", context={"request": request})


@app.get("/re-diagnostics")
async def load_rediagnostics(request: Request):
    return templates.TemplateResponse("re-diagnostics.html", context={"request": request})


@app.get("/results")
async def load_results(request: Request):
    return templates.TemplateResponse("results.html", context={"request": request})


@app.get("/home")
async def load_home(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})

@app.get("/training")
async def load_(request: Request):
    return templates.TemplateResponse("training.html", context={"request": request})