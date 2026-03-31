"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  Video,
  Loader2,
  Star,
  XCircle,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CancelSessionDialog from "@/components/Dashboard/CancelSessionDialog";
import RateSessionDialog from "@/components/Dashboard/RateSessionDialog";

interface ClientSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  rating: number | null;
  feedback: string | null;
  cancellationReason: string | null;
  price: string;
  currency: string;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payment?: {
    id: string;
    amount: string;
    currency: string;
    status: string;
  } | null;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  image: string | null;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  NO_SHOW: {
    label: "No Show",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

function getTimeUntil(scheduledAt: string): string {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff < 0) return "Past";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `in ${days} day${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `in ${minutes} min`;
}

function isJoinable(scheduledAt: string, status: string): boolean {
  if (status !== "SCHEDULED" && status !== "IN_PROGRESS") return false;
  const sessionTime = new Date(scheduledAt).getTime();
  const now = Date.now();
  const fifteenMinBefore = sessionTime - 15 * 60 * 1000;
  const thirtyMinAfter = sessionTime + 30 * 60 * 1000;
  return now >= fifteenMinBefore && now <= thirtyMinAfter;
}

export default function ClientDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<ClientSession | null>(null);
  const [rateTarget, setRateTarget] = useState<ClientSession | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileRes, sessionsRes] = await Promise.all([
        fetch("/api/users/profile"),
        fetch("/api/sessions"),
      ]);

      if (!profileRes.ok || !sessionsRes.ok) {
        throw new Error("Failed to load your dashboard");
      }

      const profileData = await profileRes.json();
      const sessionsData = await sessionsRes.json();

      setProfile(profileData.user);
      setSessions(sessionsData.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const upcomingSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          new Date(s.scheduledAt) >= new Date() &&
          s.status !== "CANCELLED" &&
          s.status !== "COMPLETED" &&
          s.status !== "NO_SHOW"
      ),
    [sessions]
  );

  const pastSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          new Date(s.scheduledAt) < new Date() ||
          s.status === "COMPLETED" ||
          s.status === "CANCELLED" ||
          s.status === "NO_SHOW"
      ),
    [sessions]
  );

  const completedCount = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED").length,
    [sessions]
  );

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        Loading your dashboard...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Unable to load dashboard</p>
              <p className="text-sm mt-1">{error || "Please try again later."}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void loadData()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {profile.firstName}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your therapy sessions and track your progress.
        </p>
      </div>

      {/* Success toast */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming</CardDescription>
            <CardTitle>{upcomingSessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle>{completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total sessions</CardDescription>
            <CardTitle>{sessions.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <section id="upcoming" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary-500" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your scheduled therapy sessions. Join when the session window
              opens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const sessionDate = new Date(session.scheduledAt);
                  const joinable = isJoinable(
                    session.scheduledAt,
                    session.status
                  );
                  const status = statusConfig[session.status] || {
                    label: session.status,
                    className: "bg-neutral-100 text-neutral-700",
                  };

                  return (
                    <div
                      key={session.id}
                      className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">
                            {session.therapist.firstName}{" "}
                            {session.therapist.lastName}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                            <span>
                              {sessionDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                              {" at "}
                              {sessionDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {session.duration} min
                            </span>
                            <span className="text-neutral-400">
                              {getTimeUntil(session.scheduledAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={status.className}
                          >
                            {status.label}
                          </Badge>
                          {joinable && (
                            <Button asChild size="sm">
                              <Link href={`/session/${session.id}`}>
                                <Video className="h-4 w-4" />
                                Join Session
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-neutral-500 hover:text-red-600"
                            onClick={() => setCancelTarget(session)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">
                              Cancel
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarPlus className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 mb-4">
                  No upcoming sessions. Ready to book your next one?
                </p>
                <div className="flex justify-center gap-3">
                  <Button asChild variant="outline">
                    <Link href="/booking">Book a Session</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/matching">Find a Match</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Past Sessions / History */}
      <section id="history" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary-500" />
              Session History
            </CardTitle>
            <CardDescription>
              Your completed and past sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <div className="space-y-3">
                {pastSessions.map((session) => {
                  const sessionDate = new Date(session.scheduledAt);
                  const status = statusConfig[session.status] || {
                    label: session.status,
                    className: "bg-neutral-100 text-neutral-700",
                  };
                  const canRate =
                    session.status === "COMPLETED" && session.rating === null;

                  return (
                    <div
                      key={session.id}
                      className="rounded-xl border border-neutral-200 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">
                            {session.therapist.firstName}{" "}
                            {session.therapist.lastName}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                            <span>
                              {sessionDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {session.duration} min
                            </span>
                            {session.payment && (
                              <span>
                                {session.payment.currency}{" "}
                                {Number(session.payment.amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {session.rating !== null && (
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < session.rating!
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-none text-neutral-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={status.className}
                          >
                            {status.label}
                          </Badge>
                          {canRate && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRateTarget(session)}
                            >
                              <Star className="h-4 w-4" />
                              Rate Session
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-4 text-center">
                No session history yet. Your completed sessions will appear
                here.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Account section */}
      <section id="profile" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-neutral-500 font-medium">Name</dt>
                <dd className="text-neutral-900 mt-0.5">
                  {profile.firstName} {profile.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Email</dt>
                <dd className="text-neutral-900 mt-0.5">{profile.email}</dd>
              </div>
              {profile.phone && (
                <div>
                  <dt className="text-neutral-500 font-medium">Phone</dt>
                  <dd className="text-neutral-900 mt-0.5">{profile.phone}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </section>

      {/* Cancel dialog */}
      {cancelTarget && (
        <CancelSessionDialog
          open={!!cancelTarget}
          onOpenChange={(open) => {
            if (!open) setCancelTarget(null);
          }}
          sessionId={cancelTarget.id}
          therapistName={`${cancelTarget.therapist.firstName} ${cancelTarget.therapist.lastName}`}
          scheduledAt={cancelTarget.scheduledAt}
          onCancelled={() => {
            showSuccess("Session cancelled successfully.");
            void loadData();
          }}
        />
      )}

      {/* Rate dialog */}
      {rateTarget && (
        <RateSessionDialog
          open={!!rateTarget}
          onOpenChange={(open) => {
            if (!open) setRateTarget(null);
          }}
          sessionId={rateTarget.id}
          therapistName={`${rateTarget.therapist.firstName} ${rateTarget.therapist.lastName}`}
          scheduledAt={rateTarget.scheduledAt}
          onRated={() => {
            showSuccess("Thank you for your feedback!");
            void loadData();
          }}
        />
      )}
    </div>
  );
}
