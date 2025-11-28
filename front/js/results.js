// API_URL загружается из .env через window.API_URL в HTML шаблоне
const API_URL = window.API_URL || 'https://localhost/api';

let comparisonChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load comparison data only
    loadComparisonData();
});

async function loadComparisonData() {
    try {
        if (!Auth.isLoggedIn()) {
            document.getElementById('primary-avg').textContent = '-';
            document.getElementById('secondary-avg').textContent = '-';
            document.getElementById('improvement').textContent = '-';
            return;
        }
        
        const user = Auth.getUser();
        const response = await fetch(`${API_URL}/diagnostics`);
        const allData = await response.json();
        
        // Фильтруем данные по текущему пользователю
        const userData = allData.filter(item => 
            item.first_name === user.firstName && item.last_name === user.lastName
        );
        
        const primaryData = userData.filter(d => d.type === 'primary');
        const secondaryData = userData.filter(d => d.type === 'secondary');
        
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
