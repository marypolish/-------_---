document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5500/api/login", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Зберігання айді користувача в локальному сховищі
      // Зберігання даних користувача в локальному сховищі
      localStorage.setItem("userRole", data.user.role); // Роль користувача
      localStorage.setItem("userId", data.user.id); // ID користувача
      localStorage.setItem("groupId", data.user.groupId || ""); // ID групи (тільки для студентів)
      localStorage.setItem("departmentId", data.user.departmentId || ""); // ID кафедри (тільки для викладачів)

      alert(`Успішний вхід! Ви увійшли як ${data.user.role}`);
      window.location.href = "calendar.html"; // перенаправлення на головну сторінку
    } else {
      alert(data.message || "Помилка входу");
    }
  });
});
