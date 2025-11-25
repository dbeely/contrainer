# Инструкция по деплою на сервер

## Подготовка к деплою

### 1. Backend (FastAPI)

#### На сервере Linux с systemd:

1. **Установите зависимости:**
```bash
pip3 install -r requirements.txt
```

2. **Создайте файл `.env` в папке `back/`:**
```env
DB_HOST=localhost
DB_NAME=inhibitory_control
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=3306
```

3. **Создайте systemd service файл `/etc/systemd/system/inhibitory-control.service`:**
```ini
[Unit]
Description=Inhibitory Control API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/contrainer/back
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 /path/to/contrainer/back/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Запустите сервис:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable inhibitory-control
sudo systemctl start inhibitory-control
```

#### С использованием Nginx:

Создайте конфигурацию `/etc/nginx/sites-available/inhibitory-control`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/inhibitory-control /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Frontend

#### Вариант 1: Статические файлы через Nginx

1. **Скопируйте папку `front/` на сервер:**
```bash
scp -r front/ user@server:/var/www/inhibitory-control/
```

2. **Создайте конфигурацию Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/inhibitory-control;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Обновите API_URL в JavaScript файлах:**
Замените `http://localhost:8000/api` на `https://your-domain.com/api` во всех файлах в `front/js/`:
- `diagnostics.js`
- `re-diagnostics.js`
- `training.js`
- `results.js`

#### Вариант 2: Использование CDN или хостинга

Загрузите файлы на любой статический хостинг (GitHub Pages, Netlify, Vercel) и обновите API_URL на адрес вашего backend сервера.

### 3. База данных MySQL

1. **Создайте базу данных:**
```sql
CREATE DATABASE inhibitory_control CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Создайте пользователя:**
```sql
CREATE USER 'ic_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON inhibitory_control.* TO 'ic_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Инициализируйте таблицы:**
```bash
python3 back/data_base.py
```

### 4. SSL сертификат (рекомендуется)

Используйте Let's Encrypt для получения бесплатного SSL сертификата:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Проверка работы

1. **Проверьте backend:**
```bash
curl http://localhost:8000/
curl http://localhost:8000/api/diagnostics
```

2. **Проверьте frontend:**
Откройте в браузере `http://your-domain.com`

3. **Проверьте логи:**
```bash
sudo journalctl -u inhibitory-control -f
```

## Обновление API_URL для продакшена

Создайте скрипт для автоматического обновления:

```bash
#!/bin/bash
# update_api_url.sh

API_URL="https://your-domain.com/api"
FRONTEND_DIR="/var/www/inhibitory-control/js"

sed -i "s|http://localhost:8000/api|${API_URL}|g" ${FRONTEND_DIR}/*.js
```

Или обновите вручную все файлы в `front/js/`:
- `diagnostics.js`
- `re-diagnostics.js`
- `training.js`
- `results.js`

Замените:
```javascript
const API_URL = 'http://localhost:8000/api';
```

На:
```javascript
const API_URL = 'https://your-domain.com/api';
```

## Мониторинг

### Логи приложения:
```bash
sudo journalctl -u inhibitory-control -n 100
```

### Логи Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Мониторинг базы данных:
```bash
mysql -u ic_user -p inhibitory_control
SHOW TABLES;
SELECT COUNT(*) FROM diagnostics;
SELECT COUNT(*) FROM training;
```

## Резервное копирование

### База данных:
```bash
mysqldump -u ic_user -p inhibitory_control > backup_$(date +%Y%m%d).sql
```

### Файлы приложения:
```bash
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/inhibitory-control /path/to/contrainer/back
```

## Безопасность

1. **Используйте сильные пароли для БД**
2. **Ограничьте доступ к MySQL только с localhost**
3. **Настройте firewall:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
4. **Регулярно обновляйте зависимости:**
```bash
pip3 install --upgrade -r requirements.txt
```
5. **Используйте HTTPS (SSL)**
6. **Настройте CORS в `back/main.py` для конкретных доменов вместо `"*"`**
