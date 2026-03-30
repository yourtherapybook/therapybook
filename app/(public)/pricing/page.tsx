"use client";
import React, { useState } from 'react';
import BookingButton from '@/components/Common/BookingButton';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  Euro,
  Users,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
  Check,
  Heart,
  Clock,
  TrendingDown,
  BookOpen,
  UserCheck,
  Minus,
  Plus
} from 'lucide-react';

const Pricing: React.FC = () => {
  const [selectedSessions, setSelectedSessions] = useState(12);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sessionPrice = 40; // Average price
  const traditionalTherapyPrice = 120;

  const calculateTotal = () => selectedSessions * sessionPrice;
  const calculateSavings = () => (selectedSessions * traditionalTherapyPrice) - calculateTotal();
  const calculateSavingsPercentage = () => Math.round((calculateSavings() / (selectedSessions * traditionalTherapyPrice)) * 100);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <section className="pt-8 pb-16">
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

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8">
          <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="h-6 w-6 text-primary-500" />
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Session cost calculator</h2>
                <p className="text-neutral-600">Estimate your investment based on the number of sessions you expect to book.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-neutral-900">Sessions</span>
                  <span className="text-sm text-neutral-600">{selectedSessions} sessions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setSelectedSessions((value) => Math.max(1, value - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (selectedSessions / 20) * 100)}%` }} />
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setSelectedSessions((value) => Math.min(20, value + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="text-sm text-neutral-500">TherapyBook total</div>
                  <div className="text-2xl font-bold text-neutral-900">€{calculateTotal()}</div>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="text-sm text-neutral-500">Traditional therapy</div>
                  <div className="text-2xl font-bold text-neutral-900">€{selectedSessions * traditionalTherapyPrice}</div>
                </div>
                <div className="rounded-xl bg-primary-50 p-4 border border-primary-100">
                  <div className="text-sm text-primary-700">Estimated savings</div>
                  <div className="text-2xl font-bold text-primary-700">€{calculateSavings()}</div>
                </div>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                  <TrendingDown className="h-5 w-5" />
                  About {calculateSavingsPercentage()}% lower than a traditional €120/session benchmark
                </div>
                <p className="text-sm text-green-700">
                  TherapyBook keeps access costs down by pairing clients with supervised trainees instead of charging platform or subscription fees upfront.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">What is included</h2>
              <div className="space-y-3">
                {[
                  '50-minute video sessions with approved trainee therapists',
                  'Clinical supervision by certified professionals',
                  'Flexible session-by-session pricing',
                  'Secure booking and reminder emails',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary-500 mt-0.5" />
                    <span className="text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Why clients choose this model</h2>
              <div className="space-y-4 text-sm text-neutral-700">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary-500 mt-0.5" />
                  <span>Every trainee profile in the live directory is reviewed and approved before it appears publicly.</span>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary-500 mt-0.5" />
                  <span>Clients can match by specialty and language, then book against real published availability.</span>
                </div>
                <div className="flex items-start gap-3">
                  <UserCheck className="h-5 w-5 text-primary-500 mt-0.5" />
                  <span>Bookings only confirm after payment clears, so the operational lifecycle stays accurate end to end.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-subtle">
              <BookOpen className="h-8 w-8 text-primary-500 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Supervised training model</h3>
              <p className="text-neutral-600 text-sm">Trainees work within accredited programs and under supervision, which enables lower-cost sessions while keeping provider listings grounded in reviewed application data.</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-subtle">
              <Clock className="h-8 w-8 text-primary-500 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Pay per session</h3>
              <p className="text-neutral-600 text-sm">There is no access subscription. You only pay when you reserve a real slot through checkout.</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-subtle">
              <Award className="h-8 w-8 text-primary-500 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Transparent quality bar</h3>
              <p className="text-neutral-600 text-sm">Profiles reflect real application fields from approved trainees instead of hand-authored showcase bios.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-subtle">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">What happens after you book</h2>
              <p className="text-neutral-600">Pricing is only one part of trust. The operational workflow below is what the platform now enforces.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                <Clock className="h-6 w-6 text-primary-500 mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-2">Reserve real availability</h3>
                <p className="text-sm text-neutral-600">
                  Checkout starts from published provider availability, and the server validates the slot before a reservation is created.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                <Euro className="h-6 w-6 text-primary-500 mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-2">Confirm after payment clears</h3>
                <p className="text-sm text-neutral-600">
                  TherapyBook only confirms the session after the payment processor reports completion, which keeps bookings and payments in sync.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                <Users className="h-6 w-6 text-primary-500 mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-2">Join from your booked session link</h3>
                <p className="text-sm text-neutral-600">
                  Clients and trainees receive reminder emails and access the room from the authenticated session page tied to the booking record.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="bg-white rounded-xl border border-neutral-200 shadow-subtle overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span className="font-medium text-neutral-900">{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-neutral-500" /> : <ChevronDown className="h-5 w-5 text-neutral-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-neutral-600 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <BookingButton size="lg">
              Start With a Real Booking
            </BookingButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
