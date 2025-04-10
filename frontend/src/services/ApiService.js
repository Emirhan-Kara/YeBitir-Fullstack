const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to handle response
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle error responses
  if (!response.ok) {
    let errorMessage;
    try {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        // Check for specific error messages
        if (response.status === 400 && errorData.message?.toLowerCase().includes('duplicate')) {
          errorMessage = 'This username or email is already registered';
        } else {
          errorMessage = errorData.message || errorData.error || 'An error occurred';
        }
      } else {
        const textError = await response.text();
        errorMessage = textError || `HTTP error! status: ${response.status}`;
      }
    // eslint-disable-next-line no-unused-vars
    } catch (parseError) {
      // Ignore parse error and use default message
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  // Handle success responses
  try {
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return {
        ...data,
        success: true
      };
    }
    const textResponse = await response.text();
    try {
      const jsonResponse = JSON.parse(textResponse);
      return {
        ...jsonResponse,
        success: true
      };
    // eslint-disable-next-line no-unused-vars
    } catch (parseError) {
      // Couldn't parse as JSON, return as text
      return { 
        success: true,
        message: textResponse || ''
      };
    }
  } catch (error) {
    console.error('Error parsing success response:', error);
    throw new Error('Failed to parse server response');
  }
};

// Authentication services
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify({ email, password })
  });
  return handleResponse(response);
};

export const register = async (name, email, password) => {
  const requestBody = {
    username: name,
    email,
    password
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      try {
        const result = await handleResponse(response);
        return {
          success: true,
          ...result
        };
      // eslint-disable-next-line no-unused-vars
      } catch (parseError) {
        // Even if parsing fails, if the status is OK, consider it a success
        console.log('Response parsing error, but status OK - considering successful');
        return {
          success: true,
          message: 'Registration completed successfully'
        };
      }
    } else {
      // Handle error response
      const errorResult = await handleResponse(response).catch(error => ({
        success: false,
        message: error.message
      }));
      return errorResult;
    }
  } catch (error) {
    console.error('Registration error:', error);
    // Return a structured error response
    return {
      success: false,
      message: error.message || 'Registration failed'
    };
  }
};

// Recipe services
export const getAllRecipes = async () => {
  const response = await fetch(`${API_BASE_URL}/recipes`);
  const result = await handleResponse(response);
  
  // Handle object-style response with numeric keys
  if (result && typeof result === 'object') {
    // Convert object with numeric keys to array
    const recipeArray = Object.keys(result)
      .filter(key => !isNaN(key)) // Only take numeric keys
      .map(key => result[key]);
    
    if (recipeArray.length > 0) {
      return recipeArray;
    }
  }
  
  // Fallback to previous handling
  if (Array.isArray(result)) {
    return result;
  } else if (result.recipes && Array.isArray(result.recipes)) {
    return result.recipes;
  } else if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  
  console.warn('Unexpected recipes response format:', result);
  return [];
};

export const getRecipeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    
    // Get the raw text from the response
    const responseText = await response.text();
    
    let result;
    
    // Try to parse the response or extract JSON from it
    if (responseText) {
      try {
        // First try direct parsing
        result = JSON.parse(responseText);
      } catch {
        // If that fails, try to extract a JSON object using regex
        const jsonMatch = responseText.match(/{.*}/);
        if (jsonMatch) {
          try {
            const extractedJson = jsonMatch[0];
            result = JSON.parse(extractedJson);
          } catch {
            // Both parsing attempts failed
            result = null;
          }
        }
      }
    }
    
    // If we couldn't parse any JSON, return an error response
    if (!result) {
      return {
        id: id,
        title: "Failed to parse recipe data",
        description: responseText?.substring(0, 100) + "...",
        ingredients: [],
        instructions: []
      };
    }
    
    // Check for various response formats and process accordingly
    // Remove success flag for cleaner data structure if it exists
    const recipeData = result.success ? 
      (({ ...rest }) => rest)(result) : 
      result;
    
    // Check if we have a nested data property
    if (recipeData.data) {
      return recipeData.data;
    }
    
    // Check if we received the recipe directly
    if (recipeData.id || recipeData.title || recipeData.ingredients) {
      return recipeData;
    }
    
    // Handle object with numeric keys (like PHP array serialization)
    if (typeof recipeData === 'object') {
      const keys = Object.keys(recipeData).filter(key => !isNaN(key));
      if (keys.length > 0) {
        return recipeData[keys[0]]; // Return first recipe object
      }
    }
    
    return {
      id: id,
      title: "Recipe format unexpected",
      description: "The server returned data in an unexpected format",
      ingredients: [],
      instructions: []
    };
  } catch (error) {
    // Return a minimal recipe object with error information
    return {
      id: id,
      title: "Error fetching recipe",
      description: error.message,
      ingredients: [],
      instructions: []
    };
  }
};

