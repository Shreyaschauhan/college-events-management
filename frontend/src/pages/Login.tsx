
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { redirectIfAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from the location state, if available
  const redirectPath = location.state?.from || '/';

  useEffect(() => {
    redirectIfAuthenticated(() => {
      // This is a no-op since redirectIfAuthenticated already handles redirection
    });
  }, [redirectIfAuthenticated]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm type="login" redirectPath={redirectPath} />
    </div>
  );
};

export default Login;
