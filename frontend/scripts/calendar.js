const daysContainer = document.getElementById('daysContainer');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();

// Функція для оновлення календаря
function updateCalendar() {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    monthLabel.innerText = `${currentDate.toLocaleString('uk', { month: 'long' })} ${currentYear}`;

    // Очищаємо контейнер з днями
    daysContainer.innerHTML = '';

    // Знаходимо перший день місяця
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Знаходимо день тижня для першого дня місяця
    const firstDayOfWeek = firstDay.getDay(); // Понеділок - 1, Вівторок - 2 і т.д.
    const totalDaysInMonth = lastDay.getDate();

    // Створюємо порожні клітинки до першого дня
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
        const emptyCell = document.createElement('div');
        daysContainer.appendChild(emptyCell);
    }

    // Створюємо клітинки для всіх днів місяця
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerText = day;

        // Якщо сьогоднішній день, виділяємо жирним
        if (day === currentDate.getDate() && currentMonth === new Date().getMonth()) {
            dayElement.style.fontWeight = 'bold';
        }

        // Приклад: додаємо клас 'inactive' для днів, які належать до минулого або наступного місяця
        if (day < currentDate.getDate() && currentMonth === new Date().getMonth()) {
            dayElement.classList.add('inactive');
        }

        daysContainer.appendChild(dayElement);
    }
}

// Обробники подій для кнопок зміни місяця
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Ініціалізуємо календар
updateCalendar();
