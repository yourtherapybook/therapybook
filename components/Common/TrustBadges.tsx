import React from 'react';
import Link from 'next/link';
import { CalendarClock, FileCheck2, Lock, Phone } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'header' | 'footer' | 'inline';
  showAll?: boolean;
}

const emergencyNumber = '112';

const TrustBadges: React.FC<TrustBadgesProps> = ({ variant = 'inline', showAll = true }) => {
  const items = [
    {
      icon: Lock,
      title: 'Data handling',
      subtitle: 'See privacy details',
      description: 'Authentication, uploads, booking records, and reminder emails are routed through authenticated product flows.',
      href: '/privacy#data-protection',
      className: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FileCheck2,
      title: 'Approved profiles',
      subtitle: 'Reviewed trainee listings',
      description: 'Public provider profiles come from reviewed trainee applications before they appear in the live directory.',
      href: '/directory',
      className: 'bg-primary-100 text-primary-600'
    },
    {
      icon: CalendarClock,
      title: 'Booking controls',
      subtitle: 'Real scheduling rules',
      description: 'Slots, payment confirmation, reminder emails, and session-room access all tie back to the live booking record.',
      href: '/booking',
      className: 'bg-green-100 text-green-600'
    },
    {
      icon: Phone,
      title: 'Emergency resources',
      subtitle: 'Immediate help',
      description: 'TherapyBook is not an emergency service. Use crisis support numbers if you need urgent assistance.',
      href: `tel:${emergencyNumber}`,
      className: 'bg-red-100 text-red-600'
    }
  ];

  const visibleItems = showAll ? items : items.slice(0, 3);

  if (variant === 'header') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {visibleItems.slice(0, 3).map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex items-center space-x-2 rounded-full bg-white px-3 py-1.5 shadow-subtle">
              <Icon className="h-4 w-4 text-primary-500" />
              <span className="text-xs font-medium text-neutral-700">{item.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${item.className}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">{item.title}</h4>
              <p className="text-sm text-neutral-600 mb-2">{item.description}</p>
              <span className="text-xs font-medium text-primary-600 underline underline-offset-4">
                {item.subtitle}
              </span>
            </>
          );

          return (
            <div key={item.title} className="text-center">
              {item.href.startsWith('tel:') ? (
                <a href={item.href} className="block rounded-2xl p-2 transition-colors hover:bg-neutral-50">
                  {content}
                </a>
              ) : (
                <Link href={item.href} className="block rounded-2xl p-2 transition-colors hover:bg-neutral-50">
                  {content}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-neutral-50 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className={`mb-2 rounded-lg p-3 ${item.className}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-neutral-900">{item.title}</span>
              <span className="text-xs text-neutral-600">{item.subtitle}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBadges;
