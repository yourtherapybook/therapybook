"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to send reset link');
            }
        } catch {
            setStatus('error');
            setErrorMessage('Network connection error');
        }
    };

    return (
        <div className="bg-white py-8 px-4 shadow-subtle sm:rounded-lg sm:px-10">
            {status === 'success' ? (
                <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-primary-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2">Check your email</h2>
                    <p className="text-neutral-600 mb-6">
                        If an account exists for that email, we've sent instructions to reset your password.
                    </p>
                    <Link href="/auth/signin" className="text-primary-600 hover:text-primary-500 font-medium">
                        Return to login
                    </Link>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-neutral-900 text-center mb-6">Reset your password</h2>
                    <p className="text-sm text-neutral-600 text-center mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/auth/signin" className="text-sm text-neutral-600 hover:text-neutral-900">
                            Back to login
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
