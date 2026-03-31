"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2, Video, VideoOff, Mic, MicOff, PhoneOff,
  Monitor, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyRoomProps {
  roomUrl: string;
  displayName: string;
  token?: string;
  onLeave?: () => void;
}

export default function DailyRoom({
  roomUrl,
  displayName,
  token,
  onLeave,
}: DailyRoomProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<'loading' | 'joined' | 'error' | 'left'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple iframe approach — no SDK instance conflicts
    if (iframeRef.current) {
      const url = new URL(roomUrl);
      // Add display name and config via URL params
      url.searchParams.set('t', token || '');
      url.searchParams.set('userName', displayName);
      iframeRef.current.src = url.toString();
      setState('joined');
    }
  }, [roomUrl, displayName, token]);

  if (state === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="font-medium text-red-800 mb-2">Unable to join session</p>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (state === 'left') {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <Video className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
        <p className="font-medium text-neutral-900 mb-2">Session ended</p>
        <p className="text-sm text-neutral-500">You've left the video room.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900 relative">
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              <p className="text-sm">Connecting to session room...</p>
              <p className="text-xs text-neutral-400 mt-1">EU-hosted · Encrypted</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="TherapyBook session room"
          className="w-full"
          style={{ height: 560 }}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
        />
      </div>
    </div>
  );
}
