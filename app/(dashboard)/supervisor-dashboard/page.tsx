"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Loader2, CalendarClock, Clock3, AlertCircle } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  notes: string | null;
}

interface SupervisorSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  therapist: { id: string; firstName: string; lastName: string };
  client: { firstName: string; lastName: string };
}

export default function SupervisorDashboard() {
  const [assignments, setAssignments] = useState<AssignedTrainee[]>([]);
  const [sessions, setSessions] = useState<SupervisorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch supervisor's assigned trainees and their sessions
      const [assignRes, sessionsRes] = await Promise.all([
        fetch("/api/supervisor/assignments"),
        fetch("/api/sessions"),
      ]);

      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData.assignments || []);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
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

  const upcomingSessions = useMemo(
    () => traineeSessions.filter((s) => new Date(s.scheduledAt) >= new Date() && s.status !== "CANCELLED"),
    [traineeSessions]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-600">
        <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading supervisor workspace...
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
        <h1 className="text-2xl font-bold text-neutral-900">Supervisor Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor your assigned trainees and their session activity.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Trainees</CardDescription>
            <CardTitle>{activeTrainees.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Sessions</CardDescription>
            <CardTitle>{upcomingSessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sessions</CardDescription>
            <CardTitle>{traineeSessions.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Assigned Trainees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            Assigned Trainees
          </CardTitle>
          <CardDescription>Trainees under your supervision.</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrainees.length > 0 ? (
            <div className="space-y-3">
              {activeTrainees.map((assignment) => {
                const traineeSessionCount = traineeSessions.filter(
                  (s) => s.therapist.id === assignment.trainee.id
                ).length;
                return (
                  <div
                    key={assignment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-neutral-200 p-4"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">
                        {assignment.trainee.firstName} {assignment.trainee.lastName}
                      </div>
                      <div className="text-sm text-neutral-500">{assignment.trainee.email}</div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <span>{traineeSessionCount} session{traineeSessionCount !== 1 ? "s" : ""}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center">
              No trainees assigned yet. Contact administration for assignments.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trainee Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary-500" />
            Upcoming Trainee Sessions
          </CardTitle>
          <CardDescription>Sessions scheduled for your assigned trainees.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-neutral-200 p-4"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-neutral-900">
                      {session.therapist.firstName} {session.therapist.lastName}
                      <span className="text-neutral-400 mx-2">→</span>
                      {session.client.firstName} {session.client.lastName}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
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
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center">
              No upcoming sessions for your trainees.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