export const createRecipe = async (recipeData, image, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const formData = new FormData();
    
    // Convert recipe data to JSON string and append to form data
    const recipeBlob = new Blob([JSON.stringify(recipeData)], {
      type: 'application/json'
    });
    formData.append('recipe', recipeBlob);

    // Append image if it exists
    if (image) {
      formData.append('image', image);
    }

    // Log the request details for debugging
    console.log('Creating recipe with token:', token);

    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create recipe' }));
      console.error('Recipe creation failed:', response.status, errorData);
      throw new Error(errorData.message || 'Failed to create recipe');
    }

    return handleResponse(response);
  } catch (error) {
    console.error('Recipe creation error:', error);
    throw error;
  }
};

export const updateRecipe = async (id, recipeData, image, token) => {
  const formData = new FormData();
  formData.append('recipe', new Blob([JSON.stringify(recipeData)], { type: 'application/json' }));
  if (image) {
    formData.append('image', image);
  }

  const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors',
    body: formData
  });
  return handleResponse(response);
};

export const deleteRecipe = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const searchRecipes = async (query) => {
  // If query is an object (for filtering), convert to query string
  if (typeof query === 'object') {
    const params = new URLSearchParams();
    
    // Only add non-empty filters that aren't "Any"
    Object.entries(query).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'Any' && key !== 'limit') {
        params.append(key, value);
      }
    });
    
    // Append the limit parameter if it exists (only once)
    if (query.limit) {
      params.append('limit', query.limit);
    }
    
    const queryString = params.toString();
    const response = await fetch(`${API_BASE_URL}/recipes/search?${queryString}`);
    return handleResponse(response);
  } else {
    // Handle text search
    const response = await fetch(`${API_BASE_URL}/recipes/search?query=${encodeURIComponent(query)}`);
    return handleResponse(response);
  }
};

export const filterRecipes = async (filters) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Convert filters to a query string format
    let queryString = '';
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== 'Any') {
        if (key === 'recipeName') {
          queryString = value; // Use recipe name as the main query
        } else {
          queryParams.append(key, value);
        }
      }
    });

    // Always include a query parameter, even if empty
    queryParams.append('query', queryString);

    const url = `${API_BASE_URL}/recipes/search?${queryParams}`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await handleResponse(response);
    console.log('Response data:', result);

    // Extract recipes from the response based on its structure
    let recipes = [];
    if (Array.isArray(result)) {
      recipes = result;
    } else if (result && typeof result === 'object') {
      // Check if the result is an object with numeric keys
      const numericKeys = Object.keys(result).filter(key => !isNaN(key));
      if (numericKeys.length > 0) {
        recipes = numericKeys.map(key => result[key]);
      } else if (result.recipes && Array.isArray(result.recipes)) {
        recipes = result.recipes;
      } else if (result.data && Array.isArray(result.data)) {
        recipes = result.data;
      }
    }

    console.log('Processed recipes:', recipes);
    return recipes;
  } catch (error) {
    console.error('Error filtering recipes:', error);
    return [];
  }
};

// Comment services
export const getCommentsByRecipe = async (recipeId) => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Prepare headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${recipeId}`, {
      headers
    });
    
    if (!response.ok) {
      console.error('Failed to fetch comments:', response.status, response.statusText);
      if (response.status === 500) {
        // Try to get more error details from response body
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (jsonError) {
          console.error('Could not parse error response:', jsonError);
        }
      }
      return [];
    }
    
    // Get the raw text response
    const responseText = await response.text();
    
    // Try to parse the JSON manually
    try {
      // Look for JSON structure in the response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        return jsonData;
      }
      
      // Try direct parsing if no match found
      const jsonData = JSON.parse(responseText);
      return Array.isArray(jsonData) ? jsonData : [];
    } catch (parseError) {
      console.error('Error parsing comments response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const addComment = async (recipeId, text, rating, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/recipe/${recipeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, rating })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const likeComment = async (commentId, token) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

export const dislikeComment = async (commentId, token) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/dislike`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

