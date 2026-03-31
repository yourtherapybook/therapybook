"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Loader2, Video, VideoOff, Mic, MicOff, PhoneOff,
  Monitor, MessageSquare, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);

  const [state, setState] = useState<'loading' | 'joined' | 'error' | 'left'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const cleanup = useCallback(() => {
    if (callRef.current) {
      callRef.current.destroy().catch(() => {});
      callRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const initCall = async () => {
      try {
        const call = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: {
            width: '100%',
            height: '560px',
            border: 'none',
            borderRadius: '12px',
          },
          showLeaveButton: false,
          showFullscreenButton: true,
        });

        callRef.current = call;

        call.on('joined-meeting', () => setState('joined'));
        call.on('left-meeting', () => {
          setState('left');
          onLeave?.();
        });
        call.on('error', (evt) => {
          setError(evt?.errorMsg || 'Connection error');
          setState('error');
        });
        call.on('participant-updated', (evt) => {
          if (evt?.participant?.local) {
            setAudioMuted(!evt.participant.audio);
            setVideoMuted(!evt.participant.video);
            setScreenSharing(!!evt.participant.screen);
          }
        });

        await call.join({
          url: roomUrl,
          userName: displayName,
          ...(token ? { token } : {}),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join session');
        setState('error');
      }
    };

    void initCall();

    return cleanup;
  }, [roomUrl, displayName, token, onLeave, cleanup]);

  const toggleAudio = () => callRef.current?.setLocalAudio(!callRef.current.localAudio());
  const toggleVideo = () => callRef.current?.setLocalVideo(!callRef.current.localVideo());
  const toggleScreen = async () => {
    if (screenSharing) {
      await callRef.current?.stopScreenShare();
    } else {
      await callRef.current?.startScreenShare();
    }
  };
  const hangup = () => callRef.current?.leave();

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
      {/* Video container */}
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
        <div ref={containerRef} className="w-full" style={{ minHeight: 560 }} />
      </div>

      {/* Control bar */}
      {state === 'joined' && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={audioMuted ? "destructive" : "outline"}
            size="icon"
            onClick={toggleAudio}
            className="rounded-full"
            title={audioMuted ? 'Unmute' : 'Mute'}
          >
            {audioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant={videoMuted ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVideo}
            className="rounded-full"
            title={videoMuted ? 'Camera on' : 'Camera off'}
          >
            {videoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button
            variant={screenSharing ? "secondary" : "outline"}
            size="icon"
            onClick={() => void toggleScreen()}
            className="rounded-full"
            title="Share screen"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={hangup}
            className="rounded-full"
            title="Leave session"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
