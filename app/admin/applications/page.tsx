"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, CheckSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface QueueApplication {
  id: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    documents?: { id: string; type: string; status: string }[];
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  SUBMITTED: { label: "Submitted", className: "bg-amber-50 text-amber-700 border-amber-200" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-50 text-blue-700 border-blue-200" },
  APPROVED: { label: "Approved", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

const FILTERS = ["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

function getAge(dateStr: string | null): string {
  if (!dateStr) return "—";
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function AdminApplicationsQueue() {
  const [applications, setApplications] = useState<QueueApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("SUBMITTED");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications?status=${filter}&page=${page}&limit=30`);
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Application Queue</h1>
        <p className="text-sm text-neutral-500 mt-1">Review trainee applications. Verify documents before approving.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f === "ALL" ? "All" : statusConfig[f]?.label || f}
          </Button>
        ))}
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
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <CheckSquare className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">No applications match this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const st = statusConfig[app.status] || statusConfig.DRAFT;
                    const docs = (app.user.documents || []).filter((d) => d.type !== "PROFILE_PHOTO");
                    const verifiedDocs = docs.filter((d) => d.status === "VERIFIED").length;
                    const pendingDocs = docs.filter((d) => d.status === "PENDING").length;
                    const hasDocs = docs.length > 0;

                    return (
                      <TableRow key={app.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium text-neutral-900">
                            {app.user.firstName} {app.user.lastName}
                          </div>
                          <div className="text-xs text-neutral-500">{app.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">
                          <div>{getAge(app.submittedAt || app.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          {hasDocs ? (
                            <div className="text-xs space-y-0.5">
                              <div className="text-green-700">{verifiedDocs} verified</div>
                              {pendingDocs > 0 && (
                                <div className="text-amber-700">{pendingDocs} pending</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/applications/${app.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                              Review
                            </Link>
                          </Button>
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
