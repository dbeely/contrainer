const API_URL = 'http://localhost:8000/api';

let diagnosticsChart = null;
let trainingChart = null;
let comparisonChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Load data
    loadDiagnosticsData();
    loadTrainingData();
    loadComparisonData();
});

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Initialize charts when tab is opened
    if (tabName === 'diagnostics' && !diagnosticsChart) {
        loadDiagnosticsData();
    } else if (tabName === 'training' && !trainingChart) {
        loadTrainingData();
    } else if (tabName === 'comparison' && !comparisonChart) {
        loadComparisonData();
    }
}

async function loadDiagnosticsData() {
    try {
        const response = await fetch(`${API_URL}/diagnostics`);
        const data = await response.json();
        
        if (data.length === 0) {
            document.getElementById('diagnostics-table-body').innerHTML = 
                '<tr><td colspan="6" class="no-data">Нет данных</td></tr>';
            return;
        }
        
        // Update table
        const tbody = document.getElementById('diagnostics-table-body');
        tbody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(item.timestamp).toLocaleDateString('ru-RU')}</td>
                <td>${item.type === 'primary' ? 'Первичная' : 'Повторная'}</td>
                <td>${item.attempts[0]?.toFixed(2) || '-'} сек</td>
                <td>${item.attempts[1]?.toFixed(2) || '-'} сек</td>
                <td>${item.attempts[2]?.toFixed(2) || '-'} сек</td>
                <td>${item.average_time.toFixed(2)} сек</td>
            `;
            tbody.appendChild(row);
        });
        
        // Create chart
        const ctx = document.getElementById('diagnostics-chart').getContext('2d');
        if (diagnosticsChart) {
            diagnosticsChart.destroy();
        }
        
        const primaryData = data.filter(d => d.type === 'primary');
        const secondaryData = data.filter(d => d.type === 'secondary');
        
        diagnosticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((d, i) => `Тест ${i + 1}`),
                datasets: [
                    {
                        label: 'Первичная диагностика',
                        data: primaryData.map(d => d.average_time),
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Повторная диагностика',
                        data: secondaryData.map(d => d.average_time),
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Время (секунды)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading diagnostics data:', error);
        document.getElementById('diagnostics-table-body').innerHTML = 
            '<tr><td colspan="6" class="no-data">Ошибка загрузки данных</td></tr>';
    }
}

async function loadTrainingData() {
    try {
        const response = await fetch(`${API_URL}/training`);
        const data = await response.json();
        
        if (data.length === 0) {
            document.getElementById('training-table-body').innerHTML = 
                '<tr><td colspan="6" class="no-data">Нет данных</td></tr>';
            return;
        }
        
        // Update table
        const tbody = document.getElementById('training-table-body');
        tbody.innerHTML = '';
        
        const exerciseNames = {
            'distraction-1': 'Отвлекающие стимулы',
            'distraction-2': 'Фланкер',
            'distraction-3': 'Струп-тест',
            'inhibition-1': 'Go/No-Go',
            'inhibition-2': 'Переключение задач',
            'inhibition-3': 'Стоп-сигнал'
        };
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(item.timestamp).toLocaleDateString('ru-RU')}</td>
                <td>${exerciseNames[item.exercise_type] || item.exercise_type}</td>
                <td>${item.exercise_type.startsWith('distraction') ? 'Отвлекающее' : 'Затормаживающее'}</td>
                <td>${item.accuracy.toFixed(1)}%</td>
                <td>${item.avg_reaction_time.toFixed(0)} мс</td>
                <td>${item.score}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Create chart
        const ctx = document.getElementById('training-chart').getContext('2d');
        if (trainingChart) {
            trainingChart.destroy();
        }
        
        trainingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map((d, i) => `Упражнение ${i + 1}`),
                datasets: [
                    {
                        label: 'Точность (%)',
                        data: data.map(d => d.accuracy),
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1
                    },
                    {
                        label: 'Очки',
                        data: data.map(d => d.score),
                        backgroundColor: 'rgba(139, 92, 246, 0.5)',
                        borderColor: 'rgb(139, 92, 246)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Точность (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Очки'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading training data:', error);
        document.getElementById('training-table-body').innerHTML = 
            '<tr><td colspan="6" class="no-data">Ошибка загрузки данных</td></tr>';
    }
}

async function loadComparisonData() {
    try {
        const response = await fetch(`${API_URL}/diagnostics`);
        const data = await response.json();
        
        const primaryData = data.filter(d => d.type === 'primary');
        const secondaryData = data.filter(d => d.type === 'secondary');
        
        if (primaryData.length === 0 || secondaryData.length === 0) {
            document.getElementById('primary-avg').textContent = '-';
            document.getElementById('secondary-avg').textContent = '-';
            document.getElementById('improvement').textContent = '-';
            return;
        }
        
        const primaryAvg = primaryData.reduce((sum, d) => sum + d.average_time, 0) / primaryData.length;
        const secondaryAvg = secondaryData.reduce((sum, d) => sum + d.average_time, 0) / secondaryData.length;
        const improvement = ((primaryAvg - secondaryAvg) / primaryAvg * 100).toFixed(1);
        
        document.getElementById('primary-avg').textContent = primaryAvg.toFixed(2);
        document.getElementById('secondary-avg').textContent = secondaryAvg.toFixed(2);
        document.getElementById('improvement').textContent = `${improvement}%`;
        
        // Create comparison chart
        const ctx = document.getElementById('comparison-chart').getContext('2d');
        if (comparisonChart) {
            comparisonChart.destroy();
        }
        
        comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Первичная диагностика', 'Повторная диагностика'],
                datasets: [{
                    label: 'Среднее время (сек)',
                    data: [primaryAvg, secondaryAvg],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.5)',
                        'rgba(139, 92, 246, 0.5)'
                    ],
                    borderColor: [
                        'rgb(99, 102, 241)',
                        'rgb(139, 92, 246)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Время (секунды)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading comparison data:', error);
    }
}
