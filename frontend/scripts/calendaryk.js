document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logout-btn");

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

  // У разі необхідності, відобразити поля для адміністраторів
  if (userRole === "admin") {
    document.getElementById("admin-fields").style.display = "block";
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

  // Оновлений код із кнопкою редагування подій
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

    document.getElementById(
      "selected-date"
    ).textContent = `${day} ${getMonthName(currentMonth)} ${currentYear}`;

    // Фільтруємо події для вибраної дати
    const eventsForSelectedDate = allEvents.filter((event) =>
      event.date.startsWith(selectedDate)
    );
    displayEvents(eventsForSelectedDate); // Виводимо події для вибраної дати
  }

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
        eventItem.innerHTML = `
        <strong>${event.name}</strong><br>
        <span>${event.description}</span><br>
        <span><em>Локація: ${event.location}</em></span><br>
        <button class="edit-event-btn">Редагувати</button>
        <button class="delete-event-btn">Видалити</button>
      `;

        // Додаємо обробник події для кнопки "Редагувати"
        eventItem
          .querySelector(".edit-event-btn")
          .addEventListener("click", () => {
            selectedEvent = event; // Зберігаємо вибрану подію
            openEditModal(selectedEvent); // Відкриваємо модальне вікно
          });

        // Перевірка, чи є поточний користувач адміністратором
        if (userRole === "admin") {
          // Додаємо обробник події для кнопки "Видалити"
          eventItem
            .querySelector(".delete-event-btn")
            .addEventListener("click", () => {
              const confirmation = confirm(
                "Ви дійсно хочете видалити цю подію?"
              );
              if (confirmation) {
                selectedtoDEvent = event; // Зберігаємо вибрану подію
                deleteEvent(selectedtoDEvent); // Видаляємо подію за її ID
              }
            });
        } else {
          // Якщо не адмін, приховуємо кнопку "Видалити"
          eventItem.querySelector(".delete-event-btn").style.display = "none";
        }

        eventsList.appendChild(eventItem);
      });
    }
  }

  function openEditModal(event) {
    // Відкриваємо модальне вікно для редагування
    const editModal = document.getElementById("edit-event-modal");
    const editEventForm = document.getElementById("edit-event-form");

    // Заповнюємо поля форми даними події
    document.getElementById("edit-event-name").value = event.name;
    document.getElementById("edit-event-description").value = event.description;
    document.getElementById("edit-event-location").value = event.location;

    // Приховуємо поле дати (вже не потрібне для редагування)
    document.getElementById("edit-event-date").value = event.date; // Зберігаємо дату, але не надаємо її для редагування

    // Показуємо модальне вікно
    editModal.style.display = "block";

    // Видаляємо попередні обробники форми та кнопки скасування
    editEventForm.onsubmit = null;
    const cancelBtn = document.getElementById("cancel-edit-btn");
    cancelBtn.removeEventListener("click", closeEditModal); // Очистка попереднього обробника
    cancelBtn.addEventListener("click", closeEditModal); // Додаємо новий обробник

    // Обробляємо збереження змін
    editEventForm.onsubmit = async function (e) {
      e.preventDefault();

      // Оновлюємо дані події
      const updatedEvent = {
        name: document.getElementById("edit-event-name").value,
        description: document.getElementById("edit-event-description").value,
        location: document.getElementById("edit-event-location").value,
      };

      // Формуємо запит для оновлення події
      const params = new URLSearchParams();
      params.append("userRole", userRole);
      params.append("userId", userId);

      if (groupId) params.append("groupId", groupId); // Для студентів
      if (departmentId) params.append("departmentId", departmentId); // Для викладачів

      // Відправляємо запит для оновлення події на сервері
      try {
        const response = await fetch(
          `http://localhost:5500/api/events/update/${
            event.id
          }?${params.toString()}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedEvent), // Відправляємо тільки оновлені дані без дати
          }
        );

        if (!response.ok) {
          throw new Error("Не вдалося оновити подію");
        }
        // Додаємо оновлену подію в масив всіх подій
        const updatedEventIndex = allEvents.findIndex((e) => e.id === event.id);
        if (updatedEventIndex !== -1) {
          allEvents[updatedEventIndex] = {
            ...allEvents[updatedEventIndex],
            ...updatedEvent, // Обновлені дані
          };
        }

        // Оновлюємо календар
        updateCalendar();
        // Закриваємо модальне вікно
        closeEditModal();
      } catch (error) {
        console.error("Помилка оновлення події", error);
      }
    };
  }

  // Закриваємо модальне вікно
  function closeEditModal() {
    document.getElementById("edit-event-modal").style.display = "none";
  }

  // Кнопки перемикання між місяцями
  prevMonthButton.addEventListener("click", () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    updateCalendar();
  });

  nextMonthButton.addEventListener("click", () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    updateCalendar();
  });

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

    // Отримуємо додаткові дані для адміністраторів
    const groupId = document.getElementById("event-group-id").value;
    const departmentId = document.getElementById("event-department-id").value;

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

      // Оновлюємо календар після створення події
      allEvents.push(newEvent);
      updateCalendar();
      closeCreateEventModal(); // Закриваємо модальне вікно після створення
    } catch (error) {
      console.error("Помилка створення події", error);
    }
  });

  // Закриття модального вікна після створення події
  function closeCreateEventModal() {
    document.getElementById("create-event-modal").style.display = "none";
  }

  // Функція для видалення події
  async function deleteEvent(event) {
    // Формуємо запит для оновлення події
    const params = new URLSearchParams();
    params.append("userRole", userRole);
    params.append("userId", userId);

    // Формуємо запит для видалення події через API
    try {
      const response = await fetch(
        `http://localhost:5500/api/events/delete/${
          event.id
        }?${params.toString()}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Подію успішно видалено");
        updateCalendar(); // Оновлюємо список подій для поточної дати
      } else {
        alert(result.message || "Не вдалося видалити подію");
      }
    } catch (error) {
      console.error("Помилка:", error);
      alert("Сталася помилка при видаленні події");
    }
  }

  // Кнопка виходу з системи
  logoutButton.addEventListener("click", () => {
    const confirmLogout = confirm("Ви дійсно хочете вийти?");
    if (confirmLogout) {
      // Видалення даних з localStorage
      localStorage.clear(); // Очищаємо дані користувача з localStorage
      window.location.href = "/login.html"; // Перенаправляємо на сторінку входу
    }
  });

  // Початкове завантаження календаря
  updateCalendar();
});
