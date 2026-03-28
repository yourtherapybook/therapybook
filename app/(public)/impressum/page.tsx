import React from 'react';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';

const ImpressumPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Impressum</h1>
          <p className="text-lg text-neutral-600">
            Legal notice and contact point for the current TherapyBook product.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-subtle space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Service operator</h2>
            <div className="space-y-3 text-neutral-700">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary-500" />
                <span>TherapyBook</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span>Berlin, Germany</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-500" />
                <a href="mailto:hello@therapybook.de" className="text-primary-600 hover:text-primary-500">
                  hello@therapybook.de
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-500" />
                <a href="tel:+493012345678" className="text-primary-600 hover:text-primary-500">
                  +49 30 12345678
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-3">Commercial launch notice</h2>
            <p className="text-sm leading-relaxed text-amber-900">
              The repository currently contains support contact details, but it does not include formal commercial-registration metadata such as a trade-register entry or VAT number. This page intentionally avoids inventing those records. If TherapyBook is launched commercially in Germany, those statutory details should be published here before go-live.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Content responsibility</h2>
            <p className="text-sm leading-relaxed text-neutral-600">
              Questions about product content, privacy requests, or legal notices can be sent to the contact address above. The live directory only displays approved trainee profiles and is backed by the current application-review workflow.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
