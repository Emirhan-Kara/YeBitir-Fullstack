import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const RecipeCard = ({ 
    title = "Untitled Recipe",
    image,
    timeInMins = 0,
    rating = 0,
    servings = 1,
    onClick
}) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  
  // Default fallback image - base64 encoded to avoid network requests
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjQwMCIgeT0iNDAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yzc1N2QiPlJlY2lwZSBJbWFnZTwvdGV4dD48L3N2Zz4=";

  return (
    <div 
      onClick={onClick}
      className="w-72 m-2 rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
      style={{ backgroundColor: theme.recipecard.background }}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={imageError ? fallbackImage : image} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      
      {/* Recipe Details */}
      <div className="p-4">
        {/* Recipe Title */}
        <h3 
          className="text-lg font-semibold mb-2 h-14 line-clamp-2 overflow-hidden"
          style={{ color: theme.recipecard.text }}
        >
          {title || "Untitled Recipe"}
        </h3>
        
        {/* Recipe Metadata */}
        <div className="flex flex-col space-y-1 text-sm">
          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Cooking Time */}
            <div 
              className="flex flex-col items-center justify-center p-1 pb-2 rounded"
              style={{ 
                backgroundColor: theme.recipecard.component, 
                color: theme.recipecard.componentText 
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeInMins || 0} mins</span>
            </div>
            
            {/* Rating */}
            <div 
              className="flex flex-col items-center justify-center p-1 pb-2 rounded"
              style={{ 
                backgroundColor: theme.recipecard.component, 
                color: theme.recipecard.componentText 
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{rating || 0}</span>
            </div>
            
            {/* Servings */}
            <div 
              className="flex flex-col items-center justify-center p-1 pb-2 rounded"
              style={{ 
                backgroundColor: theme.recipecard.component, 
                color: theme.recipecard.componentText 
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 199.603 199.603" fill="currentColor" className="w-5 h-5 mb-1">
                <path d="M187.251,173.172c-4.141,0-7.509-3.369-7.509-7.509V32.074c0-1.952,1.569-5.644,7.509-5.644 c9.424,0,12.352,33.462,12.352,45.651c0,18.908-4.182,36.269-4.843,38.893v54.688C194.76,169.803,191.392,173.172,187.251,173.172z M184.742,113.161v52.502c0,1.383,1.125,2.509,2.509,2.509s2.509-1.125,2.509-2.509v-52.502H184.742z M184.742,108.161h5.548 c1.187-5.159,4.313-20.256,4.313-36.079c0-20.876-4.906-38.858-7.546-40.649c-1.542,0.033-2.218,0.461-2.314,0.771V108.161z M16.632,173.172c-1.87,0-3.67-0.734-4.938-2.014c-1.165-1.177-1.799-2.711-1.783-4.318l0.806-81.785 C4.583,82.688,0.142,76.768,0.001,69.852C-0.001,69.79,0,69.727,0.003,69.664L1.718,31.96c0.063-1.378,1.259-2.421,2.61-2.384 c1.38,0.063,2.447,1.232,2.384,2.611l-1.596,35.09h4.361l0.802-35.26c0.031-1.381,1.208-2.48,2.556-2.443 c1.381,0.032,2.474,1.176,2.442,2.556L14.48,67.278h4.306l-0.799-35.147c-0.031-1.38,1.062-2.524,2.442-2.556 c1.358-0.042,2.525,1.062,2.556,2.443l0.802,35.26h4.361l-1.595-35.09c-0.063-1.379,1.004-2.548,2.384-2.611 c1.367-0.052,2.549,1.005,2.61,2.384l1.714,37.703c0.003,0.063,0.004,0.126,0.002,0.188c-0.141,6.915-4.582,12.836-10.716,15.203 l0.807,81.785c0.016,1.607-0.618,3.141-1.783,4.318C20.302,172.438,18.502,173.172,16.632,173.172z M15.706,86.156l-0.795,80.732 c-0.003,0.337,0.181,0.595,0.336,0.751c0.67,0.677,2.099,0.676,2.771,0c0.155-0.157,0.339-0.415,0.336-0.751l-0.796-80.732H15.706z M5.333,72.278c1.256,5.078,5.878,8.878,11.299,8.878c5.422,0,10.044-3.8,11.299-8.878h-6.587c0,0-0.003,0-0.005,0h-9.414 c-0.001,0-0.001,0-0.002,0c0,0-0.001,0-0.002,0H5.333z M102.781,163.258c-36.692,0-66.544-29.852-66.544-66.544 s29.852-66.544,66.544-66.544c36.693,0,66.545,29.852,66.545,66.544S139.475,163.258,102.781,163.258z M102.781,35.169 c-33.936,0-61.544,27.609-61.544,61.544s27.608,61.544,61.544,61.544s61.545-27.609,61.545-61.544S136.717,35.169,102.781,35.169z M102.781,145.155c-26.711,0-48.441-21.731-48.441-48.441s21.73-48.441,48.441-48.441s48.441,21.731,48.441,48.441 S129.492,145.155,102.781,145.155z M102.781,53.272c-23.954,0-43.441,19.488-43.441,43.441s19.487,43.441,43.441,43.441 s43.441-19.488,43.441-43.441S126.735,53.272,102.781,53.272z"></path>
              </svg>
              <span>{servings || 1} servings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;