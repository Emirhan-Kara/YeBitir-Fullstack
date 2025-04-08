import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Home, UtensilsCrossed, Shuffle, Info, FilePlus, User, LogIn, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Header = ({ 
  isHomepage = false, 
  scrollThreshold = 50
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { theme } = useTheme();
  const { isLoggedIn, isAdmin } = useAuth(); // Get authentication state and isAdmin from context
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        const isScrollingDown = currentScrollY > lastScrollY;
        
        setIsVisible(!isScrollingDown);
        setLastScrollY(currentScrollY);
      }
    };
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY, scrollThreshold]);

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };
  
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery('');
      navigate(`/recipes`);
      setIsSearchVisible(false);
    }
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recipes', label: 'Recipes', icon: UtensilsCrossed },
    { path: '/recipe-wheel', label: 'Recipe Wheel', icon: Shuffle },
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/add-recipe', label: 'Add Recipe', icon: FilePlus },
  ];

  return (
    <header 
      className={`px-2 sm:px-3 md:px-6 lg:px-8 py-2 md:py-3 w-full fixed top-0 z-50 ${
        isVisible 
          ? 'translate-y-0 shadow-md' 
          : '-translate-y-full'
      } transition-all duration-500 ease-in-out`}
      style={{ 
        backgroundColor: theme.headerfooter.background,
        color: theme.headerfooter.text 
      }}
    >
      <div className="flex flex-wrap items-center justify-between">
        {/* Logo and Theme Toggle - Always visible */}
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <span 
              className="font-bold text-xl" 
              style={{ color: theme.headerfooter.logoRed, fontFamily: "cursive" }}
            >
              Ye
            </span>
            <span 
              className="font-bold text-xl" 
              style={{ color: theme.core.text, fontFamily: "cursive" }}
            >
              Bitir
            </span>
          </Link>
          
          {/* Theme Toggle */}
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Search - Collapsible on small screens, visible on larger screens */}
        {!isHomepage && (
          <div className={`${isSearchVisible ? 'flex' : 'hidden'} md:flex w-full md:w-auto order-3 md:order-2 mt-3 md:mt-0`}>
            <form onSubmit={handleSearch} className="relative flex w-full md:w-auto">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search recipes..." 
                  className="w-full p-2 rounded-l-lg pl-8 text-sm"
                  style={{
                    backgroundColor: theme.headerfooter.searchBox,
                    color: theme.core.text,
                    borderColor: theme.headerfooter.componentBg
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search 
                  className="absolute left-2 top-2.5" 
                  size={14} 
                  color={theme.core.text} 
                />
              </div>
              <button 
                type="submit" 
                className="px-3 py-2 rounded-r-lg transition-colors cursor-pointer hover:brightness-110 transform hover:scale-105 transition-transform duration-200"
                style={{
                  backgroundColor: theme.headerfooter.logoRed,
                  color: theme.recipecard.componentText,
                }}
                aria-label="Search"
              >
                <Search size={14} color={theme.recipecard.componentText} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile search toggle */}
        {!isHomepage && (
          <button 
            className="md:hidden order-2 p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-200 transform hover:scale-110 transition-transform duration-200"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            aria-label="Toggle search"
          >
            <Search size={20} color={theme.headerfooter.text} />
          </button>
        )}

        {/* Navigation - Horizontal scrolling on small screens */}
        <div className="order-4 md:order-3 w-full md:w-auto mt-2 md:mt-0 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6 py-1 min-w-max">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className="flex flex-col items-center px-1 sm:px-2 md:px-3 lg:px-4 no-underline whitespace-nowrap group transform hover:scale-110 transition-transform duration-200"
              >
                <div className="p-1 rounded-full transition-colors group-hover:bg-opacity-20 group-hover:bg-gray-400">
                  <item.icon 
                    size={windowWidth < 768 ? 20 : 24} 
                    className="sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-6 lg:h-6"
                    color={isActiveRoute(item.path) ? theme.headerfooter.logoRed : theme.headerfooter.text} 
                  />
                </div>
                <span 
                  className={`text-xs sm:text-sm md:text-sm lg:text-sm pt-1 ${isActiveRoute(item.path) ? 'font-bold' : ''}`}
                  style={{ 
                    color: isActiveRoute(item.path) 
                      ? theme.headerfooter.logoRed
                      : theme.headerfooter.text
                  }}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            
            {/* Profile/Login - Using isAdmin from context */}
            <Link 
              to={isLoggedIn ? (isAdmin ? "/admin" : "/profile") : "/login"} 
              className="flex flex-col items-center px-1 sm:px-2 md:px-3 lg:px-4 no-underline whitespace-nowrap group transform hover:scale-110 transition-transform duration-200"
            >
              <div className="p-1 rounded-full transition-colors group-hover:bg-opacity-20 group-hover:bg-gray-400">
                {isLoggedIn ? (
                  <User 
                    size={windowWidth < 768 ? 20 : 24} 
                    className="sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-6 lg:h-6"
                    color={isActiveRoute(isAdmin ? '/admin' : '/profile') ? theme.headerfooter.logoRed : theme.headerfooter.text} 
                  />
                ) : (
                  <LogIn 
                    size={windowWidth < 768 ? 20 : 24} 
                    className="sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-6 lg:h-6"
                    color={isActiveRoute('/login') ? theme.headerfooter.logoRed : theme.headerfooter.text} 
                  />
                )}
              </div>
              <span 
                className={`text-xs sm:text-sm md:text-sm lg:text-sm pt-1 ${isActiveRoute(isLoggedIn ? (isAdmin ? '/admin' : '/profile') : '/login') ? 'font-bold' : ''}`}
                style={{ 
                  color: isActiveRoute(isLoggedIn ? (isAdmin ? '/admin' : '/profile') : '/login') 
                    ? theme.headerfooter.logoRed
                    : theme.headerfooter.text
                }}
              >
                {isLoggedIn ? (isAdmin ? "Admin" : "Profile") : "Login"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Custom scrollbar hiding styles */}
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;  /* Internet Explorer and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, and Opera */
          }
        `}
      </style>
    </header>
  );
};

export default Header;