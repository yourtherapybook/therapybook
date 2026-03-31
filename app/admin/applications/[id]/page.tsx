"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building,
  ShieldCheck,
  Download,
  Clock,
  Loader2,
  AlertCircle,
  Shield,
  BadgeCheck,
  BadgeX,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- Types ---

interface DocumentRecord {
  id: string;
  title: string;
  type: string;
  r2Key: string;
  size: number;
  mimeType: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
}

interface ApplicationData {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  approvalReason: string | null;
  // Profile
  title: string | null;
  therapistType: string | null;
  institutionOfStudy: string | null;
  specialties: string[];
  treatmentOrientation: string[];
  modality: string[];
  ageGroups: string[];
  languages: string[];
  personalStatement: string | null;
  profilePhotoUrl: string | null;
  // Practice
  practiceName: string | null;
  practiceWebsite: string | null;
  officePhone: string | null;
  city: string | null;
  stateProvince: string | null;
  country: string | null;
  // Agreements
  paymentAgreement: boolean;
  responseTimeAgreement: boolean;
  minimumClientCommitment: boolean;
  termsOfService: boolean;
  motivationStatement: string | null;
  // Relations
  user: {
    firstName: string;
    lastName: string;
    email: string;
    documents: DocumentRecord[];
  };
  referrals: { id: string; firstName: string; lastName: string; workEmail: string }[];
}

// --- Status config ---

const applicationStatusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  DRAFT: { label: "Draft", className: "bg-neutral-100 text-neutral-600 border-neutral-200", icon: Clock },
  SUBMITTED: { label: "Submitted", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", className: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertCircle },
  APPROVED: { label: "Approved", className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const documentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
  VERIFIED: { label: "Verified", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

// --- Checklist computation ---

interface ChecklistItem {
  key: string;
  label: string;
  passed: boolean;
  detail?: string;
}

function computeChecklist(app: ApplicationData): ChecklistItem[] {
  const docs = app.user.documents.filter((d) => d.type !== "PROFILE_PHOTO");
  const verifiedDocs = docs.filter((d) => d.status === "VERIFIED");
  const pendingDocs = docs.filter((d) => d.status === "PENDING");

  return [
    {
      key: "agreements",
      label: "All agreements accepted",
      passed: app.paymentAgreement && app.responseTimeAgreement && app.minimumClientCommitment && app.termsOfService,
    },
    {
      key: "docs_uploaded",
      label: "Credential documents uploaded",
      passed: docs.length > 0,
      detail: docs.length > 0 ? `${docs.length} document${docs.length !== 1 ? "s" : ""}` : "None uploaded",
    },
    {
      key: "docs_verified",
      label: "At least one document verified",
      passed: verifiedDocs.length > 0,
      detail: verifiedDocs.length > 0 ? `${verifiedDocs.length} verified` : "None verified",
    },
    {
      key: "docs_reviewed",
      label: "All documents reviewed (no pending)",
      passed: pendingDocs.length === 0 && docs.length > 0,
      detail: pendingDocs.length > 0 ? `${pendingDocs.length} still pending` : "All reviewed",
    },
    {
      key: "profile_complete",
      label: "Profile fields completed",
      passed: Boolean(app.title && app.institutionOfStudy && app.personalStatement),
    },
  ];
}

// --- Component ---

export default function ApplicationReview() {
  const params = useParams();
  const router = useRouter();
  const applicationId = typeof params?.id === "string" ? params.id : null;

  const [app, setApp] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [docProcessing, setDocProcessing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supervisor state
  const [supervisors, setSupervisors] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([]);
  const [assignedSupervisorId, setAssignedSupervisorId] = useState<string | null>(null);
  const [supervisorProcessing, setSupervisorProcessing] = useState(false);

  // Decision dialog state
  const [decisionDialog, setDecisionDialog] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      router.push("/admin/applications");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/applications/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data.application);
      } else {
        setError("Failed to load application");
      }
    } catch {
      setError("Failed to load application");
    } finally {
      setLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    void fetchApplication();
  }, [fetchApplication]);

  // Load available supervisors and check existing assignment
  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const [supRes, assignRes] = await Promise.all([
          fetch("/api/admin/supervisors?list=supervisors"),
          fetch("/api/admin/supervisors"),
        ]);
        if (supRes.ok) {
          const data = await supRes.json();
          setSupervisors(data.supervisors || []);
        }
        if (assignRes.ok && app) {
          const data = await assignRes.json();
          const existing = (data.assignments || []).find(
            (a: any) => a.trainee?.id === app.userId && a.isActive
          );
          if (existing) setAssignedSupervisorId(existing.supervisor.id);
        }
      } catch {
        // Non-critical
      }
    };
    if (app) void loadSupervisors();
  }, [app]);

  const handleAssignSupervisor = async (supervisorId: string) => {
    if (!app) return;
    setSupervisorProcessing(true);
    try {
      const res = await fetch("/api/admin/supervisors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId, traineeId: app.userId }),
      });
      if (res.ok) {
        setAssignedSupervisorId(supervisorId);
        setSuccessMsg("Supervisor assigned");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign supervisor");
      }
    } catch {
      setError("Failed to assign supervisor");
    } finally {
      setSupervisorProcessing(false);
    }
  };

  const handleDocumentAction = async (docId: string, status: "VERIFIED" | "REJECTED") => {
    setDocProcessing(docId);
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSuccessMsg(`Document ${status.toLowerCase()}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchApplication();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update document");
      }
    } catch {
      setError("Failed to update document");
    } finally {
      setDocProcessing(null);
    }
  };

  const handleDecision = async (decision: "UNDER_REVIEW" | "APPROVED" | "REJECTED") => {
    if (!applicationId) return;

    if (decision === "APPROVED" || decision === "REJECTED") {
      if (!decisionReason.trim()) {
        setDecisionError(decision === "APPROVED" ? "Approval reasoning is required" : "Rejection reason is required");
        return;
      }
    }

    setProcessing(true);
    setDecisionError(null);

    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reason: decisionReason }),
      });

      if (res.ok) {
        setDecisionDialog(null);
        setDecisionReason("");
        setSuccessMsg(`Application ${decision.toLowerCase().replace("_", " ")}`);
        setTimeout(() => setSuccessMsg(null), 4000);
        await fetchApplication();
      } else {
        const data = await res.json();
        setDecisionError(data.error || "Failed to update application");
      }
    } catch {
      setDecisionError("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="h-5 bg-neutral-200 rounded w-32 animate-pulse" />
        <div className="h-8 bg-neutral-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !app) {
    return (
      <Card className="max-w-lg border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => void fetchApplication()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!app) return null;

  const statusConfig = applicationStatusConfig[app.status] || applicationStatusConfig.DRAFT;
  const StatusIcon = statusConfig.icon;
  const isTerminal = app.status === "APPROVED" || app.status === "REJECTED";
  const canDecide = app.status === "SUBMITTED" || app.status === "UNDER_REVIEW";
  const checklist = computeChecklist(app);
  const allChecksPassed = checklist.every((c) => c.passed);
  const documentBaseUrl = process.env.NEXT_PUBLIC_R2_DEV_URL || "";
  const profilePhoto = app.user.documents?.find((d) => d.type === "PROFILE_PHOTO");
  const credentialDocs = (app.user.documents || []).filter((d) => d.type !== "PROFILE_PHOTO");
  const documentUrl = (r2Key: string) => (documentBaseUrl ? `${documentBaseUrl}/${r2Key}` : "#");

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/applications"
          className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Queue
        </Link>
        <Badge variant="outline" className={statusConfig.className}>
          <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">{successMsg}</p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto text-red-600">
            Dismiss
          </Button>
        </div>
      )}

      {/* Applicant header card */}
      <Card>
        <CardHeader className="bg-neutral-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              {profilePhoto?.r2Key && (
                <img
                  src={documentUrl(profilePhoto.r2Key)}
                  alt={`${app.user.firstName} ${app.user.lastName}`}
                  className="h-14 w-14 rounded-lg object-cover border border-neutral-200"
                />
              )}
              <div>
                <CardTitle className="text-xl">
                  {app.user.firstName} {app.user.lastName}
                </CardTitle>
                <CardDescription>{app.user.email}</CardDescription>
              </div>
            </div>
            <div className="text-sm text-neutral-500">
              <div>Submitted {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</div>
              {app.reviewedAt && (
                <div>Reviewed {new Date(app.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile + Practice (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary-500" />
                Public Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-neutral-500 font-medium">Title</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.title || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Institution</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.institutionOfStudy || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Modality</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.modality?.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Target Groups</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.ageGroups?.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Languages</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.languages?.join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Specialties</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.specialties?.join(", ") || "—"}</dd>
                </div>
              </dl>
              {app.personalStatement && (
                <div className="mt-4">
                  <div className="text-sm text-neutral-500 font-medium mb-1">Personal Statement</div>
                  <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-lg border">{app.personalStatement}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice & Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4 text-primary-500" />
                Practice & Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-neutral-500 font-medium">Practice Name</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.practiceName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Location</dt>
                  <dd className="text-neutral-900 mt-0.5">
                    {[app.city, app.stateProvince, app.country].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Phone</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.officePhone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 font-medium">Website</dt>
                  <dd className="text-neutral-900 mt-0.5">{app.practiceWebsite || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary-500" />
                Credential Documents
              </CardTitle>
              <CardDescription>Review and verify each document before approving the application.</CardDescription>
            </CardHeader>
            <CardContent>
              {credentialDocs.length > 0 ? (
                <div className="space-y-3">
                  {credentialDocs.map((doc) => {
                    const docStatus = documentStatusConfig[doc.status] || documentStatusConfig.PENDING;
                    const isProcessingThis = docProcessing === doc.id;

                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-neutral-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-neutral-900 truncate">{doc.title}</div>
                            <div className="text-xs text-neutral-500">
                              {doc.type.replace("_", " ")} · {(doc.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={docStatus.className}>
                            {docStatus.label}
                          </Badge>
                          {documentBaseUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={documentUrl(doc.r2Key)} target="_blank" rel="noreferrer">
                                <Download className="h-4 w-4" />
                                View
                              </a>
                            </Button>
                          )}
                          {doc.status === "PENDING" && canDecide && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isProcessingThis}
                                onClick={() => handleDocumentAction(doc.id, "VERIFIED")}
                                className="text-green-700 border-green-200 hover:bg-green-50"
                              >
                                {isProcessingThis ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <BadgeCheck className="h-4 w-4" />
                                )}
                                Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isProcessingThis}
                                onClick={() => handleDocumentAction(doc.id, "REJECTED")}
                                className="text-red-700 border-red-200 hover:bg-red-50"
                              >
                                <BadgeX className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 py-2">No credential documents uploaded.</p>
              )}
            </CardContent>
          </Card>

          {/* Referrals */}
          {app.referrals?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary-500" />
                  Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {app.referrals.map((ref) => (
                    <div key={ref.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
                      <div className="font-medium text-neutral-900">
                        {ref.firstName} {ref.lastName}
                      </div>
                      <div className="text-neutral-500">{ref.workEmail}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Checklist + Agreements + Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Approval Checklist */}
          {canDecide && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-primary-500" />
                  Approval Checklist
                </CardTitle>
                <CardDescription>All items must pass before approval.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" aria-label="Approval prerequisites checklist">
                  {checklist.map((item) => (
                    <li key={item.key} className="flex items-start gap-2.5">
                      {item.passed ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-4.5 w-4.5 text-neutral-300 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className={cn("text-sm font-medium", item.passed ? "text-neutral-900" : "text-neutral-400")}>
                          {item.label}
                        </div>
                        {item.detail && (
                          <div className="text-xs text-neutral-500">{item.detail}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Agreements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary-500" />
                Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Payment Agreement", value: app.paymentAgreement },
                  { label: "Response Time SLA", value: app.responseTimeAgreement },
                  { label: "Minimum Client Commitment", value: app.minimumClientCommitment },
                  { label: "Terms of Service", value: app.termsOfService },
                ].map((agreement) => (
                  <li key={agreement.label} className="flex items-center gap-2">
                    {agreement.value ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-neutral-700">{agreement.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Supervisor Assignment */}
          {(canDecide || app.status === 'APPROVED') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary-500" />
                  Supervisor
                </CardTitle>
                <CardDescription>Assign a supervisor to this trainee.</CardDescription>
              </CardHeader>
              <CardContent>
                {supervisors.length > 0 ? (
                  <div className="space-y-3">
                    <Combobox
                      value={assignedSupervisorId || ""}
                      onValueChange={(value) => {
                        if (value && value !== assignedSupervisorId) {
                          void handleAssignSupervisor(value);
                        }
                      }}
                      disabled={supervisorProcessing}
                      placeholder="Search supervisors..."
                      searchPlaceholder="Type to search..."
                      emptyText="No supervisors found."
                      options={supervisors.map((sup) => ({
                        value: sup.id,
                        label: `${sup.firstName} ${sup.lastName}`,
                        description: sup.email,
                      }))}
                    />
                    {assignedSupervisorId && (
                      <p className="text-xs text-green-600">Supervisor assigned</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No users with the Supervisor role exist yet. Promote a user to Supervisor in the Users console first.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Decision Actions */}
          {canDecide && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.status === "SUBMITTED" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                    disabled={processing}
                    onClick={() => handleDecision("UNDER_REVIEW")}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                    Mark Under Review
                  </Button>
                )}
                <Button
                  className="w-full justify-start"
                  disabled={!allChecksPassed || processing}
                  onClick={() => {
                    setDecisionDialog("APPROVED");
                    setDecisionReason("");
                    setDecisionError(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Application
                </Button>
                {!allChecksPassed && (
                  <p className="text-xs text-neutral-500">
                    Complete all checklist items to enable approval.
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setDecisionDialog("REJECTED");
                    setDecisionReason("");
                    setDecisionError(null);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Reject Application
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Terminal state info */}
          {app.status === "APPROVED" && app.approvalReason && (
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800">Approval Reasoning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">{app.approvalReason}</p>
              </CardContent>
            </Card>
          )}

          {app.status === "REJECTED" && app.rejectionReason && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-800">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{app.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Decision Dialog */}
      <Dialog
        open={decisionDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDecisionDialog(null);
            setDecisionReason("");
            setDecisionError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decisionDialog === "APPROVED" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {decisionDialog === "APPROVED"
                ? `This will promote ${app.user.firstName} ${app.user.lastName} to Trainee role and make their profile visible in the directory.`
                : `This will reject ${app.user.firstName} ${app.user.lastName}'s application. They will be notified by email.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label htmlFor="decision-reason" className="block text-sm font-medium text-neutral-700">
              {decisionDialog === "APPROVED" ? "Approval reasoning (required)" : "Rejection reason (required)"}
            </label>
            <Textarea
              id="decision-reason"
              placeholder={
                decisionDialog === "APPROVED"
                  ? "Why is this application being approved? (e.g., documents verified, qualifications confirmed)"
                  : "Why is this application being rejected?"
              }
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {decisionError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{decisionError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDecisionDialog(null)}>
              Cancel
            </Button>
            {decisionDialog === "APPROVED" ? (
              <Button disabled={processing || !decisionReason.trim()} onClick={() => handleDecision("APPROVED")}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirm Approval
              </Button>
            ) : (
              <Button
                variant="destructive"
                disabled={processing || !decisionReason.trim()}
                onClick={() => handleDecision("REJECTED")}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Confirm Rejection
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
