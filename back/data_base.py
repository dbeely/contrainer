"""
Database initialization script
Creates database and tables if they don't exist
"""
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'port': int(os.getenv('DB_PORT', 3306))
}

DB_NAME = os.getenv('DB_NAME', 'inhibitory_control')

def create_database():
    """Create database if it doesn't exist"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists")
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"Error creating database: {e}")

def create_tables():
    """Create tables in the database"""
    try:
        config = DB_CONFIG.copy()
        config['database'] = DB_NAME
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Create diagnostics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS diagnostics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(20) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
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
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
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
        
        # Добавляем колонки если таблицы уже существуют
        try:
            cursor.execute("ALTER TABLE diagnostics ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT ''")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE diagnostics ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT ''")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE training ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT ''")
        except:
            pass
        try:
            cursor.execute("ALTER TABLE training ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT ''")
        except:
            pass
        
        connection.commit()
        cursor.close()
        connection.close()
        print("Tables created successfully")
    except Error as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    create_database()
    create_tables()
    print("Database setup complete!")
