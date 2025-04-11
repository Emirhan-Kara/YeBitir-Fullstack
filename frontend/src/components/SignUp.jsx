import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import ThemeToggle from './ThemeToggle';
import { User, Mail, Lock, KeyRound, UserPlus, AlertCircle } from 'lucide-react';
import './SignUp.css';

// Reuse the AnimatedFoodIconsBackground from Home
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { theme } = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

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

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password
      );
      
      if (result.success) {
        // Set success message and keep form disabled
        setSuccessMessage('Registration successful! Redirecting to login...');
        setIsLoading(true); 
        
        // Force a 2-second delay before navigation
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setGeneralError(result.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('already exists')) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered'
        }));
      } else {
        setGeneralError('An error occurred during registration. Please try again.');
      }
      setIsLoading(false);
    }
  };

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

  return (
    <div 
      ref={containerRef}
      className="signup-container"
      style={{ 
        backgroundColor: theme.core.background, 
        color: theme.core.text 
      }}
    >
      {/* AnimatedFoodIconsBackground */}
      <AnimatedFoodIconsBackground count={80} />
      
      {/* Edgy shapes that respond to mouse movement */}
      <div className="shape-container">
        {generateEdgyShapes()}
      </div>

      {/* Theme Toggle */}
      <div className="theme-toggle-position">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo/Brand */}
          <div className="flex justify-center animate-float">
            <Link to="/" className="flex flex-col items-center">
              <span className="font-bold text-5xl text-gray-900 drop-shadow-xl" style={{ 
                fontFamily: "cursive",
                color: theme.headerfooter.logoRed
              }}>
                Ye
              </span>
              <span className="font-bold text-5xl drop-shadow-xl" style={{ 
                fontFamily: "cursive",
                color: theme.core.text
              }}>
                Bitir
              </span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold relative z-10 animate-fadeIn">
            <span className="relative edgy-title">Create Account</span>
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fadeIn delay-200">
          <div 
            className="signup-card sm:rounded-lg sm:px-10 edgy-form-container" 
            style={{ 
              backgroundColor: `${theme.core.containerHoover}80`
            }}
          >
            {/* Success Message - Force green with inline styles */}
            {successMessage && (
              <div 
                className="mb-4 p-4 rounded-lg shadow-lg"
                style={{
                  backgroundColor: '#dcfce7', /* Light green background */
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: '#16a34a', /* Medium green border */
                  color: '#15803d', /* Dark green text */
                  animation: 'successAnimation 0.5s ease-out forwards, successPulse 2s ease-in-out infinite'
                }}
              >
                <p className="flex items-center justify-center text-lg font-medium">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error Message */}
            {generalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded animate-shake">
                <p className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {generalError}
                </p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Full Name
                </label>
                <div className="mt-1 input-with-icon">
                  <div className="input-icon">
                    <User size={18} style={{ color: theme.core.text }} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`custom-input edgy-input ${errors.name ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: `${theme.headerfooter.searchBox}90`,
                      color: theme.core.text
                    }}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <div className="mt-1 input-with-icon">
                  <div className="input-icon">
                    <Mail size={18} style={{ color: theme.core.text }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`custom-input edgy-input ${errors.email ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: `${theme.headerfooter.searchBox}90`,
                      color: theme.core.text
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="mt-1 input-with-icon">
                  <div className="input-icon">
                    <Lock size={18} style={{ color: theme.core.text }} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`custom-input edgy-input ${errors.password ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: `${theme.headerfooter.searchBox}90`,
                      color: theme.core.text
                    }}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <div className="mt-1 input-with-icon">
                  <div className="input-icon">
                    <KeyRound size={18} style={{ color: theme.core.text }} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`custom-input edgy-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: `${theme.headerfooter.searchBox}90`,
                      color: theme.core.text
                    }}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: theme.headerfooter.logoRed,
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-2" />
                      Sign up
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: `${theme.core.text}20` }}></div>
                </div>
                <div className="relative flex justify-center text-sm ">
                  <span className="px-2 py-1 rounded-xl" style={{ backgroundColor: theme.headerfooter.componentBg, color: theme.core.text }}>
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="font-medium hover:underline transition-colors"
                  style={{ color: theme.headerfooter.logoRed }}
                >
                  Login to your account
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center animate-fadeIn delay-300">
          <Link to="/" className="text-sm hover:underline transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;