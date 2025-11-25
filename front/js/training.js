const API_URL = 'http://localhost:8000/api';

let currentExercise = null;
let exerciseData = {
    score: 0,
    correct: 0,
    incorrect: 0,
    reactionTimes: []
};

document.addEventListener('DOMContentLoaded', function() {
    const exerciseCards = document.querySelectorAll('.exercise-card');
    const modal = document.getElementById('exercise-modal');
    const closeModal = document.querySelector('.close-modal');
    
    exerciseCards.forEach(card => {
        const btn = card.querySelector('.start-exercise-btn');
        btn.addEventListener('click', () => {
            const exerciseType = card.dataset.exercise;
            startExercise(exerciseType);
        });
    });
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

function startExercise(exerciseType) {
    currentExercise = exerciseType;
    exerciseData = { score: 0, correct: 0, incorrect: 0, reactionTimes: [] };
    
    const modal = document.getElementById('exercise-modal');
    const content = document.getElementById('exercise-content');
    
    content.innerHTML = getExerciseHTML(exerciseType);
    modal.style.display = 'block';
    
    // Initialize exercise-specific logic
    initializeExercise(exerciseType);
}

function getExerciseHTML(exerciseType) {
    const exercises = {
        'distraction-1': {
            title: 'Упражнение 1: Отвлекающие стимулы',
            description: 'Нажимайте на стрелки, игнорируя отвлекающие элементы'
        },
        'distraction-2': {
            title: 'Упражнение 2: Фланкер',
            description: 'Определяйте направление центральной стрелки'
        },
        'distraction-3': {
            title: 'Упражнение 3: Струп-тест',
            description: 'Назовите цвет слова, игнорируя его значение'
        },
        'inhibition-1': {
            title: 'Упражнение 4: Go/No-Go',
            description: 'Реагируйте на зелёный, не реагируйте на красный'
        },
        'inhibition-2': {
            title: 'Упражнение 5: Переключение задач',
            description: 'Переключайтесь между правилами в зависимости от сигнала'
        },
        'inhibition-3': {
            title: 'Упражнение 6: Стоп-сигнал',
            description: 'Останавливайте реакцию при появлении стоп-сигнала'
        }
    };
    
    const ex = exercises[exerciseType];
    
    return `
        <h2>${ex.title}</h2>
        <p>${ex.description}</p>
        <div class="exercise-stats">
            <div>
                <div class="stat-label">Очки</div>
                <div class="stat-value" id="exercise-score">0</div>
            </div>
            <div>
                <div class="stat-label">Правильно</div>
                <div class="stat-value" id="exercise-correct">0</div>
            </div>
            <div>
                <div class="stat-label">Неправильно</div>
                <div class="stat-value" id="exercise-incorrect">0</div>
            </div>
        </div>
        <div class="exercise-area" id="exercise-area"></div>
        <div style="text-align: center; margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="closeExercise()">Завершить</button>
        </div>
    `;
}

function initializeExercise(exerciseType) {
    const area = document.getElementById('exercise-area');
    
    switch(exerciseType) {
        case 'distraction-1':
            initDistraction1(area);
            break;
        case 'distraction-2':
            initFlanker(area);
            break;
        case 'distraction-3':
            initStroop(area);
            break;
        case 'inhibition-1':
            initGoNoGo(area);
            break;
        case 'inhibition-2':
            initTaskSwitching(area);
            break;
        case 'inhibition-3':
            initStopSignal(area);
            break;
    }
}

// Exercise 1: Distraction with arrows
function initDistraction1(area) {
    let targetDirection = Math.random() > 0.5 ? 'left' : 'right';
    let startTime = Date.now();
    
    function showStimulus() {
        area.innerHTML = '';
        const stimulus = document.createElement('div');
        stimulus.style.fontSize = '4rem';
        stimulus.style.marginBottom = '1rem';
        
        const arrows = ['←', '→', '↑', '↓'];
        const distractors = arrows.filter(a => {
            if (targetDirection === 'left') return a !== '←';
            return a !== '→';
        });
        
        // Show target arrow
        const target = document.createElement('div');
        target.textContent = targetDirection === 'left' ? '←' : '→';
        target.style.color = 'blue';
        target.style.fontSize = '5rem';
        target.style.marginBottom = '1rem';
        area.appendChild(target);
        
        // Show distractors
        distractors.forEach(() => {
            const dist = document.createElement('span');
            dist.textContent = distractors[Math.floor(Math.random() * distractors.length)];
            dist.style.color = 'gray';
            dist.style.fontSize = '3rem';
            dist.style.margin = '0 0.5rem';
            area.appendChild(dist);
        });
        
        const buttons = document.createElement('div');
        buttons.style.marginTop = '2rem';
        
        const leftBtn = document.createElement('button');
        leftBtn.className = 'btn btn-primary';
        leftBtn.textContent = '← Влево';
        leftBtn.onclick = () => checkAnswer('left', Date.now() - startTime);
        
        const rightBtn = document.createElement('button');
        rightBtn.className = 'btn btn-primary';
        rightBtn.textContent = '→ Вправо';
        rightBtn.onclick = () => checkAnswer('right', Date.now() - startTime);
        
        buttons.appendChild(leftBtn);
        buttons.appendChild(rightBtn);
        area.appendChild(buttons);
        
        setTimeout(() => {
            if (area.contains(stimulus)) {
                showStimulus();
            }
        }, 3000);
    }
    
    function checkAnswer(answer, reactionTime) {
        const correct = answer === targetDirection;
        if (correct) {
            exerciseData.correct++;
            exerciseData.score += 10;
        } else {
            exerciseData.incorrect++;
        }
        exerciseData.reactionTimes.push(reactionTime);
        updateExerciseStats();
        
        targetDirection = Math.random() > 0.5 ? 'left' : 'right';
        startTime = Date.now();
        showStimulus();
    }
    
    showStimulus();
}

// Exercise 2: Flanker
function initFlanker(area) {
    let startTime = Date.now();
    
    function showStimulus() {
        area.innerHTML = '';
        const directions = ['←', '→'];
        const center = directions[Math.floor(Math.random() * 2)];
        const flankers = directions[Math.floor(Math.random() * 2)];
        
        const stimulus = document.createElement('div');
        stimulus.style.fontSize = '4rem';
        stimulus.textContent = `${flankers}${flankers}${center}${flankers}${flankers}`;
        stimulus.style.marginBottom = '2rem';
        area.appendChild(stimulus);
        
        const buttons = document.createElement('div');
        const leftBtn = document.createElement('button');
        leftBtn.className = 'btn btn-primary';
        leftBtn.textContent = '← Влево';
        leftBtn.onclick = () => checkAnswer('left', center, Date.now() - startTime);
        
        const rightBtn = document.createElement('button');
        rightBtn.className = 'btn btn-primary';
        rightBtn.textContent = '→ Вправо';
        rightBtn.onclick = () => checkAnswer('right', center, Date.now() - startTime);
        
        buttons.appendChild(leftBtn);
        buttons.appendChild(rightBtn);
        area.appendChild(buttons);
        
        setTimeout(() => {
            if (area.contains(stimulus)) {
                showStimulus();
            }
        }, 3000);
    }
    
    function checkAnswer(answer, center, reactionTime) {
        const correct = (answer === 'left' && center === '←') || (answer === 'right' && center === '→');
        if (correct) {
            exerciseData.correct++;
            exerciseData.score += 10;
        } else {
            exerciseData.incorrect++;
        }
        exerciseData.reactionTimes.push(reactionTime);
        updateExerciseStats();
        
        startTime = Date.now();
        showStimulus();
    }
    
    showStimulus();
}

// Exercise 3: Stroop Test
function initStroop(area) {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const colorNames = ['красный', 'синий', 'зелёный', 'жёлтый'];
    let startTime = Date.now();
    
    function showStimulus() {
        area.innerHTML = '';
        const wordColor = colors[Math.floor(Math.random() * colors.length)];
        const wordText = colorNames[Math.floor(Math.random() * colorNames.length)];
        
        const stimulus = document.createElement('div');
        stimulus.textContent = wordText;
        stimulus.style.color = wordColor;
        stimulus.style.fontSize = '4rem';
        stimulus.style.fontWeight = 'bold';
        stimulus.style.marginBottom = '2rem';
        area.appendChild(stimulus);
        
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.flexWrap = 'wrap';
        buttons.style.gap = '0.5rem';
        buttons.style.justifyContent = 'center';
        
        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = colorNames[colors.indexOf(color)];
            btn.style.backgroundColor = color;
            btn.onclick = () => checkAnswer(color, wordColor, Date.now() - startTime);
            buttons.appendChild(btn);
        });
        
        area.appendChild(buttons);
        
        setTimeout(() => {
            if (area.contains(stimulus)) {
                showStimulus();
            }
        }, 4000);
    }
    
    function checkAnswer(answer, correct, reactionTime) {
        const correctAnswer = answer === correct;
        if (correctAnswer) {
            exerciseData.correct++;
            exerciseData.score += 10;
        } else {
            exerciseData.incorrect++;
        }
        exerciseData.reactionTimes.push(reactionTime);
        updateExerciseStats();
        
        startTime = Date.now();
        showStimulus();
    }
    
    showStimulus();
}

