import React from 'react';
import { Mail, MessageCircle, Clock } from 'lucide-react';

const SupportCTA: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
              Have questions before booking?
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Our team can help you understand how trainee therapy works, whether
              it fits your needs, and how to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a
              href="mailto:support@therapybook.com"
              className="flex flex-col items-center text-center rounded-xl border border-neutral-200 bg-white p-6 hover:border-primary-300 hover:shadow-subtle transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">Email us</h3>
              <p className="text-sm text-neutral-600">support@therapybook.com</p>
            </a>

            <a
              href="/directory"
              className="flex flex-col items-center text-center rounded-xl border border-neutral-200 bg-white p-6 hover:border-primary-300 hover:shadow-subtle transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">Browse therapists</h3>
              <p className="text-sm text-neutral-600">View profiles before committing</p>
            </a>

            <a
              href="/pricing"
              className="flex flex-col items-center text-center rounded-xl border border-neutral-200 bg-white p-6 hover:border-primary-300 hover:shadow-subtle transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">No commitment</h3>
              <p className="text-sm text-neutral-600">Pay per session, cancel anytime</p>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportCTA;
