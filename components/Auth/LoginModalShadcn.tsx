import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Enhanced LoginModal using Shadcn/ui components
 * Demonstrates integration of Shadcn/ui with existing TherapyBook functionality
 */
const LoginModalShadcn: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterClick
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setError('');
    }
  }, [isOpen, form]);

  const { login } = useAuth();

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(data.email, data.password);
      
      if (result?.ok) {
        onLoginSuccess();
        onClose();
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900">
            Access Your Session
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Sign in to your account to book your therapy session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        disabled={isLoading}
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                variant="therapybook"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-neutral-200"></div>
            <span className="px-4 text-sm text-neutral-500">or</span>
            <div className="flex-1 border-t border-neutral-200"></div>
          </div>

          {/* Register Button */}
          <Button
            onClick={onRegisterClick}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Create New Account
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Button variant="link" className="text-sm">
              Forgot your password?
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModalShadcn;