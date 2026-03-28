"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface BookingButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const BookingButton: React.FC<BookingButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  fullWidth = false
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const bookingDestination = '/booking';

  const handleBookingClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push(bookingDestination);
    } else {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(bookingDestination)}`);
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Style variants
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-subtle hover:shadow-hover',
    secondary: 'bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
  };

  const baseClasses = `
    font-semibold rounded-lg transition-all duration-200 
    flex items-center justify-center group
    ${fullWidth ? 'w-full' : 'inline-flex'}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      onClick={handleBookingClick}
      disabled={isLoading}
      className={baseClasses}
      aria-label="Book your therapy session"
    >
      {children || (
        <>
          <Calendar className="h-5 w-5 mr-2" />
          Book Your Session
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
};

export default BookingButton;
