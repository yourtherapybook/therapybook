import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck } from 'lucide-react';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
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
                        <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow">{children}</main>
        </div>
    );
}
