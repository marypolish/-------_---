const calendar = document.getElementById("calendar");
const eventModal = document.getElementById("event-modal");
const modalClose = document.getElementById("modal-close");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const calendarMonth = document.getElementById("calendar-month");
const eventDetails = document.getElementById("event-details");
const eventList = document.getElementById("event-list"); // список подій на вибрану дату
const createEventButton = document.getElementById("create-event-button");
const editEventButton = document.getElementById("edit-event-button");
const deleteEventButton = document.getElementById("delete-event-button");
const saveEventButton = document.getElementById("save-event");
const clockElement = document.getElementById("clock"); // елемент для часу

let selectedDate = null;
let selectedEventId = null;

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const events = {}; // Об'єкт для збереження подій

// Оновлення часу кожну секунду
const updateClock = () => {
    const now = new Date();
    const timeString = now.toLocaleString();
    clockElement.textContent = timeString;
};
setInterval(updateClock, 1000);

// Функція для відображення подій на вибраній даті
const showEventDetails = (date) => {
    selectedDate = date;
    const formattedDate = `${date.getDate()} ${date.toLocaleString('uk', { month: 'long' })} ${date.getFullYear()}`;

    eventDetails.innerHTML = `<strong>Дата:</strong> ${formattedDate}`;
    eventList.innerHTML = '';

    if (events[formattedDate]) {
        events[formattedDate].forEach(event => {
            const li = document.createElement("li");
            li.textContent = event.title;
            li.dataset.eventId = event.id; // додаємо id події як data-атрибут
            li.classList.remove('selected-event'); // прибираємо виділення зі всіх подій перед додаванням нового
            li.addEventListener('click', () => selectEvent(event.id, li));
            eventList.appendChild(li);
        });

        editEventButton.style.display = 'inline-block';
        deleteEventButton.style.display = 'inline-block';
    } else {
        eventList.innerHTML = "<li>Немає подій на цю дату</li>";
        editEventButton.style.display = 'none';
        deleteEventButton.style.display = 'none';
    }
};

// Вибір події
const selectEvent = (id, liElement) => {
    selectedEventId = id;

    // Всі елементи списку подій мають клас 'selected-event'
    const eventItems = eventList.querySelectorAll("li");
    eventItems.forEach(item => item.classList.remove('selected-event'));

    // Додаємо клас виділення до вибраної події
    liElement.classList.add('selected-event');

    const event = getEventById(id);
    if (event) {
        document.getElementById("event-id").value = event.id;
        document.getElementById("event-title").value = event.title;
        document.getElementById("event-time").value = event.time;
        document.getElementById("event-description").value = event.description;
    }
};

// Останнє знайдення події за ID
const getEventById = (id) => {
    for (let date in events) {
        const event = events[date].find(event => event.id === id);
        if (event) return event;
    }
    return null;
};

// Функція для створення або редагування події
const openEventModal = () => {
    if (!selectedDate) {
        alert("Будь ласка, виберіть дату перед створенням події.");
        return;
    }
    document.getElementById("event-id").value = '';
    document.getElementById("event-title").value = '';
    document.getElementById("event-time").value = '';
    document.getElementById("event-description").value = '';
    eventModal.style.display = 'flex';
};


// Закрити модальне вікно
const closeEventModal = () => {
    eventModal.style.display = 'none';
};

modalClose.addEventListener('click', closeEventModal);

// Функція для генерування календаря з індикатором дат з подіями
const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    calendarMonth.textContent = `${firstDay.toLocaleString('uk', { month: 'long' })} ${currentYear}`;

    let days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push('');
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    let rows = [];
    while (days.length) {
        rows.push(days.splice(0, 7));
    }

    const tbody = calendar.querySelector("tbody");
    tbody.innerHTML = '';

    rows.forEach((week) => {
        const tr = document.createElement("tr");
        week.forEach((day) => {
            const td = document.createElement("td");
            td.textContent = day;
            if (day) {
                const formattedDate = `${day} ${firstDay.toLocaleString('uk', { month: 'long' })} ${currentYear}`;
                // Якщо є події на цю дату, додаємо клас 'has-events'
                if (events[formattedDate] && events[formattedDate].length > 0) {
                    td.classList.add('has-events');
                }

                td.addEventListener('click', () => {
                    showEventDetails(new Date(currentYear, currentMonth, day));
                    highlightSelectedDate(td);
                });
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
};

// Виділення вибраної дати
const highlightSelectedDate = (selectedCell) => {
    const allCells = calendar.querySelectorAll("td");
    allCells.forEach(cell => cell.classList.remove('selected'));
    selectedCell.classList.add('selected');
};

// Генерація календаря
generateCalendar();

// Перехід до попереднього місяця
prevMonthButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
});

// Перехід до наступного місяця
nextMonthButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
});

// Додавання нової події
createEventButton.addEventListener('click', () => {
    openEventModal(selectedDate);
});

// Збереження події
saveEventButton.addEventListener('click', () => {
    const title = document.getElementById("event-title").value;
    const time = document.getElementById("event-time").value;
    const description = document.getElementById("event-description").value;
    const eventId = document.getElementById("event-id").value; // Отримуємо id події

    if (title && time) {
        const formattedDate = `${selectedDate.getDate()} ${selectedDate.toLocaleString('uk', { month: 'long' })} ${selectedDate.getFullYear()}`;

        if (eventId) {
            // Якщо eventId є, то редагуємо подію
            const event = getEventById(eventId);
            if (event) {
                event.title = title;
                event.time = time;
                event.description = description;
            }
        } else {
            // Якщо eventId немає, то додаємо нову подію
            const newEvent = {
                id: new Date().getTime(),
                title: title,
                time: time,
                description: description,
            };

            if (!events[formattedDate]) {
                events[formattedDate] = [];
            }

            events[formattedDate].push(newEvent);
        }

        showEventDetails(selectedDate); // Оновлюємо список подій після збереження
        highlightSelectedDate(calendar.querySelector(`td.selected`)); // Залишаємо виділення на вибраній даті
        closeEventModal();
    }
});

// Видалення події з попередженням
deleteEventButton.addEventListener('click', () => {
    if (selectedEventId) {
        const confirmation = confirm("Ви дійсно хочете видалити цю подію?");
        if (confirmation) {
            const formattedDate = `${selectedDate.getDate()} ${selectedDate.toLocaleString('uk', { month: 'long' })} ${selectedDate.getFullYear()}`;
            events[formattedDate] = events[formattedDate].filter(event => event.id !== selectedEventId);
            
            if (events[formattedDate].length === 0) {
                delete events[formattedDate];
            }

            showEventDetails(selectedDate);
            highlightSelectedDate(calendar.querySelector(`td.selected`));
            closeEventModal();
        }
    } else {
        alert("Будь ласка, виберіть подію для видалення.");
    }
});

// Редагування події
editEventButton.addEventListener('click', () => {
    if (selectedEventId) {
        const event = getEventById(selectedEventId);
        if (event) {
            document.getElementById("event-id").value = event.id;
            document.getElementById("event-title").value = event.title;
            document.getElementById("event-time").value = event.time;
            document.getElementById("event-description").value = event.description;
            eventModal.style.display = 'flex';
        }
    }
});

// Генерація календаря
generateCalendar();