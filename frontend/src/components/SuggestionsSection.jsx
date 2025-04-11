import React, { useRef, useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { getRandomRecipes } from '../services/ApiService';
import { useNavigate } from 'react-router-dom';

const SuggestionsSection = ({ text = "", currentRecipeId }) => {
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [cardWidth, setCardWidth] = useState(300); // Default estimate
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Fetch suggested recipes from backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        // Convert currentRecipeId to number and ensure it's valid
        const excludeId = currentRecipeId ? Number(currentRecipeId) : null;
        
        if (isNaN(excludeId)) {
          console.error('Invalid recipe ID:', currentRecipeId);
          setSuggestions([]);
          setError('Invalid recipe ID');
          return;
        }
        
        const data = await getRandomRecipes(10, excludeId);
        
        if (!data || !Array.isArray(data)) {
          console.log('Invalid data format received:', data);
          setSuggestions([]);
          setError('Invalid data format received from server');
          return;
        }
        
        if (data.length === 0) {
          console.log('No recipes returned from server');
          setSuggestions([]);
          setError('No recipes available');
          return;
        }
        
        setSuggestions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentRecipeId]);

  // Handle recipe click
  const handleRecipeClick = (recipeId) => {
    // Scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/recipe/${recipeId}`);
  };
  
  // Calculate visible cards and track scroll position
  useEffect(() => {
    if (scrollContainerRef.current) {
      const updateScrollInfo = () => {
        // Get card width including margin
        const cards = scrollContainerRef.current.querySelectorAll('.card-wrapper');
        if (cards.length > 0) {
          const firstCardRect = cards[0].getBoundingClientRect();
          setCardWidth(firstCardRect.width + 16); // width + margin
        }
        
        setMaxScroll(scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth);
        setScrollPosition(scrollContainerRef.current.scrollLeft);
      };
      
      updateScrollInfo();
      
      // Add scroll event listener
      const handleScroll = () => {
        setScrollPosition(scrollContainerRef.current.scrollLeft);
      };
      
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateScrollInfo);
      
      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener('scroll', handleScroll);
        }
        window.removeEventListener('resize', updateScrollInfo);
      };
    }
  }, [suggestions]); // Re-run when suggestions change
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Calculate the number of whole cards that fit
      const visibleWidth = scrollContainerRef.current.clientWidth;
      const cardsPerView = Math.floor(visibleWidth / cardWidth);
      
      // Scroll by whole cards, making sure not to show partial cards
      const scrollDistance = cardsPerView * cardWidth;
      scrollContainerRef.current.scrollBy({ 
        left: -scrollDistance, 
        behavior: 'smooth' 
      });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Calculate the number of whole cards that fit
      const visibleWidth = scrollContainerRef.current.clientWidth;
      const cardsPerView = Math.floor(visibleWidth / cardWidth);
      
      // Scroll by whole cards, making sure not to show partial cards
      const scrollDistance = cardsPerView * cardWidth;
      scrollContainerRef.current.scrollBy({ 
        left: scrollDistance, 
        behavior: 'smooth' 
      });
    }
  };
  
  return (
    <div className="w-19/20 mx-auto rounded-[40px] text-white p-6 mt-4 relative"
          style={{ color: theme.core.text }}>
      {text && (
        <div className="w-full sm:w-8/20 md:w-6/20 lg:w-5/20 mx-auto p-3 text-xl sm:text-2xl font-bold text-center rounded-full mb-6"
            style={{ backgroundColor: theme.core.container }}>
          {text}
        </div>
      )}
      
      <div className="relative">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: theme.headerfooter.logoRed }}></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            No suggestions available at the moment.
          </div>
        ) : (
          <>
            {/* Left Arrow - Only show if not at the start */}
            {scrollPosition > 0 && (
              <button 
                onClick={scrollLeft}
                className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg cursor-pointer hover:scale-125"
                aria-label="Scroll left"
                style={{ backgroundColor: theme.core.containerHoover }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Suggestions Container - Horizontal Scrolling */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto py-4 px-12 space-x-4 no-scrollbar"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                `
              }} />
              
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="flex-shrink-0 card-wrapper cursor-pointer" 
                  style={{ scrollSnapAlign: 'start' }}
                  onClick={() => handleRecipeClick(suggestion.id)}
                >
                  <RecipeCard
                    title={suggestion.title}
                    image={suggestion.image}
                    timeInMins={suggestion.timeInMins}
                    rating={suggestion.rating}
                    servings={suggestion.servings}
                  />
                </div>
              ))}
            </div>
            
            {/* Right Arrow - Only show if not at the end */}
            {scrollPosition < maxScroll && (
              <button 
                onClick={scrollRight}
                className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg cursor-pointer hover:scale-125"
                aria-label="Scroll right"
                style={{ backgroundColor: theme.core.containerHoover }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionsSection;
