from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Тренажёр Ингибиторного Контроля API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'inhibitory_control'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 3306))
}

# Pydantic models
class DiagnosticsRequest(BaseModel):
    type: str  # 'primary' or 'secondary'
    attempts: List[float]
    average_time: float
    timestamp: str

class TrainingRequest(BaseModel):
    exercise_type: str
    score: int
    correct: int
    incorrect: int
    accuracy: float
    avg_reaction_time: float
    reaction_times: List[float]
    timestamp: str

# Database connection helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise

# Initialize database tables
def init_db():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Create diagnostics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS diagnostics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(20) NOT NULL,
                attempts JSON NOT NULL,
                average_time FLOAT NOT NULL,
                timestamp DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create training table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS training (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exercise_type VARCHAR(50) NOT NULL,
                score INT NOT NULL,
                correct INT NOT NULL,
                incorrect INT NOT NULL,
                accuracy FLOAT NOT NULL,
                avg_reaction_time FLOAT NOT NULL,
                reaction_times JSON NOT NULL,
                timestamp DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        connection.commit()
        cursor.close()
        connection.close()
        print("Database initialized successfully")
    except Error as e:
        print(f"Error initializing database: {e}")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "Тренажёр Ингибиторного Контроля API"}

@app.post("/api/diagnostics")
async def create_diagnostics(data: DiagnosticsRequest):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        import json
        attempts_json = json.dumps(data.attempts)
        
        query = """
            INSERT INTO diagnostics (type, attempts, average_time, timestamp)
            VALUES (%s, %s, %s, %s)
        """
        values = (data.type, attempts_json, data.average_time, data.timestamp)
        
        cursor.execute(query, values)
        connection.commit()
        
        diagnostic_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return {"id": diagnostic_id, "message": "Diagnostics data saved successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/diagnostics")
async def get_diagnostics():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM diagnostics ORDER BY timestamp DESC"
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Parse JSON fields
        import json
        for result in results:
            result['attempts'] = json.loads(result['attempts'])
            result['timestamp'] = result['timestamp'].isoformat() if result['timestamp'] else None
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/training")
async def create_training(data: TrainingRequest):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        import json
        reaction_times_json = json.dumps(data.reaction_times)
        
        query = """
            INSERT INTO training (exercise_type, score, correct, incorrect, accuracy, 
                               avg_reaction_time, reaction_times, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (data.exercise_type, data.score, data.correct, data.incorrect,
                 data.accuracy, data.avg_reaction_time, reaction_times_json, data.timestamp)
        
        cursor.execute(query, values)
        connection.commit()
        
        training_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return {"id": training_id, "message": "Training data saved successfully"}
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/training")
async def get_training():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT * FROM training ORDER BY timestamp DESC"
        cursor.execute(query)
        results = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Parse JSON fields
        import json
        for result in results:
            result['reaction_times'] = json.loads(result['reaction_times'])
            result['timestamp'] = result['timestamp'].isoformat() if result['timestamp'] else None
        
        return results
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get diagnostics stats
        cursor.execute("""
            SELECT type, AVG(average_time) as avg_time, COUNT(*) as count
            FROM diagnostics
            GROUP BY type
        """)
        diagnostics_stats = cursor.fetchall()
        
        # Get training stats
        cursor.execute("""
            SELECT exercise_type, AVG(accuracy) as avg_accuracy, AVG(score) as avg_score, COUNT(*) as count
            FROM training
            GROUP BY exercise_type
        """)
        training_stats = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return {
            "diagnostics": diagnostics_stats,
            "training": training_stats
        }
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
