document.addEventListener('DOMContentLoaded', () => {
    const viewWeeklyButton = document.getElementById('view-weekly');
    const weeklyAnalyticsSection = document.getElementById('weekly-analytics');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    const weekRange = document.getElementById('weekly-range');
    const weeklyData = document.getElementById('weekly-data');

    let currentWeekStart = null;
    let currentWeekEnd = null;
    let meals = JSON.parse(localStorage.getItem('meals')) || [];

    const getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
            start: startOfWeek,
            end: endOfWeek
        };
    };

    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const renderWeeklyAnalytics = () => {
        if (currentWeekStart === null || currentWeekEnd === null) return;

        const weeklyMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= currentWeekStart && mealDate <= currentWeekEnd;
        });

        weekRange.textContent = `${formatDate(currentWeekStart)} - ${formatDate(currentWeekEnd)}`;

        weeklyData.innerHTML = `
            <p>Total Meals Logged: ${weeklyMeals.length}</p>
            <ul>
                ${weeklyMeals.map(meal => `<li>${meal.food} - ${meal.portion} - ${meal.date}</li>`).join('')}
            </ul>
        `;
    };

    const changeWeek = (direction) => {
        const newStartDate = new Date(currentWeekStart);
        newStartDate.setDate(currentWeekStart.getDate() + (7 * direction));
        const newWeekRange = getWeekRange(newStartDate);

        currentWeekStart = newWeekRange.start;
        currentWeekEnd = newWeekRange.end;

        renderWeeklyAnalytics();
    };

    viewWeeklyButton.addEventListener('click', () => {
        const currentDate = new Date();
        const weekRange = getWeekRange(currentDate);

        currentWeekStart = weekRange.start;
        currentWeekEnd = weekRange.end;

        weeklyAnalyticsSection.classList.toggle('hidden');
        renderWeeklyAnalytics();
    });

    prevWeekButton.addEventListener('click', () => {
        changeWeek(-1);
    });

    nextWeekButton.addEventListener('click', () => {
        changeWeek(1);
    });
});