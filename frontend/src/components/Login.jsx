import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedFoodIcons from './AnimatedFoodIcons';
import ThemeToggle from './ThemeToggle';
import { 
  User, 
  Lock, 
  LogIn, 
  X, 
  Mail, 
  Send, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import './Login.css';

// Reuse the AnimatedFoodIconsBackground from Home
const AnimatedFoodIconsBackground = React.memo(({ count }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      <AnimatedFoodIcons count={count} />
    </div>
  );
});

// Forgot Password Modal Component
const ForgotPasswordModal = ({ isOpen, onClose, theme }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef(null);
  
  useEffect(() => {
    // Close modal when pressing escape key
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    // Click outside to close
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle email validation and reset request
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      // Reset the form after a delay
      setTimeout(() => {
        onClose();
        setEmail('');
        setSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div 
        ref={modalRef}
        className="modal-container"
        style={{ 
          backgroundColor: theme.core.containerHoover,
          color: theme.core.text
        }}
      >
        <div className="modal-backdrop" style={{ backgroundColor: theme.headerfooter.logoRed }}></div>
        
        <div className="modal-header">
          <h2 className="modal-title">Reset Your Password</h2>
          <button 
            onClick={onClose} 
            className="close-button"
            style={{ color: theme.core.text }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          {!success ? (
            <>
              <p className="mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {error && (
                <div className="flex items-center gap-2 text-red-500 mb-4 p-2 bg-red-100 rounded">
                  <AlertCircle size={18} />
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="block text-sm font-medium mb-1">
                    Email address
                  </label>
                  <div className="input-with-icon">
                    <div className="input-icon">
                      <Mail size={18} style={{ color: theme.core.text }} />
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="custom-input edgy-input"
                      placeholder="your-email@example.com"
                      style={{
                        backgroundColor: `${theme.headerfooter.searchBox}90`,
                        color: theme.core.text
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="modal-submit-btn edgy-button w-full mt-2"
                  style={{ backgroundColor: theme.headerfooter.logoRed }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block mr-2">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="modal-success-icon">
                <CheckCircle size={48} color={theme.headerfooter.logoRed} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reset Link Sent!</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    try {
      // Attempt login with our auth context
      const result = await login(email, password);
      
      if (result.success) {
        // Get the saved redirect path or default to home
        const redirectPath = localStorage.getItem('redirectPath') || '/';
        localStorage.removeItem('redirectPath'); // Clear the saved path
        navigate(redirectPath);
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
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
      className="login-container"
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
          <h2 className="mt-6 text-center text-3xl font-extrabold relative z-10 animate-fadeIn">
            <span className="relative edgy-title">Log in</span>
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fadeIn delay-200">
          <div 
            className="login-card sm:rounded-lg sm:px-10 edgy-form-container" 
            style={{ 
              backgroundColor: `${theme.core.containerHoover}80`
            }}
          >
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-shake">
                <p>{error}</p>
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <div className="mt-1 input-with-icon">
                  <div className="input-icon">
                    <User size={18} style={{ color: theme.core.text }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="custom-input edgy-input"
                    style={{
                      backgroundColor: `${theme.headerfooter.searchBox}90`,
                      color: theme.core.text
                    }}
                  />
                </div>
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="custom-input edgy-input"
                    style={{
                      backgroundColor: `${theme.headerfooter.searchBox}90`,
                      color: theme.core.text
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-medium hover:underline transition-colors bg-transparent border-0 p-0 cursor-pointer"
                    style={{ color: theme.headerfooter.logoRed }}
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  style={{ 
                    backgroundColor: theme.headerfooter.logoRed,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2" style={{ 
                    backgroundColor: theme.core.containerHoover,
                    color: theme.core.text
                  }}>Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => console.log('Google sign-in clicked')}
                  className="google-btn edgy-input"
                  style={{ 
                    backgroundColor: `${theme.headerfooter.searchBox}90`,
                    color: theme.core.text
                  }}
                >
                  {/* Google logo */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <span>Log in with Google</span>
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium hover:underline transition-colors" style={{ color: theme.headerfooter.logoRed }}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center animate-fadeIn delay-400">
          <Link to="/" className="text-sm hover:underline transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        theme={theme}
      />
    </div>
  );
};

export default Login;