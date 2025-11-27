# Настройка переменных окружения

## Быстрый старт

1. Скопируйте файл `env.example` в `.env`:
   ```bash
   cp env.example .env
   ```

2. Откройте файл `.env` и заполните необходимые значения:
   ```bash
   nano .env
   # или
   notepad .env  # на Windows
   ```

3. Запустите сервер:
   ```bash
   python run_server.py
   ```

## Описание переменных

### Настройки сервера

- `SERVER_HOST` - IP адрес для прослушивания (по умолчанию: `0.0.0.0`)
- `SERVER_PORT` - Порт сервера (по умолчанию: `8000`)
- `SERVER_RELOAD` - Автоперезагрузка при изменении кода (по умолчанию: `True`)

### Настройки базы данных MySQL

- `DB_HOST` - Хост базы данных (по умолчанию: `localhost`)
- `DB_PORT` - Порт базы данных (по умолчанию: `3306`)
- `DB_USER` - Имя пользователя БД (по умолчанию: `root`)
- `DB_PASSWORD` - Пароль пользователя БД
- `DB_NAME` - Имя базы данных (по умолчанию: `contrainer_db`)

### API настройки

- `API_URL` - URL API для фронтенда (по умолчанию: `http://localhost:8000/api`)
  - Эта переменная автоматически передается во все JS файлы через HTML шаблоны
  - Для продакшена укажите полный URL вашего домена (например: `https://yourdomain.com/api`)

### Настройки окружения

- `ENVIRONMENT` - Окружение (`development` или `production`)
- `DEBUG` - Режим отладки (по умолчанию: `True`)

## Пример .env файла для продакшена

```env
# Настройки сервера
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
SERVER_RELOAD=False

# Настройки базы данных MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=contrainer_user
DB_PASSWORD=secure_password_here
DB_NAME=contrainer_db

# API URL
API_URL=https://yourdomain.com/api

# Настройки окружения
ENVIRONMENT=production
DEBUG=False
```

## Безопасность

⚠️ **Важно**: Файл `.env` содержит конфиденциальную информацию и не должен попадать в систему контроля версий (Git). Файл `.env` уже добавлен в `.gitignore`.

Используйте `env.example` как шаблон для других разработчиков, но без реальных паролей и секретов.