// Exercise 4: Go/No-Go
function initGoNoGo(area) {
    let startTime = Date.now();
    
    function showStimulus() {
        area.innerHTML = '';
        const isGo = Math.random() > 0.3; // 70% Go, 30% No-Go
        
        const stimulus = document.createElement('div');
        stimulus.style.width = '200px';
        stimulus.style.height = '200px';
        stimulus.style.borderRadius = '50%';
        stimulus.style.backgroundColor = isGo ? 'green' : 'red';
        stimulus.style.margin = '0 auto 2rem';
        stimulus.style.cursor = 'pointer';
        area.appendChild(stimulus);
        
        const instruction = document.createElement('div');
        instruction.textContent = isGo ? 'Нажмите на зелёный!' : 'НЕ нажимайте на красный!';
        instruction.style.marginBottom = '1rem';
        instruction.style.fontSize = '1.5rem';
        instruction.style.fontWeight = 'bold';
        area.insertBefore(instruction, stimulus);
        
        if (isGo) {
            stimulus.onclick = () => {
                checkAnswer(true, true, Date.now() - startTime);
            };
        } else {
            setTimeout(() => {
                checkAnswer(false, false, Date.now() - startTime);
            }, 2000);
        }
        
        setTimeout(() => {
            if (area.contains(stimulus) && isGo) {
                checkAnswer(false, true, Date.now() - startTime);
            }
        }, 2000);
    }
    
    function checkAnswer(clicked, shouldClick, reactionTime) {
        const correct = clicked === shouldClick;
        if (correct) {
            exerciseData.correct++;
            exerciseData.score += shouldClick ? 10 : 15; // More points for No-Go
        } else {
            exerciseData.incorrect++;
        }
        if (clicked) {
            exerciseData.reactionTimes.push(reactionTime);
        }
        updateExerciseStats();
        
        startTime = Date.now();
        setTimeout(showStimulus, 500);
    }
    
    showStimulus();
}

