document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        initialView: 'dayGridMonth',
        locale: 'uk', // Локалізація
        events: async function (info, successCallback, failureCallback) {
            try {
                const response = await fetch(`/api/events?startDate=${info.startStr}&endDate=${info.endStr}`);
                const events = await response.json();
                successCallback(events.map(event => ({
                    id: event.id,
                    title: event.name,
                    start: event.date,
                    extendedProps: event, // Додаткова інформація
                })));
            } catch (error) {
                failureCallback(error);
            }
        },
        eventClick: function (info) {
            alert(`Подія: ${info.event.title}\nОпис: ${info.event.extendedProps.description}`);
        },
    });

    calendar.render();
});
