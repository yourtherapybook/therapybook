import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center items-center space-x-2">
                    <div className="bg-primary-500 p-2 rounded-lg">
                        <Heart className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-neutral-900">TherapyBook</span>
                </Link>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
