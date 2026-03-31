"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users, Loader2, CalendarClock, Clock3, AlertCircle,
  FileText, Shield, Lock, Eye, CheckCircle2,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { SessionTypeBadge } from "@/components/Common/SessionTypeBadge";

interface AssignedTrainee {
  id: string;
  trainee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface SupervisorSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  type: string;
  notes: string | null;
  therapist: { id: string; firstName: string; lastName: string };
  client: { firstName: string; lastName: string };
  payment?: { status: string } | null;
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

export default function SupervisorDashboard() {
  const [assignments, setAssignments] = useState<AssignedTrainee[]>([]);
  const [sessions, setSessions] = useState<SupervisorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note review dialog
  const [reviewTarget, setReviewTarget] = useState<SupervisorSession | null>(null);
  const [reviewNotes, setReviewNotes] = useState<SessionNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<"upcoming" | "past">("upcoming");
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignRes, sessionsRes] = await Promise.all([
        fetch("/api/supervisor/assignments"),
        fetch("/api/sessions"),
      ]);
      if (assignRes.ok) {
        const data = await assignRes.json();
        setAssignments(data.assignments || []);
      }
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions || []);
      }
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const activeTrainees = useMemo(
    () => assignments.filter((a) => a.isActive),
    [assignments]
  );

  const traineeIds = useMemo(
    () => new Set(activeTrainees.map((a) => a.trainee.id)),
    [activeTrainees]
  );

  const traineeSessions = useMemo(
    () => sessions.filter((s) => traineeIds.has(s.therapist.id)),
    [sessions, traineeIds]
  );

  const filteredSessions = useMemo(() => {
    let filtered = traineeSessions;
    if (selectedTraineeId) {
      filtered = filtered.filter((s) => s.therapist.id === selectedTraineeId);
    }
    const now = new Date();
    if (viewMode === "upcoming") {
      return filtered.filter((s) => new Date(s.scheduledAt) >= now && s.status !== "CANCELLED");
    }
    return filtered.filter((s) => new Date(s.scheduledAt) < now || s.status === "COMPLETED" || s.status === "NO_SHOW" || s.status === "CANCELLED");
  }, [traineeSessions, viewMode, selectedTraineeId]);

  const completedSessions = useMemo(
    () => traineeSessions.filter((s) => s.status === "COMPLETED"),
    [traineeSessions]
  );

  const sessionsWithoutNotes = useMemo(
    () => completedSessions.filter((s) => !s.notes),
    [completedSessions]
  );

  // Open note review dialog
  const openNoteReview = async (session: SupervisorSession) => {
    setReviewTarget(session);
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setReviewNotes(data.notes || []);
      } else {
        setReviewNotes([]);
      }
    } catch {
      setReviewNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading supervision workspace...
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" /> {error}
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => void loadData()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Supervision Workspace</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Oversee your assigned trainees, review session documentation, and monitor caseload.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Trainees</CardDescription>
            <CardTitle>{activeTrainees.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Sessions</CardDescription>
            <CardTitle>
              {traineeSessions.filter((s) => new Date(s.scheduledAt) >= new Date() && s.status !== "CANCELLED").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle>{completedSessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={sessionsWithoutNotes.length > 0 ? "border-amber-200" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              {sessionsWithoutNotes.length > 0 && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
              Undocumented
            </CardDescription>
            <CardTitle className={sessionsWithoutNotes.length > 0 ? "text-amber-700" : ""}>
              {sessionsWithoutNotes.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Assigned Trainees */}
      <section id="trainees" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-500" />
              Assigned Trainees
            </CardTitle>
            <CardDescription>Click a trainee to filter sessions below.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeTrainees.length > 0 ? (
              <div className="space-y-2">
                {/* All trainees filter */}
                <button
                  onClick={() => setSelectedTraineeId(null)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    !selectedTraineeId ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <span className="text-sm font-medium text-neutral-900">All Trainees</span>
                  <span className="text-xs text-neutral-500 ml-2">{traineeSessions.length} sessions</span>
                </button>
                {activeTrainees.map((assignment) => {
                  const count = traineeSessions.filter((s) => s.therapist.id === assignment.trainee.id).length;
                  const completedCount = completedSessions.filter((s) => s.therapist.id === assignment.trainee.id).length;
                  const undocCount = sessionsWithoutNotes.filter((s) => s.therapist.id === assignment.trainee.id).length;
                  const isSelected = selectedTraineeId === assignment.trainee.id;
                  return (
                    <button
                      key={assignment.id}
                      onClick={() => setSelectedTraineeId(isSelected ? null : assignment.trainee.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        isSelected ? "border-primary-500 bg-primary-50" : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-neutral-900">
                            {assignment.trainee.firstName} {assignment.trainee.lastName}
                          </span>
                          <span className="text-xs text-neutral-500 ml-2">{assignment.trainee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-neutral-500">{count} sessions</span>
                          <span className="text-neutral-500">{completedCount} completed</span>
                          {undocCount > 0 && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {undocCount} undocumented
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-4 text-center">
                No trainees assigned. Contact administration for assignments.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Sessions — switchable view */}
      <section id="sessions" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary-500" />
                Trainee Sessions
                {selectedTraineeId && (
                  <Badge variant="outline" className="ml-2">Filtered</Badge>
                )}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "upcoming" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={viewMode === "past" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("past")}
                >
                  Past
                </Button>
              </div>
            </div>
            <CardDescription>
              {viewMode === "upcoming"
                ? "Scheduled sessions for your trainees."
                : "Completed sessions — review documentation."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSessions.length > 0 ? (
              <div className="space-y-3">
                {filteredSessions.slice(0, 20).map((session) => {
                  const st = statusConfig[session.status] || statusConfig.SCHEDULED;
                  const hasNotes = !!session.notes;
                  const isPast = new Date(session.scheduledAt) < new Date();
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-neutral-200 p-4"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-neutral-900">
                          <span className="text-primary-600">{session.therapist.firstName} {session.therapist.lastName}</span>
                          <span className="text-neutral-400 mx-2">→</span>
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
                        <SessionTypeBadge type={session.type} />
                        <Badge variant="outline" className={st.className}>{st.label}</Badge>
                        {isPast && (
                          hasNotes ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <FileText className="h-3 w-3 mr-1" /> Documented
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <AlertCircle className="h-3 w-3 mr-1" /> No notes
                            </Badge>
                          )
                        )}
                        {(session.status === "COMPLETED" || session.status === "NO_SHOW") && (
                          <Button variant="outline" size="sm" onClick={() => void openNoteReview(session)}>
                            <Eye className="h-3.5 w-3.5" />
                            Review Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredSessions.length > 20 && (
                  <p className="text-xs text-neutral-500 text-center pt-2">
                    Showing 20 of {filteredSessions.length} sessions
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 py-4 text-center">
                {viewMode === "upcoming" ? "No upcoming sessions." : "No past sessions to review."}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Note Review Dialog */}
      <Dialog open={reviewTarget !== null} onOpenChange={(open) => { if (!open) setReviewTarget(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-500" />
              Session Note Review
            </DialogTitle>
            <DialogDescription>
              {reviewTarget && (
                <>
                  {reviewTarget.therapist.firstName} {reviewTarget.therapist.lastName} →{" "}
                  {reviewTarget.client.firstName} {reviewTarget.client.lastName} ·{" "}
                  {new Date(reviewTarget.scheduledAt).toLocaleDateString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-2">
            {notesLoading ? (
              <div className="flex items-center justify-center py-8 text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading notes...
              </div>
            ) : reviewNotes.length > 0 ? (
              reviewNotes.map((note) => (
                <div key={note.id} className="rounded-lg border border-neutral-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-neutral-500">
                      {note.author.firstName} {note.author.lastName} ({note.author.role}) ·{" "}
                      {new Date(note.createdAt).toLocaleString()}
                    </div>
                    {note.isLocked && (
                      <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-200">
                        <Lock className="h-3 w-3 mr-1" /> Signed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <FileText className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">No notes have been recorded for this session.</p>
                <p className="text-xs text-neutral-400 mt-1">The trainee should document this session.</p>
              </div>
            )}
          </div>

          <div className="border-t pt-3 flex justify-end">
            <Button variant="outline" onClick={() => setReviewTarget(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
