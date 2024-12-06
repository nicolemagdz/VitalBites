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

    const renderWeeklyAnalytics = async () => {
        if (currentWeekStart === null || currentWeekEnd === null) return;

        // Filter meals based on the current week range
        const weeklyMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= currentWeekStart && mealDate <= currentWeekEnd;
        });

        // If no meals are logged for this week, render the default table
        if (weeklyMeals.length === 0) {
            weekRange.textContent = `${formatDate(currentWeekStart)} - ${formatDate(currentWeekEnd)}`;
            weeklyData.innerHTML = `
                <div id="left-column">
                    <p>Total Meals Logged: 0</p>
                    <ul>
                        <li>No meals logged for this week.</li>
                    </ul>
                </div>
                <div class="right-column">
                    <h2>Nutritional Summary:</h2>
                    <table class="nutrition-table">
                        <tr><th>Nutrient</th><th>Value</th></tr>
                        <tr><td>Total Calories</td><td>0 kcal</td></tr>
                        <tr><td>Total Fat</td><td>0 g</td></tr>
                        <tr><td>Saturated Fat</td><td>0 g</td></tr>
                        <tr><td>Trans Fat</td><td>0 g</td></tr>
                        <tr><td>Cholesterol</td><td>0 mg</td></tr>
                        <tr><td>Sodium</td><td>0 mg</td></tr>
                        <tr><td>Total Carbohydrates</td><td>0 g</td></tr>
                        <tr><td>Dietary Fiber</td><td>0 g</td></tr>
                        <tr><td>Total Sugars</td><td>0 g</td></tr>
                        <tr><td>Protein</td><td>0 g</td></tr>
                    </table>
                    <h4>Rich Vitamins:</h4>
                    <p>Insufficient data for rich vitamins.</p>
                    <h4>Rich Minerals:</h4>
                    <p>Insufficient data for rich minerals.</p>
                </div>
            `;
            return;
        }

        weekRange.textContent = `${formatDate(currentWeekStart)} - ${formatDate(currentWeekEnd)}`;

        const leftColumnHTML = `
            <div id="left-column">
                <p>Total Meals Logged: ${weeklyMeals.length}</p>
                <ul>
                    ${weeklyMeals.map(meal => `<li>${meal.food} - ${meal.portion} - ${meal.date}</li>`).join('')}
                </ul>
            </div>
        `;

        let rightColumnHTML = `
            <div class="right-column">
                <h2>Nutritional Summary:</h2>
                <table class="nutrition-table">
                    <tr><td>Total Calories</td><td>0 kcal</td></tr>
                    <tr><td>Total Fat</td><td>0 g</td></tr>
                    <tr><td>Saturated Fat</td><td>0 g</td></tr>
                    <tr><td>Trans Fat</td><td>0 g</td></tr>
                    <tr><td>Cholesterol</td><td>0 mg</td></tr>
                    <tr><td>Sodium</td><td>0 mg</td></tr>
                    <tr><td>Total Carbohydrates</td><td>0 g</td></tr>
                    <tr><td>Dietary Fiber</td><td>0 g</td></tr>
                    <tr><td>Total Sugars</td><td>0 g</td></tr>
                    <tr><td>Protein</td><td>0 g</td></tr>
                </table>
                <h4>Rich Vitamins:</h4>
                <p>Insufficient data for rich vitamins.</p>
                <h4>Rich Minerals:</h4>
                <p>Insufficient data for rich minerals.</p>
            </div>
        `;

        const foodDetails = weeklyMeals.map(meal => meal.food).join(',');
        try {
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodDetails}&api_key=FtBPJ1szonFLDYUrYeDhFkE2RGOlrQEQzHdJdohg`);
            const data = await response.json();

            if (data.foods) {
                let totalCalories = 0;
                let totalFat = 0;
                let totalSaturatedFat = 0;
                let totalTransFat = 0;
                let totalCholesterol = 0;
                let totalSodium = 0;
                let totalCarbs = 0;
                let totalFiber = 0;
                let totalSugar = 0;
                let totalProtein = 0;
                let vitamins = [];
                let minerals = [];

                data.foods.forEach(food => {
                    food.foodNutrients.forEach(nutrient => {
                        switch (nutrient.nutrientName) {
                            case 'Energy':
                                totalCalories += nutrient.value;
                                break;
                            case 'Total Fat':
                                totalFat += nutrient.value;
                                break;
                            case 'Saturated Fatty Acids':
                                totalSaturatedFat += nutrient.value;
                                break;
                            case 'Trans Fatty Acids':
                                totalTransFat += nutrient.value;
                                break;
                            case 'Cholesterol':
                                totalCholesterol += nutrient.value;
                                break;
                            case 'Sodium':
                                totalSodium += nutrient.value;
                                break;
                            case 'Total Carbohydrate':
                                totalCarbs += nutrient.value;
                                break;
                            case 'Dietary Fiber':
                                totalFiber += nutrient.value;
                                break;
                            case 'Total Sugars':
                                totalSugar += nutrient.value;
                                break;
                            case 'Protein':
                                totalProtein += nutrient.value;
                                break;
                            case 'Vitamin A':
                            case 'Vitamin C':
                            case 'Vitamin D':
                            case 'Vitamin E':
                            case 'Vitamin K':
                                if (nutrient.value >= 10) {
                                    vitamins.push(`${nutrient.nutrientName}: ${Math.round(nutrient.value)}%`);
                                }
                                break;
                            case 'Calcium':
                            case 'Iron':
                            case 'Magnesium':
                            case 'Potassium':
                                if (nutrient.value >= 10) {
                                    minerals.push(`${nutrient.nutrientName}: ${Math.round(nutrient.value)}%`);
                                }
                                break;
                            default:
                                break;
                        }
                    });
                });

                rightColumnHTML = `
                    <div class="right-column">
                        <h2>Nutritional Summary:</h2>
                        <table class="nutrition-table">
                            <tr><td>Total Calories</td><td>${Math.round(totalCalories)} kcal</td></tr>
                            <tr><td>Total Fat</td><td>${Math.round(totalFat)} g</td></tr>
                            <tr><td>Saturated Fat</td><td>${Math.round(totalSaturatedFat)} g</td></tr>
                            <tr><td>Trans Fat</td><td>${Math.round(totalTransFat)} g</td></tr>
                            <tr><td>Cholesterol</td><td>${Math.round(totalCholesterol)} mg</td></tr>
                            <tr><td>Sodium</td><td>${Math.round(totalSodium)} mg</td></tr>
                            <tr><td>Total Carbohydrates</td><td>${Math.round(totalCarbs)} g</td></tr>
                            <tr><td>Dietary Fiber</td><td>${Math.round(totalFiber)} g</td></tr>
                            <tr><td>Total Sugars</td><td>${Math.round(totalSugar)} g</td></tr>
                            <tr><td>Protein</td><td>${Math.round(totalProtein)} g</td></tr>
                        </table>
                        <h4>Rich Vitamins:</h4>
                        <p>${vitamins.length ? vitamins.join('<br>') : 'Insufficient data for rich vitamins.'}</p>
                        <h4>Rich Minerals:</h4>
                        <p>${minerals.length ? minerals.join('<br>') : 'Insufficient data for rich minerals.'}</p>
                    </div>
                `;
            } else {
                console.error('No data found for the provided food items.');
            }
        } catch (error) {
            console.error('Error fetching nutritional data:', error);
        }

        weeklyData.innerHTML = leftColumnHTML + rightColumnHTML;
    };

    const updateWeekRange = () => {
        const now = new Date();
        const { start, end } = getWeekRange(now);

        currentWeekStart = start;
        currentWeekEnd = end;
        renderWeeklyAnalytics();
    };

    viewWeeklyButton.addEventListener('click', () => {
        weeklyAnalyticsSection.style.display = 'block';
        updateWeekRange();
    });

    prevWeekButton.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        currentWeekEnd.setDate(currentWeekEnd.getDate() - 7);
        renderWeeklyAnalytics();
    });

    nextWeekButton.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);
        renderWeeklyAnalytics();
    });

    updateWeekRange();
});
