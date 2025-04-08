import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import { createRecipe } from '../services/ApiService';
import { useNotification } from '../context/NotificationContext';

// Define unitOptions outside the component
const unitOptions = [
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

// Memoized AnimatedFoodIconsBackground component to prevent re-renders
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { theme } = useTheme();
  const { isLoggedIn, token } = useAuth();
  const { dispatch } = useNotification();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Recipe form state
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    cuisine: '',
    mealType: '',
    diet: '',
    mainIngredient: '',
    prepTime: '',
    cookTime: '',
    servings: 1,
    ingredients: [],
    steps: [],
    photo: null,
    photoPreview: null
  });

  // Current input states for ingredients and steps
  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    quantity: '',
    unit: unitOptions[0].units[0],
    customUnit: ''
  });
  
  const [currentStepText, setCurrentStepText] = useState('');

  // Options for dropdown selects
  const cuisineOptions = [
    'Turkish', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 
    'French', 'Mediterranean', 'American', 'Thai', 'Greek', 'Korean',
    'Middle Eastern', 'Spanish', 'Vietnamese', 'Brazilian', 'Other'
  ];
  
  const mealTypeOptions = [
    'Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Appetizer', 'Soup', 
    'Salad', 'Main Course', 'Side Dish', 'Dessert', 'Snack', 'Beverage'
  ];
  
  const dietOptions = [
    'Regular', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Low-Carb', 'Keto', 'Paleo', 'Halal', 'Kosher', 'None'
  ];

  const mainIngredientOptions = [
    'Beef', 'Chicken', 'Pork', 'Lamb', 'Fish', 'Seafood',
    'Eggs', 'Tofu', 'Beans', 'Lentils',
    'Rice', 'Pasta', 'Bread', 'Potatoes',
    'Vegetables', 'Mushrooms', 'Fruits',
    'Other'
  ];

  // Add validation states for each step
  const [stepValidation, setStepValidation] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false
  });

  // Validate step 1 (Basic Info)
  const validateStep1 = () => {
    const requiredFields = {
      title: 'Recipe Title',
      cuisine: 'Cuisine',
      mealType: 'Meal Type',
      mainIngredient: 'Main Ingredient',
      prepTime: 'Preparation Time',
      cookTime: 'Cooking Time',
      servings: 'Servings'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!recipe[field] || recipe[field].toString().trim() === '') {
        missingFields.push(label);
      }
    }

    // Additional numeric validations
    if (recipe.prepTime && (isNaN(recipe.prepTime) || parseInt(recipe.prepTime) < 0)) {
      missingFields.push('Valid Preparation Time');
    }
    if (recipe.cookTime && (isNaN(recipe.cookTime) || parseInt(recipe.cookTime) < 0)) {
      missingFields.push('Valid Cooking Time');
    }
    if (recipe.servings && (isNaN(recipe.servings) || parseInt(recipe.servings) < 1)) {
      missingFields.push('Valid number of Servings');
    }

    const isValid = missingFields.length === 0;
    setStepValidation(prev => ({ ...prev, step1: isValid }));
    return isValid;
  };

  // Validate step 2 (Ingredients)
  const validateStep2 = () => {
    const isValid = recipe.ingredients.length > 0;
    setStepValidation(prev => ({ ...prev, step2: isValid }));
    return isValid;
  };

  // Validate step 3 (Instructions)
  const validateStep3 = () => {
    const isValid = recipe.steps.length > 0;
    setStepValidation(prev => ({ ...prev, step3: isValid }));
    return isValid;
  };

  // Validate step 4 (Photo)
  const validateStep4 = () => {
    const isValid = true; // Photo is optional
    setStepValidation(prev => ({ ...prev, step4: isValid }));
    return isValid;
  };

  // Update validation when recipe data changes
  React.useEffect(() => {
    validateStep1();
    validateStep2();
    validateStep3();
    validateStep4();
  }, [recipe]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        dispatch({
          type: "error",
          message: "Please select an image file",
          duration: 3000
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        dispatch({
          type: "error",
          message: "Image size should not exceed 5MB",
          duration: 3000
        });
        return;
      }

      // Create preview URL
      const filePreview = URL.createObjectURL(file);

      setRecipe(prev => ({
        ...prev,
        photo: file,
        photoPreview: filePreview
      }));
    }
  };

  // Handle ingredient input changes
  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    setCurrentIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle next step with validation
  const nextStep = () => {
    let canProceed = false;
    
    switch (currentStep) {
      case 1:
        canProceed = validateStep1();
        break;
      case 2:
        canProceed = validateStep2();
        break;
      case 3:
        canProceed = validateStep3();
        break;
      case 4:
        canProceed = validateStep4();
        break;
      default:
        canProceed = false;
    }

    if (canProceed && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step function
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if next button should be enabled
  const isNextEnabled = () => {
    switch (currentStep) {
      case 1:
        return stepValidation.step1;
      case 2:
        return stepValidation.step2;
      case 3:
        return stepValidation.step3;
      case 4:
        return stepValidation.step4;
      default:
        return false;
    }
  };

  // Handle cancel/quit recipe creation
  const handleCancel = () => {
    if (recipe.title || recipe.ingredients.length > 0 || recipe.steps.length > 0) {
      if (window.confirm('Are you sure you want to quit? Your recipe progress will be lost.')) {
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const prepTimeInt = parseInt(recipe.prepTime) || 0;
      const cookTimeInt = parseInt(recipe.cookTime) || 0;
      
      const newRecipe = {
        title: recipe.title,
        description: recipe.description || '',
        timeInMins: prepTimeInt + cookTimeInt,
        servings: parseInt(recipe.servings) || 1,
        cuisine: recipe.cuisine,
        mealType: recipe.mealType,
        diet: recipe.diet || '',
        mainIngredient: recipe.mainIngredient || '',
        prepTime: prepTimeInt,
        cookTime: cookTimeInt,
        ingredients: recipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`),
        instructions: recipe.steps.map(step => step.text)
      };
      
      // Send the recipe to the backend with image and token
      await createRecipe(newRecipe, recipe.photo, token);
      
      // Show success notification
      dispatch({
        type: "success",
        message: "Recipe created successfully!",
        duration: 3000
      });
      
      navigate('/profile');
    } catch (error) {
      console.error('Error creating recipe:', error);
      dispatch({
        type: "error",
        message: error.message || 'Failed to create recipe. Please try again.',
        duration: 5000
      });
    }
  };

  // Add ingredient to list
  const addIngredient = () => {
    if (!currentIngredient.name || !currentIngredient.quantity) {
      return;
    }

    const finalUnit = currentIngredient.unit === 'custom' ? currentIngredient.customUnit : currentIngredient.unit;
    
    setRecipe(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          name: currentIngredient.name,
          quantity: currentIngredient.quantity,
          unit: finalUnit,
          id: Date.now()
        }
      ]
    }));

    setCurrentIngredient({
      name: "",
      quantity: "",
      unit: unitOptions[0].units[0],
      customUnit: ""
    });
  };

  // Remove ingredient from list
  const removeIngredient = (id) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id)
    }));
  };

  // Add step to list
  const addStep = () => {
    if (currentStepText.trim()) {
      setRecipe(prev => ({
        ...prev,
        steps: [...prev.steps, { text: currentStepText, id: Date.now() }]
      }));
      setCurrentStepText('');
    }
  };

  // Remove step from list
  const removeStep = (id) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl overflow-hidden">
      {/* Animated food icons background - positioned absolutely but only in this container */}
      <AnimatedFoodIconsBackground count={60} />
      <div 
        className="bg-white rounded-lg shadow-md p-6 relative"
        style={{backgroundColor: theme.core.container, color:theme.core.text}}  >
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Recipe</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentStep >= step ? theme.core.containerHoover : theme.headerfooter.background}}>
                {step}
              </div>
              {step < 5 && (
                <div className="w-12 h-1"
                      style={{ backgroundColor: currentStep > step ? theme.core.containerHoover : theme.headerfooter.background}}>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}
              style={{ borderColor: theme.core.text}}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Recipe Basics</h2>
              
              <div>
                <label className="block mb-2">Recipe Title</label>
                <input
                  type="text"
                  name="title"
                  value={recipe.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  placeholder="Enter recipe title"
                  style={{ borderColor: theme.core.text}}
                />
              </div>
              
              <div>
                <label className="block  mb-2">Short Description</label>
                <textarea
                  name="description"
                  value={recipe.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  placeholder="Briefly describe your recipe"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block  mb-2">Cuisine</label>
                  <select
                    name="cuisine"
                    value={recipe.cuisine}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  >
                    <option value="" style={{ color: theme.headerfooter.logoRed}}>
                        Select Cuisine
                    </option>
                    {cuisineOptions.map(option => (
                      <option style={{ color: theme.headerfooter.logoRed}} key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block  mb-2">Meal Type</label>
                  <select
                    name="mealType"
                    value={recipe.mealType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  >
                    <option style={{ color: theme.headerfooter.logoRed}} value="">Select Meal Type</option>
                    {mealTypeOptions.map(option => (
                      <option style={{ color: theme.headerfooter.logoRed}} key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block  mb-2">Diet</label>
                  <select
                    name="diet"
                    value={recipe.diet}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  >
                    <option value="">Select Diet</option>
                    {dietOptions.map(option => (
                      <option style={{ color: theme.headerfooter.logoRed}} key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block  mb-2">Main Ingredient</label>
                  <select
                    name="mainIngredient"
                    value={recipe.mainIngredient}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  >
                    <option value="">Select Main Ingredient</option>
                    {mainIngredientOptions.map(option => (
                      <option style={{ color: theme.headerfooter.logoRed}} key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2">Prep Time (minutes)</label>
                  <input
                    type="number"
                    name="prepTime"
                    value={recipe.prepTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block mb-2">Cook Time (minutes)</label>
                  <input
                    type="number"
                    name="cookTime"
                    value={recipe.cookTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block mb-2">Servings</label>
                  <input
                    type="number"
                    name="servings"
                    value={recipe.servings}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Ingredients */}
          {currentStep === 2 && (
            <div className="space-y-6"
                  style={{ color:theme.core.text }}>
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <p className=" opacity-70">Add all ingredients needed for your recipe</p>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label className="block mb-2">Ingredient Name</label>
                  <input
                    type="text"
                    name="name"
                    value={currentIngredient.name}
                    onChange={handleIngredientChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    placeholder="e.g. Flour"
                  />
                </div>
                
                <div className="md:w-1/4">
                  <label className="block mb-2">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={currentIngredient.quantity}
                    onChange={handleIngredientChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    placeholder="e.g. 2"
                  />
                </div>
                
                <div className="md:w-1/4">
                  <label className="block mb-2">Unit Type</label>
                  <select
                    name="unit"
                    value={currentIngredient.unit}
                    onChange={handleIngredientChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  >
                    {unitOptions.map(category => (
                      <optgroup key={category.category} label={category.category}>
                        {category.units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">Custom Unit</option>
                  </select>
                </div>

                {currentIngredient.unit === 'custom' && (
                  <div className="md:w-1/4">
                    <label className="block mb-2">Custom Unit</label>
                    <input
                      type="text"
                      name="customUnit"
                      value={currentIngredient.customUnit}
                      onChange={handleIngredientChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                      placeholder="e.g. slice"
                    />
                  </div>
                )}
                
                <div className="md:w-auto flex items-end">
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="border-2 bg-[#c0392b] hover:bg-[#a82315] hover:scale-110 cursor-pointer text-white px-6 py-2 rounded-md focus:outline-none transition-colors"
                    style={{ borderColor: theme.core.text }}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {recipe.ingredients.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 ">Ingredient List</h3>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient) => (
                      <li key={ingredient.id} className="flex justify-between items-center p-3 rounded-md"
                                              style={{backgroundColor: theme.core.containerHoover}}>
                        <span>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-[#c0392b] hover:text-[#a82315]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Instructions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold ">Instructions</h2>
              <p className=" opacity-70">Add step-by-step instructions for your recipe</p>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block  mb-2">Step Description</label>
                  <textarea
                    value={currentStepText}
                    onChange={(e) => setCurrentStepText(e.target.value)}
                    className="w-full px-4 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                    placeholder="Describe this step..."
                    rows="3"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addStep}
                    className="border-2 bg-[#c0392b] hover:bg-[#a82315] hover:scale-110 cursor-pointer text-white px-2 py-2 h-10 rounded-md focus:outline-none transition-colors"
                    style={{borderColor: theme.core.text}}
                  >
                    Add Step
                  </button>
                </div>
              </div>
              
              {recipe.steps.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4 ">Instructions</h3>
                  <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                      <li key={step.id} className="flex items-start bg-[#e2ece0] p-4 rounded-md"
                                      style={{ backgroundColor: theme.core.containerHoover }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1"
                              style={{ backgroundColor: theme.core.container, color: theme.core.text}}>
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="">{step.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="text-[#c0392b] hover:text-[#a82315] ml-4 flex-shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Photo */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold ">Recipe Photo</h2>
              <p className=" opacity-70">Add a photo of your finished recipe</p>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-[#c0392b]"
                  />
                </div>
                
                {recipe.photoPreview ? (
                  <div className="mt-4 w-full max-w-lg">
                    <img 
                      src={recipe.photoPreview} 
                      alt="Recipe Preview" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="mt-4 w-full max-w-lg h-64 rounded-lg flex items-center justify-center"
                      style={{backgroundColor: theme.core.containerHoover}}>
                    <p className="text-white">No photo selected</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold ">Review Your Recipe</h2>
              <p className=" opacity-70">Please review your recipe before submitting</p>
              
              <div className="rounded-lg p-6 space-y-6"
                  style={{ backgroundColor: theme.core.containerHoover}}>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo */}
                  <div className="md:w-1/3">
                    {recipe.photoPreview ? (
                      <img 
                        src={recipe.photoPreview} 
                        alt="Recipe" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">No Photo</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Basic Info */}
                  <div className="md:w-2/3 space-y-3">
                    <h3 className="text-xl font-bold ">{recipe.title || "Untitled Recipe"}</h3>
                    <p className="text-gray-600" >{recipe.description || "No description provided."}</p>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <span className="font-semibold">Cuisine:</span> {recipe.cuisine || "Not specified"}
                      </div>
                      <div>
                        <span className="font-semibold">Meal Type:</span> {recipe.mealType || "Not specified"}
                      </div>
                      <div>
                        <span className="font-semibold">Prep Time:</span> {recipe.prepTime || "0"} min
                      </div>
                      <div>
                        <span className="font-semibold">Cook Time:</span> {recipe.cookTime || "0"} min
                      </div>
                      <div>
                        <span className="font-semibold">Total Time:</span> {(parseInt(recipe.prepTime) || 0) + (parseInt(recipe.cookTime) || 0)} min
                      </div>
                      <div>
                        <span className="font-semibold">Servings:</span> {recipe.servings}
                      </div>
                      {recipe.diet && (
                        <div>
                          <span className="font-semibold">Diet:</span> {recipe.diet}
                        </div>
                      )}
                      {recipe.mainIngredient && (
                        <div>
                          <span className="font-semibold">Main Ingredient:</span> {recipe.mainIngredient}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Ingredients */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold  mb-3">Ingredients</h4>
                  {recipe.ingredients.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-gray-500">No ingredients added</p>
                  )}
                </div>
                
                {/* Instructions */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold  mb-3">Instructions</h4>
                  {recipe.steps.length > 0 ? (
                    <ol className="list-decimal pl-5 space-y-2">
                      {recipe.steps.map((step) => (
                        <li key={step.id} className="mb-2">
                          {step.text}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="italic text-gray-500">No instructions added</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto border hover:brightness-80 px-6 py-2 rounded-md focus:outline-none transition-colors cursor-pointer hover:scale-110"
                style={{ color: theme.core.text,  backgroundColor: theme.headerfooter.background}}
              >
                Previous
              </button>
            )}
            
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto border hover:brightness-80 px-6 py-2 rounded-md focus:outline-none transition-colors cursor-pointer hover:scale-110"
              style={{ color: theme.core.text,  backgroundColor: theme.headerfooter.background}}
            >
              Cancel
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isNextEnabled()}
                className={`w-full sm:w-auto bg-[#c0392b] border-2 cursor-pointer text-white px-6 py-2 rounded-md focus:outline-none transition-colors ${
                  isNextEnabled() 
                    ? 'hover:bg-[#a82315] hover:scale-110' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ borderColor: theme.core.text }}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full sm:w-auto border-2 bg-[#c0392b] hover:bg-[#a82315] hover:scale-110 cursor-pointer text-white px-6 py-2 rounded-md focus:outline-none transition-colors"
                style={{ borderColor: theme.core.text }}
              >
                Submit Recipe
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipePage;
