import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoginModal from '../Auth/LoginModal';

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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBookingClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      // User is logged in, redirect to booking page
      router.push('/booking');
    } else {
      // User is not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Redirect to booking page after successful login
    router.push('/booking');
  };

  const handleRegisterClick = () => {
    setShowLoginModal(false);
    // Navigate to registration page (you can create this later)
    router.push('/register');
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
    <>
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

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={handleRegisterClick}
      />
    </>
  );
};

export default BookingButton;