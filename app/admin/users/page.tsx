"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Users, Loader2, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: string | null;
  createdAt: string;
}

const ROLE_OPTIONS = ["CLIENT", "TRAINEE", "SUPERVISOR", "ADMIN"] as const;

const roleConfig: Record<string, { className: string }> = {
  CLIENT: { className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  TRAINEE: { className: "bg-blue-50 text-blue-700 border-blue-200" },
  SUPERVISOR: { className: "bg-purple-50 text-purple-700 border-purple-200" },
  ADMIN: { className: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateUser = async (userId: string, patch: Record<string, unknown>) => {
    setSavingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }

      setSuccessMsg("User updated");
      setTimeout(() => setSuccessMsg(null), 3000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage user roles, verification, and account status.</p>
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
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <Users className="h-8 w-8 mx-auto mb-3 text-neutral-300" />
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const rc = roleConfig[user.role] || roleConfig.CLIENT;
                    const isUpdating = savingUserId === user.id;

                    return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                              {user.firstName?.[0] || "?"}{user.lastName?.[0] || "?"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-neutral-900 truncate">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-neutral-500 truncate">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(role) => void updateUser(user.id, { role })}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={user.emailVerified
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-500 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => void updateUser(user.id, {
                              emailVerified: user.emailVerified ? null : new Date().toISOString(),
                            })}
                          >
                            {user.emailVerified ? "Unverify" : "Verify"}
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
    </div>
  );
}
