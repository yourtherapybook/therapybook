"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, Video, Clock, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSessionsManagement() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/admin/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions);
            }
        } catch {
            console.error('Session aggregation fault');
        }
        setLoading(false);
    };

    useEffect(() => {
        void fetchSessions();
    }, []);

    const updateSession = async (sessionId: string, status: string) => {
        try {
            setUpdatingId(sessionId);
            const res = await fetch('/api/admin/sessions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, status }),
            });

            if (!res.ok) {
                throw new Error('Failed to update session');
            }

            const data = await res.json();
            setSessions((current) => current.map((session) => session.id === sessionId ? data.session : session));
        } catch (error) {
            console.error('Session update error:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Session Monitor</h1>
                <p className="text-sm text-neutral-500">Global oversight of scheduled, completed, and payment-backed session activity.</p>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Schedule Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Participants</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500"><div className="animate-pulse flex justify-center"><FileText className="h-8 w-8 text-neutral-300" /></div></td></tr>
                        ) : sessions.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No sessions currently scheduled on platform.</td></tr>
                        ) : (
                            sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-neutral-900">{new Date(session.scheduledAt).toLocaleDateString()}</div>
                                        <div className="text-sm text-neutral-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(session.scheduledAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-neutral-900">Client: {session.client?.email || 'Unknown'}</div>
                                        <div className="text-sm text-neutral-500">Trainee: {session.therapist?.email || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                                            {session.status === 'SCHEDULED' ? <Calendar className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {session.payment ? `${session.payment.currency} ${session.payment.amount} • ${session.payment.status}` : 'No payment'}
                                        <div className="flex items-center mt-1"><Video className="w-3 h-3 mr-1" /> {session.meetingUrl ? 'Room ready' : 'Room pending'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={updatingId === session.id}
                                                onClick={() => void updateSession(session.id, 'COMPLETED')}
                                            >
                                                Complete
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={updatingId === session.id}
                                                onClick={() => void updateSession(session.id, 'NO_SHOW')}
                                            >
                                                No Show
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={updatingId === session.id}
                                                onClick={() => void updateSession(session.id, 'CANCELLED')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
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
