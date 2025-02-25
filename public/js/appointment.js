document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const form = document.getElementById('appointmentForm');

    // Установить минимальную дату как сегодня
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Обновление доступных временных слотов при выборе даты
    dateInput.addEventListener('change', async () => {
        try {
            const response = await fetch(`/api/appointments/available-slots?date=${dateInput.value}`);
            const availableSlots = await response.json();
            
            timeSelect.innerHTML = '<option value="">Выберите время</option>';
            availableSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка при получении доступных слотов:', error);
            alert('Ошибка при загрузке доступного времени');
        }
    });

    // Обработка отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const patientName = document.getElementById('patientName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();

        if (!patientName || !phoneNumber) {
            alert('Имя и номер телефона обязательны для заполнения');
            return;
        }

        const formData = {
            patientName,
            phoneNumber,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            comment: document.getElementById('comment').value.trim()
        };

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Запись успешно создана!');
                form.reset();
                dateInput.dispatchEvent(new Event('change')); // Обновить доступное время
            } else {
                alert(data.message || 'Ошибка при создании записи');
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            alert('Ошибка при создании записи');
        }
    });
}); 