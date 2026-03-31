"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TemplateEntry {
  key: string;
  label: string;
  subject: string;
  category: string;
}

const TEMPLATES: TemplateEntry[] = [
  // Auth
  { key: "VERIFY_EMAIL", label: "Verify Email", subject: "Verify your TherapyBook account", category: "Auth" },
  { key: "PASSWORD_RESET", label: "Password Reset", subject: "Reset your TherapyBook password", category: "Auth" },
  // Applications
  { key: "APPLICATION_RECEIVED", label: "Application Received", subject: "Application Received — TherapyBook", category: "Applications" },
  { key: "APPLICATION_UNDER_REVIEW", label: "Application Under Review", subject: "Application Under Review — TherapyBook", category: "Applications" },
  { key: "APPLICATION_APPROVED", label: "Application Approved", subject: "Welcome to TherapyBook — Application Approved!", category: "Applications" },
  { key: "APPLICATION_REJECTED", label: "Application Rejected", subject: "TherapyBook Application Update", category: "Applications" },
  // Sessions
  { key: "BOOKING_CONFIRMED", label: "Booking Confirmed (Client)", subject: "Session Confirmed — TherapyBook", category: "Sessions" },
  { key: "SESSION_BOOKED_THERAPIST", label: "New Booking (Therapist)", subject: "New Session Booked — TherapyBook", category: "Sessions" },
  { key: "SESSION_CANCELLED", label: "Session Cancelled", subject: "Session Cancelled — TherapyBook", category: "Sessions" },
  { key: "SESSION_RESCHEDULED", label: "Session Rescheduled", subject: "Session Rescheduled — TherapyBook", category: "Sessions" },
  { key: "SESSION_REMINDER", label: "Session Reminder", subject: "Session Reminder — 24h until your appointment", category: "Sessions" },
  // Admin
  { key: "ADMIN_NEW_APPLICATION", label: "New Application (Admin)", subject: "New Trainee Application — TherapyBook", category: "Admin" },
];

const CATEGORIES = ["All", "Auth", "Applications", "Sessions", "Admin"];

const categoryBadgeClass: Record<string, string> = {
  Auth: "bg-blue-50 text-blue-700 border-blue-200",
  Applications: "bg-amber-50 text-amber-700 border-amber-200",
  Sessions: "bg-green-50 text-green-700 border-green-200",
  Admin: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminEmailTemplates() {
  const [selected, setSelected] = useState<TemplateEntry>(TEMPLATES[0]);
  const [mode, setMode] = useState<"html" | "text">("html");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const visible = categoryFilter === "All"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === categoryFilter);

  const previewUrl = `/api/admin/emails/preview?key=${selected.key}&mode=${mode}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Email Templates</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Preview all transactional email templates sent by TherapyBook.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            variant={categoryFilter === c ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Template list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700">
              {visible.length} template{visible.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-neutral-100">
              {visible.map((t) => (
                <li key={t.key}>
                  <button
                    onClick={() => setSelected(t)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-neutral-50 ${
                      selected.key === t.key ? "bg-orange-50 border-l-2 border-orange-400" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-neutral-900 truncate">
                        {t.label}
                      </span>
                      <Badge variant="outline" className={`shrink-0 text-xs ${categoryBadgeClass[t.category] ?? ""}`}>
                        {t.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{t.subject}</p>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Preview panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                {selected.label}
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-1 truncate">
                <span className="font-medium text-neutral-600">Subject:</span> {selected.subject}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant={mode === "html" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("html")}
              >
                HTML
              </Button>
              <Button
                variant={mode === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("text")}
              >
                Plain text
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {mode === "html" ? (
              <iframe
                key={previewUrl}
                src={previewUrl}
                className="w-full border-0 rounded-b-lg"
                style={{ height: 600 }}
                title={`Preview: ${selected.label}`}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="p-4 rounded-b-lg bg-neutral-50">
                <iframe
                  key={previewUrl}
                  src={previewUrl}
                  className="w-full border-0 font-mono text-sm"
                  style={{ height: 300 }}
                  title={`Plain text: ${selected.label}`}
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
