import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { TraineeApplication, FormValidation } from '../../../types/trainee-application';
import { accountInfoSchema, getPasswordStrength } from '../../../lib/validation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Card, CardContent } from '../../ui/card';

interface Step1AccountInfoProps {
  data: Partial<TraineeApplication>;
  onUpdate: (data: Partial<TraineeApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  validation: FormValidation;
}

interface AccountInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

const Step1AccountInfo: React.FC<Step1AccountInfoProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  validation
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });

  const form = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      firstName: data.accountInfo?.firstName || '',
      lastName: data.accountInfo?.lastName || '',
      email: data.accountInfo?.email || '',
      phone: data.accountInfo?.phone || '',
      password: data.accountInfo?.password || '',
      confirmPassword: data.accountInfo?.confirmPassword || '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  const { watch, formState: { errors, isValid } } = form;
  const watchedPassword = watch('password');

  // Update password strength in real-time
  useEffect(() => {
    if (watchedPassword) {
      const strength = getPasswordStrength(watchedPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [watchedPassword]);

  // Auto-save form data when it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate({
        ...data,
        accountInfo: {
          firstName: value.firstName || '',
          lastName: value.lastName || '',
          email: value.email || '',
          phone: value.phone || '',
          password: value.password || '',
          confirmPassword: value.confirmPassword || '',
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, data, onUpdate]);

  const onSubmit = (formData: AccountInfoFormData) => {
    onUpdate({
      ...data,
      accountInfo: formData,
    });
    onNext();
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-destructive';
    if (score <= 2) return 'bg-yellow-500';
    if (score <= 3) return 'bg-orange-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Account Information
        </h2>
        <p className="text-neutral-600">
          Let's start with your basic information and login credentials
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700 font-medium">
                        First Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700 font-medium">
                        Last Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be your login email and where we'll send important updates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium">
                      Phone Number (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include country code (e.g., +1 555-123-4567)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Fields */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium">
                      Password *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500 pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-neutral-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-neutral-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Password strength:</span>
                          <span className={`text-sm font-medium ${
                            passwordStrength.score <= 2 ? 'text-destructive' : 
                            passwordStrength.score <= 3 ? 'text-orange-500' : 'text-green-600'
                          }`}>
                            {getPasswordStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        <Progress 
                          value={(passwordStrength.score / 5) * 100} 
                          className="h-2"
                        />
                        {passwordStrength.feedback.length > 0 && (
                          <div className="space-y-1">
                            {passwordStrength.feedback.map((feedback, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                                <X className="h-3 w-3 text-destructive" />
                                {feedback}
                              </div>
                            ))}
                          </div>
                        )}
                        {passwordStrength.score >= 4 && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Check className="h-3 w-3" />
                            Password meets security requirements
                          </div>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 font-medium">
                      Confirm Password *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="border-neutral-300 focus:border-primary-500 focus:ring-primary-500 pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-neutral-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-neutral-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  disabled
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                  disabled={!isValid}
                >
                  Next Step
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Show validation errors if any */}
      {Object.keys(validation.errors).length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <h4 className="text-destructive font-medium mb-2">Please fix the following errors:</h4>
            <ul className="text-destructive text-sm space-y-1">
              {Object.entries(validation.errors).map(([field, error]) => (
                <li key={field} className="flex items-center gap-2">
                  <X className="h-3 w-3" />
                  {String(error)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Step1AccountInfo;