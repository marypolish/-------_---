document.addEventListener("DOMContentLoaded", function () {
  // Отримуємо всі необхідні дані з localStorage
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const groupId = localStorage.getItem("groupId");
  const departmentId = localStorage.getItem("departmentId");

  // Перевірка, чи є дані в localStorage
  if (!userRole || !userId) {
    console.error("Недостатньо даних для користувача");
    return;
  }

  // Відображення кнопок редагування/видалення
  if (userRole === "admin" || userRole === "teacher") {
    document.getElementById("edit-event-btn").style.display = "inline-block";
    document.getElementById("delete-event-btn").style.display = "inline-block";
  }

  // Формуємо параметри запиту для отримання подій
  const params = new URLSearchParams();
  params.append("userRole", userRole);
  params.append("userId", userId);

  if (groupId) params.append("groupId", groupId); // Для студентів
  if (departmentId) params.append("departmentId", departmentId); // Для викладачів

  // Оновлення поточного дня і часу
  function updateCurrentDateTime() {
    const currentDate = new Date();
    const day = currentDate.toLocaleDateString("uk-UA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const time = currentDate.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    document.getElementById("current-day").textContent = day;
    document.getElementById("current-time").textContent = time;
  }

  // Оновлюємо день і час кожну секунду
  setInterval(updateCurrentDateTime, 1000);

  // Виконання запиту для отримання подій
  fetch(`http://localhost:5500/api/events/user/events?${params.toString()}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      allEvents = data; // Зберігаємо події
      updateCalendar(); // Оновлюємо календар
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      document.getElementById("events-list").innerHTML =
        "<li>Помилка завантаження подій</li>";
    });

  // Календар з переключенням місяців
  const currentMonthDisplay = document.getElementById("current-month");
  const calendarGrid = document.getElementById("calendar-grid");
  const prevMonthButton = document.getElementById("prev-month");
  const nextMonthButton = document.getElementById("next-month");

  let currentMonth = new Date().getMonth(); // Поточний місяць (0-11)
  let currentYear = new Date().getFullYear(); // Поточний рік

  // Зберігаємо події на глобальному рівні для подальшого використання
  let allEvents = [];

  function updateCalendar() {
    // Очищаємо календар
    calendarGrid.innerHTML = "";
    currentMonthDisplay.textContent = `${getMonthName(
      currentMonth
    )} ${currentYear}`;

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const lastDayOfMonth = lastDateOfMonth.getDay();

    // Заповнення календаря днями місяця
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      const emptyCell = document.createElement("div");
      calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDateOfMonth.getDate(); day++) {
      const dayCell = document.createElement("div");
      dayCell.textContent = day;
      dayCell.classList.add("calendar-day");
      dayCell.addEventListener("click", () => handleDayClick(day));
      calendarGrid.appendChild(dayCell);

      // Фільтрація подій по даті для відображення в календарі
      const formattedDay = formatDate(currentYear, currentMonth, day);
      const dayEvents = allEvents.filter((event) =>
        event.date.startsWith(formattedDay)
      );
      if (dayEvents.length > 0) {
        dayCell.classList.add("has-events");
      }
    }

    // Заповнення порожніх клітинок у кінці місяця
    for (let i = lastDayOfMonth; i < 6; i++) {
      const emptyCell = document.createElement("div");
      calendarGrid.appendChild(emptyCell);
    }
  }

  function getMonthName(monthIndex) {
    const months = [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ];
    return months[monthIndex];
  }

  function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(day) {
    // Знімаємо підсвітку з усіх днів
    document.querySelectorAll(".calendar-day").forEach((cell) => {
      cell.classList.remove("selected");
    });

    // Встановлюємо підсвітку для вибраного дня
    const selectedCell = [...calendarGrid.children].find(
      (cell) => cell.textContent == day
    );
    selectedCell.classList.add("selected");

    // Отримання поточного року та місяця
    const selectedDate = formatDate(currentYear, currentMonth, day);

    document.getElementById("selected-date").textContent = selectedDate;

    // Фільтруємо події для вибраної дати
    const eventsForSelectedDate = allEvents.filter((event) =>
      event.date.startsWith(selectedDate)
    );
    displayEvents(eventsForSelectedDate); // Виводимо події для вибраної дати
  }

  prevMonthButton.addEventListener("click", () => {
    currentMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    if (currentMonth === 11) currentYear--;
    updateCalendar();
  });

  nextMonthButton.addEventListener("click", () => {
    currentMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    if (currentMonth === 0) currentYear++;
    updateCalendar();
  });

  function displayEvents(events) {
    const eventsList = document.getElementById("events-list");
    eventsList.innerHTML = ""; // Очищаємо список подій

    if (events.length === 0) {
      const noEventsMessage = document.createElement("li");
      noEventsMessage.textContent = "Немає подій на цей день";
      eventsList.appendChild(noEventsMessage);
    } else {
      events.forEach((event) => {
        const eventItem = document.createElement("li");
        // Виведення назви події, опису і локації
        eventItem.innerHTML = `
      <strong>${event.name}</strong><br>
      <span>${event.description}</span><br>
      <span><em>Локація: ${event.location}</em></span>
    `;
        eventsList.appendChild(eventItem);
      });
    }
  }

  // Обробка відкриття модального вікна
  const createEventBtn = document.getElementById("create-event-btn");
  const modal = document.getElementById("create-event-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");

  createEventBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Обробка створення події
  const createEventForm = document.getElementById("create-event-form");
  createEventForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Отримуємо дані з форми
    const name = document.getElementById("event-name").value;
    const description = document.getElementById("event-description").value;
    const date = document.getElementById("event-date").value;
    const location = document.getElementById("event-location").value;

    // Формуємо запит для створення події
    const params = new URLSearchParams();
    params.append("userRole", userRole);
    params.append("userId", userId);

    if (groupId) params.append("groupId", groupId); // Для студентів
    if (departmentId) params.append("departmentId", departmentId); // Для викладачів

    // Формуємо дані події
    const eventData = {
      name,
      description,
      date: date, // Додаємо дату події
      location,
      targetGroupId: groupId || null, // Для студентів
      targetDepartmentId: departmentId || null, // Для викладачів
    };

    // Відправляємо запит на сервер
    try {
      const response = await fetch(
        `http://localhost:5500/api/events/create?${params.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        throw new Error("Не вдалося створити подію");
      }

      const newEvent = await response.json();
      console.log("Подія створена:", newEvent);

      // Додаємо нову подію до списку подій
      allEvents.push(newEvent);

      // Закриваємо модальне вікно після успішного створення події
      modal.style.display = "none";

      // Оновлюємо календар
      updateCalendar();
    } catch (error) {
      console.error("Помилка при створенні події:", error);
    }

    updateCalendar(); // Оновлюємо календар після створення події
  });
});
