import React, { createContext, useEffect, useReducer } from 'react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

/**
 * @typedef {Object} User
 * @property {string} id - The unique ID of the user.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} role - The role of the user (e.g., "admin", "student", "organizer").
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user - The currently authenticated user.
 * @property {boolean} isAuthenticated - Whether the user is authenticated.
 * @property {boolean} isLoading - Whether authentication is in progress.
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user - The currently authenticated user.
 * @property {boolean} isAuthenticated - Whether the user is authenticated.
 * @property {boolean} isLoading - Whether authentication is in progress.
 * @property {(email: string, password: string) => Promise<boolean>} login - Function to log in a user.
 * @property {(name: string, email: string, password: string, role: string) => Promise<boolean>} register - Function to register a new user.
 * @property {() => void} logout - Function to log out the user.
 * @property {(roles: string | string[]) => boolean} hasRole - Function to check if the user has a specific role.
 */

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'STOP_LOADING':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext({
  ...initialState,
  login: () => Promise.resolve(false),
  register: () => Promise.resolve(false),
  logout: () => {},
  hasRole: () => false,
});

/**
 * AuthProvider component to provide authentication context to the application.
 * @param {{ children: React.ReactNode }} props - The props for the component.
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const verificationResponse = await authService.verifyToken();
          const adaptedUser = {
            id: verificationResponse.user._id || verificationResponse.user.id,
            name: verificationResponse.user.fullName || verificationResponse.user.name,
            email: verificationResponse.user.email,
            role: verificationResponse.user.role,
          };
          dispatch({
            type: 'INITIALIZE',
            payload: { isAuthenticated: true, user: adaptedUser },
          });
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
          dispatch({
            type: 'INITIALIZE',
            payload: { isAuthenticated: false, user: null },
          });
        }
      } else {
        dispatch({
          type: 'INITIALIZE',
          payload: { isAuthenticated: false, user: null },
        });
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const data = await authService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      toast.success(`Welcome back, ${data.user.fullName || data.user.name}!`);
      return true;
    } catch (error) {
      console.error('Login context error:', error);
      toast.error(error.message || 'Login failed. Please check credentials.');
      dispatch({ type: 'STOP_LOADING' });
      return false;
    }
  };

  const register = async (name, email, password, role) => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const registrationData = { fullName: name, email, password, role };
      const data = await authService.register(registrationData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      toast.success('Registration successful! Welcome aboard.');
      return true;
    } catch (error) {
      console.error('Register context error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      dispatch({ type: 'STOP_LOADING' });
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    toast.info('You have been logged out.');
  };

  const hasRole = (roles) => {
    if (!state.user || !state.isAuthenticated) return false;
    const userRole = state.user.role;
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};