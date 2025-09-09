document.addEventListener('DOMContentLoaded', () => {
    const ingredientInput = document.getElementById('ingredient-input');
    const addIngredientButton = document.getElementById('add-ingredient-button');
    const ingredientList = document.getElementById('ingredient-list');
    const findRecipesButton = document.getElementById('find-recipes-button');
    const recipeResults = document.getElementById('recipe-results');
    const savedRecipesContainer = document.getElementById('saved-recipes-list');
    const dietFilter = document.getElementById('diet-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const loadMoreButton = document.getElementById('load-more-button');
    let ingredients = [];
    let savedRecipeIds = [];
    let currentOffset = 0;

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

    function saveFavourites() {
        localStorage.setItem('savedRecipeIds', JSON.stringify(savedRecipeIds));
    }

    async function loadFavourites() {
        const savedIds = localStorage.getItem('savedRecipeIds');
        if (savedIds) {
            savedRecipeIds = JSON.parse(savedIds);
            if (savedRecipeIds.length > 0) {
                displaySavedRecipes();
            }
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

    async function findRecipes(isLoadMore = false) {
        if (!isLoadMore) {
            currentOffset = 0;
            recipeResults.innerHTML = '';
            loadMoreButton.classList.add('hidden');
        }
        const apiKey = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
        const ingredientsString = ingredients.join(',');
        if (!isLoadMore) {
            recipeResults.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
            </div>`;
        }
            
        if (ingredients.length === 0) {
            recipeResults.innerHTML = '<p>Please add some ingredients first</p>';
            return;
        }

        let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredientsString}&addRecipeInformation=true&number=12&apiKey=${apiKey}`;
        const diet = dietFilter.value;
        const cuisine = cuisineFilter.value;
        if (diet) {
            apiUrl += `&diet=${diet}`;
        }
        if (cuisine) {
            apiUrl += `&cuisine=${cuisine}`;
        }
        apiUrl += `&offset=${currentOffset}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
            }
            const data = await response.json();
            const recipes = data.results || [];
            if (!isLoadMore) {
                recipeResults.innerHTML = '';
            }
            displayRecipes(recipes);
            if (recipes.length === 12) {
                loadMoreButton.classList.remove('hidden');
            } else {
                loadMoreButton.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeResults.innerHTML = `<p>Sorry, there was an error fetching recipes.</p>`;
        }
    }

    function displayRecipes(recipes) {
        if (recipes.length === 0 && currentOffset === 0) {
            recipeResults.innerHTML = '<p>No recipes found with these ingredients and filters. Try changing your search.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.dataset.id = recipe.id;
            const isSaved = savedRecipeIds.includes(recipe.id);
            const saveButtonClass = isSaved ? 'saved' : '';
            const saveButtonText = isSaved ? 'Saved' : 'Save';
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null;this.src='https://placehold.co/312x231/e9e9e9/333?text=Image+Not+Found';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <div class="card-info">
                    <span>${recipe.readyInMinutes} min</span>
                    <span>${recipe.servings} servings</span>
                    </div>
                    <p>Missing ${recipe.missedIngredientCount || 0} ingredients</p>
                    <button class="details-button">View Details</button>
                    <button class="save-button ${saveButtonClass}">${saveButtonText}</button>
                </div>
            `;
            recipeResults.appendChild(recipeCard);
        });
    }

    async function displaySavedRecipes() {
        if (!savedRecipesContainer) return;
        savedRecipesContainer.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
            </div>`;
        if (savedRecipeIds.length === 0) {
            savedRecipesContainer.innerHTML = "<p>You haven't saved any recipes yet.</p>";
            return;
        }
        const apiKey = 'b0cad93a1b1b4b4fb64f8c6a6c046211';
        const apiUrl = `https://api.spoonacular.com/recipes/informationBulk?ids=${savedRecipeIds.join(',')}&apiKey=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch saved recipes.');
            const recipes = await response.json();
            savedRecipesContainer.innerHTML = '';
            recipes.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.classList.add('recipe-card');
                recipeCard.dataset.id = recipe.id;
                recipeCard.innerHTML = `
                    <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null;this.src='https://placehold.co/312x231/e9e9e9/333?text=Image+Not+Found';">
                    <div class="card-content">
                        <h3>${recipe.title}</h3>
                        <div class="card-info">
                            <span>${recipe.readyInMinutes} min</span>
                            <span>${recipe.servings} servings</span>
                        </div>
                         <button class="details-button">View Details</button>
                         <button class="save-button saved">Saved</button>
                    </div>
                `;
                savedRecipesContainer.appendChild(recipeCard);
            });
        } catch (error) {
            console.error(error);
            savedRecipesContainer.innerHTML = "<p>Could not load saved recipes.</p>";
        }
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
            function renderRecipeDetails() {
                const ingredientsHtml = recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');
                modalBody.innerHTML = `
                <h2>${recipe.title}</h2>
                <img class="recipe-detail-img" src="${recipe.image}" alt="${recipe.title}">
                <h3>Ingredients</h3>
                <ul>${ingredientsHtml}</ul>
                <h3>Instructions</h3>
                <div class="instructions">${recipe.instructions || '<p>No instructions provided.</p>'}</div>
                <button id="generate-shopping-list-button">Create Shopping List</button>`;
                modalBody.querySelector('#generate-shopping-list-button').addEventListener('click', generateShoppingList);
            }
            function generateShoppingList() {
                const recipeIngredientNames = recipe.extendedIngredients.map(ing => ing.name.toLowerCase());
                const shoppingListItems = recipeIngredientNames.filter(recipeIng => {
                    return !ingredients.some(userIng => recipeIng.includes(userIng));
                });
                const shoppingListHtml = shoppingListItems.length > 0
                    ? shoppingListItems.map(item => `<li><input type="checkbox"> <label>${item}</label></li>`).join('')
                    : `<li>You have all the ingredients for this recipe</li>`;
                modalBody.innerHTML = `
                <h2>Shopping List for ${recipe.title}</h2>
                <ul class="shopping-list">${shoppingListHtml}</ul>
                <button id="back-to-recipe-button">Back to Recipe</button>`;
                modalBody.querySelector('#back-to-recipe-button').addEventListener('click', renderRecipeDetails);
            }
            renderRecipeDetails();
        } catch (error) {
            console.error('Error fetching recipe', error);
            modalOverlay.querySelector('.modal-body').innerHTML = '<p>There was an issue fetching recipe details. Try again later</p>';
        }
    }
    
    addIngredientButton.addEventListener('click', addIngredient);
    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addIngredient();
        }
    });

    document.body.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.recipe-card');

        if (target.classList.contains('details-button') && card) {
            getRecipeDetails(card.dataset.id);
        }

        if (target.classList.contains('save-button') && card) {
            const recipeId = parseInt(card.dataset.id, 10);
            const index = savedRecipeIds.indexOf(recipeId);
            if (index > -1) {
                savedRecipeIds.splice(index, 1);
                target.classList.remove('saved');
                target.textContent = 'Save';
            } else {
                savedRecipeIds.push(recipeId);
                target.classList.add('saved');
                target.textContent = 'Saved';
            }
            saveFavourites();
            displaySavedRecipes();
        }
    });

    findRecipesButton.addEventListener('click', () => findRecipes(false));
    loadMoreButton.addEventListener('click', () => {
        currentOffset += 12;
        findRecipes(true);
    });
    loadIngredients();
    loadFavourites();
});

