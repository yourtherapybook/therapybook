"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Building, ShieldCheck, Download, Clock3 } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationReview() {
    const params = useParams();
    const router = useRouter();
    const applicationId = typeof params?.id === 'string' ? params.id : null;
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (applicationId) {
            fetchApplication();
        }
    }, [applicationId]);

    const fetchApplication = async () => {
        if (!applicationId) {
            router.push('/admin/applications');
            return;
        }

        try {
            const res = await fetch(`/api/admin/applications/${applicationId}`);
            if (res.ok) {
                const data = await res.json();
                setApp(data.application);
            } else {
                router.push('/admin/applications');
            }
        } catch {
            router.push('/admin/applications');
        }
        setLoading(false);
    };

    const handleDecision = async (decision: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED') => {
        if (!applicationId) return;
        if (decision === 'REJECTED' && !rejectionReason.trim()) return;
        setProcessing(true);

        try {
            const res = await fetch(`/api/admin/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision, reason: rejectionReason })
            });

            if (res.ok) {
                fetchApplication();
            }
        } catch {
            alert("System fault while dispatching resolution.");
        }
        setProcessing(false);
        setRejectMode(false);
    };

    if (loading) return <div className="animate-pulse space-y-4 max-w-4xl opacity-50"><div className="h-8 bg-neutral-200 rounded w-1/4"></div><div className="h-64 bg-neutral-200 rounded"></div></div>;
    if (!app) return null;

    const isResolved = app.status === 'APPROVED' || app.status === 'REJECTED';
    const isUnderReview = app.status === 'UNDER_REVIEW';
    const documentBaseUrl = process.env.NEXT_PUBLIC_R2_DEV_URL || '';
    const profilePhoto = app.user.documents?.find((document: any) => document.type === 'PROFILE_PHOTO');
    const supportingDocuments = (app.user.documents || []).filter((document: any) => document.type !== 'PROFILE_PHOTO');
    const documentUrl = (r2Key: string) => documentBaseUrl ? `${documentBaseUrl}/${r2Key}` : '#';

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <Link href="/admin/applications" className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Queue
                </Link>
                {(isResolved || isUnderReview) && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        app.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : app.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                    }`}>
                        {app.status === 'APPROVED'
                            ? <CheckCircle className="w-4 h-4 mr-2" />
                            : app.status === 'REJECTED'
                                ? <XCircle className="w-4 h-4 mr-2" />
                                : <Clock3 className="w-4 h-4 mr-2" />}
                        {app.status}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                {/* Header Block */}
                <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50 grid grid-cols-2 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900">{app.user.firstName} {app.user.lastName}</h2>
                        <div className="text-sm text-neutral-500 mt-1">{app.user.email}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-neutral-500">Application Date</div>
                        <div className="font-medium text-neutral-900">{new Date(app.createdAt).toLocaleString()}</div>
                    </div>
                </div>

                {/* Payload Layout */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Identity & Profile */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="flex items-center text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b pb-2"><User className="w-4 h-4 mr-2 text-primary-500" /> Public Profile Vector</h3>
                            {profilePhoto?.r2Key && (
                                <div className="mb-4">
                                    <img
                                        src={documentUrl(profilePhoto.r2Key)}
                                        alt={`${app.user.firstName} ${app.user.lastName}`}
                                        className="h-24 w-24 rounded-xl object-cover border border-neutral-200"
                                    />
                                </div>
                            )}
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between"><dt className="text-neutral-500">Title</dt><dd className="font-medium">{app.title || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">Institution</dt><dd className="font-medium">{app.institutionOfStudy || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">Modality</dt><dd className="font-medium">{app.modality?.join(', ') || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">Target Groups</dt><dd className="font-medium">{app.ageGroups?.join(', ') || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">Languages</dt><dd className="font-medium">{app.languages?.join(', ') || '-'}</dd></div>
                            </dl>
                            <div className="mt-4 text-sm">
                                <div className="text-neutral-500 mb-1">Personal Statement</div>
                                <div className="bg-neutral-50 p-3 rounded border border-neutral-200 italic line-clamp-4">{app.personalStatement || 'No statement provided.'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure & Practice */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="flex items-center text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b pb-2"><Building className="w-4 h-4 mr-2 text-primary-500" /> Operational Geography</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between"><dt className="text-neutral-500">Practice Entity</dt><dd className="font-medium">{app.practiceName || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">City Hub</dt><dd className="font-medium">{[app.city, app.stateProvince, app.country].filter(Boolean).join(', ') || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">Office Phone</dt><dd className="font-medium">{app.officePhone || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="text-neutral-500">Website</dt><dd className="font-medium">{app.practiceWebsite || '-'}</dd></div>
                            </dl>
                        </div>

                        {/* Compliance Matrix */}
                        <div>
                            <h3 className="flex items-center text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b pb-2"><ShieldCheck className="w-4 h-4 mr-2 text-primary-500" /> Legal Assent</h3>
                            <ul className="space-y-2 text-sm text-neutral-700">
                                <li className="flex items-center">{app.paymentAgreement ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />} Financial Agreement</li>
                                <li className="flex items-center">{app.responseTimeAgreement ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />} Responsiveness SLA (4 business days)</li>
                                <li className="flex items-center">{app.minimumClientCommitment ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />} Minimum Client Commitment</li>
                                <li className="flex items-center">{app.termsOfService ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />} Terms of Service</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b pb-2"><FileText className="w-4 h-4 mr-2 text-primary-500" /> Uploaded Evidence</h3>
                            {supportingDocuments.length > 0 ? (
                                <div className="space-y-3">
                                    {supportingDocuments.map((document: any) => (
                                        <div key={document.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                                            <div>
                                                <div className="font-medium text-neutral-900">{document.title}</div>
                                                <div className="text-neutral-500">{document.type} • {document.status}</div>
                                            </div>
                                            {documentBaseUrl && (
                                                <a
                                                    href={documentUrl(document.r2Key)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center text-primary-600 hover:text-primary-700"
                                                >
                                                    <Download className="w-4 h-4 mr-1" /> View
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">No supporting documents uploaded.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <h3 className="flex items-center text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b pb-2"><User className="w-4 h-4 mr-2 text-primary-500" /> Referrals</h3>
                    {app.referrals?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {app.referrals.map((referral: any) => (
                                <div key={referral.id} className="rounded-lg border border-neutral-200 p-4 text-sm">
                                    <div className="font-medium text-neutral-900">{referral.firstName} {referral.lastName}</div>
                                    <div className="text-neutral-500">{referral.workEmail}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">No referrals were provided with this application.</p>
                    )}
                </div>

                {/* Operational Footer */}
                {!isResolved && (
                    <div className="bg-neutral-50 px-6 py-5 border-t border-neutral-200 mt-4 flex justify-end space-x-3">
                        {rejectMode ? (
                            <div className="w-full flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Mandatory rejection reasoning..."
                                    className="flex-1 rounded-md border-neutral-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                    autoFocus
                                />
                                <button onClick={() => setRejectMode(false)} className="px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">Cancel</button>
                                <button disabled={!rejectionReason.trim() || processing} onClick={() => handleDecision('REJECTED')} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center">
                                    {processing ? '...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        ) : (
                            <>
                                {!isUnderReview && (
                                    <button disabled={processing} onClick={() => handleDecision('UNDER_REVIEW')} className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors disabled:opacity-50">
                                        <Clock3 className="w-4 h-4 mr-2" /> Mark Under Review
                                    </button>
                                )}
                                <button onClick={() => setRejectMode(true)} className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors">
                                    <XCircle className="w-4 h-4 mr-2" /> Reject Candidate
                                </button>
                                <button disabled={processing} onClick={() => handleDecision('APPROVED')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Approve & Elevate Role
                                </button>
                            </>
                        )}
                    </div>
                )}

                {app.status === 'REJECTED' && app.rejectionReason && (
                    <div className="bg-red-50 px-6 py-4 border-t border-red-200">
                        <h4 className="text-sm font-semibold text-red-800 mb-1">Rejection Reasoning</h4>
                        <p className="text-sm text-red-700">{app.rejectionReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
