from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import mysql.connector

app = FastAPI()
from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="../front/style"), name="static")
templates = Jinja2Templates(directory="../front")

db_config = {
    'host': 'localhost',
    'user': 'your_mysql_user',
    'password': 'your_mysql_password',
    'database': 'your_database'
}

@app.get("/", response_class=HTMLResponse)
def read_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/register/", response_class=HTMLResponse)
def register(request: Request, login: str = Form(...), password: str = Form(...)):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("INSERT INTO users (login, password) VALUES (%s, %s)", (login, password))
        connection.commit()
        message = "Пользователь успешно зарегистрирован"
    except Exception as e:
        message = f"Ошибка при регистрации: {e}"
    finally:
        cursor.close()
        connection.close()
    return templates.TemplateResponse("register.html", {"request": request, "message": message})