export const deleteComment = async (commentId, token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return handleResponse(response);
};

// User services
export const getUserProfile = async (tokenOrUsername) => {
  try {
    // If it looks like a JWT token (contains dots and is long), use the /profile endpoint
    const isToken = typeof tokenOrUsername === 'string' && tokenOrUsername.split('.').length === 3;
    const endpoint = isToken ? `${API_BASE_URL}/users/profile` : `${API_BASE_URL}/users/${tokenOrUsername}`;
    
    const headers = isToken ? {
      'Authorization': `Bearer ${tokenOrUsername}`,
      'Accept': 'application/json'
    } : {
      'Accept': 'application/json'
    };

    const response = await fetch(endpoint, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await handleResponse(response);

    // Process the data to ensure we return a consistent format
    return {
      username: result.username,
      bio: result.bio || "",
      profileImage: result.profileImage,
      joinDate: result.joinDate || new Date().toISOString(),
      email: result.email
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      username: typeof tokenOrUsername === 'string' ? tokenOrUsername : 'Unknown',
      bio: "Error loading profile",
      profileImage: null,
      joinDate: new Date().toISOString(),
      email: ''
    };
  }
};

export const getUserByUsername = async (username) => {
  const response = await fetch(`${API_BASE_URL}/users/${username}`);
  return handleResponse(response);
};

export const updateUserProfile = async (token, userData) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
};

export const updateUserPassword = async (token, passwordData) => {
  const response = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors',
    body: JSON.stringify({
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  });
  return handleResponse(response);
};

export const deleteUserAccount = async (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const getUserRecipes = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/user/${username}`);
    const result = await handleResponse(response);
    
    // Handle different response formats
    let recipes;
    if (Array.isArray(result)) {
      recipes = result;
    } else if (result.recipes && Array.isArray(result.recipes)) {
      recipes = result.recipes;
    } else if (result.data && Array.isArray(result.data)) {
      recipes = result.data;
    } else if (typeof result === 'object') {
      // Convert object with numeric keys to array if needed
      recipes = Object.keys(result)
        .filter(key => !isNaN(key))
        .map(key => result[key]);
    }
    
    return recipes || [];
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return [];
  }
};

export const getSavedRecipes = async (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  const response = await fetch(`${API_BASE_URL}/users/saved-recipes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

// Check if a recipe is saved by the current user
export const isRecipeSaved = async (recipeId, token) => {
  if (!token || !recipeId) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/recipe/${recipeId}/saved`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.isSaved || false;
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // Silently handle errors and return false
    return false;
  }
};

// Save a recipe
export const saveRecipe = async (recipeId, token) => {
  if (!token || !recipeId) {
    throw new Error('Authentication token and recipe ID are required');
  }

  const response = await fetch(`${API_BASE_URL}/users/save-recipe/${recipeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include'
  });
  return handleResponse(response);
};

// Unsave a recipe
export const unsaveRecipe = async (recipeId, token) => {
  if (!token || !recipeId) {
    throw new Error('Authentication token and recipe ID are required');
  }

  const response = await fetch(`${API_BASE_URL}/users/unsave-recipe/${recipeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include'
  });
  return handleResponse(response);
};

export const getSuggestedRecipes = async () => {
  const response = await fetch(`${API_BASE_URL}/recipes/suggested`);
  const result = await handleResponse(response);
  
  // Extract data from the success object
  if (result && result.success) {
    // Remove the success property to get the actual data
    const { success: _, ...data } = result;
    
    // Handle object-style response with numeric keys
    if (typeof data === 'object') {
      // Convert object with numeric keys to array
      const recipeArray = Object.keys(data)
        .filter(key => !isNaN(key)) // Only take numeric keys
        .map(key => data[key]);
      
      if (recipeArray.length > 0) {
        return recipeArray;
      }
    }
    
    // If data is already an array, return it
    if (Array.isArray(data)) {
      return data;
    }
    
    // Check for nested data structures
    if (data.recipes && Array.isArray(data.recipes)) {
      return data.recipes;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
  }
  
  console.warn('Unexpected suggested recipes response format:', result);
  return [];
};

export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return handleResponse(response);
};

export const updateProfilePicture = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile picture');
    }

    return handleResponse(response);
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw error;
  }
};

export const getRandomRecipes = async (limit = 10, excludeId = null) => {
  const params = new URLSearchParams();
  params.append('limit', limit);
  if (excludeId) {
    params.append('excludeId', excludeId);
  }
  
  const response = await fetch(`${API_BASE_URL}/recipes/random?${params}`);
  const result = await handleResponse(response);
  
  // Handle different response formats
  if (Array.isArray(result)) {
    return result;
  } else if (result && Array.isArray(result.data)) {
    return result.data;
  } else if (result && typeof result === 'object') {
    // If it's a success wrapper object
    const { success, ...data } = result;
    if (Array.isArray(data)) {
      return data;
    }
    // If it's an object with numeric keys
    const recipeArray = Object.keys(data)
      .filter(key => !isNaN(key))
      .map(key => data[key]);
    if (recipeArray.length > 0) {
      return recipeArray;
    }
  }
  
  return [];
};

export const getLoggedInUserRecipes = async (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  const response = await fetch(`${API_BASE_URL}/users/my-recipes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  });
  return handleResponse(response);
};

