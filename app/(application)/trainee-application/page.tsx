"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TraineeApplicationFlow from '@/components/TraineeApplication/TraineeApplicationFlow';

const TraineeApplicationContent: React.FC = () => {
  const router = useRouter();

  // Check for success parameter
  const searchParams = useSearchParams();
  const isSuccess = searchParams?.get('success') === 'true';

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Success Header */}
        <section className="bg-gradient-to-br from-green-50 to-white pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
              Application Submitted!
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Thank you for your application. We'll review it within 3-5 business days and notify you of our decision.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-50 to-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-6">
            Trainee Application
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Join our network of supervised trainee therapists and help make mental health care accessible
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16">
        <TraineeApplicationFlow />
      </section>
    </div>
  );
};

export default function TraineeApplication() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-neutral-50 py-24 text-center">Loading...</div>}>
      <TraineeApplicationContent />
    </React.Suspense>
  );
}