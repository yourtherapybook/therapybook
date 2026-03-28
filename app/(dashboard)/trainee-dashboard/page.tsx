"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Clock3, Loader2, MapPin, Video } from 'lucide-react';
import AvailabilityManager from '@/components/Booking/AvailabilityManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProfile {
  user: {
    id: string;
    firstName: string;
    role: string;
    traineeApplication?: {
      status: string;
    } | null;
  };
}

interface DashboardSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingUrl?: string;
  client: {
    firstName: string;
    lastName: string;
  };
  payment?: {
    status: string;
  } | null;
}

export default function TraineeDashboard() {
  const [profile, setProfile] = useState<DashboardProfile['user'] | null>(null);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [profileResponse, sessionsResponse] = await Promise.all([
          fetch('/api/users/profile'),
          fetch('/api/sessions'),
        ]);

        if (!profileResponse.ok || !sessionsResponse.ok) {
          throw new Error('Failed to load dashboard');
        }

        const profilePayload: DashboardProfile = await profileResponse.json();
        const sessionsPayload = await sessionsResponse.json();

        setProfile(profilePayload.user);
        setSessions(
          (sessionsPayload.sessions || []).filter((session: DashboardSession) => session.status !== 'CANCELLED')
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const upcomingSessions = useMemo(
    () => sessions.filter((session) => new Date(session.scheduledAt) >= new Date()),
    [sessions]
  );
  const pastSessions = useMemo(
    () => sessions.filter((session) => new Date(session.scheduledAt) < new Date()),
    [sessions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        Loading practitioner workspace...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-red-800">{error || 'Failed to load dashboard'}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Practitioner Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Manage live availability, review booked sessions, and keep your provider profile bookable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming sessions</CardDescription>
            <CardTitle>{upcomingSessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Past sessions</CardDescription>
            <CardTitle>{pastSessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Application status</CardDescription>
            <CardTitle>{profile.traineeApplication?.status || 'N/A'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section id="availability" className="scroll-mt-24">
        <AvailabilityManager therapistId={profile.id} />
      </section>

      <section id="schedule" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary-500" /> Upcoming Sessions</CardTitle>
            <CardDescription>Booked sessions are shown here once payment has been completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-neutral-900">{session.client.firstName} {session.client.lastName}</div>
                    <div className="text-sm text-neutral-600">{new Date(session.scheduledAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> {session.duration} min</span>
                    <span className="rounded-full bg-neutral-100 px-3 py-1">{session.status}</span>
                    {session.meetingUrl && (
                      <a href={session.meetingUrl} className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Video className="h-4 w-4" /> Join link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-neutral-500">No booked sessions yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="history" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary-500" /> Session History</CardTitle>
            <CardDescription>Completed sessions stay available for future reporting and follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastSessions.length > 0 ? pastSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-neutral-200 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">{session.client.firstName} {session.client.lastName}</div>
                  <div className="text-sm text-neutral-600">{new Date(session.scheduledAt).toLocaleString()}</div>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">{session.status}</span>
              </div>
            )) : (
              <p className="text-sm text-neutral-500">No completed sessions yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="text-sm text-neutral-500">
        Need to update your onboarding data? <Link href="/trainee-application" className="text-primary-600 hover:text-primary-700">Return to your application</Link>.
      </div>
    </div>
  );
}
