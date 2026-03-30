import React from 'react';
import { FileText, Lock, Mail, Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Privacy & Data Handling
          </h1>
          <p className="text-lg text-neutral-600">
            This page summarizes how the current TherapyBook product handles account, onboarding, booking, and session data.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-subtle p-8 space-y-12">
          <section id="privacy-rights">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-neutral-900">What data the app stores</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Account and profile data</h3>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li>• Name, email address, phone number, and role-based account metadata</li>
                  <li>• Trainee application profile fields such as specialties, languages, education, and public bio</li>
                  <li>• Availability records used to power booking and scheduling</li>
                </ul>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Operational records</h3>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li>• Uploaded onboarding documents linked to document records</li>
                  <li>• Session reservations, payment state, reminders, and session notes</li>
                  <li>• Audit log entries for administrative and workflow-sensitive changes</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="data-protection">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-neutral-900">How the product protects access</h2>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <ul className="space-y-3 text-sm text-green-900">
                <li>• Authentication is required for account management, onboarding drafts, dashboard access, uploads, and session participation.</li>
                <li>• Uploads are presigned first and then committed to Prisma so files stay connected to a tracked document record.</li>
                <li>• Booking, payment, and session status changes are server-authoritative instead of relying on client-only success states.</li>
                <li>• Reminder emails, password reset, and verification emails are sent through transactional email flows rather than local-only UI state.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-neutral-900">How data is used</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-200 p-5">
                <h3 className="font-semibold text-neutral-900 mb-2">Access control</h3>
                <p className="text-sm text-neutral-600">To sign users in, verify email ownership, reset passwords, and gate access to role-based routes.</p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-5">
                <h3 className="font-semibold text-neutral-900 mb-2">Marketplace operations</h3>
                <p className="text-sm text-neutral-600">To review trainee applications, publish approved providers, reserve sessions, process payments, and send reminders.</p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-5">
                <h3 className="font-semibold text-neutral-900 mb-2">Administrative oversight</h3>
                <p className="text-sm text-neutral-600">To support audit trails, investigate booking issues, and manage approval, status, and compliance-related actions.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="h-6 w-6 text-neutral-700" />
              <h2 className="text-2xl font-bold text-neutral-900">Privacy requests</h2>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                If you need access to your stored data, want to correct account information, or want to request deletion of an account that is no longer active, contact the team directly.
              </p>
              <div className="space-y-2 text-sm text-neutral-800">
                <div>Email: <a href="mailto:hello@therapybook.de" className="font-medium text-primary-600 hover:text-primary-500">hello@therapybook.de</a></div>
                <div>Location: Berlin, Germany</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
