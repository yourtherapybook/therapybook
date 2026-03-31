"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock, Clock3, Video, Loader2, Star, XCircle,
  CalendarPlus, CheckCircle2, AlertCircle, CreditCard,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CancelSessionDialog from "@/components/Dashboard/CancelSessionDialog";
import RateSessionDialog from "@/components/Dashboard/RateSessionDialog";
import { SessionTypeBadge, SessionLocationInfo } from "@/components/Common/SessionTypeBadge";

interface ClientSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  rating: number | null;
  feedback: string | null;
  cancellationReason: string | null;
  type: string;
  location: string | null;
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

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-green-50 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  NO_SHOW: { label: "No Show", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Payment pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  PROCESSING: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
  FAILED: { label: "Payment failed", className: "bg-red-50 text-red-700 border-red-200" },
  REFUNDED: { label: "Refunded", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

function getJoinWindowText(scheduledAt: string): string {
  const t = new Date(scheduledAt).getTime();
  const opensAt = t - 15 * 60 * 1000;
  const now = Date.now();
  if (now >= opensAt) return "Room open now";
  const diff = opensAt - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Room opens in ${hours}h ${mins}m`;
  return `Room opens in ${mins}m`;
}

function isJoinable(scheduledAt: string, status: string): boolean {
  if (status !== "SCHEDULED" && status !== "IN_PROGRESS") return false;
  const t = new Date(scheduledAt).getTime();
  const now = Date.now();
  return now >= t - 15 * 60 * 1000 && now <= t + 30 * 60 * 1000;
}

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

export default function ClientDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ClientSession | null>(null);
  const [rateTarget, setRateTarget] = useState<ClientSession | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PER_PAGE = 10;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileRes, sessionsRes] = await Promise.all([
        fetch("/api/users/profile"),
        fetch("/api/sessions"),
      ]);
      if (!profileRes.ok || !sessionsRes.ok) throw new Error("Failed to load your dashboard");
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

  useEffect(() => { void loadData(); }, [loadData]);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) =>
      new Date(s.scheduledAt) >= new Date() &&
      s.status !== "CANCELLED" && s.status !== "COMPLETED" && s.status !== "NO_SHOW"
    ),
    [sessions]
  );

  // Show ALL past sessions including cancelled (for refund visibility)
  const pastSessions = useMemo(
    () => sessions.filter((s) =>
      new Date(s.scheduledAt) < new Date() || s.status === "COMPLETED" || s.status === "CANCELLED" || s.status === "NO_SHOW"
    ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    [sessions]
  );

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PER_PAGE;
    return pastSessions.slice(start, start + HISTORY_PER_PAGE);
  }, [pastSessions, historyPage]);
  const totalHistoryPages = Math.ceil(pastSessions.length / HISTORY_PER_PAGE);

  const completedCount = useMemo(() => sessions.filter((s) => s.status === "COMPLETED").length, [sessions]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading your dashboard...
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
          <Button variant="outline" className="mt-4" onClick={() => void loadData()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome back, {profile.firstName}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your therapy sessions and track your progress.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      {/* KPI cards */}
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
            <CardDescription>Total</CardDescription>
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
            <CardDescription>Join when the session window opens.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => {
                  const joinable = isJoinable(session.scheduledAt, session.status);
                  const joinText = getJoinWindowText(session.scheduledAt);
                  const st = statusConfig[session.status] || statusConfig.SCHEDULED;
                  const paymentOk = session.payment?.status === "COMPLETED";
                  return (
                    <div key={session.id} className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 transition-colors">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">
                            {session.therapist.firstName} {session.therapist.lastName}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                            <span>
                              {new Date(session.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short", month: "short", day: "numeric",
                              })}
                              {" at "}
                              {new Date(session.scheduledAt).toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" /> {session.duration} min
                            </span>
                            <span className="text-xs text-neutral-400">{joinText}</span>
                          </div>
                          <SessionLocationInfo type={session.type} location={session.location} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SessionTypeBadge type={session.type} location={session.location} />
                          {paymentOk ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Payment pending</Badge>
                          )}
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                          {session.type === 'ONLINE' && joinable && (
                            <Button asChild size="sm">
                              <Link href={`/session/${session.id}`}>
                                <Video className="h-4 w-4" /> Join
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-red-600" onClick={() => setCancelTarget(session)}>
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">Cancel</span>
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
                <p className="text-sm text-neutral-500 mb-4">No upcoming sessions. Ready to book?</p>
                <div className="flex justify-center gap-3">
                  <Button asChild variant="outline"><Link href="/booking">Book a Session</Link></Button>
                  <Button asChild variant="outline"><Link href="/matching">Find a Match</Link></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Session History — shows ALL including cancelled for refund visibility */}
      <section id="history" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary-500" />
              Session History
            </CardTitle>
            <CardDescription>Past sessions, ratings, and payment status.</CardDescription>
          </CardHeader>
          <CardContent>
            {paginatedHistory.length > 0 ? (
              <div className="space-y-3">
                {paginatedHistory.map((session) => {
                  const st = statusConfig[session.status] || statusConfig.COMPLETED;
                  const canRate = session.status === "COMPLETED" && session.rating === null;
                  const pst = session.payment ? paymentStatusConfig[session.payment.status] : null;
                  return (
                    <div key={session.id} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">
                            {session.therapist.firstName} {session.therapist.lastName}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                            <span>
                              {new Date(session.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short", month: "short", day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" /> {session.duration} min
                            </span>
                            {session.payment && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3.5 w-3.5" />
                                {session.payment.currency} {Number(session.payment.amount).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {session.rating !== null && (
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < session.rating! ? "fill-amber-400 text-amber-400" : "fill-none text-neutral-300"}`} />
                              ))}
                            </div>
                          )}
                          {session.status === "CANCELLED" && session.cancellationReason && (
                            <p className="text-xs text-red-600 mt-1">Cancelled: {session.cancellationReason}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SessionTypeBadge type={session.type} />
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                          {pst && (
                            <Badge variant="outline" className={pst.className}>{pst.label}</Badge>
                          )}
                          {canRate && (
                            <Button variant="outline" size="sm" onClick={() => setRateTarget(session)}>
                              <Star className="h-4 w-4" /> Rate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-4 text-center">No session history yet.</p>
            )}

            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)}>Previous</Button>
                <span className="text-sm text-neutral-500">Page {historyPage} of {totalHistoryPages}</span>
                <Button variant="outline" size="sm" disabled={historyPage >= totalHistoryPages} onClick={() => setHistoryPage(historyPage + 1)}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Account */}
      <section id="profile" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Account</CardTitle>
                <CardDescription>Your account details.</CardDescription>
              </div>
              {!editingProfile && (
                <Button variant="outline" size="sm" onClick={() => {
                  setEditingProfile(true);
                  setProfileForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || '' });
                }}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700">First Name</label>
                    <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700">Last Name</label>
                    <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Phone</label>
                  <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Optional" className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={profileSaving} onClick={async () => {
                    setProfileSaving(true);
                    try {
                      const res = await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm) });
                      if (res.ok) { setEditingProfile(false); showSuccess('Profile updated'); void loadData(); }
                    } catch {} finally { setProfileSaving(false); }
                  }}>
                    {profileSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div><dt className="text-neutral-500 font-medium">Name</dt><dd className="text-neutral-900 mt-0.5">{profile.firstName} {profile.lastName}</dd></div>
                <div><dt className="text-neutral-500 font-medium">Email</dt><dd className="text-neutral-900 mt-0.5">{profile.email}</dd></div>
                {profile.phone && <div><dt className="text-neutral-500 font-medium">Phone</dt><dd className="text-neutral-900 mt-0.5">{profile.phone}</dd></div>}
              </dl>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Cancel dialog */}
      {cancelTarget && (
        <CancelSessionDialog
          open={!!cancelTarget}
          onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
          sessionId={cancelTarget.id}
          therapistName={`${cancelTarget.therapist.firstName} ${cancelTarget.therapist.lastName}`}
          scheduledAt={cancelTarget.scheduledAt}
          onCancelled={() => { showSuccess("Session cancelled. If eligible, your refund will be processed."); void loadData(); }}
        />
      )}

      {/* Rate dialog */}
      {rateTarget && (
        <RateSessionDialog
          open={!!rateTarget}
          onOpenChange={(open) => { if (!open) setRateTarget(null); }}
          sessionId={rateTarget.id}
          therapistName={`${rateTarget.therapist.firstName} ${rateTarget.therapist.lastName}`}
          scheduledAt={rateTarget.scheduledAt}
          onRated={() => { showSuccess("Thank you for your feedback!"); void loadData(); }}
        />
      )}
    </div>
  );
}
