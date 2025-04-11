// Comprehensive list of all recipe category options
export const cuisineOptions = [
  'Turkish',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'French',
  'Mediterranean',
  'American',
  'Thai',
  'Greek',
  'Korean',
  'Middle Eastern',
  'Spanish',
  'Vietnamese',
  'Brazilian',
  'Other'
].sort();

export const mealTypeOptions = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Soup',
  'Salad',
  'Main Course',
  'Side Dish',
  'Dessert',
  'Snack',
  'Beverage'
].sort();

export const dietOptions = [
  'Regular',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
  'Whole30',
  'None'
].sort();

export const mainIngredientOptions = [
  'Beef',
  'Chicken',
  'Pork',
  'Lamb',
  'Fish',
  'Seafood',
  'Eggs',
  'Tofu',
  'Beans',
  'Lentils',
  'Rice',
  'Pasta',
  'Bread',
  'Potatoes',
  'Vegetables',
  'Mushrooms',
  'Fruits',
  'Other'
].sort();

// Unit options for ingredients
export const unitOptions = [
  {
    category: "Volume",
    units: ["cup", "tablespoon", "teaspoon", "ml", "l", "fluid oz", "gallon", "quart", "pint"]
  },
  {
    category: "Weight",
    units: ["gram", "kg", "oz", "lb", "pound"]
  },
  {
    category: "Count/Pieces",
    units: ["piece", "whole", "clove", "slice", "can"]
  },
  {
    category: "Special",
    units: ["pinch", "dash", "to taste", "as needed"]
  }
]; 