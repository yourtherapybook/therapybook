import React from 'react';
import Link from 'next/link';
import { ClipboardList, Users, Calendar, Video } from 'lucide-react';
import { Button } from '../ui/button';

const Process: React.FC = () => {
  const steps = [
    {
      icon: ClipboardList,
      title: 'Share your needs',
      description: 'Answer the matching questionnaire so the platform can score approved providers against your stated preferences.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Users,
      title: 'Review live matches',
      description: 'Compare a shortlist built from real provider records, specialties, languages, and availability-backed directory data.',
      color: 'bg-primary-100 text-primary-600'
    },
    {
      icon: Calendar,
      title: 'Reserve a real slot',
      description: 'Pick a published appointment time, then let the server validate it before checkout begins.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Video,
      title: 'Start Therapy',
      description: 'Join the session through your authenticated room link after payment confirmation and reminder emails.',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            How TherapyBook Works
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Getting started with mental health support has never been easier. 
            Our streamlined process connects you with the right therapist in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-neutral-200 transform translate-x-8 z-0"></div>
                )}
                
                <div className="relative bg-white p-6 rounded-2xl shadow-subtle hover:shadow-hover transition-all duration-300 border border-neutral-100">
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl ${step.color} mb-4`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-primary-50 rounded-2xl p-8 inline-block">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
              Ready to get started?
            </h3>
            <p className="text-neutral-600 mb-6">
              Start with the assessment if you want a shortlist before booking.
            </p>
            <Button asChild size="lg">
              <Link href="/matching">Begin Assessment</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
