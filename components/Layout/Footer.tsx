import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import TrustBadges from '../Common/TrustBadges';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Find Therapists', href: '/directory' },
      { name: 'Take Assessment', href: '/matching' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'For Practitioners', href: '/practitioners' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Crisis Resources', href: '/crisis-resources' },
      { name: 'Technical Support', href: '/support' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'HIPAA Compliance', href: '/privacy-policy#data-protection' },
      { name: 'Cookie Policy', href: '/cookies' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' }
    ]
  };

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Trust Badges Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Your Trust & Safety Matter
            </h3>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              We maintain the highest standards of security, compliance, and professional care 
              to ensure your mental health journey is safe and confidential.
            </p>
          </div>
          <TrustBadges variant="footer" />
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">TherapyBook</span>
            </Link>
            <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
              Connecting you with qualified trainee therapists for accessible, 
              professional mental health support.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-neutral-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>hello@therapybook.de</span>
              </div>
              <div className="flex items-center text-neutral-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>+49 30 12345678</span>
              </div>
              <div className="flex items-center text-neutral-300">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Berlin, Germany</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Phone className="h-6 w-6 text-red-400 mt-1" />
              <div>
                <h4 className="font-semibold text-red-300 mb-2">
                  24/7 Emergency Support
                </h4>
                <p className="text-red-200 text-sm mb-3">
                  If you're experiencing a mental health crisis or emergency, 
                  immediate help is available:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="tel:112"
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Emergency: 112</span>
                  </a>
                  <a
                    href="tel:+498001110111"
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Crisis Line: 0800 111 0 111</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-sm mb-4 md:mb-0">
              © {currentYear} TherapyBook. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/impressum"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Impressum
              </Link>
              <Link
                href="/privacy-policy"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Datenschutz
              </Link>
              <a
                href="https://www.telefonseelsorge.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-neutral-400 hover:text-white transition-colors"
              >
                <span>Telefonseelsorge</span>
                <span>Deutsche Depressionshilfe</span>
              </a>
              <a
                href="tel:116117"
                className="flex items-center text-blue-700 hover:text-blue-800"
              >
                <Phone className="h-3 w-3 mr-1" />
                <span>Medical Emergency Service: 116 117</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;