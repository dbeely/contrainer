// Таблица Шульте - собственная реализация
class SchulteTable {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.size = 5;
        this.numbers = [];
        this.currentNumber = 1;
        this.startTime = null;
        this.timerInterval = null;
        this.isActive = false;
    }

    generateTable() {
        // Создаем массив чисел от 1 до 25
        this.numbers = Array.from({ length: this.size * this.size }, (_, i) => i + 1);
        
        // Перемешиваем для случайного расположения
        for (let i = this.numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
        }

        this.currentNumber = 1;
        this.render();
    }

    render() {
        // Сохраняем блок "Найдите:", если он существует
        const existingDisplay = this.container.querySelector('.current-number-display');
        
        // Очищаем контейнер, но сохраняем блок отображения
        const tableElement = this.container.querySelector('table');
        if (tableElement) {
            tableElement.remove();
        }
        
        const table = document.createElement('table');
        table.className = 'schulte-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.margin = '0 auto';
        table.style.maxWidth = '500px';
        table.style.flexShrink = '0';

        let index = 0;
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('td');
                const number = this.numbers[index];
                
                cell.textContent = number;
                cell.className = 'schulte-cell';
                cell.dataset.number = number;
                
                // Стили для ячейки
                cell.style.width = '20%';
                cell.style.height = '80px';
                cell.style.border = '2px solid #6366f1';
                cell.style.textAlign = 'center';
                cell.style.fontSize = '2rem';
                cell.style.fontWeight = 'bold';
                cell.style.cursor = 'pointer';
                cell.style.transition = 'background-color 0.3s, color 0.3s';
                cell.style.backgroundColor = '#ffffff';
                cell.style.color = '#1e293b';
                // Убеждаемся, что текст всегда виден
                cell.style.display = 'table-cell';
                cell.style.verticalAlign = 'middle';
                
                // Hover эффект - только легкое затемнение
                cell.onmouseenter = () => {
                    if (this.isActive) {
                        cell.style.backgroundColor = '#f1f5f9';
                    }
                };
                
                cell.onmouseleave = () => {
                    if (this.isActive) {
                        cell.style.backgroundColor = '#ffffff';
                        cell.style.color = '#1e293b';
                    }
                    cell.style.transform = 'scale(1)';
                };
                
                // Клик по ячейке
                cell.onclick = () => {
                    if (this.isActive && number === this.currentNumber) {
                        this.handleClick(number, cell);
                    }
                };
                
                row.appendChild(cell);
                index++;
            }
            table.appendChild(row);
        }

        // Вставляем таблицу после блока "Найдите:", если он есть
        if (existingDisplay) {
            existingDisplay.insertAdjacentElement('afterend', table);
        } else {
            this.container.appendChild(table);
        }
    }

    handleClick(number, cell) {
        if (number === this.currentNumber) {
            // Не подсвечиваем найденное число, просто переходим к следующему
            this.currentNumber++;
            
            // Если нашли все числа
            if (this.currentNumber > this.size * this.size) {
                this.complete();
            } else {
                // Обновляем отображение следующего числа
                this.highlightNext();
            }
        }
    }

    highlightNext() {
        const cells = this.container.querySelectorAll('.schulte-cell');
        cells.forEach(cell => {
            // Все числа остаются белыми, без подсветки
            cell.style.backgroundColor = '#ffffff';
            cell.style.color = '#1e293b';
        });
        
        // Обновляем отображение текущего числа внизу
        this.updateCurrentNumberDisplay();
    }
    
    updateCurrentNumberDisplay() {
        let display = this.container.querySelector('.current-number-display');
        if (!display) {
            display = document.createElement('div');
            display.className = 'current-number-display';
            display.style.cssText = `
                text-align: center;
                margin-top: 0;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background-color: rgba(255, 255, 255, 0.95);
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 300px;
                margin-left: auto;
                margin-right: auto;
                flex-shrink: 0;
                order: -1;
            `;
            // Вставляем блок в начало контейнера, перед таблицей
            this.container.insertBefore(display, this.container.firstChild);
        }
        if (display) {
            display.innerHTML = `
                <div style="font-size: 1.2rem; color: #64748b; margin-bottom: 0.5rem;">Найдите:</div>
                <div style="font-size: 4rem; color: #A8D5E2; font-weight: bold;">${this.currentNumber}</div>
            `;
        }
    }

    start() {
        this.isActive = true;
        this.currentNumber = 1;
        this.startTime = Date.now();
        // Сначала создаем блок "Найдите:", затем таблицу
        this.updateCurrentNumberDisplay();
        this.generateTable();
        // Обновляем отображение текущего числа
        this.highlightNext();
        this.startTimer();
    }

    startTimer() {
        const timerDisplay = document.getElementById('current-time');
        if (timerDisplay) {
            this.timerInterval = setInterval(() => {
                if (this.isActive && this.startTime) {
                    const elapsed = (Date.now() - this.startTime) / 1000;
                    timerDisplay.textContent = `${elapsed.toFixed(2)} сек`;
                }
            }, 10);
        }
    }

    stop() {
        this.isActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    complete() {
        this.stop();
        const elapsed = (Date.now() - this.startTime) / 1000;
        
        // Удаляем отображение текущего числа
        const display = this.container.querySelector('.current-number-display');
        if (display) {
            display.remove();
        }
        
        // Вызываем callback с результатом
        if (this.onComplete) {
            setTimeout(() => {
                this.onComplete(elapsed);
            }, 500);
        }
    }

    reset() {
        this.stop();
        this.currentNumber = 1;
        // Удаляем отображение текущего числа
        const display = this.container.querySelector('.current-number-display');
        if (display) {
            display.remove();
        }
        this.container.innerHTML = '';
    }
}
