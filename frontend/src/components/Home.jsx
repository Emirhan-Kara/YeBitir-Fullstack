import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UtensilsCrossed, Clock, Salad, Cherry, Shuffle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import RecipeCard from './RecipeCard';
import './Home.css';
import { getAllRecipes } from '../services/ApiService';

// Custom navigation function that ensures scroll to top
const useCustomNavigate = () => {
  const navigate = useNavigate();
  
  const navigateAndScrollToTop = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };
  
  return navigateAndScrollToTop;
};

// Reuse the AnimatedFoodIconsBackground from RecipeWheel
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const Home = () => {
  const { theme } = useTheme();
  const navigateTo = useCustomNavigate();
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track mouse position for responsive shapes
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (containerRef.current) {
        const { left, top } = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - left,
          y: event.clientY - top
        });
      }
    };
    
    // Update window size
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Scroll reveal animation
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      
      reveals.forEach((reveal) => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (revealTop < windowHeight - revealPoint) {
          reveal.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check on load
    setTimeout(handleScroll, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Calculate position for edgy shapes based on mouse position
  const getShapeStyle = (baseX, baseY, moveFactor) => {
    const moveX = (mousePosition.x / (windowSize.width || 1) - 0.5) * moveFactor;
    const moveY = (mousePosition.y / (windowSize.height || 1) - 0.5) * moveFactor;
    
    return {
      transform: `translate(${baseX + moveX}px, ${baseY + moveY}px)`
    };
  };
  
  // Generate edgy shapes
  const generateEdgyShapes = () => {
    // Define shapes with various properties for an interesting background
    const shapeConfigs = [
      // Top left triangle
      {
        style: {
          ...getShapeStyle(-50, -50, 20),
          width: '300px',
          height: '300px',
          background: `${theme.headerfooter.logoRed}10`,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          top: '0',
          left: '0'
        }
      },
      // Top right triangle (symmetrical)
      {
        style: {
          ...getShapeStyle(50, -50, 20),
          width: '300px',
          height: '300px',
          background: `${theme.headerfooter.logoRed}10`,
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          top: '0',
          right: '0'
        }
      },
      // Center diamond
      {
        style: {
          ...getShapeStyle(0, 0, 15),
          width: '200px',
          height: '200px',
          background: `${theme.core.containerHoover}15`,
          clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
          top: '50%',
          left: '50%',
          marginTop: '-100px',
          marginLeft: '-100px'
        }
      },
      // Bottom left zigzag
      {
        style: {
          ...getShapeStyle(-80, 100, 30),
          width: '400px',
          height: '200px',
          background: `${theme.core.text}08`,
          clipPath: 'polygon(0 100%, 25% 0, 50% 100%, 75% 0, 100% 100%)',
          bottom: '0',
          left: '0'
        }
      },
      // Bottom right zigzag (symmetrical)
      {
        style: {
          ...getShapeStyle(80, 100, 30),
          width: '400px',
          height: '200px',
          background: `${theme.core.text}08`,
          clipPath: 'polygon(0 100%, 25% 0, 50% 100%, 75% 0, 100% 100%)',
          bottom: '0',
          right: '0'
        }
      },
      // Left edge rectangle
      {
        style: {
          ...getShapeStyle(-120, 0, 25),
          width: '100px',
          height: '70%',
          background: `${theme.headerfooter.logoRed}08`,
          clipPath: 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)',
          top: '15%',
          left: '0'
        }
      },
      // Right edge rectangle (symmetrical)
      {
        style: {
          ...getShapeStyle(120, 0, 25),
          width: '100px',
          height: '70%',
          background: `${theme.headerfooter.logoRed}08`,
          clipPath: 'polygon(100% 0, 0 25%, 0 75%, 100% 100%)',
          top: '15%',
          right: '0'
        }
      },
      // Top center shape
      {
        style: {
          ...getShapeStyle(0, -30, 10),
          width: '40%',
          height: '150px',
          background: `${theme.core.containerHoover}10`,
          clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
          top: '0',
          left: '30%'
        }
      }
    ];
    
    return shapeConfigs.map((config, index) => (
      <div 
        key={`shape-${index}`}
        className={`edgy-shape shape-${index} absolute transition-transform duration-300 ease-out`}
        style={config.style}
      ></div>
    ));
  };
  
  // Handle search submit
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo(`/recipes?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Fetch recipes from backend
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const recipesData = await getAllRecipes();
      
      if (!Array.isArray(recipesData)) {
        setRecipes([]);
      } else {
        setRecipes(recipesData);
      }
      
    } catch {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="home-container"
      style={{ backgroundColor: theme.core.background, color: theme.core.text }}
    >
      {/* AnimatedFoodIconsBackground */}
      <AnimatedFoodIconsBackground count={120} />
      
      {/* Edgy shapes that respond to mouse movement */}
      <div className="edgy-shapes-container">
        {generateEdgyShapes()}
      </div>
      
      {/* Main content container */}
      <div className="content-container">
        <div className="hero-section text-center mb-12">
          <h1 className="edgy-title font-bold mb-4 animate-fadeIn">
            Ye Bitir
          </h1>
          <p className="text-xl mb-8 animate-fadeIn delay-200">
            Discover, share, and savor amazing recipes!
          </p>
          
          {/* Search bar with edgy design for small screens */}
          <div className="search-container max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative flex w-full animate-fadeIn delay-300">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search recipes..." 
                  className={`w-full p-3 transition-all duration-300 ${windowSize.width < 640 ? 'edgy-input' : 'rounded-l-lg'}`}
                  style={{
                    backgroundColor: theme.headerfooter.searchBox,
                    color: theme.core.text,
                    borderColor: theme.headerfooter.componentBg
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className={`px-6 py-3 transition-all duration-300 cursor-pointer hover:brightness-110 transform hover:scale-105 ${windowSize.width < 640 ? 'edgy-button' : 'rounded-r-lg'}`}
                style={{
                  backgroundColor: theme.headerfooter.logoRed,
                  color: theme.recipecard.componentText,
                }}
                aria-label="Search"
              >
                Search
              </button>
            </form>
          </div>
        </div>
        
        {/* Recipe Wheel Button */}
        <div className="flex justify-center mt-10">
            <button 
              onClick={() => navigateTo('/recipe-wheel')}
              className="recipe-wheel-btn flex items-center gap-2 px-6 py-3 transform hover:scale-115 transition-transform duration-200 cursor-pointer"
              style={{ 
                backgroundColor: theme.headerfooter.logoRed,
                color: theme.recipecard.componentText
              }}
            >
              <Shuffle size={20} />
              <span className="font-semibold">Try Our Recipe Wheel</span>
            </button>
          </div>

        {/* Featured recipes section */}
        <div className="featured-section mt-24 reveal">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold edgy-heading mx-auto">
              Featured Recipes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {loading ? (
              <div className="col-span-full text-center py-10">Loading recipes...</div>
            ) : error ? (
              <div className="col-span-full text-center py-10">Error loading recipes</div>
            ) : recipes.length > 0 ? (
              recipes.slice(0, 9).map((recipe) => (
                <div key={`recipe-${recipe.id}`} onClick={() => navigateTo(`/recipe/${recipe.id}`)} className="cursor-pointer">
                  <RecipeCard 
                    title={recipe.title}
                    image={recipe.image} 
                    timeInMins={recipe.timeInMins}
                    rating={recipe.rating}
                    servings={recipe.servings}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">No recipes found</div>
            )}
          </div>
        </div>
        
        {/* Cuisines section */}
        <div className="cuisines-section mt-24 reveal">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold edgy-heading mx-auto">Explore Cuisines</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Italian", image: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg" },
              { name: "Mexican", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/800px-Flag_of_Mexico.svg.png" },
              { name: "Chinese", image: "https://cdn.britannica.com/90/7490-004-BAD4AA72/Flag-China.jpg" },
              { name: "Indian", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/2560px-Flag_of_India.svg.png" },
              { name: "Japanese", image: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/640px-Flag_of_Japan.svg.png" },
              { name: "Turkish", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1200px-Flag_of_Turkey.svg.png" }
            ].map((cuisine, index) => (
              <div 
                key={`cuisine-${index}`} 
                className="category-card relative overflow-hidden cursor-pointer animate-float hover:scale-110"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigateTo(`/recipes?cuisine=${cuisine.name}`)}
              >
                <img src={cuisine.image} alt={cuisine.name} className="w-full h-32 object-cover" />
                <div className="category-overlay absolute inset-0 flex items-end justify-center p-2">
                  <span className="text-white font-bold text-lg">{cuisine.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Meal Types section */}
        <div className="meal-types-section mt-24 reveal">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold edgy-heading mx-auto">Meal Types</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Breakfast", icon: <Clock size={36} /> },
              { name: "Lunch", icon: <UtensilsCrossed size={36} /> },
              { name: "Dinner", icon: <UtensilsCrossed size={36} /> },
              { name: "Dessert", icon: <Cherry size={36} /> }
            ].map((mealType, index) => (
              <div 
                key={`meal-${index}`} 
                className="edgy-corner category-box flex flex-col items-center justify-center p-6 cursor-pointer transition-all hover:scale-105 animate-float"
                style={{ 
                  backgroundColor: `${theme.core.containerHoover}40`,
                  animationDelay: `${index * 200}ms` 
                }}
                onClick={() => navigateTo(`/recipes?mealType=${mealType.name}`)}
              >
                <div className="icon-container mb-2 text-center hover:scale-110" style={{ color: theme.headerfooter.logoRed }}>
                  {mealType.icon}
                </div>
                <h3 className="text-lg font-semibold">{mealType.name}</h3>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dietary Preferences section */}
        <div className="diet-section mt-24 reveal">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold edgy-heading mx-auto">Dietary Preferences</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Vegetarian", count: "320+ recipes" },
              { name: "Vegan", count: "215+ recipes" },
              { name: "Gluten-Free", count: "180+ recipes" },
              { name: "Keto", count: "150+ recipes" },
              { name: "Low-Carb", count: "200+ recipes" },
              { name: "Dairy-Free", count: "170+ recipes" }
            ].map((diet, index) => (
              <div 
                key={`diet-${index}`} 
                className="edgy-corner category-box p-4 cursor-pointer transition-all hover:scale-105"
                style={{ 
                  backgroundColor: `${theme.core.containerHoover}30`,
                  clipPath: index % 2 === 0 
                    ? 'polygon(0 10%, 10% 0, 95% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%)' 
                    : 'polygon(5% 0, 90% 0, 100% 10%, 100% 90%, 95% 100%, 10% 100%, 0 90%, 0 10%)'
                }}
                onClick={() => navigateTo(`/recipes?diet=${diet.name}`)}
              >
                <h3 className="text-lg font-semibold">{diet.name}</h3>
                <p className="text-sm opacity-75">{diet.count}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Ingredients section */}
        <div className="ingredients-section mt-24 reveal">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold edgy-heading mx-auto">Main Ingredients</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Chicken", "Beef", "Fish", "Pork", "Tofu", "Rice", 
              "Pasta", "Potatoes", "Eggs", "Cheese", "Mushrooms", "Vegetables"
            ].map((ingredient, index) => (
              <div 
                key={`ingredient-${index}`} 
                className="ingredient-tag pulse-border cursor-pointer px-4 py-2 m-1 transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: `${theme.core.containerHoover}50`,
                  clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)'
                }}
                onClick={() => navigateTo(`/recipes?ingredient=${ingredient}`)}
              >
                <span className="font-medium">{ingredient}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Action Buttons */}
        <div className="action-buttons-section mt-32 mb-24 reveal">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <button 
              onClick={() => navigateTo('/recipes')}
              className="cursor-pointer action-button flex items-center gap-2 px-8 py-4 edgy-corner transform hover:scale-105 transition-transform duration-200 text-center"
              style={{ 
                backgroundColor: theme.core.containerHoover,
                color: theme.core.text
              }}
            >
              <span className="font-bold">Explore All Recipes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 