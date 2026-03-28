"use client";
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get('token');

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!token) {
        return (
            <div className="bg-white py-8 px-4 shadow-subtle sm:rounded-lg sm:px-10 text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Invalid Link</h2>
                <p className="text-neutral-600 mb-6">The password reset link is missing or malformed.</p>
                <Link href="/auth/forgot-password" className="text-primary-600 hover:text-primary-500 font-medium">
                    Request a new link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setStatus('error');
            setErrorMessage('Password must be at least 8 characters');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setTimeout(() => router.push('/auth/signin'), 3000);
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to reset password');
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
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2">Password Updated</h2>
                    <p className="text-neutral-600 mb-6">Your password has been successfully reset.</p>
                    <p className="text-sm text-neutral-500">Redirecting to login...</p>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-neutral-900 text-center mb-6">Choose new password</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                New Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-neutral-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-neutral-400" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-neutral-500">Must be at least 8 characters long</p>
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
                            {status === 'loading' ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
