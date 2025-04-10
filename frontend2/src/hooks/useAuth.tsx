
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const requireAuth = (callback: () => void, roles?: UserRole | UserRole[]) => {
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

  const redirectIfAuthenticated = (callback: () => void) => {
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
