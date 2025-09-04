document.addEventListener('DOMContentLoaded', () => {

    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientBtn = document.getElementById('add-ingredient-button');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesBtn = document.getElementById('find-recipes-button');
    const recipeResults = document.getElementById('recipe-results');

    let ingredients = [];
    function renderIngredients() {
        ingredientList.innerHTML = '';
        ingredients.forEach((ingredient, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${ingredient}</span>
                <button class="remove-btn" data-index="${index}">×</button>
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
        const apiKey = '';
        const ingredientsString = ingredients.join(',');

        recipeResults.innerHTML = '<p>Finding recipes...</p>';

        if (ingredients.length === 0) {
            recipeResults.innerHTML = '<p>Please add some ingredients first!</p>';
            return;
        }

        if (apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
            recipeResults.innerHTML = '<p style="color: red; font-weight: bold;">Please add your Spoonacular API key to the script.js file.</p>';
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
            recipeResults.innerHTML = `<p>Sorry, there was an error fetching recipes. Make sure your API key is correct and you have requests remaining.</p>`;
        }
    }

    function displayRecipes(recipes) {
        recipeResults.innerHTML = '';

        if (recipes.length === 0) {
            recipeResults.innerHTML = '<p>No recipes found with these ingredients. Try adding more!</p>';
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
                    <a href="${recipeUrl}" target="_blank">View Recipe</a>
                </div>
            `;
            recipeResults.appendChild(recipeCard);
        });
    }

    addIngredientBtn.addEventListener('click', addIngredient);

    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addIngredient();
        }
    });

    ingredientList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const indexToRemove = parseInt(event.target.getAttribute('data-index'), 10);
            ingredients.splice(indexToRemove, 1);
            renderIngredients();
        }
    });

    findRecipesBtn.addEventListener('click', findRecipes);
});

