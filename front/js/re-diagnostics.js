const API_URL = 'http://localhost:8000/api';

let attempts = [];
let currentAttempt = 0;
let schulteTable = null;

document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    if (!Auth.isLoggedIn()) {
        showAuthModal();
    }
    
    const startBtn = document.getElementById('start-test-btn');
    const resetBtn = document.getElementById('reset-test-btn');
    const schulteContainer = document.getElementById('schulte-container');
    const videoContainer = document.getElementById('video-container');
    const resultsContainer = document.getElementById('results-container');
    const saveBtn = document.getElementById('save-results-btn');

    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    saveBtn.addEventListener('click', saveResults);
});

function startTest() {
    if (currentAttempt >= 3) {
        showResults();
        return;
    }

    if (!Auth.isLoggedIn()) {
        alert('Пожалуйста, авторизуйтесь для прохождения теста');
        showAuthModal();
        return;
    }

    currentAttempt++;
    document.getElementById('start-test-btn').style.display = 'none';
    document.getElementById('reset-test-btn').style.display = 'inline-block';
    document.getElementById('video-container').style.display = 'block';
    document.getElementById('schulte-container').style.display = 'block';
    document.getElementById('attempt-number').textContent = `${currentAttempt} / 3`;
    
    const schulteContainer = document.getElementById('schulte-container');
    schulteContainer.innerHTML = ''; // Очищаем контейнер
    
    // Создаем новую таблицу Шульте
    schulteTable = new SchulteTable(schulteContainer, (time) => {
        completeTest(time);
    });
    
    schulteTable.start();
}

function completeTest(time) {
    attempts.push(time);
    
    document.getElementById('start-test-btn').style.display = 'inline-block';
    document.getElementById('reset-test-btn').style.display = 'none';
    document.getElementById('video-container').style.display = 'none';
    document.getElementById('schulte-container').style.display = 'none';
    
    if (schulteTable) {
        schulteTable.reset();
    }
    
    // Обновление среднего результата
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    document.getElementById('average-time').textContent = `${average.toFixed(2)} сек`;
    
    if (currentAttempt >= 3) {
        showResults();
    } else {
        alert(`Попытка ${currentAttempt} завершена. Время: ${time.toFixed(2)} сек. Нажмите "Начать тест" для следующей попытки.`);
    }
}

function showResults() {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    
    attempts.forEach((attempt, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.style.padding = '0.5rem';
        resultItem.style.borderBottom = '1px solid #e2e8f0';
        resultItem.textContent = `Попытка ${index + 1}: ${attempt.toFixed(2)} сек`;
        resultsList.appendChild(resultItem);
    });
    
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    document.getElementById('final-average').textContent = `${average.toFixed(2)}`;
    
    document.getElementById('results-container').style.display = 'block';
}

function resetTest() {
    currentAttempt = 0;
    attempts = [];
    
    if (schulteTable) {
        schulteTable.reset();
        schulteTable = null;
    }
    
    document.getElementById('start-test-btn').style.display = 'inline-block';
    document.getElementById('reset-test-btn').style.display = 'none';
    document.getElementById('video-container').style.display = 'none';
    document.getElementById('schulte-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('attempt-number').textContent = '1 / 3';
    document.getElementById('current-time').textContent = '0.00 сек';
    document.getElementById('average-time').textContent = '-';
}

async function saveResults() {
    if (!Auth.isLoggedIn()) {
        alert('Пожалуйста, авторизуйтесь для сохранения результатов');
        showAuthModal();
        return;
    }
    
    const user = Auth.getUser();
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    
    const data = {
        type: 'secondary',
        first_name: user.firstName,
        last_name: user.lastName,
        attempts: attempts,
        average_time: average,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_URL}/diagnostics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Результаты успешно сохранены!');
        } else {
            throw new Error('Ошибка при сохранении');
        }
    } catch (error) {
        console.error('Error saving results:', error);
        alert('Ошибка при сохранении результатов. Проверьте подключение к серверу.');
    }
}