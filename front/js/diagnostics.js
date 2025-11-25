const API_URL = 'http://localhost:8000/api';

let attempts = [];
let currentAttempt = 0;
let startTime = null;
let testInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-test-btn');
    const resetBtn = document.getElementById('reset-test-btn');
    const schulteContainer = document.getElementById('schulte-container');
    const resultsContainer = document.getElementById('results-container');
    const saveBtn = document.getElementById('save-results-btn');

    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    saveBtn.addEventListener('click', saveResults);

    // Listen for messages from iframe (if the Schulte table supports it)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'schulte-complete') {
            completeTest(event.data.time);
        }
    });
});

function startTest() {
    if (currentAttempt >= 3) {
        showResults();
        return;
    }

    currentAttempt++;
    startTime = Date.now();
    
    document.getElementById('start-test-btn').style.display = 'none';
    document.getElementById('reset-test-btn').style.display = 'inline-block';
    document.getElementById('schulte-container').style.display = 'block';
    document.getElementById('attempt-number').textContent = `${currentAttempt} / 3`;
    
    // Start timer
    testInterval = setInterval(updateTimer, 100);
    
    // Show manual completion button
    const schulteContainer = document.getElementById('schulte-container');
    if (!schulteContainer.querySelector('.manual-complete-btn')) {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-success manual-complete-btn';
        completeBtn.textContent = 'Завершить тест';
        completeBtn.style.marginTop = '1rem';
        completeBtn.onclick = () => {
            const time = (Date.now() - startTime) / 1000;
            completeTest(time);
        };
        schulteContainer.appendChild(completeBtn);
    }
}

function updateTimer() {
    if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        document.getElementById('current-time').textContent = `${elapsed.toFixed(2)} сек`;
    }
}

function completeTest(time) {
    clearInterval(testInterval);
    attempts.push(time);
    
    document.getElementById('start-test-btn').style.display = 'inline-block';
    document.getElementById('reset-test-btn').style.display = 'none';
    document.getElementById('schulte-container').style.display = 'none';
    
    // Remove manual complete button
    const completeBtn = document.querySelector('.manual-complete-btn');
    if (completeBtn) {
        completeBtn.remove();
    }
    
    // Update average
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
    clearInterval(testInterval);
    currentAttempt = 0;
    attempts = [];
    startTime = null;
    
    document.getElementById('start-test-btn').style.display = 'inline-block';
    document.getElementById('reset-test-btn').style.display = 'none';
    document.getElementById('schulte-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('attempt-number').textContent = '1 / 3';
    document.getElementById('current-time').textContent = '0.00 сек';
    document.getElementById('average-time').textContent = '-';
    
    const completeBtn = document.querySelector('.manual-complete-btn');
    if (completeBtn) {
        completeBtn.remove();
    }
}

async function saveResults() {
    const average = attempts.reduce((a, b) => a + b, 0) / attempts.length;
    
    const data = {
        type: 'primary',
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
