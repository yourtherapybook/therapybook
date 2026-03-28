"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export default function AdminApplicationsQueue() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const filterOptions = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

    useEffect(() => {
        fetchQueue();
    }, [filter]);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/applications?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications);
            }
        } catch (error) {
            console.error('Failed fetching queue', error);
        }
        setLoading(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
            case 'UNDER_REVIEW': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" /> In Review</span>;
            case 'APPROVED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
            case 'REJECTED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"><AlertCircle className="w-3 h-3 mr-1" /> {status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Application Queue</h1>
                    <p className="text-sm text-neutral-500">Review and resolve prospective trainee applications.</p>
                </div>
                <div className="flex bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
                    {filterOptions.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:text-neutral-900'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Candidate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Submitted</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500"><div className="animate-pulse flex justify-center"><FileText className="h-8 w-8 text-neutral-300" /></div></td></tr>
                        ) : applications.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">No applications match the current queue filter.</td></tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-neutral-900">{app.user.firstName} {app.user.lastName}</div>
                                                <div className="text-sm text-neutral-500">{app.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {new Date(app.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/applications/${app.id}`} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors">
                                            <Eye className="w-4 h-4 mr-1.5" />
                                            Review
                                        </Link>
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
