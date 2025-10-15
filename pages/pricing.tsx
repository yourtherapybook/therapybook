import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BookingButton from '../components/Common/BookingButton';
import { 
  Calculator, 
  Euro, 
  Users, 
  Shield, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Check,
  ArrowRight,
  Heart,
  Clock,
  Star,
  TrendingDown,
  BookOpen,
  UserCheck
} from 'lucide-react';

const Pricing: React.FC = () => {
  const [selectedSessions, setSelectedSessions] = useState(12);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const sessionPrice = 40; // Average price
  const traditionalTherapyPrice = 120;

  const calculateTotal = () => selectedSessions * sessionPrice;
  const calculateSavings = () => (selectedSessions * traditionalTherapyPrice) - calculateTotal();
  const calculateSavingsPercentage = () => Math.round((calculateSavings() / (selectedSessions * traditionalTherapyPrice)) * 100);

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Marketing Professional",
      content: "The supervised student therapists at TherapyBook provided excellent care at a fraction of traditional costs. I felt supported throughout my journey.",
      rating: 5
    },
    {
      name: "Michael K.",
      role: "University Student",
      content: "As a student myself, I appreciated working with trainee therapists who understood my situation. The supervision ensures quality care.",
      rating: 5
    },
    {
      name: "Anna L.",
      role: "Working Parent",
      content: "Affordable therapy that doesn't compromise on quality. The €50 onboarding fee was transparent from the start, and the sessions have been transformative.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Why are sessions with student therapists more affordable?",
      answer: "Our trainee therapists are supervised by certified professionals and offer sessions at reduced rates as part of their training. This allows us to provide quality care at €30-€50 per session instead of traditional €120+ rates."
    },
    {
      question: "Are there any hidden fees or upfront costs?",
      answer: "No hidden fees whatsoever. You only pay for the therapy sessions you book (€30-€50 each). No upfront access fees, no platform charges, no subscription costs."
    },
    {
      question: "How does supervision work?",
      answer: "All student therapists receive regular supervision from certified therapists. Your sessions are reviewed (with your consent) to ensure quality care and professional development."
    },
    {
      question: "Can I switch therapists if needed?",
      answer: "Yes, you can request a therapist change at any time. We'll help you find a better match within our network of supervised trainees at no additional cost."
    },
    {
      question: "How many sessions do you recommend?",
      answer: "Most clients see significant progress with 10-15 sessions. However, the number varies based on individual needs and goals. Your therapist will discuss this during your initial sessions."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
            Affordable Therapy,{' '}
            <span className="text-primary-500">Supervised Quality</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Get professional support from supervised trainees in systemic therapy, Gestalt, coaching & more – starting at €30 per session with no upfront fees
          </p>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-subtle">
              <Euro className="h-5 w-5 text-primary-500" />
              <span className="font-medium text-neutral-700">€30-€50 per session</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-subtle">
              <Heart className="h-5 w-5 text-primary-500" />
              <span className="font-medium text-neutral-700">No upfront access fees</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-subtle">
              <Shield className="h-5 w-5 text-primary-500" />
              <span className="font-medium text-neutral-700">Supervised by certified therapists</span>
            </div>
          </div>

          <BookingButton size="lg">
            Book Your First Session
          </BookingButton>
        </div>
      </section>

      {/* Rest of component content would continue here */}
    </div>
  );
};

export default Pricing;