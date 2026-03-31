"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarClock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SessionTypeBadge } from "@/components/Common/SessionTypeBadge";

interface AdminSession {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  notes: string | null;
  cancellationReason: string | null;
  client: { id: string; firstName: string; lastName: string; email: string };
  therapist: { id: string; firstName: string; lastName: string; email: string };
  payment: { id: string; amount: string; currency: string; status: string } | null;
}

const sessionStatusConfig: Record<string, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-green-50 text-green-700 border-green-200" },
  COMPLETED: { label: "Completed", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  NO_SHOW: { label: "No Show", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  PROCESSING: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  REFUNDED: { label: "Refunded", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function AdminSessionsManagement() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sessions?page=${page}&limit=30`);
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, page]);

  const updateSession = async (sessionId: string, status: string) => {
    setUpdatingId(sessionId);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      setSuccessMsg(`Session marked as ${status.toLowerCase().replace("_", " ")}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // Admin refund via the canonical sessions API
  const handleRefund = async (sessionId: string) => {
    setUpdatingId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", cancellationReason: "Cancelled by admin" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Refund failed");
      }
      const data = await res.json();
      setSuccessMsg(data.refundApplied ? "Session cancelled and payment refunded" : "Session cancelled");
      setTimeout(() => setSuccessMsg(null), 4000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Sessions</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage session statuses, resolve payment issues, and handle cancellations with refunds.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800">{successMsg}</p>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" /> {error}
            <Button variant="ghost" size="sm" className="ml-auto text-red-600" onClick={() => setError(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <CalendarClock className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">No sessions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Therapist</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => {
                    const sst = sessionStatusConfig[session.status] || { label: session.status, className: "" };
                    const pst = session.payment
                      ? paymentStatusConfig[session.payment.status] || { label: session.payment.status, className: "" }
                      : null;
                    const isUpdating = updatingId === session.id;
                    const canCancel = session.status === "SCHEDULED";
                    const canComplete = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";

                    return (
                      <TableRow key={session.id} className="hover:bg-muted/50">
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium text-neutral-900">
                            {new Date(session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-neutral-900">
                            {session.client.firstName} {session.client.lastName}
                          </div>
                          <div className="text-xs text-neutral-500">{session.client.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-neutral-900">
                            {session.therapist.firstName} {session.therapist.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <SessionTypeBadge type={session.type} />
                          <Badge variant="outline" className={sst.className}>{sst.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {session.payment ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className={pst?.className || ""}>
                                {pst?.label || session.payment.status}
                              </Badge>
                              <div className="text-xs text-neutral-500">
                                {session.payment.currency} {Number(session.payment.amount).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">No payment</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canComplete && (
                              <>
                                <Button
                                  variant="outline" size="sm"
                                  disabled={isUpdating}
                                  onClick={() => void updateSession(session.id, "COMPLETED")}
                                >
                                  Complete
                                </Button>
                                <Button
                                  variant="outline" size="sm"
                                  disabled={isUpdating}
                                  onClick={() => void updateSession(session.id, "NO_SHOW")}
                                  className="text-amber-700 border-amber-200 hover:bg-amber-50"
                                >
                                  No Show
                                </Button>
                              </>
                            )}
                            {canCancel && (
                              <Button
                                variant="outline" size="sm"
                                disabled={isUpdating}
                                onClick={() => void handleRefund(session.id)}
                                className="text-red-700 border-red-200 hover:bg-red-50"
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                Cancel + Refund
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
