import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.name === 'dark';

  return (
    <div className={`flex items-center ${className}`}>
      <span 
        className="mr-2 text-sm font-medium"
        style={{ color: theme.headerfooter.text }}
      >
        {isDark ? 'Dark' : 'Light'} Mode
      </span>
      <button
        onClick={toggleTheme}
        className="w-14 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none"
        style={{
          backgroundColor: isDark ? theme.headerfooter.componentBg : theme.core.container
        }}
      >
        <div
          className={`
            bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300
            ${isDark ? 'translate-x-7' : 'translate-x-0'}
            flex items-center justify-center
          `}
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
