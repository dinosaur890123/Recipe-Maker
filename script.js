document.addEventListener('DOMContentLoaded', () => {
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientButton = document.getElementById('add-ingredient-button');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesButton = document.getElementById('find-recipes-button');
    const recipeResults = document.getElementById('recipe-results');
    let ingredients = [];
    function saveIngredients() {
        localStorage.setItem('recipeIngredients', JSON.stringify(ingredients));
    }
    function loadIngredients() {
        const savedIngredients = localStorage.getItem('recipeIngredients');
        if (savedIngredients) {
            ingredients = JSON.parse(savedIngredients);
            renderIngredients();
        }
    }
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
            saveIngredients();
        }
    }
    async function findRecipes() {
        const apiKey = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
        const ingredientsString = ingredients.join(',');
        recipeResults.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
            </div>`;
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
            recipeCard.dataset.id = recipe.id;
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null;this.src='https://placehold.co/312x231/e9e9e9/333?text=Image+Not+Found';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>Missing ${recipe.missedIngredientCount} ingredients</p>
                    <button class="details-button">View Details</button>
                </div>
            `;
            recipeResults.appendChild(recipeCard);
        });
    }
    async function getRecipeDetails(recipeId) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <button class="close-modal-button">&times;</button>
                <div class="modal-body">
                <div class="loader-container">
                <div class="loader"></div>
                </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
        document.body.style.overflow = 'hidden';
        const closeModal = () => {
            document.body.removeChild(modalOverlay);
            document.body.style.overflow = 'auto';
            
        };
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
        modalOverlay.querySelector('.close-modal-button').addEventListener('click', closeModal);
        const apiKey = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
        const apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
            }
            const recipe = await response.json();
            const modalBody = modalOverlay.querySelector('.modal-body');
            const ingredientsHtml = recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');
            modalBody.innerHTML = `
                <h2>${recipe.title}</h2>
                <img class="recipe-detail-img" src="${recipe.image}" alt="${recipe.title}">
                <h3>Ingredients</h3>
                <ul>${ingredientsHtml}</ul>
                <h3>Instructions</h3>
                <div class="instructions">${recipe.instructions || '<p>No instructions provided.</p>'}</div>
            `;
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            modalOverlay.querySelector('.modal-body').innerHTML = '<p>There was an issue fetching recipe details. Try again later</p>';
        }
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
            saveIngredients();
        }
    });
    recipeResults.addEventListener('click', (event) => {
        if (event.target.classList.contains('details-button')) {
            const card = event.target.closest('.recipe-card');
            if (card && card.dataset.id) {
                getRecipeDetails(card.dataset.id);
            }
        }
    });
    findRecipesButton.addEventListener('click', findRecipes);
    loadIngredients();
});