// Exercise 5: Task Switching
function initTaskSwitching(area) {
    let currentRule = 'color'; // 'color' or 'shape'
    let startTime = Date.now();
    
    function showStimulus() {
        area.innerHTML = '';
        
        // Switch rule randomly
        if (Math.random() > 0.7) {
            currentRule = currentRule === 'color' ? 'shape' : 'color';
        }
        
        const instruction = document.createElement('div');
        instruction.textContent = `Правило: ${currentRule === 'color' ? 'Цвет' : 'Форма'}`;
        instruction.style.marginBottom = '1rem';
        instruction.style.fontSize = '1.5rem';
        instruction.style.fontWeight = 'bold';
        instruction.style.color = currentRule === 'color' ? 'blue' : 'green';
        area.appendChild(instruction);
        
        const shapes = ['🔴', '🔵', '🟢', '🟡'];
        const colors = ['red', 'blue', 'green', 'yellow'];
        const shapeIndex = Math.floor(Math.random() * shapes.length);
        const colorIndex = Math.floor(Math.random() * colors.length);
        
        const stimulus = document.createElement('div');
        stimulus.textContent = shapes[shapeIndex];
        stimulus.style.fontSize = '8rem';
        stimulus.style.marginBottom = '2rem';
        area.appendChild(stimulus);
        
        const buttons = document.createElement('div');
        buttons.style.display = 'flex';
        buttons.style.flexWrap = 'wrap';
        buttons.style.gap = '0.5rem';
        buttons.style.justifyContent = 'center';
        
        if (currentRule === 'color') {
            colors.forEach((color, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.textContent = color;
                btn.onclick = () => checkAnswer(color, colors[colorIndex], Date.now() - startTime);
                buttons.appendChild(btn);
            });
        } else {
            shapes.forEach((shape, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.textContent = shape;
                btn.onclick = () => checkAnswer(shape, shapes[shapeIndex], Date.now() - startTime);
                buttons.appendChild(btn);
            });
        }
        
        area.appendChild(buttons);
        
        setTimeout(() => {
            if (area.contains(stimulus)) {
                showStimulus();
            }
        }, 4000);
    }
    
    function checkAnswer(answer, correct, reactionTime) {
        const correctAnswer = answer === correct;
        if (correctAnswer) {
            exerciseData.correct++;
            exerciseData.score += 10;
        } else {
            exerciseData.incorrect++;
        }
        exerciseData.reactionTimes.push(reactionTime);
        updateExerciseStats();
        
        startTime = Date.now();
        showStimulus();
    }
    
    showStimulus();
}

