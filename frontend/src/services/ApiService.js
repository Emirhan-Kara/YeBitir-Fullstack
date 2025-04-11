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
  try {
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

    const result = await handleResponse(response);
    
    // Ensure the response has the expected structure
    if (!result.data) {
      return {
        data: {
          user: result.user || result,
          token: result.token
        }
      };
    }
    
    return result;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
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
    const formData = new FormData();
    const recipeBlob = new Blob([JSON.stringify(recipeData)], { type: 'application/json' });
    formData.append('recipe', recipeBlob);

    // Append image if it exists and is valid
    if (image) {
      if (!(image instanceof File)) {
        throw new Error('Invalid image file');
      }
      formData.append('image', image);
    }

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
      const errorData = await response.json();
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
    const result = await handleResponse(response);
    
    // Ensure we return an array
    if (Array.isArray(result)) {
      return result;
    } else if (result && typeof result === 'object') {
      if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.recipes && Array.isArray(result.recipes)) {
        return result.recipes;
      } else {
        // Convert object with numeric keys to array if needed
        const recipeArray = Object.keys(result)
          .filter(key => !isNaN(key))
          .map(key => result[key]);
        if (recipeArray.length > 0) {
          return recipeArray;
        }
      }
    }
    return []; // Return empty array if no valid data format found
  } else {
    // Handle text search
    const response = await fetch(`${API_BASE_URL}/recipes/search?query=${encodeURIComponent(query)}`);
    const result = await handleResponse(response);
    
    // Apply the same array handling logic
    if (Array.isArray(result)) {
      return result;
    } else if (result && typeof result === 'object') {
      if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.recipes && Array.isArray(result.recipes)) {
        return result.recipes;
      } else {
        const recipeArray = Object.keys(result)
          .filter(key => !isNaN(key))
          .map(key => result[key]);
        if (recipeArray.length > 0) {
          return recipeArray;
        }
      }
    }
    return []; // Return empty array if no valid data format found
  }
};

export const filterRecipes = async (filterData) => {
  // Clean up filter data to remove "Any" values
  const cleanedFilters = {};
  Object.entries(filterData).forEach(([key, value]) => {
    if (value && value !== '' && value !== 'Any') {
      cleanedFilters[key] = value;
    }
  });
  
  const response = await fetch(`${API_BASE_URL}/recipes/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanedFilters)
  });
  return handleResponse(response);
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

export const deleteOwnComment = async (token, commentId) => {
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

export const deleteComment = async (token, commentId) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  // Get the current user's role from the token
  const tokenData = JSON.parse(atob(token.split('.')[1]));
  const isAdmin = tokenData.role === 'ADMIN';

  // Use the appropriate function based on user role
  if (isAdmin) {
    const response = await fetch(`${API_BASE_URL}/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  } else {
    return deleteOwnComment(token, commentId);
  }
};

// User services
export const getUserProfile = async (token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
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
    const response = await fetch(`${API_BASE_URL}/users/${username}/recipes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    throw error;
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

export const getRecipeStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/recipes/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return handleResponse(response);
};

export const updateRecipeStatus = async (recipeId, isActive, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/recipes/${recipeId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ active: isActive })
  });
  return handleResponse(response);
};

export const deleteRecipeAdmin = async (recipeId, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  return handleResponse(response);
};

// Admin-specific recipe services
export const getAdminRecipes = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/recipes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const result = await handleResponse(response);
  
  // Handle different response formats
  if (Array.isArray(result)) {
    return result;
  } else if (result && typeof result === 'object') {
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else if (result.recipes && Array.isArray(result.recipes)) {
      return result.recipes;
    } else {
      // Convert object with numeric keys to array if needed
      const recipeArray = Object.keys(result)
        .filter(key => !isNaN(key))
        .map(key => result[key]);
      if (recipeArray.length > 0) {
        return recipeArray;
      }
    }
  }
  
  console.warn('Unexpected admin recipes response format:', result);
  return [];
};

export const deleteUserAdmin = async (userId, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  return handleResponse(response);
};

// Admin User Management
export const getAdminUsers = async (token) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse server response: ' + responseText);
    }

    // Handle different response formats
    let users = [];
    if (Array.isArray(result)) {
      users = result;
    } else if (result && Array.isArray(result.data)) {
      users = result.data;
    } else if (result && typeof result === 'object') {
      // Try to extract users from object if needed
      const possibleUsers = Object.values(result).find(val => Array.isArray(val));
      if (possibleUsers) {
        users = possibleUsers;
      }
    }


    // Transform and validate each user object
    const transformedUsers = users.map(user => {
      const transformed = {
        id: user.id || 0,
        username: user.username || '',
        email: user.email || '',
        dateCreated: user.joinDate || user.join_date || null,
        lastActive: user.lastLogin || user.last_login || null,
        removed: user.active === false || user.active === 0,
        role: user.role || 'USER'
      };
      return transformed;
    });

    return transformedUsers;
  } catch (error) {
    console.error('Error in getAdminUsers:', error);
    throw error;
  }
};

export const getUserStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  return handleResponse(response);
};

export const updateUserStatus = async (userId, isActive, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ active: isActive }),
    credentials: 'include'
  });
  return handleResponse(response);
};

export const searchUsersAdmin = async (query, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  return handleResponse(response);
};

export const filterUsersAdmin = async (filters, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/filter`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(filters),
    credentials: 'include'
  });
  return handleResponse(response);
};

export const getAdminStats = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch admin statistics');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch admin statistics');
  }
};

// Function to report a comment
export const reportComment = async (commentId, token) => {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    console.log('Reporting comment:', commentId);
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to report comment: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reporting comment:', error);
    throw error;
  }
};

// Function to get all comments for admin
export const getAllComments = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Frontend: Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Frontend: Successfully received comments:', data.length);
    return data;
  } catch (error) {
    console.error('Frontend: Error in getAllComments:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

// Function to clear a reported comment
export const clearReportedComment = async (token, commentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/comments/${commentId}/clear-report`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error clearing reported comment:', error);
    throw new Error(error.message || 'Failed to clear reported comment');
  }
};