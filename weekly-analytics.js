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

        const weeklyMeals = meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= currentWeekStart && mealDate <= currentWeekEnd;
        });

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
                    <tr><th>Nutrient</th><th>Value</th></tr>
        `;

        const foodDetails = weeklyMeals.map(meal => meal.food).join(',');
        try {
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodDetails}&api_key=FtBPJ1szonFLDYUrYeDhFkE2RGOlrQEQzHdJdohg`);
            const data = await response.json();

            if(data.foods) {
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

                rightColumnHTML += `
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
                    <h4>Rich Vitamins:</h4>
                    ${
                        vitamins.length > 0
                            ? `<ul>${vitamins.map(vit => `<li>${vit}</li>`).join('')}</ul>`
                            : '<p>Insufficient data for rich vitamins.</p>'
                    }
                    <h4>Rich Minerals:</h4>
                    ${
                        minerals.length > 0
                            ? `<ul>${minerals.map(mineral => `<li>${mineral}</li>`).join('')}</ul>`
                            : '<p>Insufficient data for rich minerals.</p>'
                    }
                `;
            }

            rightColumnHTML += '</div>';
            weeklyData.innerHTML = leftColumnHTML + rightColumnHTML;
            
        } catch (error) {
            console.error('Error fetching FoodData Central data:', error);
        }
    };

    const changeWeek = (direction) => {
        const newStartDate = new Date(currentWeekStart);
        newStartDate.setDate(currentWeekStart.getDate() + direction * 7);
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