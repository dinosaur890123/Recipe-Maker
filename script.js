document.addEventListener('DOMContentLoaded', () => {
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientButton = document.getElementById('add-ingredient-button');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesBtn = document.getElementById('find-recipes-button');
    const recipeResults = document.getElementById('recipe-results');
    let ingredients = [];
    function renderIngredients() {
        ingredientList.innerHTML = '';
        ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientList.appendChild(li);
        })
    }
    function addIngredient() {
        const ingredient = ingredientInput.value.trim();
        if (ingredient) {
            ingredients.push(ingredient);
            ingredientInput.value = '';
            renderIngredients()
        }
    }
    addIngredientBtn.addEventListener('click', addIngredient);
    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addIngredient();
        }
    });
    findRecipesButton.addEventListener('click', () => {
        recipeResults.innerHTML = '';
        if (ingredients.length === 0) {
            recipeResults.innerHTML = '<p>Please add some ingredients first!</p>';
            return;
        }
        console.log('Searching for recipes with:', ingredients.join(', '));
        recipeResults.innerHTML = `<p>Searching for recipes... (API not yet connected)</p>`;
    });
});