"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Info, Video, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SessionManager from './SessionManager';
import DailyRoom from './DailyRoom';

interface SessionWorkspaceProps {
  initialSession: any;
  userRole: 'client' | 'therapist';
  roomUrl: string;
  roomName?: string;
  roomPassword?: string;
  jitsiDomain?: string;
  displayName?: string;
  userEmail?: string;
  paymentStatus?: string | null;
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export default function SessionWorkspace({
  initialSession,
  userRole,
  roomUrl,
  roomName,
  roomPassword,
  jitsiDomain,
  displayName,
  userEmail,
  paymentStatus,
}: SessionWorkspaceProps) {
  const [session, setSession] = useState(initialSession);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [consentGiven, setConsentGiven] = useState(false);
  const [dailyRoomUrl, setDailyRoomUrl] = useState<string | null>(null);
  const [roomProvider, setRoomProvider] = useState<'daily' | 'jitsi' | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const accessState = useMemo(() => {
    const scheduledAt = new Date(session.scheduledAt);
    const roomOpensAt = new Date(scheduledAt.getTime() - 15 * 60 * 1000);
    const roomClosesAt = new Date(scheduledAt.getTime() + (session.duration + 30) * 60 * 1000);

    return {
      roomOpensAt,
      roomClosesAt,
      canJoin:
        paymentStatus === 'COMPLETED' &&
        session.status === 'SCHEDULED' &&
        currentTime >= roomOpensAt &&
        currentTime <= roomClosesAt,
    };
  }, [currentTime, paymentStatus, session]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr,1fr] gap-8">
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2 text-neutral-900">
              <Video className="h-5 w-5 text-primary-500" />
              <h1 className="text-xl font-semibold">Session Room</h1>
            </div>

            {paymentStatus !== 'COMPLETED' ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
                Payment is still being finalized. This room unlocks after payment is marked complete.
              </div>
            ) : accessState.canJoin ? (
              consentGiven ? (
                <div className="space-y-4">
                  {dailyRoomUrl && roomProvider === 'daily' ? (
                    <DailyRoom
                      roomUrl={dailyRoomUrl}
                      displayName={displayName || 'Participant'}
                    />
                  ) : dailyRoomUrl ? (
                    <div className="rounded-xl border border-neutral-200 overflow-hidden">
                      <iframe
                        title="TherapyBook session room"
                        src={dailyRoomUrl}
                        className="h-[560px] w-full"
                        allow="camera; microphone; fullscreen; display-capture"
                      />
                    </div>
                  ) : roomLoading ? (
                    <div className="flex items-center justify-center py-16 text-neutral-500">
                      <Video className="h-5 w-5 animate-pulse mr-2" /> Preparing session room...
                    </div>
                  ) : (
                    <div className="rounded-xl border border-neutral-200 overflow-hidden">
                      <iframe
                        title="TherapyBook session room"
                        src={roomUrl}
                        className="h-[560px] w-full"
                        allow="camera; microphone; fullscreen; display-capture"
                      />
                    </div>
                  )}
                  <p className="text-sm text-neutral-500">
                    This room is encrypted and only available to session participants.
                    {roomProvider === 'daily' && ' Hosted in the EU.'}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-neutral-900">Before you join</h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        This is a private therapy session. By joining, you acknowledge:
                      </p>
                      <ul className="text-sm text-neutral-600 mt-3 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 font-bold mt-0.5">•</span>
                          This session is confidential between you and your {userRole === 'client' ? 'therapist' : 'client'}.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 font-bold mt-0.5">•</span>
                          Recording this session without all parties&apos; consent is prohibited.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 font-bold mt-0.5">•</span>
                          Your session access is logged for safety and compliance purposes.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      setConsentGiven(true);
                      setRoomLoading(true);
                      try {
                        const res = await fetch(`/api/sessions/${session.id}/room`, { method: 'POST' });
                        if (res.ok) {
                          const data = await res.json();
                          setDailyRoomUrl(data.roomUrl);
                          setRoomProvider(data.provider);
                        }
                      } catch {
                        // Fallback to existing roomUrl
                        setDailyRoomUrl(roomUrl);
                        setRoomProvider('jitsi');
                      } finally {
                        setRoomLoading(false);
                      }
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <Video className="h-4 w-4" />
                    I understand — Join Session
                  </Button>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                <div className="flex items-center gap-2 font-medium">
                  <CalendarClock className="h-5 w-5" />
                  Join window opens 15 minutes before the scheduled time.
                </div>
                <p className="mt-2 text-sm">
                  Room opens at {formatDateTime(accessState.roomOpensAt.toISOString())}.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-2 text-sm text-neutral-500">Session status</div>
            <div className="text-lg font-semibold text-neutral-900">{session.status}</div>
            <div className="mt-4 text-sm text-neutral-600">
              Scheduled for {formatDateTime(session.scheduledAt)}
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              Payment: {paymentStatus || 'Unknown'}
            </div>
          </div>

          {paymentStatus === 'COMPLETED' && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Payment confirmed
              </div>
              <p className="mt-2 text-sm">
                The join room will be available during the scheduled access window.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2 text-neutral-900 font-medium mb-2">
              <Info className="h-4 w-4 text-primary-500" />
              Session controls
            </div>
            <p>Use the management panel below to reschedule or cancel, subject to the 24-hour policy.</p>
          </div>
        </div>
      </div>

      <SessionManager
        session={session}
        userRole={userRole}
        onSessionUpdate={setSession}
      />
    </div>
  );
}
