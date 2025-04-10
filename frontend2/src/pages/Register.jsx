
import { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Register = () => {
  const { redirectIfAuthenticated } = useAuth();

  useEffect(() => {
    redirectIfAuthenticated(() => {
      // This is a no-op since redirectIfAuthenticated already handles redirection
    });
  }, [redirectIfAuthenticated]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm type="register" />
    </div>
  );
};

export default Register;
