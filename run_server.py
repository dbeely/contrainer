#!/usr/bin/env python
"""
Скрипт для запуска FastAPI сервера
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "back.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

