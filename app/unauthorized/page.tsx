"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-subtle sm:rounded-lg sm:px-10 text-center">
                <ShieldAlert className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h2>
                <p className="text-neutral-600 mb-6">
                    You do not have the necessary permissions to access this page or perform this action.
                </p>
                <div className="space-y-3">
                    <Link href="/" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                        Return to Home
                    </Link>
                    <Link href="/auth/signin" className="w-full flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50">
                        Sign In with Different Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
