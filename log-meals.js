document.addEventListener('DOMContentLoaded', () => {
    const mealForm = document.getElementById('meal-form');
    const foodItemInput = document.getElementById('food-item');
    const portionSizeInput = document.getElementById('portion-size');
    const mealDateInput = document.getElementById('meal-date');
    const successMessage = document.getElementById('success-message');

    let meals = JSON.parse(localStorage.getItem('meals')) || [];

    if (mealForm) {
        mealForm.addEventListener('submit', event => {
            event.preventDefault();

            const foodItem = foodItemInput.value.trim();
            const portionSize = portionSizeInput.value.trim();
            const mealDate = mealDateInput.value;

            if (foodItem && portionSize && mealDate) {
                const newMeal = {
                    food: foodItem,
                    portion: portionSize,
                    date: mealDate,

                    calories: Math.floor(Math.random() * 500) + 100,
                    protein: Math.floor(Math.random() * 50) + 10,
                    carbs: Math.floor(Math.random() * 100) + 20,
                    fats: Math.floor(Math.random() * 30) + 5,
                };

                meals.push(newMeal);
                localStorage.setItem('meals', JSON.stringify(meals));

                foodItemInput.value = '';
                portionSizeInput.value = '';
                mealDateInput.value = '';

                successMessage.style.display = 'block';
                setTimeout(() => successMessage.style.display = 'none', 3000);
            }
        });
    }
})