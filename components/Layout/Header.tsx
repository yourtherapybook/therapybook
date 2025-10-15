import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart, Menu, X, Globe } from 'lucide-react';
import BookingButton from '../Common/BookingButton';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const router = useRouter();

  const navigation = [
    { name: 'Find Therapists', href: '/directory' },
    { name: 'Apply as Trainee', href: '/trainee-application' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Take Assessment', href: '/matching' },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-neutral-900">TherapyBook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Language Toggle & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setCurrentLanguage(currentLanguage === 'EN' ? 'ES' : 'EN')}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label="Toggle language"
              >
                <Globe className="h-4 w-4" />
                <span>{currentLanguage}</span>
              </button>
            </div>
            <BookingButton size="sm">
              Book Session
            </BookingButton>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setCurrentLanguage(currentLanguage === 'EN' ? 'ES' : 'EN')}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>{currentLanguage}</span>
                </button>
                <BookingButton size="sm">
                  Book Session
                </BookingButton>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;