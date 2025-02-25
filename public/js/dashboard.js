document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/doctor/login';
        return;
    }

    const dateSelect = document.getElementById('dateSelect');
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    
    const timeSlots = [
        '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    // Функция для блокировки времени
    const blockTime = async (date, time) => {
        try {
            const response = await fetch('/api/appointments/block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date, time })
            });

            if (response.ok) {
                loadAppointments(dateSelect.value);
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка при блокировке времени');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ошибка при блокировке времени');
        }
    };

    // Функция загрузки записей
    const loadAppointments = async (date) => {
        try {
            const response = await fetch(`/api/appointments/by-date?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/doctor/login';
                return;
            }

            const appointments = await response.json();
            
            // Очистить таблицу
            appointmentsTableBody.innerHTML = '';

            // Создать карту записей
            const appointmentMap = new Map(
                appointments.map(app => [app.time, app])
            );

            // Заполнить таблицу для всех временных слотов
            timeSlots.forEach(time => {
                const appointment = appointmentMap.get(time) || { time };
                const hasAppointment = Boolean(appointment.patientName);
                const row = document.createElement('tr');
                const isBlocked = Boolean(appointment.isBlocked);

                row.innerHTML = `
                    <td>${time}</td>
                    <td>${appointment.patientName || '-'}</td>
                    <td>${appointment.phoneNumber || '-'}</td>
                    <td>${appointment.comment || '-'}</td>
                    <td>
                        ${!hasAppointment && !isBlocked ? `
                            <button class="btn btn-warning"
                                    onclick="blockTime('${date}', '${time}')">
                                Заблокировать
                            </button>
                        ` : '-'}
                    </td>
                `;

                // Добавляем класс для заблокированных строк
                if (isBlocked) {
                    row.classList.add('blocked-time');
                }
                
                appointmentsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading appointments:', error);
            alert('Ошибка при загрузке записей');
        }
    };

    // Загрузить записи при изменении даты
    dateSelect.addEventListener('change', () => {
        loadAppointments(dateSelect.value);
    });

    // Установить сегодняшнюю дату и загрузить записи
    const today = new Date().toISOString().split('T')[0];
    dateSelect.value = today;
    loadAppointments(today);

    // Сделать функцию blockTime глобально доступной
    window.blockTime = blockTime;

    // Обработка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }
}); 