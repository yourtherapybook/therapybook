"use client";
import React, { useEffect, useState } from 'react';
import { Mail, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleOptions = ['CLIENT', 'TRAINEE', 'SUPERVISOR', 'ADMIN'] as const;

export default function AdminUsersManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingUserId, setSavingUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch {
            console.error('Identity aggregation fault');
        }
        setLoading(false);
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    const updateUser = async (userId: string, patch: Record<string, unknown>) => {
        try {
            setSavingUserId(userId);
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...patch }),
            });

            if (!res.ok) {
                throw new Error('Failed to update user');
            }

            const data = await res.json();
            setUsers((current) => current.map((user) => user.id === userId ? data.user : user));
        } catch (error) {
            console.error('User update error:', error);
        } finally {
            setSavingUserId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
                <p className="text-sm text-neutral-500">Monitor and administer identity roles and verification state.</p>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User Entity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Verification</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500"><div className="animate-pulse flex justify-center"><FileText className="h-8 w-8 text-neutral-300" /></div></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">No identities logged.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                                                {user.firstName?.[0] || '?'}{user.lastName?.[0] || '?'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-neutral-900">{user.firstName} {user.lastName}</div>
                                                <div className="text-sm text-neutral-500 flex items-center"><Mail className="w-3 h-3 mr-1" /> {user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                                <Shield className="w-3 h-3 mr-1" /> {user.role}
                                            </span>
                                            <Select
                                                value={user.role}
                                                onValueChange={(role) => void updateUser(user.id, { role })}
                                            >
                                                <SelectTrigger className="w-[160px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roleOptions.map((role) => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {user.emailVerified ? (
                                            <span className="text-green-600 font-medium text-xs">Verified</span>
                                        ) : (
                                            <span className="text-yellow-600 font-medium text-xs">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={savingUserId === user.id}
                                            onClick={() => void updateUser(user.id, { emailVerified: !Boolean(user.emailVerified) })}
                                        >
                                            {savingUserId === user.id ? 'Saving...' : user.emailVerified ? 'Mark Unverified' : 'Mark Verified'}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
