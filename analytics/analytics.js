document.addEventListener('DOMContentLoaded', () => {
    const mealList = document.getElementById('meal-list');
    const editPopup = document.getElementById('edit-popup');
    const deletePopup = document.getElementById('delete-popup');
    const editForm = document.getElementById('edit-form');
    const editFoodInput = document.getElementById('edit-food');
    const editPortionInput = document.getElementById('edit-portion');
    const cancelEdit = document.getElementById('cancel-edit');
    const confirmDelete = document.getElementById('confirm-delete');
    const cancelDelete = document.getElementById('cancel-delete');

    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    
    let currentDeleteIndex = null;
    let currentEditIndex = null;

    const getTodayDate = () => {
        const today = new Date();
        return today.toLocaleDateString();
    }

    const renderMeals = () => {
        if (meals.length === 0) {
            mealList.innerHTML = '<p>No meals logged yet.</p>';
            return;
        }

        mealList.innerHTML = meals
            .map(
                (meal, index) => `
            <li>
                <span>${meal.food} - ${meal.portion} on ${meal.date}</span>
                <button class="edit-meal" data-index="${index}">Edit</button>
                <button class="delete-meal" data-index="${index}">Delete</button>
            </li>
        `
            )
            .join('');
        setupEditButtons();
        setupDeleteButtons();
    };

    const setupEditButtons = () => {
        document.querySelectorAll('.edit-meal').forEach(button => {
            button.addEventListener('click', event => {
                currentEditIndex = event.target.dataset.index;
                const meal = meals[currentEditIndex];
                editFoodInput.value = meal.food;
                editPortionInput.value = meal.portion;
                editPopup.classList.remove('hidden');
            });
        });
    };

    const setupDeleteButtons = () => {
        document.querySelectorAll('.delete-meal').forEach(button => {
            button.addEventListener('click', event => {
                currentDeleteIndex = event.target.dataset.index;
                const meal = meals[currentDeleteIndex];
                const deleteMessage = document.getElementById('delete-message');
                deleteMessage.textContent = `Are you sure you want to delete: "${meal.food} - ${meal.portion} on ${meal.date}"?`;
                deletePopup.classList.remove('hidden');
            });
        });
    };

    if (editForm) {
        editForm.addEventListener('submit', event => {
            event.preventDefault();
            if (currentEditIndex !== null) {
                meals[currentEditIndex] = {
                    food: editFoodInput.value,
                    portion: editPortionInput.value,
                };
                localStorage.setItem('meals', JSON.stringify(meals));
                currentEditIndex = null;
                editPopup.classList.add('hidden');
                renderMeals();
            }
        });
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', () => {
            currentEditIndex = null;
            editPopup.classList.add('hidden');
        });
    }

    if (confirmDelete) {
        confirmDelete.addEventListener('click', () => {
            if (currentDeleteIndex !== null) {
                meals.splice(currentDeleteIndex, 1);
                localStorage.setItem('meals', JSON.stringify(meals));
                currentDeleteIndex = null;
                deletePopup.classList.add('hidden');
                renderMeals();
            }
        });
    }

    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            currentDeleteIndex = null;
            deletePopup.classList.add('hidden');
        });
    }

    const logMeal = (food, portion) => {
        const newMeal = {
            food,
            portion,
            date: getTodayDate(),
        };
        meals.push(newMeal);
        localStorage.setItem('meals', JSON.stringify(meals));
        renderMeals();
    };

    renderMeals();
});