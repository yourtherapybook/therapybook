import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { GDPRBanner } from '@/components/gdpr-banner';

export const metadata: Metadata = {
    title: 'TherapyBook — Affordable Trainee Therapy',
    description: 'Book affordable therapy sessions with approved trainee therapists. Pay per session, no subscriptions.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'TherapyBook',
    },
};

export const viewport: Viewport = {
    themeColor: '#FF7F50',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="de" suppressHydrationWarning>
            <body>
                <Providers>
                    {children}
                    <GDPRBanner />
                </Providers>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                                });
                            }
                        `,
                    }}
                />
            </body>
        </html>
    );
}
