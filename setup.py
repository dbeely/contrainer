"""
Скрипт для первоначальной настройки проекта
"""
import os
import subprocess
import sys

def install_requirements():
    """Установка зависимостей Python"""
    print("Установка зависимостей Python...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Зависимости установлены успешно")
    except subprocess.CalledProcessError:
        print("✗ Ошибка при установке зависимостей")
        return False
    return True

def create_env_file():
    """Создание файла .env если его нет"""
    env_path = os.path.join("back", ".env")
    if os.path.exists(env_path):
        print("✓ Файл .env уже существует")
        return True
    
    print("\nСоздание файла .env...")
    print("Пожалуйста, укажите параметры подключения к базе данных:")
    
    db_host = input("DB_HOST [localhost]: ").strip() or "localhost"
    db_name = input("DB_NAME [inhibitory_control]: ").strip() or "inhibitory_control"
    db_user = input("DB_USER [root]: ").strip() or "root"
    db_password = input("DB_PASSWORD: ").strip()
    db_port = input("DB_PORT [3306]: ").strip() or "3306"
    
    env_content = f"""DB_HOST={db_host}
DB_NAME={db_name}
DB_USER={db_user}
DB_PASSWORD={db_password}
DB_PORT={db_port}
"""
    
    try:
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
        print(f"✓ Файл .env создан: {env_path}")
        return True
    except Exception as e:
        print(f"✗ Ошибка при создании файла .env: {e}")
        return False

def init_database():
    """Инициализация базы данных"""
    print("\nИнициализация базы данных...")
    try:
        from back.data_base import create_database, create_tables
        create_database()
        create_tables()
        print("✓ База данных инициализирована успешно")
        return True
    except Exception as e:
        print(f"✗ Ошибка при инициализации базы данных: {e}")
        print("Убедитесь, что MySQL запущен и параметры подключения корректны")
        return False

def main():
    print("=" * 50)
    print("Настройка проекта Тренажёр Ингибиторного Контроля")
    print("=" * 50)
    
    if not install_requirements():
        return
    
    if not create_env_file():
        return
    
    if not init_database():
        print("\nВы можете инициализировать базу данных позже, запустив:")
        print("python back/data_base.py")
        return
    
    print("\n" + "=" * 50)
    print("Настройка завершена!")
    print("=" * 50)
    print("\nДля запуска сервера выполните:")
    print("python run_server.py")
    print("\nИли:")
    print("cd back && python main.py")

if __name__ == "__main__":
    main()
