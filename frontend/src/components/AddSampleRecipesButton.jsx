import React, { useState } from 'react';
import { addDummyRecipes } from '../services/ApiService';
import { motion } from 'framer-motion';

const AddSampleRecipesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSampleRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Adding dummy recipes...');
      const results = await addDummyRecipes();
      console.log('Dummy recipes added successfully:', results);
      alert('Sample recipes have been added successfully!');
    } catch (err) {
      console.error('Error adding dummy recipes:', err);
      setError(err.message || 'Failed to add sample recipes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddSampleRecipes}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg text-white font-medium ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700'
        } transition-colors duration-200 flex items-center gap-2`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding Recipes...
          </>
        ) : (
          'Add Sample Recipes'
        )}
      </motion.button>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          Error: {error}
        </p>
      )}
    </div>
  );
};

export default AddSampleRecipesButton; 