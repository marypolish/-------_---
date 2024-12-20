document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const departmentName = document.getElementById('departmentName').value;
    const groupName = document.getElementById('groupName').value;

    const response = await fetch('http://localhost:5500/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            email,
            password,
            role,
            departmentName,
            groupName
        }),
    });    

    const data = await response.json();

    if (response.ok) {
        alert('Користувач успішно зареєстрований');
        window.location.href = 'login.html'; // перенаправлення на сторінку входу
    } else {
        console.error(data.message || 'Помилка реєстрації');
        alert(data.message || 'Помилка реєстрації');
    }    
});
