import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { GDPRBanner } from '@/components/gdpr-banner';

export const metadata: Metadata = {
    title: 'Therapy Platform',
    description: 'Avant-Garde German Therapy Management',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Therapy Platform',
    },
};

export const viewport: Viewport = {
    themeColor: '#ffffff',
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
            </body>
        </html>
    );
}
