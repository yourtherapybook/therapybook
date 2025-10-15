import React from 'react';
import { Shield, Lock, Eye, FileText, Phone, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-lg text-neutral-600">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-subtle p-8">
          {/* GDPR Compliance Section */}
          <section id="gdpr-compliance" className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-neutral-900">GDPR Compliance</h2>
            </div>
            
            <div className="prose prose-neutral max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-4">
                TherapyBook is fully compliant with the General Data Protection Regulation (GDPR) 
                and the German Federal Data Protection Act (Bundesdatenschutzgesetz - BDSG). 
                We are committed to protecting your personal data and respecting your privacy rights.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Your Rights Under GDPR</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Right to access your personal data</li>
                  <li>• Right to rectification of inaccurate data</li>
                  <li>• Right to erasure ("right to be forgotten")</li>
                  <li>• Right to restrict processing</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to processing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Protection Section */}
          <section id="data-protection" className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-neutral-900">Data Protection & Security</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">Encryption & Security</h3>
                <ul className="space-y-2 text-green-800 text-sm">
                  <li>• TLS 1.3 encryption for all data transmission</li>
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• ISO 27001 compliant security practices</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-3">Medical Data Protection</h3>
                <ul className="space-y-2 text-purple-800 text-sm">
                  <li>• Compliance with German medical confidentiality laws</li>
                  <li>• Segregated storage of sensitive health data</li>
                  <li>• Access controls and audit logging</li>
                  <li>• Regular data protection impact assessments</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-neutral-600" />
              <h2 className="text-2xl font-bold text-neutral-900">Data Protection Officer</h2>
            </div>
            
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Contact Our DPO</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-neutral-700">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>dpo@therapybook.de</span>
                    </div>
                    <div className="flex items-center text-neutral-700">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>+49 30 555 123 456</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Supervisory Authority</h3>
                  <p className="text-sm text-neutral-700">
                    Berlin Commissioner for Data Protection and Freedom of Information<br/>
                    Friedrichstr. 219, 10969 Berlin<br/>
                    Phone: +49 30 13889-0
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Notice */}
          <div className="border-t border-neutral-200 pt-6">
            <p className="text-xs text-neutral-500 text-center">
              This privacy policy is governed by German law. For any disputes, 
              the courts of Berlin, Germany shall have exclusive jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;