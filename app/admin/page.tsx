"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  CheckSquare,
  CreditCard,
  CalendarClock,
  FolderOpen,
  Shield,
  ScrollText,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlatformStats {
  users: { total: number; clients: number; trainees: number; supervisors: number };
  applications: { total: number; pending: number; underReview: number; approved: number };
  sessions: { total: number; scheduled: number; completed: number; cancelled: number; noShow: number };
  payments: { total: number; completed: number; refunded: number; gmv: number; totalRefunded: number };
  documents: { total: number; pending: number };
  supervision: { activeAssignments: number };
  audit: { recentEvents: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" /> {error || "Failed to load dashboard"}
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => void load()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Operations Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Platform health and operational metrics.</p>
      </div>

      {/* KPI Grid — adapted from SalesLedger: grid gap-4 md:grid-cols-2 lg:grid-cols-4 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.users.total}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {stats.users.clients} clients · {stats.users.trainees} trainees · {stats.users.supervisors} supervisors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>GMV (Completed)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">EUR {stats.payments.gmv.toFixed(2)}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {stats.payments.completed} payments · {stats.payments.refunded} refunded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary-500" />
              <span className="text-2xl font-bold">{stats.sessions.total}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {stats.sessions.scheduled} scheduled · {stats.sessions.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{stats.supervision.activeAssignments}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">Active supervisor-trainee pairs</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Queues */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Applications */}
        <Card className={stats.applications.pending + stats.applications.underReview > 0 ? "border-amber-200" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-amber-500" />
                Application Queue
              </CardTitle>
              {(stats.applications.pending + stats.applications.underReview) > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {stats.applications.pending + stats.applications.underReview} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">{stats.applications.pending}</span> submitted ·{" "}
              <span className="font-medium">{stats.applications.underReview}</span> under review ·{" "}
              <span className="font-medium">{stats.applications.approved}</span> approved
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/applications">
                Review Applications <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Documents */}
        <Card className={stats.documents.pending > 0 ? "border-amber-200" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-blue-500" />
                Document Queue
              </CardTitle>
              {stats.documents.pending > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {stats.documents.pending} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">{stats.documents.pending}</span> awaiting review of{" "}
              <span className="font-medium">{stats.documents.total}</span> total
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/documents">
                Review Documents <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Audit Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-neutral-500" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">{stats.audit.recentEvents}</span> events in the last 30 days
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/audit">
                View Audit Log <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Session breakdown */}
      {(stats.sessions.cancelled > 0 || stats.sessions.noShow > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Session Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-neutral-600">Completed: <span className="font-medium text-neutral-900">{stats.sessions.completed}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-neutral-600">Cancelled: <span className="font-medium text-neutral-900">{stats.sessions.cancelled}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-neutral-600">No-show: <span className="font-medium text-neutral-900">{stats.sessions.noShow}</span></span>
              </div>
              {stats.payments.totalRefunded > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-neutral-600">Refunded: <span className="font-medium text-neutral-900">EUR {stats.payments.totalRefunded.toFixed(2)}</span></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
