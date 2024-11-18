document.addEventListener('DOMContentLoaded', () => {
    console.log('VitalBites app loaded!');

    const mainContent = document.querySelector('main');
    const welcomeMessage = document.createElement('p');
    welcomeMessage.textContent = 'Welcome to VitalBites! Start tracking your meals today';
    welcomeMessage.style.fontWeight = 'bold';
    mainContent.appendChild(welcomeMessage);

    const trackButton = document.createElement('button');
    trackButton.textContent = 'Track a Meal';
    trackButton.addEventListener('click', () => {
        alert('Meal tracking coming soon!');
    });
    mainContent.appendChild(trackButton);
});