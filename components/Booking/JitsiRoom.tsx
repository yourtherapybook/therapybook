"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JitsiRoomProps {
  roomName: string;
  displayName: string;
  domain?: string;
  password?: string;
  userEmail?: string;
  subject?: string;
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiRoom({
  roomName,
  displayName,
  domain = 'meet.jit.si',
  password,
  userEmail,
  subject,
  onLeave,
}: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  useEffect(() => {
    // Load Jitsi IFrame API script
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load video conferencing'));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!containerRef.current || apiRef.current) return;

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: 560,
          userInfo: {
            displayName,
            email: userEmail || '',
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: true,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            hideConferenceSubject: false,
            subject: subject || 'TherapyBook Session',
            // Lobby/waiting room
            enableLobbyChat: false,
            // Recording (disabled for privacy)
            fileRecordingsEnabled: false,
            liveStreamingEnabled: false,
            // UI
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'chat',
              'raisehand', 'tileview', 'hangup',
              'settings', 'fullscreen',
            ],
            SETTINGS_SECTIONS: ['devices', 'language'],
            // Security
            enableInsecureRoomNameWarning: false,
            p2p: { enabled: true },
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            DEFAULT_BACKGROUND: '#f9f9f9',
            TOOLBAR_ALWAYS_VISIBLE: true,
            HIDE_INVITE_MORE_HEADER: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          },
        });

        apiRef.current = api;

        // Set password when room is created
        if (password) {
          api.addEventListener('participantRoleChanged', (event: any) => {
            if (event.role === 'moderator') {
              api.executeCommand('password', password);
            }
          });

          // Join with password for non-moderators
          api.addEventListener('passwordRequired', () => {
            api.executeCommand('password', password);
          });
        }

        api.addEventListener('videoConferenceJoined', () => {
          setLoading(false);
        });

        api.addEventListener('videoConferenceLeft', () => {
          onLeave?.();
        });

        api.addEventListener('audioMuteStatusChanged', (event: any) => {
          setAudioMuted(event.muted);
        });

        api.addEventListener('videoMuteStatusChanged', (event: any) => {
          setVideoMuted(event.muted);
        });

        api.addEventListener('readyToClose', () => {
          onLeave?.();
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start video session');
        setLoading(false);
      }
    };

    void initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, domain, password, userEmail, subject, onLeave]);

  const toggleAudio = () => {
    apiRef.current?.executeCommand('toggleAudio');
  };

  const toggleVideo = () => {
    apiRef.current?.executeCommand('toggleVideo');
  };

  const toggleScreenShare = () => {
    apiRef.current?.executeCommand('toggleShareScreen');
  };

  const toggleChat = () => {
    apiRef.current?.executeCommand('toggleChat');
  };

  const hangup = () => {
    apiRef.current?.executeCommand('hangup');
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <Video className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="font-medium text-red-800 mb-2">Unable to start video session</p>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Video container */}
      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              <p className="text-sm">Connecting to session room...</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full" style={{ minHeight: 560 }} />
      </div>

      {/* Custom control bar (supplements Jitsi's built-in toolbar) */}
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
          title={videoMuted ? 'Turn on camera' : 'Turn off camera'}
        >
          {videoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleScreenShare}
          className="rounded-full"
          title="Share screen"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleChat}
          className="rounded-full"
          title="Chat"
        >
          <MessageSquare className="h-4 w-4" />
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
    </div>
  );
}
