// src/context/AuthContext.tsx

import React, { createContext, useEffect, useReducer } from 'react';
import { User, UserRole } from '@/lib/types';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'INITIALIZE'; payload: { isAuthenticated: boolean; user: User | null } }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'LOADING'; payload: boolean }
  | { type: 'STOP_LOADING' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      const userPayload = action.payload as any;
      const adaptedUser: User = {
        id: userPayload._id || userPayload.id, // Ensure _id is mapped to id
        name: userPayload.fullName || userPayload.name,
        email: userPayload.email,
        role: userPayload.role,
      };
      return {
        ...state,
        user: adaptedUser,
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

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: () => Promise.resolve(false),
  register: () => Promise.resolve(false),
  logout: () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const verificationResponse = await authService.verifyToken();
          const adaptedVerificationUser: User = {
            id: verificationResponse.user._id || verificationResponse.user.id, // Ensure _id is mapped to id
            name: verificationResponse.user.fullName || verificationResponse.user.name,
            email: verificationResponse.user.email,
            role: verificationResponse.user.role,
          };
          dispatch({
            type: 'INITIALIZE',
            payload: { isAuthenticated: true, user: adaptedVerificationUser },
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

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const data = await authService.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      toast.success(`Welcome back, ${data.user.fullName || data.user.name}!`);
      return true;
    } catch (error: any) {
      console.error('Login context error:', error);
      toast.error(error.message || 'Login failed. Please check credentials.');
      dispatch({ type: 'STOP_LOADING' });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const registrationData = { fullName: name, email, password, role };
      const data = await authService.register(registrationData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      toast.success('Registration successful! Welcome aboard.');
      return true;
    } catch (error: any) {
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

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
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