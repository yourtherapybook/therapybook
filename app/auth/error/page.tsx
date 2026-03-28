"use client";

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Authentication unavailable',
    description: 'TherapyBook could not complete authentication because the sign-in provider is misconfigured.',
  },
  AccessDenied: {
    title: 'Access denied',
    description: 'Your account is not allowed to complete that action.',
  },
  Verification: {
    title: 'Verification required',
    description: 'Please verify your email address before continuing.',
  },
  Default: {
    title: 'Unable to sign you in',
    description: 'The authentication flow did not complete successfully. Please try again.',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get('error') || 'Default';

  const message = useMemo(() => {
    return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;
  }, [errorCode]);

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <div className="mb-3 flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3 text-yellow-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-center">{message.title}</CardTitle>
        <CardDescription className="text-center">{message.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild variant="therapybook" size="lg" className="w-full">
          <Link href="/auth/signin">Return to sign in</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/auth/forgot-password">Reset password</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
