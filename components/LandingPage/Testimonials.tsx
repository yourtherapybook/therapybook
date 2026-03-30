import React from 'react';
import { CalendarClock, CreditCard, FileCheck2, Shield } from 'lucide-react';

const highlights = [
  {
    icon: FileCheck2,
    title: 'Approved trainee profiles',
    description: 'Directory listings are sourced from reviewed trainee applications instead of injected sample therapists or stock credentials.'
  },
  {
    icon: CalendarClock,
    title: 'Live slot booking',
    description: 'Clients book against published availability, and the server revalidates the slot before reserving the session.'
  },
  {
    icon: CreditCard,
    title: 'Payment-first confirmation',
    description: 'Reservations move to confirmed sessions only after the payment processor reports completion.'
  },
  {
    icon: Shield,
    title: 'Authenticated session access',
    description: 'Each booked session has its own protected room link, plus reminder emails and session management controls.'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            What TherapyBook Handles End to End
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            The platform now exposes real provider profiles, booking validation, payment confirmation, and authenticated session access instead of demo-only flows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;

            return (
              <div
                key={highlight.title}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-subtle"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{highlight.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{highlight.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
