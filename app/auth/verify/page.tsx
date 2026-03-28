"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing verification token');
            return;
        }

        fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                    setTimeout(() => router.push('/auth/signin?verified=true'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Network error during verification');
            });
    }, [token, router]);

    return (
        <div className="bg-white py-8 px-4 shadow-subtle sm:rounded-lg sm:px-10 text-center">
            {status === 'loading' && (
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-900">{message}</h2>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verified!</h2>
                    <p className="text-neutral-600 mb-6">{message}</p>
                    <p className="text-sm text-neutral-500">Redirecting you to login...</p>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center">
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verification Failed</h2>
                    <p className="text-neutral-600 mb-6">{message}</p>
                    <Link href="/auth/signin" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                        Return to Login
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>}>
            <VerifyContent />
        </Suspense>
    );
}
