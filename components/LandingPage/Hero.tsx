import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Video, Clock } from 'lucide-react';
import BookingButton from '../Common/BookingButton';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-white overflow-hidden pt-16 pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FF7F50%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="mb-12 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              Find a Supervised{' '}
              <span className="text-primary-500">Trainee Therapist</span>{' '}
              Who Fits
            </h1>
            <p className="mt-6 text-xl text-neutral-600 leading-relaxed">
              Connect with approved trainee therapists, compare live specialties and languages, and book secure video sessions with transparent pay-per-session pricing.
            </p>
            
            {/* Key features */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-subtle">
                <Shield className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium text-neutral-700">Approved trainee profiles</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-subtle">
                <Video className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium text-neutral-700">Authenticated session rooms</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-subtle">
                <Clock className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-medium text-neutral-700">Flexible Scheduling</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <BookingButton size="lg" />
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg border-2 border-neutral-200 transition-all duration-200"
              >
                See Pricing - No Upfront Fees
              </Link>
            </div>
          </div>

          {/* Illustration/Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl p-8 shadow-subtle">
              <img
                src="https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Therapy session illustration"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-6 -left-6 bg-white p-4 rounded-xl shadow-subtle animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-neutral-700">Safe Space</span>
              </div>
            </div>
            
            <div className="absolute bottom-6 -right-6 bg-white p-4 rounded-xl shadow-subtle animate-pulse delay-1000">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm font-medium text-neutral-700">Emergency resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
