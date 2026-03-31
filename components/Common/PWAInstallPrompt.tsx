"use client";

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!installPrompt || dismissed) return null;

  const handleInstall = async () => {
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-4 flex items-start gap-3">
        <div className="bg-primary-50 p-2 rounded-lg shrink-0">
          <Download className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900">Install TherapyBook</p>
          <p className="text-xs text-neutral-500 mt-0.5">Add to your home screen for quick access</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleInstall}>Install</Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>Not now</Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-neutral-400 hover:text-neutral-600 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
