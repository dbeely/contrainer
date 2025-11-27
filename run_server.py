#!/usr/bin/env python
"""
Скрипт для запуска FastAPI сервера
"""
import uvicorn
import config

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.SERVER_HOST,
        port=config.SERVER_PORT,
        reload=config.SERVER_RELOAD
    )



