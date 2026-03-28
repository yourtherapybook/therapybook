"use client";

import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
  callbackUrl?: string;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({
  children,
  className,
  callbackUrl = '/',
}) => {
  const handleSignOut = async () => {
    await signOut({ callbackUrl });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      onClick={() => {
        void handleSignOut();
      }}
    >
      {children}
    </Button>
  );
};

export default SignOutButton;
