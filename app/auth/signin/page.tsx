"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'The email or password you entered is incorrect.',
  AccessDenied: 'Access to that account was denied.',
  Configuration: 'Authentication is temporarily unavailable. Please try again shortly.',
  Default: 'We could not sign you in. Please try again.',
};

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const verified = searchParams?.get('verified') === 'true';
  const registeredEmail = searchParams?.get('email') || '';
  const routeError = searchParams?.get('error');

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: registeredEmail,
      password: '',
    },
  });

  useEffect(() => {
    if (registeredEmail) {
      form.setValue('email', registeredEmail);
    }
  }, [form, registeredEmail]);

  const routeErrorMessage = useMemo(() => {
    if (!routeError) return null;
    return AUTH_ERROR_MESSAGES[routeError] || AUTH_ERROR_MESSAGES.Default;
  }, [routeError]);

  const handleSubmit = async (values: SignInFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await login(values.email, values.password, { callbackUrl });

      if (!result?.ok) {
        setAuthError(AUTH_ERROR_MESSAGES.Default);
        return;
      }

      router.push(result.url || callbackUrl);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(AUTH_ERROR_MESSAGES[error.message] || error.message);
      } else {
        setAuthError(AUTH_ERROR_MESSAGES.Default);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your TherapyBook account to access booking, onboarding, and dashboards.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {verified && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status" aria-live="polite">
            Your email has been verified. You can sign in now.
          </div>
        )}

        {routeErrorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {routeErrorMessage}
          </div>
        )}

        {authError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {authError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="therapybook" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </Form>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
          <p className="font-medium text-neutral-900">Need an account?</p>
          <p className="mt-1">Create a client account to book sessions, or start the trainee application if you are joining the provider network.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Create client account</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/trainee-application">Apply as trainee</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
