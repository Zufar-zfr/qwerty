document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Сохраняем токен
            localStorage.setItem('token', data.token);
            // Перенаправляем на панель управления
            window.location.href = '/doctor/dashboard';
        } else {
            alert(data.message || 'Ошибка при входе');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при входе');
    }
}); 