// Система авторизации
const Auth = {
    // Сохранение данных пользователя
    saveUser(firstName, lastName) {
        localStorage.setItem('user_firstName', firstName);
        localStorage.setItem('user_lastName', lastName);
        localStorage.setItem('user_loggedIn', 'true');
    },

    // Получение данных пользователя
    getUser() {
        if (localStorage.getItem('user_loggedIn') === 'true') {
            return {
                firstName: localStorage.getItem('user_firstName') || '',
                lastName: localStorage.getItem('user_lastName') || '',
                isLoggedIn: true
            };
        }
        return { firstName: '', lastName: '', isLoggedIn: false };
    },

    // Проверка авторизации
    isLoggedIn() {
        return localStorage.getItem('user_loggedIn') === 'true';
    },

    // Выход
    logout() {
        localStorage.removeItem('user_firstName');
        localStorage.removeItem('user_lastName');
        localStorage.removeItem('user_loggedIn');
    },

    // Полное имя пользователя
    getFullName() {
        const user = this.getUser();
        return `${user.firstName} ${user.lastName}`.trim();
    }
};

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Всегда обновляем отображение (кнопка авторизации или имя пользователя)
    updateUserDisplay();
});

function showAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h2>Авторизация</h2>
            <p>Пожалуйста, введите ваше имя и фамилию для сохранения результатов</p>
            <form id="auth-form">
                <div class="form-group">
                    <label for="first-name">Имя:</label>
                    <input type="text" id="first-name" required autocomplete="given-name">
                </div>
                <div class="form-group">
                    <label for="last-name">Фамилия:</label>
                    <input type="text" id="last-name" required autocomplete="family-name">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Войти</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('auth-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        
        if (firstName && lastName) {
            Auth.saveUser(firstName, lastName);
            modal.style.display = 'none';
            modal.remove();
            updateUserDisplay();
        }
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
}

function updateUserDisplay() {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;
    
    // Удаляем старое отображение если есть
    const oldDisplay = document.getElementById('user-display');
    if (oldDisplay) {
        oldDisplay.remove();
    }
    
    const user = Auth.getUser();
    const userDisplay = document.createElement('div');
    userDisplay.id = 'user-display';
    userDisplay.className = 'user-display';
    
    if (user.isLoggedIn) {
        // Показываем имя пользователя с возможностью выхода
        userDisplay.innerHTML = `
            <span class="user-name-display" style="color: #1e293b; padding: 0.5rem 1rem; border-radius: 8px; background-color: rgba(255, 255, 255, 0.4); cursor: pointer; transition: background-color 0.3s;">
                ${Auth.getFullName()}
            </span>
        `;
        userDisplay.querySelector('.user-name-display').addEventListener('click', showLogoutModal);
    } else {
        // Показываем кнопку авторизации
        userDisplay.innerHTML = `
            <button class="btn-auth" style="color: #1e293b; padding: 0.5rem 1.5rem; border-radius: 8px; background-color: rgba(255, 255, 255, 0.4); border: 2px solid rgba(255, 255, 255, 0.5); cursor: pointer; transition: all 0.3s; font-size: 1rem; font-weight: 600;">
                Авторизоваться
            </button>
        `;
        userDisplay.querySelector('.btn-auth').addEventListener('click', () => {
            showAuthModal();
        });
        userDisplay.querySelector('.btn-auth').addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        });
        userDisplay.querySelector('.btn-auth').addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        });
    }
    
    navContainer.appendChild(userDisplay);
}

function showLogoutModal() {
    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.className = 'auth-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h2>Выход</h2>
            <p>Вы действительно хотите выйти?</p>
            <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">Текущий пользователь: ${Auth.getFullName()}</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button id="logout-confirm" class="btn btn-primary" style="flex: 1;">Выйти</button>
                <button id="logout-cancel" class="btn btn-secondary" style="flex: 1;">Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('logout-confirm').addEventListener('click', function() {
        Auth.logout();
        modal.style.display = 'none';
        modal.remove();
        updateUserDisplay();
        // Перезагружаем страницу для обновления данных
        window.location.reload();
    });
    
    document.getElementById('logout-cancel').addEventListener('click', function() {
        modal.style.display = 'none';
        modal.remove();
    });
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
}
