import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-primary-500 p-2 rounded-lg">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-neutral-900">TherapyBook</span>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-grow">{children}</main>
        </div>
    );
}
