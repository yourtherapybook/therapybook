"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, AlertCircle, BadgeCheck, BadgeX, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface DocRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  r2Key: string;
  size: number;
  mimeType: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  VERIFIED: { label: "Verified", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS_FILTERS = ["ALL", "PENDING", "VERIFIED", "REJECTED"];
const TYPE_FILTERS = ["ALL", "CERTIFICATION", "IDENTIFICATION", "PROFILE_PHOTO", "CLINICAL_NOTE"];

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const documentBaseUrl = process.env.NEXT_PUBLIC_R2_DEV_URL || "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/documents?status=${statusFilter}&type=${typeFilter}&page=${page}&limit=30`);
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(data.documents);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => { void load(); }, [load]);

  const handleAction = async (docId: string, status: "VERIFIED" | "REJECTED") => {
    setProcessing(docId);
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSuccessMsg(`Document ${status.toLowerCase()}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await load();
      } else {
        const data = await res.json();
        setError(data.error || "Action failed");
      }
    } catch {
      setError("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Documents</h1>
        <p className="text-sm text-neutral-500 mt-1">Review and verify uploaded credential documents.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => { setStatusFilter(f); setPage(1); }}
            >
              {f === "ALL" ? "All" : statusConfig[f]?.label || f}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <Button
              key={f}
              variant={typeFilter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => { setTypeFilter(f); setPage(1); }}
            >
              {f === "ALL" ? "All Types" : f.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <BadgeCheck className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-800">{successMsg}</p>
        </div>
      )}

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
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <FileText className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">No documents found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const st = statusConfig[doc.status] || { label: doc.status, className: "" };
                    const isProcessingThis = processing === doc.id;
                    return (
                      <TableRow key={doc.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium text-neutral-900 truncate max-w-[200px]">{doc.title}</div>
                          <div className="text-xs text-neutral-500">{(doc.size / 1024).toFixed(0)} KB</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-neutral-700">{doc.user.firstName} {doc.user.lastName}</div>
                          <div className="text-xs text-neutral-500">{doc.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-600">{doc.type.replace("_", " ")}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-500">
                          {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {documentBaseUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`${documentBaseUrl}/${doc.r2Key}`} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {doc.status === "PENDING" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessingThis}
                                  onClick={() => handleAction(doc.id, "VERIFIED")}
                                  className="text-green-700 border-green-200 hover:bg-green-50"
                                >
                                  {isProcessingThis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                                  Verify
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessingThis}
                                  onClick={() => handleAction(doc.id, "REJECTED")}
                                  className="text-red-700 border-red-200 hover:bg-red-50"
                                >
                                  <BadgeX className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              </>
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
