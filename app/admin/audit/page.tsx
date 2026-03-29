"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ScrollText, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface AuditRecord {
  id: string;
  action: string;
  entityId: string;
  entityType: string;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

const ACTION_FILTERS = [
  "ALL",
  "ADMIN_APPLICATION_DECISION",
  "ADMIN_DOCUMENT_REVIEW",
  "ADMIN_USER_UPDATE",
  "ADMIN_SESSION_UPDATE",
  "SESSION_CANCELLED",
  "SESSION_RESCHEDULED",
  "SESSION_UPDATED",
  "SESSION_RATE",
];

const ENTITY_FILTERS = ["ALL", "TraineeApplication", "Document", "Session", "User"];

const actionColor: Record<string, string> = {
  ADMIN_APPLICATION_DECISION: "bg-purple-50 text-purple-700 border-purple-200",
  ADMIN_DOCUMENT_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  SESSION_CANCELLED: "bg-red-50 text-red-700 border-red-200",
  SESSION_RESCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
  SESSION_RATE: "bg-green-50 text-green-700 border-green-200",
};

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailLog, setDetailLog] = useState<AuditRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit?action=${actionFilter}&entityType=${entityFilter}&page=${page}&limit=40`);
      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter, page]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Audit Log</h1>
        <p className="text-sm text-neutral-500 mt-1">Compliance-grade event trail for all administrative and sensitive operations.</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ACTION_FILTERS.map((f) => (
            <Button
              key={f}
              variant={actionFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => { setActionFilter(f); setPage(1); }}
            >
              {f === "ALL" ? "All Actions" : f.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ENTITY_FILTERS.map((f) => (
            <Button
              key={f}
              variant={entityFilter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => { setEntityFilter(f); setPage(1); }}
            >
              {f === "ALL" ? "All Entities" : f}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" /> {error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <ScrollText className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">No audit events found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline" className={actionColor[log.action] || "bg-neutral-50 text-neutral-700 border-neutral-200"}>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-700">{log.entityType}</div>
                        <div className="text-xs text-neutral-400 font-mono truncate max-w-[120px]">{log.entityId}</div>
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div className="text-sm text-neutral-700">{log.user.firstName} {log.user.lastName}</div>
                            <div className="text-xs text-neutral-500">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">System</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.details && (
                          <Button variant="ghost" size="sm" onClick={() => setDetailLog(log)}>
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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

      {/* Detail Dialog */}
      <Dialog open={detailLog !== null} onOpenChange={(open) => { if (!open) setDetailLog(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
            <DialogDescription>
              {detailLog?.action.replace(/_/g, " ")} on {detailLog?.entityType} · {detailLog ? new Date(detailLog.createdAt).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>
          {detailLog?.details && (
            <pre className="text-xs bg-neutral-50 border rounded-lg p-4 overflow-auto max-h-80 text-neutral-700">
              {JSON.stringify(detailLog.details, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
