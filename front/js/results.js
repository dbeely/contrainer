// API_URL загружается из .env через window.API_URL в HTML шаблоне
const API_URL = window.API_URL || 'https://contrainer.ru/api';

let comparisonChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load comparison data only
    loadComparisonData();
});

async function loadComparisonData() {
    try {
        const feedbackContainer = document.getElementById('feedback-container');

        if (!Auth.isLoggedIn()) {
            // ... (код скрытия элементов, если не залогинен) ...
             if(feedbackContainer) feedbackContainer.style.display = 'none';
            return;
        }

        const user = Auth.getUser();
        const response = await fetch(`${API_URL}/diagnostics`);
        const allData = await response.json();

        const userData = allData.filter(item =>
            item.first_name === user.firstName && item.last_name === user.lastName
        );

        const primaryData = userData.filter(d => d.type === 'primary');
        const secondaryData = userData.filter(d => d.type === 'secondary');

        if (primaryData.length === 0 || secondaryData.length === 0) {
            // ... (код обработки отсутствия данных) ...
            if(feedbackContainer) feedbackContainer.style.display = 'none';
            return;
        }

        const primaryAvg = primaryData.reduce((sum, d) => sum + d.average_time, 0) / primaryData.length;
        const secondaryAvg = secondaryData.reduce((sum, d) => sum + d.average_time, 0) / secondaryData.length;
        const improvement = ((primaryAvg - secondaryAvg) / primaryAvg * 100).toFixed(1);

        document.getElementById('primary-avg').textContent = primaryAvg.toFixed(2);
        document.getElementById('secondary-avg').textContent = secondaryAvg.toFixed(2);

        const improvementEl = document.getElementById('improvement');
        improvementEl.textContent = `${improvement > 0 ? '+' : ''}${improvement}%`;

        // Красим проценты: если стало лучше - зеленый, если хуже - оранжевый (не красный)
        improvementEl.style.color = improvement > 0 ? 'var(--success-color)' : 'var(--warning-color)';

        // --- ОБНОВЛЕННАЯ ЛОГИКА ОБРАТНОЙ СВЯЗИ ---
        if (feedbackContainer) {
            const titleEl = document.getElementById('feedback-title');
            const textEl = document.getElementById('feedback-text');
            const recEl = document.getElementById('feedback-recommendation');

            feedbackContainer.className = 'feedback-card'; // Сброс классов
            feedbackContainer.style.display = 'block';

            if (secondaryAvg < 30) {
                // < 30 сек: ПИК ВОЗМОЖНОСТЕЙ (Зеленый)
                feedbackContainer.classList.add('success');
                titleEl.textContent = 'Впечатляющий результат!';
                textEl.textContent = 'Ваш уровень концентрации и устойчивости к помехам просто великолепен. Вы демонстрируете пиковые возможности ингибиторного контроля.';
                recEl.innerHTML = '<strong>Совет:</strong> Вы в отличной форме! Периодически заходите в тренажер просто для удовольствия, чтобы поддерживать этот высокий уровень.';

            } else if (secondaryAvg >= 30 && secondaryAvg <= 60) {
                // 30-60 сек: НОРМА (Зеленый)
                feedbackContainer.classList.add('success');
                titleEl.textContent = 'Хороший стабильный результат';
                textEl.textContent = 'Ваши показатели находятся в пределах уверенной нормы. Вы справляетесь с задачами и умеете фильтровать лишнюю информацию.';
                recEl.innerHTML = '<strong>Совет:</strong> Чтобы навык не угасал со временем, попробуйте иногда решать по 1-2 таблицы Шульте в свободную минуту. Это поможет держать мозг в тонусе без лишних усилий.';

            } else {
                // > 60 сек: ЗОНА РОСТА (Желтый)
                feedbackContainer.classList.add('warning');
                titleEl.textContent = 'Есть пространство для развития';
                textEl.textContent = 'Сейчас отвлекающие факторы оказывают влияние на вашу концентрацию, но это легко исправить тренировками.';
                recEl.innerHTML = '<strong>Совет:</strong> Ингибиторный контроль работает как мышца. Попробуйте уделить тренировкам 10 минут пару раз в неделю, и вы очень быстро заметите, как время выполнения тестов начнет сокращаться.';
            }
        }
        // ------------------------------------------

        // Отрисовка графика (оставляем как было)
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
                        'rgba(168, 213, 226, 0.6)',
                        'rgba(245, 194, 209, 0.6)'
                    ],
                    borderColor: [
                        'rgba(168, 213, 226, 1)',
                        'rgba(245, 194, 209, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Время (секунды)' }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading comparison data:', error);
    }
}
