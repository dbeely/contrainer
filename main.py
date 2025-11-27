from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import config

# Загружаем переменные окружения
load_dotenv()

app = FastAPI(
    title="Тренажёр Ингибиторного Контроля",
    debug=config.DEBUG
)
app.mount("/front", StaticFiles(directory="front"), name="static")
templates = Jinja2Templates(directory="front")

def get_template_context(request: Request):
    """Возвращает общий контекст для всех шаблонов"""
    return {
        "request": request,
        "api_url": config.API_URL
    }

@app.get("/")
async def get_answers(request: Request):
    return templates.TemplateResponse("index.html", context=get_template_context(request))

@app.get("/diagnostics")
async def get_answers(request: Request):
    return templates.TemplateResponse("diagnostics.html", context=get_template_context(request))

@app.get("/re-diagnostics")
async def get_answers(request: Request):
    return templates.TemplateResponse("re-diagnostics.html", context=get_template_context(request))

@app.get("/results")
async def get_answers(request: Request):
    return templates.TemplateResponse("results.html", context=get_template_context(request))

@app.get("/training")
async def get_answers(request: Request):
    return templates.TemplateResponse("training.html", context=get_template_context(request))

@app.get("/home")
async def get_answers(request: Request):
    return templates.TemplateResponse("index.html", context=get_template_context(request))