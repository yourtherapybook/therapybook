"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface PaymentRecord {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  processedAt: string | null;
  user: { id: string; firstName: string; lastName: string; email: string };
  session: {
    id: string;
    scheduledAt: string;
    status: string;
    therapist: { firstName: string; lastName: string };
  } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  PROCESSING: { label: "Processing", className: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
  REFUNDED: { label: "Refunded", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

const FILTERS = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"];

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments?status=${filter}&page=${page}&limit=30`);
      if (!res.ok) throw new Error("Failed to load payments");
      const data = await res.json();
      setPayments(data.payments);
      setTotalPages(data.pagination.totalPages);
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
        <h1 className="text-2xl font-bold text-neutral-900">Payments</h1>
        <p className="text-sm text-neutral-500 mt-1">View all payment transactions and refund status.</p>
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
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <CreditCard className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">No payments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Therapist</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const st = statusConfig[p.status] || { label: p.status, className: "bg-neutral-100 text-neutral-700" };
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium text-neutral-900">{p.user.firstName} {p.user.lastName}</div>
                          <div className="text-xs text-neutral-500">{p.user.email}</div>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-700">
                          {p.session ? `${p.session.therapist.firstName} ${p.session.therapist.lastName}` : "—"}
                        </TableCell>
                        <TableCell className="font-medium text-neutral-900">
                          {p.currency} {Number(p.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={st.className}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600">
                          {p.session ? new Date(p.session.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-500">
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
