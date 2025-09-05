document.addEventListener('DOMContentLoaded', () => {

    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientButton = document.getElementById('add-ingredient-button');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesButton = document.getElementById('find-recipes-button');
    const recipeResults = document.getElementById('recipe-results');

    let ingredients = [];
    function renderIngredients() {
        ingredientList.innerHTML = '';
        ingredients.forEach((ingredient, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${ingredient}</span>
                <button class="remove-button" data-index="${index}">×</button>
            `;
            ingredientList.appendChild(li);
        });
    }
    function addIngredient() {
        const ingredient = ingredientInput.value.trim().toLowerCase();
        if (ingredient && !ingredients.includes(ingredient)) {
            ingredients.push(ingredient);
            ingredientInput.value = '';
            renderIngredients();
        }
    }
    async function findRecipes() {
        const apiKey = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
        const ingredientsString = ingredients.join(',');
        recipeResults.innerHTML = '<p>Finding recipes...</p>';
        if (ingredients.length === 0) {
            recipeResults.innerHTML = '<p>Please add some ingredients first</p>';
            return;
        }

        const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=12&apiKey=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
            }
            const recipes = await response.json();
            displayRecipes(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeResults.innerHTML = `<p>Sorry, there was an error fetching recipes.</p>`;
        }
    }
    function displayRecipes(recipes) {
        recipeResults.innerHTML = '';

        if (recipes.length === 0) {
            recipeResults.innerHTML = '<p>No recipes found with these ingredients. Try adding more</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            const recipeUrl = `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`;
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null;this.src='https://placehold.co/312x231/e9e9e9/333?text=Image+Not+Found';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>Missing ${recipe.missedIngredientCount} ingredients</p>
                    <a href="${recipeUrl}" target="_blank">View recipe</a>
                </div>
            `;
            recipeResults.appendChild(recipeCard);
        });
    }
    addIngredientButton.addEventListener('click', addIngredient);
    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addIngredient();
        }
    });
    ingredientList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-button')) {
            const indexToRemove = parseInt(event.target.getAttribute('data-index'), 10);
            ingredients.splice(indexToRemove, 1);
            renderIngredients();
        }
    });
    findRecipesButton.addEventListener('click', findRecipes);
});