// Exercise 6: Stop Signal
function initStopSignal(area) {
    let startTime = Date.now();
    let stopSignal = false;
    
    function showStimulus() {
        area.innerHTML = '';
        stopSignal = Math.random() > 0.7; // 30% stop signal
        
        const stimulus = document.createElement('div');
        stimulus.textContent = '→';
        stimulus.style.fontSize = '6rem';
        stimulus.style.marginBottom = '1rem';
        area.appendChild(stimulus);
        
        const instruction = document.createElement('div');
        instruction.textContent = 'Нажмите на стрелку, если не появится СТОП';
        instruction.style.marginBottom = '1rem';
        area.insertBefore(instruction, stimulus);
        
        const stopSignalDiv = document.createElement('div');
        stopSignalDiv.id = 'stop-signal';
        stopSignalDiv.textContent = 'СТОП!';
        stopSignalDiv.style.display = 'none';
        stopSignalDiv.style.color = 'red';
        stopSignalDiv.style.fontSize = '3rem';
        stopSignalDiv.style.fontWeight = 'bold';
        area.appendChild(stopSignalDiv);
        
        stimulus.onclick = () => {
            if (!stopSignal) {
                checkAnswer(true, false, Date.now() - startTime);
            } else {
                checkAnswer(false, true, Date.now() - startTime);
            }
        };
        
        if (stopSignal) {
            setTimeout(() => {
                stopSignalDiv.style.display = 'block';
                setTimeout(() => {
                    if (area.contains(stimulus)) {
                        checkAnswer(false, false, Date.now() - startTime);
                    }
                }, 500);
            }, Math.random() * 1000 + 500);
        } else {
            setTimeout(() => {
                if (area.contains(stimulus)) {
                    checkAnswer(false, false, Date.now() - startTime);
                }
            }, 2000);
        }
    }
    
    function checkAnswer(clicked, shouldStop, reactionTime) {
        const correct = (shouldStop && !clicked) || (!shouldStop && clicked);
        if (correct) {
            exerciseData.correct++;
            exerciseData.score += shouldStop ? 20 : 10;
        } else {
            exerciseData.incorrect++;
        }
        if (clicked && !shouldStop) {
            exerciseData.reactionTimes.push(reactionTime);
        }
        updateExerciseStats();
        
        startTime = Date.now();
        setTimeout(showStimulus, 1000);
    }
    
    showStimulus();
}

function updateExerciseStats() {
    document.getElementById('exercise-score').textContent = exerciseData.score;
    document.getElementById('exercise-correct').textContent = exerciseData.correct;
    document.getElementById('exercise-incorrect').textContent = exerciseData.incorrect;
}

function closeExercise() {
    if (exerciseData.correct + exerciseData.incorrect > 0) {
        saveExerciseResults();
    }
    document.getElementById('exercise-modal').style.display = 'none';
}

async function saveExerciseResults() {
    const avgReactionTime = exerciseData.reactionTimes.length > 0
        ? exerciseData.reactionTimes.reduce((a, b) => a + b, 0) / exerciseData.reactionTimes.length
        : 0;
    
    const accuracy = exerciseData.correct / (exerciseData.correct + exerciseData.incorrect) * 100;
    
    const data = {
        exercise_type: currentExercise,
        score: exerciseData.score,
        correct: exerciseData.correct,
        incorrect: exerciseData.incorrect,
        accuracy: accuracy,
        avg_reaction_time: avgReactionTime,
        reaction_times: exerciseData.reactionTimes,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_URL}/training`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Exercise results saved');
        } else {
            throw new Error('Ошибка при сохранении');
        }
    } catch (error) {
        console.error('Error saving exercise results:', error);
    }
}
