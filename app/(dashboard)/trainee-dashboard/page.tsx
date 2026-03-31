"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock, Clock3, Loader2, Video, FileText, AlertCircle,
  CheckCircle2, Users, Shield, Lock, Plus, XCircle,
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
import { SessionTypeBadge, SessionLocationInfo } from "@/components/Common/SessionTypeBadge";

interface DashboardSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  type: string;
  location: string | null;
  notes: string | null;
  client: { firstName: string; lastName: string };
  payment?: { status: string; amount: string; currency: string } | null;
}

interface SessionNote {
  id: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
  author: { firstName: string; lastName: string; role: string };
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

function isPastSession(scheduledAt: string, duration: number): boolean {
  return Date.now() > new Date(scheduledAt).getTime() + duration * 60 * 1000;
}

export default function TraineeDashboard() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supervisor info
  const [supervisorName, setSupervisorName] = useState<string | null>(null);
  const [supervisorEmail, setSupervisorEmail] = useState<string | null>(null);

  // Notes dialog
  const [notesTarget, setNotesTarget] = useState<DashboardSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Session closeout
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null);

  // Pagination
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PER_PAGE = 10;

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

      // Fetch supervisor assignment
      try {
        const supRes = await fetch("/api/supervisor/assignments");
        if (supRes.ok) {
          const supData = await supRes.json();
          const myAssignment = (supData.assignments || []).find(
            (a: any) => a.trainee?.id === profileData.user.id && a.isActive
          );
          if (myAssignment?.supervisor) {
            setSupervisorName(`${myAssignment.supervisor.firstName} ${myAssignment.supervisor.lastName}`);
            setSupervisorEmail(myAssignment.supervisor.email);
          }
        }
      } catch {
        // Non-critical
      }
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

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PER_PAGE;
    return pastSessions.slice(start, start + HISTORY_PER_PAGE);
  }, [pastSessions, historyPage]);

  const totalHistoryPages = Math.ceil(pastSessions.length / HISTORY_PER_PAGE);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Open notes dialog and fetch notes
  const openNotesDialog = async (session: DashboardSession) => {
    setNotesTarget(session);
    setNewNoteText("");
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setSessionNotes(data.notes || []);
      }
    } catch {
      setSessionNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // Add a new note (append-only)
  const handleAddNote = async () => {
    if (!notesTarget || !newNoteText.trim()) return;
    setNotesSaving(true);
    try {
      const res = await fetch(`/api/sessions/${notesTarget.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionNotes((prev) => [...prev, data.note]);
        setNewNoteText("");
        showSuccess("Note added");
      }
    } catch {
      setError("Failed to add note");
    } finally {
      setNotesSaving(false);
    }
  };

  // Lock a note
  const handleLockNote = async (noteId: string) => {
    if (!notesTarget) return;
    try {
      const res = await fetch(`/api/sessions/${notesTarget.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      if (res.ok) {
        setSessionNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, isLocked: true } : n))
        );
        showSuccess("Note locked");
      }
    } catch {
      setError("Failed to lock note");
    }
  };

  // Session closeout (Complete / No Show)
  const handleCloseout = async (sessionId: string, status: "COMPLETED" | "NO_SHOW") => {
    setClosingSessionId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showSuccess(`Session marked as ${status === "COMPLETED" ? "completed" : "no show"}`);
        await loadDashboard();
      } else {
        const data = await res.json().catch(() => ({ error: "Failed" }));
        setError(data.error || "Failed to update session");
      }
    } catch {
      setError("Failed to update session");
    } finally {
      setClosingSessionId(null);
    }
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
        <h1 className="text-2xl font-bold text-neutral-900">Practitioner Workspace</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your schedule, complete session documentation, and track your practice.
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

      {/* KPI cards + Supervisor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Supervisor card — replaces application status for approved trainees */}
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              {supervisorName ? "Supervisor" : "Status"}
            </CardDescription>
            {supervisorName ? (
              <div>
                <CardTitle className="text-base">{supervisorName}</CardTitle>
                {supervisorEmail && (
                  <p className="text-xs text-neutral-500 mt-0.5">{supervisorEmail}</p>
                )}
              </div>
            ) : (
              <CardTitle className="text-base">{appStatus || "N/A"}</CardTitle>
            )}
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
            <CardDescription>Sessions confirmed with payment.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => {
                  const st = statusConfig[session.status] || statusConfig.SCHEDULED;
                  const joinable = isJoinable(session.scheduledAt, session.status);
                  const joinText = getJoinWindowText(session.scheduledAt);
                  const paymentOk = session.payment?.status === "COMPLETED";
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
                            <span className="text-xs text-neutral-400">{joinText}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SessionTypeBadge type={session.type} />
                          {paymentOk ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Payment pending</Badge>
                          )}
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                          {session.type === 'ONLINE' && joinable && (
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
            <CardDescription>Complete documentation for each session.</CardDescription>
          </CardHeader>
          <CardContent>
            {paginatedHistory.length > 0 ? (
              <div className="space-y-3">
                {paginatedHistory.map((session) => {
                  const st = statusConfig[session.status] || statusConfig.COMPLETED;
                  const canCloseout = session.status === "SCHEDULED" && isPastSession(session.scheduledAt, session.duration);
                  const isClosing = closingSessionId === session.id;
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
                              Latest note recorded
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SessionTypeBadge type={session.type} />
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                          {canCloseout && (
                            <>
                              <Button
                                variant="outline" size="sm"
                                disabled={isClosing}
                                onClick={() => handleCloseout(session.id, "COMPLETED")}
                              >
                                {isClosing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                Complete
                              </Button>
                              <Button
                                variant="outline" size="sm"
                                disabled={isClosing}
                                onClick={() => handleCloseout(session.id, "NO_SHOW")}
                                className="text-amber-700 border-amber-200 hover:bg-amber-50"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                No Show
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" onClick={() => void openNotesDialog(session)}>
                            <FileText className="h-3.5 w-3.5" />
                            Notes
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

            {/* Pagination */}
            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-neutral-500">Page {historyPage} of {totalHistoryPages}</span>
                <Button variant="outline" size="sm" disabled={historyPage >= totalHistoryPages} onClick={() => setHistoryPage(historyPage + 1)}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Conditional application link */}
      {appStatus && appStatus !== "APPROVED" && (
        <div className="text-sm text-neutral-500">
          <Link href="/trainee-application" className="text-primary-600 hover:text-primary-700">
            Continue your application
          </Link>
        </div>
      )}

      {/* Notes Dialog — append-only with lock */}
      <Dialog open={notesTarget !== null} onOpenChange={(open) => { if (!open) setNotesTarget(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
            <DialogDescription>
              {notesTarget && `${notesTarget.client.firstName} ${notesTarget.client.lastName} — ${new Date(notesTarget.scheduledAt).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          {/* Existing notes (scrollable) */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-2">
            {notesLoading ? (
              <div className="flex items-center justify-center py-8 text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading notes...
              </div>
            ) : sessionNotes.length > 0 ? (
              sessionNotes.map((note) => (
                <div key={note.id} className="rounded-lg border border-neutral-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-neutral-500">
                      {note.author.firstName} {note.author.lastName} · {new Date(note.createdAt).toLocaleString()}
                    </div>
                    {note.isLocked ? (
                      <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-200">
                        <Lock className="h-3 w-3 mr-1" /> Signed
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => handleLockNote(note.id)}>
                        <Lock className="h-3 w-3" /> Sign off
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 py-4 text-center">No notes yet. Add your first note below.</p>
            )}
          </div>

          {/* Add new note */}
          <div className="border-t pt-3 space-y-2">
            <Textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a clinical note for this session..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotesTarget(null)}>Close</Button>
              <Button onClick={handleAddNote} disabled={notesSaving || !newNoteText.trim()}>
                {notesSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
