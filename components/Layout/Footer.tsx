import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import TrustBadges from '../Common/TrustBadges';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Find Therapists', href: '/directory' },
      { name: 'Take Assessment', href: '/matching' },
      { name: 'Pricing', href: '/pricing' }
    ],
    support: [
      { name: 'Contact Us', href: 'mailto:hello@therapybook.de' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Impressum', href: '/impressum' }
    ]
  };

  return (
    <footer className="bg-white border-t border-neutral-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-3">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-neutral-900">TherapyBook</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed mb-3">
              Affordable therapy with approved trainee therapists in Berlin.
            </p>
            <div className="space-y-1.5 text-sm text-neutral-500">
              <div className="flex items-center"><Mail className="h-3.5 w-3.5 mr-2" /> hello@therapybook.de</div>
              <div className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-2" /> Berlin, Germany</div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 text-sm">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Crisis */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 text-sm">Crisis Support</h4>
            <p className="text-xs text-neutral-500 mb-3">TherapyBook is not an emergency service. If you need immediate help:</p>
            <div className="space-y-2">
              <a href="tel:112" className="flex items-center text-sm text-red-700 hover:text-red-800 font-medium">
                <Phone className="h-3.5 w-3.5 mr-1.5" /> Emergency: 112
              </a>
              <a href="tel:+498001110111" className="flex items-center text-sm text-red-700 hover:text-red-800 font-medium">
                <Phone className="h-3.5 w-3.5 mr-1.5" /> Crisis Line: 0800 111 0 111
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-neutral-400">
            <span>© {currentYear} TherapyBook. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/impressum" className="hover:text-neutral-700 transition-colors">Impressum</Link>
              <Link href="/privacy" className="hover:text-neutral-700 transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
