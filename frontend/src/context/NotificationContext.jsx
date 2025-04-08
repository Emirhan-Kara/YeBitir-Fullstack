import React, { createContext, useContext, useReducer } from 'react';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'success':
      return {
        ...state,
        message: action.message,
        type: 'success',
        duration: action.duration || 3000,
        isVisible: true
      };
    case 'error':
      return {
        ...state,
        message: action.message,
        type: 'error',
        duration: action.duration || 5000,
        isVisible: true
      };
    case 'warning':
      return {
        ...state,
        message: action.message,
        type: 'warning',
        duration: action.duration || 3000,
        isVisible: true
      };
    case 'info':
      return {
        ...state,
        message: action.message,
        type: 'info',
        duration: action.duration || 3000,
        isVisible: true
      };
    case 'hide':
      return {
        ...state,
        isVisible: false
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    message: '',
    type: 'info',
    duration: 3000,
    isVisible: false
  });

  // Auto-hide notification after duration
  React.useEffect(() => {
    if (state.isVisible && state.duration > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'hide' });
      }, state.duration);

      return () => clearTimeout(timer);
    }
  }, [state.isVisible, state.duration]);

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
      {state.isVisible && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            state.type === 'success' ? 'bg-green-500' :
            state.type === 'error' ? 'bg-red-500' :
            state.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white`}
          style={{
            animation: 'slide-in 0.3s ease-out',
            zIndex: 1000
          }}
        >
          {state.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 