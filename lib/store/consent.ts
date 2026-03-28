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

export const useConsentStore = create<ConsentState>()(
    persist(
        (set) => ({
            hasAnswered: false,
            essential: true, // always true per TTDSG
            analytics: false,
            marketing: false,
            setConsent: (prefs) => set({ ...prefs, hasAnswered: true, essential: true }),
            acceptAll: () => set({ analytics: true, marketing: true, hasAnswered: true, essential: true }),
            declineAll: () => set({ analytics: false, marketing: false, hasAnswered: true, essential: true }),
        }),
        {
            name: 'therapybook-consent',
        }
    )
);
