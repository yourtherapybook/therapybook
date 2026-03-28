"use client";
import React, { useEffect, useState } from 'react';
import { Users, FileText, CheckSquare, TrendingUp, Search } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ applications: 0, pending: 0, inReview: 0, users: 0, therapists: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const [appRes, userRes] = await Promise.all([
                    fetch('/api/admin/applications'),
                    fetch('/api/admin/users')
                ]);

                const apps = await appRes.json();
                const users = await userRes.json();

                const appsList = apps.applications || [];
                const usersList = users.users || [];

                setStats({
                    applications: appsList.length,
                    pending: appsList.filter((a: any) => a.status === 'SUBMITTED').length,
                    inReview: appsList.filter((a: any) => a.status === 'UNDER_REVIEW').length,
                    users: usersList.length,
                    therapists: usersList.filter((u: any) => u.role === 'TRAINEE' || u.role === 'SUPERVISOR').length
                });
            } catch (err) {
                console.error('Failed to aggregate admin dashboard telemetry');
            }
            setLoading(false);
        };

        fetchKPIs();
    }, []);

    const kpiCards = [
        { name: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-500' },
        { name: 'Active Practitioners', value: stats.therapists, icon: TrendingUp, color: 'bg-green-500' },
        { name: 'Total Applications', value: stats.applications, icon: FileText, color: 'bg-purple-500' },
        { name: 'Pending Intake', value: stats.pending, icon: CheckSquare, color: 'bg-yellow-500' },
        { name: 'In Review', value: stats.inReview, icon: Search, color: 'bg-sky-500' },
    ];

    if (loading) return <div className="animate-pulse space-y-4 max-w-4xl opacity-50"><div className="h-32 bg-neutral-200 rounded"></div></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Platform Overview</h1>
                <p className="text-sm text-neutral-500">Real-time system health and entity growth metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card) => (
                    <div key={card.name} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex items-center">
                        <div className={`${card.color} p-4 rounded-lg mr-4`}>
                            <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-500">{card.name}</p>
                            <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
