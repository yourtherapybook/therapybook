"use client";

import { useState, useEffect } from 'react';
import { useConsentStore } from '../lib/store/consent';
import { Shield } from 'lucide-react';
import { Button } from './ui/button';

export function GDPRBanner() {
    const { hasAnswered, acceptAll, declineAll, setConsent } = useConsentStore();
    const [mounted, setMounted] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || hasAnswered) return null;

    const handleSave = () => {
        setConsent(prefs);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pb-8">
            <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-2xl border border-neutral-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">Ihre Privatsphäre ist uns wichtig</h2>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                        Wir verwenden Cookies, um unsere Website für Sie optimal zu gestalten, die Performance zu analysieren und relevante Inhalte bereitzustellen. Klicken Sie auf "Alle akzeptieren", um zuzustimmen, oder auf "Einstellungen", um Ihre Präferenzen anzupassen. Ihre Einwilligung können Sie jederzeit in unserer <a href="/privacy" className="text-primary hover:underline font-medium min-h-[44px] inline-flex items-center px-1">Datenschutzerklärung</a> widerrufen.
                    </p>

                    {showDetails && (
                        <div className="space-y-4 border-t border-neutral-100 pt-4 mb-4">
                            <div className="flex items-center justify-between min-h-[44px]">
                                <div>
                                    <h4 className="font-semibold text-neutral-900 text-sm">Notwendig</h4>
                                    <p className="text-xs text-neutral-500">Erforderlich für die Grundfunktionen.</p>
                                </div>
                                <input type="checkbox" checked disabled className="w-5 h-5 rounded text-primary" />
                            </div>
                            <div className="flex items-center justify-between min-h-[44px]">
                                <div>
                                    <h4 className="font-semibold text-neutral-900 text-sm">Analyse & Statistik</h4>
                                    <p className="text-xs text-neutral-500">Helfen uns die Website zu verbessern.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.analytics}
                                    onChange={(e) => setPrefs(prev => ({ ...prev, analytics: e.target.checked }))}
                                    className="w-5 h-5 rounded border-neutral-300 text-primary cursor-pointer"
                                    aria-label="Analyse Cookies"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    {!showDetails ? (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setShowDetails(true)}
                            className="min-h-[44px]"
                        >
                            Einstellungen
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleSave}
                            className="min-h-[44px]"
                        >
                            Auswahl speichern
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={declineAll}
                        className="min-h-[44px]"
                    >
                        Ablehnen
                    </Button>
                    <Button
                        size="lg"
                        onClick={acceptAll}
                        className="min-h-[44px]"
                    >
                        Alle akzeptieren
                    </Button>
                </div>
            </div>
        </div>
    );
}
