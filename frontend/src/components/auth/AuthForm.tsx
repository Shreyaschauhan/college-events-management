
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type AuthFormProps = {
  type: 'login' | 'register';
  redirectPath?: string;
};

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'organizer']).default('student'),
});

const AuthForm: React.FC<AuthFormProps> = ({ type, redirectPath = '/' }) => {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(type === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
    },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (type === 'login') {
        success = await login(data.email, data.password);
      } else {
        success = await registerUser(data.name, data.email, data.password, data.role as UserRole);
      }
      
      if (success) {
        // Redirect based on user role
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(`${type === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-card rounded-lg shadow-sm border animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">
          {type === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {type === 'login'
            ? 'Enter your credentials below to sign in'
            : 'Fill in the form below to create your account'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {type === 'register' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {type === 'register' && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="organizer">Event Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loader mr-2" />
                <span>{type === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              <span>{type === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal" 
              onClick={() => navigate('/register')}
            >
              Sign up
            </Button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal" 
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