export const addDummyRecipes = async () => {
  try {
    console.log('Starting to add dummy recipes...');
    
    const dummyRecipes = [
      {
        title: "Chicken Tikka Masala",
        description: "Rich and creamy Indian curry with tender chicken",
        ingredients: [
          "2 lbs chicken breast",
          "2 cups yogurt",
          "2 tbsp garam masala",
          "1 can tomato sauce",
          "1 cup heavy cream",
          "Fresh cilantro",
          "Basmati rice",
          "Naan bread"
        ],
        instructions: [
          "Marinate chicken in yogurt and spices",
          "Grill or broil chicken until charred",
          "Prepare sauce with tomatoes and cream",
          "Combine chicken with sauce",
          "Simmer until thick",
          "Serve with rice and naan"
        ],
        prepTimeMinutes: 30,
        cookTimeMinutes: 45,
        servings: 6,
        difficulty: "MEDIUM",
        cuisineType: "INDIAN",
        mealType: "DINNER",
        dietaryRestrictions: [],
        userId: 1
      },
      {
        title: "Spaghetti Carbonara",
        description: "Classic Italian pasta dish with eggs and pancetta",
        ingredients: [
          "1 lb spaghetti",
          "4 large eggs",
          "1 cup Pecorino Romano",
          "1/2 cup Parmigiano-Reggiano",
          "4 oz pancetta",
          "4 cloves garlic",
          "Black pepper",
          "Salt"
        ],
        instructions: [
          "Cook pasta in salted water",
          "Crisp pancetta in a pan",
          "Mix eggs and cheese",
          "Combine hot pasta with egg mixture",
          "Add pancetta and pepper",
          "Serve immediately"
        ],
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        servings: 4,
        difficulty: "EASY",
        cuisineType: "ITALIAN",
        mealType: "DINNER",
        dietaryRestrictions: [],
        userId: 1
      },
      {
        title: "Green Thai Curry",
        description: "Spicy and aromatic Thai curry with coconut milk",
        ingredients: [
          "Green curry paste",
          "Coconut milk",
          "Chicken or tofu",
          "Thai eggplants",
          "Bamboo shoots",
          "Thai basil",
          "Fish sauce",
          "Palm sugar"
        ],
        instructions: [
          "Heat coconut milk in pan",
          "Add curry paste and stir",
          "Add protein of choice",
          "Add vegetables",
          "Season with fish sauce and sugar",
          "Garnish with Thai basil"
        ],
        prepTimeMinutes: 20,
        cookTimeMinutes: 30,
        servings: 4,
        difficulty: "MEDIUM",
        cuisineType: "THAI",
        mealType: "DINNER",
        dietaryRestrictions: [],
        userId: 1
      }
    ];

    console.log('Adding dummy recipes one by one...');
    const results = [];

    // Add recipes one by one using the public endpoint
    for (const recipe of dummyRecipes) {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/public`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(recipe)
        });

        if (!response.ok) {
          console.error(`Failed to add recipe ${recipe.title}:`, response.status);
          continue;
        }

        const result = await response.json();
        console.log(`Successfully added recipe: ${recipe.title}`);
        results.push(result);

        // Add a small delay between requests to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error adding recipe ${recipe.title}:`, error);
      }
    }

    console.log('Finished adding dummy recipes:', results);
    return results;
  } catch (error) {
    console.error('Error in addDummyRecipes:', error);
    throw error;
  }
};