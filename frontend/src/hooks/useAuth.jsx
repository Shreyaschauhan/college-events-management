
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * @typedef {'admin' | 'organizer' | 'student' | 'guest'} UserRole
 */

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  /**
   * @param {Function} callback 
   * @param {UserRole|UserRole[]} [roles] 
   */
  const requireAuth = (callback, roles) => {
    if (!context.isAuthenticated) {
      toast.error('You must be logged in to access this page');
      navigate('/login');
      return;
    }

    if (roles && !context.hasRole(roles)) {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }

    callback();
  };

  /**
   * @param {Function} callback 
   */
  const redirectIfAuthenticated = (callback) => {
    if (context.isAuthenticated) {
      // Redirect to appropriate dashboard based on role
      if (context.hasRole('admin')) {
        navigate('/admin/dashboard');
      } else if (context.hasRole('organizer')) {
        navigate('/organizer/dashboard');
      } else if (context.hasRole('student')) {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
      return;
    }

    callback();
  };

  return {
    ...context,
    requireAuth,
    redirectIfAuthenticated,
  };
};
