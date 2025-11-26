from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/front", StaticFiles(directory="front"), name="static")
templates = Jinja2Templates(directory="front")

@app.get("/")
async def get_answers(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})

@app.get("/diagnostics")
async def get_answers(request: Request):
    return templates.TemplateResponse("diagnostics.html", context={"request": request})

@app.get("/re-diagnostics")
async def get_answers(request: Request):
    return templates.TemplateResponse("re-diagnostics.html", context={"request": request})

@app.get("/results")
async def get_answers(request: Request):
    return templates.TemplateResponse("results.html", context={"request": request})

@app.get("/training")
async def get_answers(request: Request):
    return templates.TemplateResponse("training.html", context={"request": request})

@app.get("/home")
async def get_answers(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})