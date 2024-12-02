document.addEventListener('DOMContentLoaded', () => {
    const viewMonthlyButton = document.getElementById('view-monthly');
    const monthlyAnalyticsSection = document.getElementById('monthly-analytics');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const monthRange = document.getElementById('month-range');
    const monthlyData = document.getElementById('monthly-data');

    let currentMonthStart = null;
    let currentMonthEnd = null;
    let meals = JSON.parse(localStorage.getItem('meals')) || [];

    const getMonthRange = (date) => {
        const startOfMonth = new Date(date);
        startOfMonth.setDate(1);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);

        return {
            start: startOfMonth,
            end: endOfMonth
        };
    };

    const formatMonth = (date) => {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${month}/${year}`;
    };

    const renderMonthlyAnalytics = () => {
        if (currentMonthStart === null || currentMonthEnd === null) return;

        const monthlyMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= currentMonthStart && mealDate <= currentMonthEnd;
        });

        monthRange.textContent = formatMonth(currentMonthStart);

        monthlyData.innerHTML = `
            <p>Total Meals Logged: ${monthlyMeals.length}</p>
            <ul>
                ${monthlyMeals.map(meal => `<li>${meal.food} - ${meal.portion} - ${meal.date}</li>`).join('')}
            </ul>
        `;
    };

    const changeMonth = (direction) => {
        const newStartDate = new Date(currentMonthStart);
        newStartDate.setMonth(currentMonthStart.getMonth() + direction);
        const newMonthRange = getMonthRange(newStartDate);

        currentWeekStart = newMonthRange.start;
        currentWeekEnd = newMonthRange.end;

        renderMonthlyAnalytics();
    };

    viewMonthlyButton.addEventListener('click', () => {
        const currentDate = new Date();
        const monthRange = getMonthRange(currentDate);

        currentMonthStart = monthRange.start;
        currentMonthEnd = monthRange.end;

        monthlyAnalyticsSection.classList.toggle('hidden');
        renderMonthlyAnalytics();
    });

    prevMonthButton.addEventListener('click', () => {
        changeMonth(-1);
    });

    nextMonthButton.addEventListener('click', () => {
        changeMonth(1);
    });

});