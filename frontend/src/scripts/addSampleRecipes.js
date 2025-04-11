import { createRecipe } from '../services/ApiService';

// Sample recipes data
const sampleRecipes = [
  {
    title: "Classic Spaghetti Bolognese",
    description: "A hearty Italian pasta dish with rich meat sauce and fresh herbs.",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timeInMins: 60,
    rating: 4.5,
    servings: 4,
    cuisine: "Italian",
    mealType: "Dinner",
    diet: "None",
    mainIngredient: "Pasta",
    prepTime: 15,
    cookTime: 45,
    ingredients: [
      "1 lb ground beef",
      "1 onion, diced",
      "3 cloves garlic, minced",
      "2 carrots, diced",
      "2 celery stalks, diced",
      "1 cup red wine",
      "2 cans crushed tomatoes",
      "1 tbsp tomato paste",
      "1 tsp dried oregano",
      "1 tsp dried basil",
      "Salt and pepper to taste",
      "1 lb spaghetti",
      "Fresh basil for garnish",
      "Parmesan cheese for serving"
    ],
    instructions: [
      "Heat olive oil in a large pot over medium heat. Add the ground beef and cook until browned, breaking it up with a spoon.",
      "Add the onion, garlic, carrots, and celery. Cook until vegetables are softened, about 5-7 minutes.",
      "Pour in the red wine and let it simmer until reduced by half.",
      "Add the crushed tomatoes, tomato paste, oregano, basil, salt, and pepper. Stir well and bring to a boil.",
      "Reduce heat to low, cover, and simmer for 30 minutes, stirring occasionally.",
      "Meanwhile, bring a large pot of salted water to boil. Cook the spaghetti according to package instructions.",
      "Drain the pasta and serve with the sauce. Garnish with fresh basil and grated Parmesan cheese."
    ],
    tags: ["Italian", "Pasta", "Beef", "Comfort Food"]
  },
  {
    title: "Vegetarian Buddha Bowl",
    description: "A colorful and nutritious bowl packed with quinoa, roasted vegetables, and tahini dressing.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timeInMins: 45,
    rating: 4.8,
    servings: 2,
    cuisine: "Mediterranean",
    mealType: "Lunch",
    diet: "Vegetarian",
    mainIngredient: "Vegetables",
    prepTime: 15,
    cookTime: 30,
    ingredients: [
      "1 cup quinoa",
      "2 cups vegetable broth",
      "1 sweet potato, cubed",
      "1 cup chickpeas, drained and rinsed",
      "1 cup broccoli florets",
      "1 avocado, sliced",
      "1 cup cherry tomatoes, halved",
      "1 cucumber, sliced",
      "2 tbsp olive oil",
      "1 tsp cumin",
      "1 tsp paprika",
      "Salt and pepper to taste",
      "2 tbsp tahini",
      "1 lemon, juiced",
      "1 clove garlic, minced",
      "Water to thin dressing"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C). Line a baking sheet with parchment paper.",
      "Cook quinoa in vegetable broth according to package instructions.",
      "Toss sweet potato cubes and chickpeas with olive oil, cumin, paprika, salt, and pepper. Spread on the prepared baking sheet.",
      "Roast for 20-25 minutes, until sweet potatoes are tender.",
      "Steam broccoli for 3-4 minutes until bright green and slightly tender.",
      "Make the dressing by whisking together tahini, lemon juice, garlic, and water until smooth.",
      "Assemble the bowls: divide quinoa between two bowls, top with roasted vegetables, chickpeas, broccoli, avocado, tomatoes, and cucumber.",
      "Drizzle with tahini dressing and serve."
    ],
    tags: ["Vegetarian", "Healthy", "Mediterranean", "Bowl"]
  },
  {
    title: "Chicken Tikka Masala",
    description: "A popular Indian curry dish with tender chicken pieces in a rich, creamy tomato sauce.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timeInMins: 75,
    rating: 4.7,
    servings: 4,
    cuisine: "Indian",
    mealType: "Dinner",
    diet: "None",
    mainIngredient: "Chicken",
    prepTime: 30,
    cookTime: 45,
    ingredients: [
      "1 lb chicken thighs, cut into bite-sized pieces",
      "1 cup plain yogurt",
      "2 tbsp lemon juice",
      "2 cloves garlic, minced",
      "1 tbsp ginger, minced",
      "2 tsp garam masala",
      "1 tsp cumin",
      "1 tsp turmeric",
      "1 tsp paprika",
      "Salt to taste",
      "2 tbsp vegetable oil",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 tbsp ginger, minced",
      "2 tsp garam masala",
      "1 tsp cumin",
      "1 tsp turmeric",
      "1 tsp paprika",
      "1 can crushed tomatoes",
      "1 cup heavy cream",
      "Fresh cilantro for garnish",
      "Cooked basmati rice for serving"
    ],
    instructions: [
      "In a bowl, combine yogurt, lemon juice, garlic, ginger, garam masala, cumin, turmeric, paprika, and salt. Add chicken pieces and marinate for at least 30 minutes (or overnight).",
      "Heat oil in a large skillet over medium heat. Add the marinated chicken and cook until browned on all sides, about 5-7 minutes. Remove from skillet and set aside.",
      "In the same skillet, add more oil if needed and sauté onion, garlic, and ginger until fragrant.",
      "Add garam masala, cumin, turmeric, and paprika. Cook for 1 minute until spices are fragrant.",
      "Pour in crushed tomatoes and bring to a simmer. Cook for 10 minutes, stirring occasionally.",
      "Add the cooked chicken back to the skillet and pour in heavy cream. Stir well and simmer for another 5-10 minutes until sauce thickens.",
      "Garnish with fresh cilantro and serve hot with basmati rice."
    ],
    tags: ["Indian", "Curry", "Chicken", "Spicy"]
  },
  {
    title: "Chocolate Chip Cookies",
    description: "Classic homemade cookies with a perfect balance of crispy edges and chewy centers.",
    image: "https://images.unsplash.com/photo-1499636136210-6f4b9aaeb0e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timeInMins: 30,
    rating: 4.9,
    servings: 24,
    cuisine: "American",
    mealType: "Dessert",
    diet: "None",
    mainIngredient: "Chocolate",
    prepTime: 15,
    cookTime: 15,
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 cup unsalted butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup packed brown sugar",
      "2 large eggs",
      "1 tsp vanilla extract",
      "1 tsp baking soda",
      "1/2 tsp salt",
      "2 cups semi-sweet chocolate chips"
    ],
    instructions: [
      "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.",
      "In a medium bowl, whisk together flour, baking soda, and salt. Set aside.",
      "In a large bowl, cream together butter and both sugars until light and fluffy, about 2-3 minutes.",
      "Beat in eggs one at a time, then stir in vanilla extract.",
      "Gradually stir the dry ingredients into the wet mixture until just combined.",
      "Fold in chocolate chips.",
      "Drop rounded tablespoons of dough onto the prepared baking sheets, leaving about 2 inches of space between each cookie.",
      "Bake for 9-11 minutes, or until edges are lightly browned but centers are still soft.",
      "Allow cookies to cool on baking sheets for 5 minutes before transferring to wire racks to cool completely."
    ],
    tags: ["Dessert", "Baking", "Chocolate", "Cookies"]
  },
  {
    title: "Sushi Rolls",
    description: "Homemade sushi rolls with fresh fish, vegetables, and perfectly seasoned rice.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timeInMins: 90,
    rating: 4.6,
    servings: 4,
    cuisine: "Japanese",
    mealType: "Dinner",
    diet: "Pescatarian",
    mainIngredient: "Fish",
    prepTime: 60,
    cookTime: 30,
    ingredients: [
      "2 cups sushi rice",
      "2 1/2 cups water",
      "1/4 cup rice vinegar",
      "2 tbsp sugar",
      "1 tsp salt",
      "4 nori sheets",
      "8 oz fresh sushi-grade salmon, sliced",
      "1 avocado, sliced",
      "1 cucumber, julienned",
      "1 carrot, julienned",
      "Soy sauce for serving",
      "Wasabi for serving",
      "Pickled ginger for serving"
    ],
    instructions: [
      "Rinse the sushi rice in cold water until the water runs clear. Drain well.",
      "Combine rice and water in a medium saucepan. Bring to a boil, then reduce heat to low, cover, and simmer for 20 minutes.",
      "While rice is cooking, combine rice vinegar, sugar, and salt in a small saucepan. Heat until sugar dissolves, then set aside to cool.",
      "When rice is done, transfer to a large bowl and gently fold in the vinegar mixture. Allow to cool to room temperature.",
      "Place a nori sheet on a bamboo sushi mat. Wet your hands with water and spread a thin layer of rice over the nori, leaving a 1-inch border at the top.",
      "Place salmon, avocado, cucumber, and carrot in the center of the rice.",
      "Roll the sushi tightly using the bamboo mat, pressing gently to shape.",
      "Cut the roll into 6-8 pieces with a sharp knife. Repeat with remaining ingredients.",
      "Serve with soy sauce, wasabi, and pickled ginger."
    ],
    tags: ["Japanese", "Sushi", "Fish", "Healthy"]
  }
];

// Function to add all sample recipes
export const addSampleRecipes = async (token) => {
  if (!token) {
    console.error('No authentication token provided');
    return;
  }

  console.log('Adding sample recipes...');
  
  for (const recipe of sampleRecipes) {
    try {
      await createRecipe(recipe, token);
      console.log(`Added recipe: ${recipe.title}`);
    } catch (error) {
      console.error(`Error adding recipe ${recipe.title}:`, error);
    }
  }
  
  console.log('Finished adding sample recipes');
};

export default addSampleRecipes; 