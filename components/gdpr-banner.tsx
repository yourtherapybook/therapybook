"use client";

import { useState, useEffect } from 'react';
import { useConsentStore } from '../lib/store/consent';
import { Button } from './ui/button';

export function GDPRBanner() {
    const { hasAnswered, acceptAll, declineAll, setConsent } = useConsentStore();
    const [mounted, setMounted] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

    useEffect(() => { setMounted(true); }, []);

    if (!mounted || hasAnswered) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
            <div className="mx-auto max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200 p-4">
                {!showDetails ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-sm text-neutral-600 flex-1">
                            We use cookies to improve your experience.{' '}
                            <button
                                onClick={() => setShowDetails(true)}
                                className="text-primary-600 hover:underline font-medium"
                            >
                                Settings
                            </button>
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={declineAll}>
                                Decline
                            </Button>
                            <Button size="sm" onClick={acceptAll}>
                                Accept
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-900">Cookie Preferences</span>
                            <a href="/privacy" className="text-xs text-primary-600 hover:underline">Privacy Policy</a>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-1">
                                <div>
                                    <div className="text-sm font-medium text-neutral-900">Essential</div>
                                    <div className="text-xs text-neutral-500">Required for core functionality</div>
                                </div>
                                <input type="checkbox" checked disabled className="h-4 w-4 rounded" />
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <div>
                                    <div className="text-sm font-medium text-neutral-900">Analytics</div>
                                    <div className="text-xs text-neutral-500">Help us improve the platform</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.analytics}
                                    onChange={(e) => setPrefs(prev => ({ ...prev, analytics: e.target.checked }))}
                                    className="h-4 w-4 rounded border-neutral-300 cursor-pointer"
                                    aria-label="Analytics cookies"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" size="sm" onClick={declineAll}>
                                Decline All
                            </Button>
                            <Button size="sm" onClick={() => setConsent(prefs)}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
