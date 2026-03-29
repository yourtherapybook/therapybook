"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Globe,
  Clock3,
  Users,
  CalendarClock,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProviderDetail {
  id: string;
  name: string;
  credentials: string;
  image: string;
  institutionOfStudy: string;
  skillsAcquired: string[];
  specialties: string[];
  treatmentOrientation: string[];
  modality: string[];
  ageGroups: string[];
  languages: string[];
  ethnicitiesServed: string[];
  bio: string;
  hourlyRate: number;
  availability: string;
  completedSessions: number;
  averageRating: number | null;
  ratingCount: number;
  memberSince: string;
  approvedAt: string | null;
  supervisor: string | null;
  schedule: { day: string; start: string; end: string }[];
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = typeof params?.id === "string" ? params.id : null;

  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/providers/${providerId}`);
      if (res.status === 404) {
        router.push("/directory");
        return;
      }
      if (!res.ok) throw new Error("Failed to load provider");
      const data = await res.json();
      setProvider(data.provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [providerId, router]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-neutral-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3 text-red-800">
              <AlertCircle className="h-5 w-5" /> {error || "Provider not found"}
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => router.push("/directory")}>
                Back to Directory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAvailable = provider.availability === "available";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/directory"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
        </Link>

        {/* Profile header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {provider.image ? (
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="h-24 w-24 rounded-xl object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                    {provider.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">{provider.name}</h1>
                  <p className="text-sm text-neutral-600">{provider.credentials}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge
                    variant="outline"
                    className={isAvailable
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }
                  >
                    {isAvailable ? "Accepting bookings" : "Not currently available"}
                  </Badge>
                  {provider.averageRating !== null && (
                    <span className="flex items-center gap-1 text-neutral-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {provider.averageRating} ({provider.ratingCount} review{provider.ratingCount !== 1 ? "s" : ""})
                    </span>
                  )}
                  {provider.completedSessions > 0 && (
                    <span className="text-neutral-500">
                      {provider.completedSessions} session{provider.completedSessions !== 1 ? "s" : ""} completed
                    </span>
                  )}
                  {provider.supervisor && (
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Shield className="h-3.5 w-3.5" />
                      Supervised by {provider.supervisor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild disabled={!isAvailable}>
                    <Link href={`/booking?therapistId=${provider.id}`}>
                      <CalendarClock className="h-4 w-4" />
                      {isAvailable ? "Book a Session" : "Currently Unavailable"}
                    </Link>
                  </Button>
                  <div className="text-sm text-neutral-500 flex items-center">
                    EUR {provider.hourlyRate.toFixed(2)} / session
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: About + Details (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {provider.bio && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{provider.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {provider.specialties.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((s) => (
                      <Badge key={s} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Approach */}
            {(provider.treatmentOrientation.length > 0 || provider.modality.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Approach</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.treatmentOrientation.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1.5">Treatment Orientation</div>
                      <div className="flex flex-wrap gap-2">
                        {provider.treatmentOrientation.map((t) => (
                          <Badge key={t} variant="outline">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {provider.modality.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-1.5">Modality</div>
                      <div className="flex flex-wrap gap-2">
                        {provider.modality.map((m) => (
                          <Badge key={m} variant="outline">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: Details (1/3) */}
          <div className="space-y-6">
            {/* Training */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4 text-primary-500" />
                  Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {provider.institutionOfStudy && (
                  <div>
                    <div className="text-neutral-500 font-medium">Institution</div>
                    <div className="text-neutral-900">{provider.institutionOfStudy}</div>
                  </div>
                )}
                {provider.skillsAcquired.length > 0 && (
                  <div>
                    <div className="text-neutral-500 font-medium">Skills</div>
                    <div className="text-neutral-900">{provider.skillsAcquired.join(", ")}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Languages & Demographics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4 text-primary-500" />
                  Languages & Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {provider.languages.length > 0 && (
                  <div>
                    <div className="text-neutral-500 font-medium">Languages</div>
                    <div className="text-neutral-900">{provider.languages.join(", ")}</div>
                  </div>
                )}
                {provider.ageGroups.length > 0 && (
                  <div>
                    <div className="text-neutral-500 font-medium">Age Groups</div>
                    <div className="text-neutral-900">{provider.ageGroups.join(", ")}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            {provider.schedule.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock3 className="h-4 w-4 text-primary-500" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 text-sm">
                    {provider.schedule.map((slot, i) => (
                      <div key={i} className="flex justify-between text-neutral-700">
                        <span className="font-medium">{slot.day}</span>
                        <span className="text-neutral-500">{slot.start} – {slot.end}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust */}
            <Card className="bg-neutral-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div className="text-neutral-600">
                    This profile has been reviewed and approved by TherapyBook.
                    {provider.supervisor && (
                      <> Sessions are supervised by {provider.supervisor}.</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
