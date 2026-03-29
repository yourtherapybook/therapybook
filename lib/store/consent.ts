import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConsentState {
    hasAnswered: boolean;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    setConsent: (preferences: { analytics: boolean; marketing: boolean }) => void;
    acceptAll: () => void;
    declineAll: () => void;
}

// Persist consent to server-side ledger (fire-and-forget)
function recordConsentServerSide(prefs: { essential: boolean; analytics: boolean; marketing: boolean }) {
    fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...prefs,
            sessionId: typeof window !== 'undefined'
                ? window.sessionStorage.getItem('tb-session-id') || crypto.randomUUID()
                : undefined,
        }),
    }).catch(() => {
        // Non-blocking — client-side store is the primary UX control
    });
}

export const useConsentStore = create<ConsentState>()(
    persist(
        (set) => ({
            hasAnswered: false,
            essential: true, // always true per TTDSG
            analytics: false,
            marketing: false,
            setConsent: (prefs) => {
                const state = { ...prefs, hasAnswered: true, essential: true };
                set(state);
                recordConsentServerSide({ essential: true, analytics: prefs.analytics, marketing: prefs.marketing });
            },
            acceptAll: () => {
                set({ analytics: true, marketing: true, hasAnswered: true, essential: true });
                recordConsentServerSide({ essential: true, analytics: true, marketing: true });
            },
            declineAll: () => {
                set({ analytics: false, marketing: false, hasAnswered: true, essential: true });
                recordConsentServerSide({ essential: true, analytics: false, marketing: false });
            },
        }),
        {
            name: 'therapybook-consent',
        }
    )
);
