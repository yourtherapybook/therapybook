"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  Loader2,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import AvailabilityManager from "@/components/Booking/AvailabilityManager";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface DashboardSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  notes: string | null;
  client: { firstName: string; lastName: string };
  payment?: { status: string; amount: string; currency: string } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-green-50 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  NO_SHOW: { label: "No Show", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

function isJoinable(scheduledAt: string, status: string): boolean {
  if (status !== "SCHEDULED" && status !== "IN_PROGRESS") return false;
  const t = new Date(scheduledAt).getTime();
  const now = Date.now();
  return now >= t - 15 * 60 * 1000 && now <= t + 30 * 60 * 1000;
}

export default function TraineeDashboard() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Notes dialog
  const [notesTarget, setNotesTarget] = useState<DashboardSession | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileRes, sessionsRes] = await Promise.all([
        fetch("/api/users/profile"),
        fetch("/api/sessions"),
      ]);

      if (!profileRes.ok || !sessionsRes.ok) throw new Error("Failed to load dashboard");

      const profileData = await profileRes.json();
      const sessionsData = await sessionsRes.json();

      setProfileId(profileData.user.id);
      setAppStatus(profileData.user.traineeApplication?.status || null);
      setSessions(
        (sessionsData.sessions || []).filter((s: DashboardSession) => s.status !== "CANCELLED")
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => new Date(s.scheduledAt) >= new Date() && s.status !== "COMPLETED" && s.status !== "NO_SHOW"),
    [sessions]
  );
  const pastSessions = useMemo(
    () => sessions.filter((s) => new Date(s.scheduledAt) < new Date() || s.status === "COMPLETED" || s.status === "NO_SHOW"),
    [sessions]
  );

  const handleSaveNotes = async () => {
    if (!notesTarget) return;
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/sessions/${notesTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText }),
      });
      if (res.ok) {
        setNotesTarget(null);
        setSuccessMsg("Session notes saved");
        setTimeout(() => setSuccessMsg(null), 3000);
        await loadDashboard();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save notes");
      }
    } catch {
      setError("Failed to save notes");
    } finally {
      setNotesSaving(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading practitioner workspace...
      </div>
    );
  }

  if (error && !profileId) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" /> {error}
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => void loadDashboard()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Practitioner Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage availability, review sessions, and add clinical notes.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto text-red-600">Dismiss</Button>
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
            <CardTitle>{pastSessions.filter((s) => s.status === "COMPLETED").length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Application</CardDescription>
            <CardTitle className="text-base">{appStatus || "N/A"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Availability */}
      {profileId && (
        <section id="availability" className="scroll-mt-24">
          <AvailabilityManager therapistId={profileId} />
        </section>
      )}

      {/* Upcoming Sessions */}
      <section id="schedule" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary-500" /> Upcoming Sessions
            </CardTitle>
            <CardDescription>Sessions are shown after payment is confirmed.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => {
                  const st = statusConfig[session.status] || statusConfig.SCHEDULED;
                  const joinable = isJoinable(session.scheduledAt, session.status);
                  return (
                    <div key={session.id} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">
                            {session.client.firstName} {session.client.lastName}
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
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                          {joinable && (
                            <Button size="sm" asChild>
                              <Link href={`/session/${session.id}`}>
                                <Video className="h-4 w-4" /> Join
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-2">No upcoming sessions.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Session History */}
      <section id="history" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-500" /> Session History
            </CardTitle>
            <CardDescription>Add notes to completed sessions for clinical records.</CardDescription>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <div className="space-y-3">
                {pastSessions.map((session) => {
                  const st = statusConfig[session.status] || statusConfig.COMPLETED;
                  return (
                    <div key={session.id} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">
                            {session.client.firstName} {session.client.lastName}
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
                              <span>{session.payment.currency} {Number(session.payment.amount).toFixed(2)}</span>
                            )}
                          </div>
                          {session.notes && (
                            <p className="text-xs text-neutral-500 mt-1 italic truncate max-w-xs">
                              Notes: {session.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNotesTarget(session);
                              setNotesText(session.notes || "");
                            }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {session.notes ? "Edit Notes" : "Add Notes"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-2">No past sessions yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="text-sm text-neutral-500">
        Need to update your onboarding data?{" "}
        <Link href="/trainee-application" className="text-primary-600 hover:text-primary-700">
          Return to your application
        </Link>.
      </div>

      {/* Notes Dialog */}
      <Dialog
        open={notesTarget !== null}
        onOpenChange={(open) => { if (!open) setNotesTarget(null); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
            <DialogDescription>
              {notesTarget && `${notesTarget.client.firstName} ${notesTarget.client.lastName} — ${new Date(notesTarget.scheduledAt).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add clinical notes for this session..."
              rows={5}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setNotesTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveNotes} disabled={notesSaving}>
              {notesSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
