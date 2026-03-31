"use client";
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Video, MapPin } from 'lucide-react';
import SessionScheduler from '@/components/Booking/SessionScheduler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { useAuth } from '@/hooks/useAuth';
import { Therapist } from '@/types';
import { analytics } from '@/lib/analytics';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  therapistId: string;
  datetime: string;
}

interface ProfileResponse {
  user: {
    id: string;
    emailVerified: string | null;
  };
}

interface ProviderDirectoryResponse {
  providers: Therapist[];
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const [providers, setProviders] = useState<Therapist[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sessionType, setSessionType] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [confirmedPayment, setConfirmedPayment] = useState<any>(null);

  const requestedTherapistId = searchParams?.get('therapistId') || '';
  const checkoutStatus = searchParams?.get('status');
  const checkoutSessionId = searchParams?.get('checkoutSessionId') || '';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const callbackUrl = searchParams?.toString() ? `/booking?${searchParams.toString()}` : '/booking';
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPage = async () => {
      try {
        setIsLoadingPage(true);

        const [providersResponse, profileResponse] = await Promise.all([
          fetch('/api/providers'),
          fetch('/api/users/profile'),
        ]);

        if (!providersResponse.ok || !profileResponse.ok) {
          throw new Error('Failed to load booking data');
        }

        const providersPayload: ProviderDirectoryResponse = await providersResponse.json();
        const profilePayload: ProfileResponse = await profileResponse.json();

        setProviders(providersPayload.providers || []);
        setEmailVerified(Boolean(profilePayload.user.emailVerified));

        const initialTherapistId =
          requestedTherapistId && providersPayload.providers.some((provider) => provider.id === requestedTherapistId)
            ? requestedTherapistId
            : providersPayload.providers.find((provider) => provider.availability === 'available')?.id || providersPayload.providers[0]?.id || '';

        setSelectedTherapistId(initialTherapistId);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load booking data');
      } finally {
        setIsLoadingPage(false);
      }
    };

    void loadPage();
  }, [isAuthenticated, requestedTherapistId]);

  useEffect(() => {
    if (!checkoutSessionId || checkoutStatus !== 'success') {
      return;
    }

    let isCancelled = false;
    let attempts = 0;

    const pollPayment = async () => {
      try {
        setPaymentStatus('processing');
        const response = await fetch(`/api/payments/confirm?checkoutSessionId=${encodeURIComponent(checkoutSessionId)}`);
        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const payload = await response.json();
        if (isCancelled) return;

        setConfirmedPayment(payload.payment);

        if (payload.payment.status === 'COMPLETED') {
          setPaymentStatus('completed');
          analytics.checkoutCompleted(payload.payment.session?.id || '', Number(payload.payment.amount || 0));
          return;
        }

        if (payload.payment.status === 'FAILED') {
          setPaymentStatus('failed');
          return;
        }

        attempts += 1;
        if (attempts < 8) {
          window.setTimeout(() => void pollPayment(), 2000);
        }
      } catch (pollError) {
        if (!isCancelled) {
          setPaymentStatus('failed');
          setError(pollError instanceof Error ? pollError.message : 'Failed to verify payment');
        }
      }
    };

    void pollPayment();

    return () => {
      isCancelled = true;
    };
  }, [checkoutSessionId, checkoutStatus]);

  const selectedTherapist = useMemo(
    () => providers.find((provider) => provider.id === selectedTherapistId),
    [providers, selectedTherapistId]
  );

  const handleSlotSelect = (slot: TimeSlot, date: Date) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
    setError(null);
    analytics.slotSelected(selectedTherapistId, slot.datetime);
  };

  const handleCheckout = async () => {
    if (!selectedTherapist || !selectedSlot) {
      setError('Select a provider and a time slot before continuing.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const bookingResponse = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId: selectedTherapist.id,
          scheduledAt: selectedSlot.datetime,
          duration: 50,
          sessionType,
        }),
      });

      const bookingPayload = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(bookingPayload.error || 'Failed to reserve the session');
      }

      const checkoutResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: bookingPayload.payment.id,
        }),
      });

      const checkoutPayload = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
        throw new Error(checkoutPayload.error || 'Failed to start secure checkout');
      }

      analytics.checkoutStarted(selectedTherapist!.id, selectedTherapist!.hourlyRate);
      window.location.href = checkoutPayload.checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingPage) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Book a therapy session</h1>
          <p className="text-neutral-600">Select an approved trainee therapist, choose a real published slot, and complete payment in secure checkout.</p>
        </div>

        {checkoutStatus === 'cancelled' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6 text-yellow-900">
              Checkout was cancelled. Your slot will be released if payment is not completed.
            </CardContent>
          </Card>
        )}

        {checkoutStatus === 'success' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              {paymentStatus === 'completed' && confirmedPayment?.session ? (
                <div className="space-y-3 text-blue-900">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Payment received. Your session is confirmed.
                  </div>
                  <p>
                    Session with {confirmedPayment.session.therapist.firstName} {confirmedPayment.session.therapist.lastName} on{' '}
                    {new Date(confirmedPayment.session.scheduledAt).toLocaleString()}.
                  </p>
                  <Link
                    href="/client-dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Go to My Dashboard →
                  </Link>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  We could not confirm the payment yet. Please contact support before trying again.
                </div>
              ) : (
                <div className="flex items-center gap-2 text-blue-900">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Finalizing your payment confirmation...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!emailVerified && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Verify your email before booking</CardTitle>
              <CardDescription className="text-red-800">
                Booking is blocked until your account email has been verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-800">Check your inbox for the verification link, then reload this page.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
                    if (res.ok) {
                      setError(null);
                      setError(null);
                      // Show inline success (reuse error card slot temporarily)
                      const btn = document.activeElement as HTMLButtonElement;
                      if (btn) { btn.textContent = 'Email Sent!'; btn.disabled = true; }
                    } else {
                      const data = await res.json();
                      setError(data.error || 'Failed to resend');
                    }
                  } catch {
                    setError('Failed to resend verification email');
                  }
                }}
              >
                Resend Verification Email
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              {error}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,0.9fr] gap-8">
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle>Select provider and slot</CardTitle>
              <CardDescription>Only slots published through the trainee dashboard are shown here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Provider</label>
                <Combobox
                  value={selectedTherapistId}
                  onValueChange={(value) => {
                    setSelectedTherapistId(value);
                    setSelectedSlot(undefined);
                    setSelectedDate(undefined);
                  }}
                  placeholder="Search for a therapist..."
                  searchPlaceholder="Type to search therapists..."
                  emptyText="No matching therapists found."
                  options={providers.map((provider) => ({
                    value: provider.id,
                    label: provider.name,
                    description: provider.availability === 'offline' ? 'Availability coming soon' : provider.specializations?.slice(0, 2).join(', ') || 'Available',
                  }))}
                />
              </div>

              {/* Session type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Session Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionType('ONLINE')}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      sessionType === 'ONLINE'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Video className={`h-5 w-5 ${sessionType === 'ONLINE' ? 'text-primary-600' : 'text-neutral-400'}`} />
                    <div>
                      <div className={`text-sm font-medium ${sessionType === 'ONLINE' ? 'text-primary-700' : 'text-neutral-900'}`}>Online</div>
                      <div className="text-xs text-neutral-500">Video session</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('IN_PERSON')}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      sessionType === 'IN_PERSON'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <MapPin className={`h-5 w-5 ${sessionType === 'IN_PERSON' ? 'text-primary-600' : 'text-neutral-400'}`} />
                    <div>
                      <div className={`text-sm font-medium ${sessionType === 'IN_PERSON' ? 'text-primary-700' : 'text-neutral-900'}`}>In Person</div>
                      <div className="text-xs text-neutral-500">At practice location</div>
                    </div>
                  </button>
                </div>
              </div>

              {selectedTherapist ? (
                <SessionScheduler
                  therapistId={selectedTherapist.id}
                  selectedSlot={selectedSlot}
                  selectedDate={selectedDate}
                  onSlotSelect={handleSlotSelect}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
                  Select a provider to load available time slots.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Therapist mini-card */}
            {selectedTherapist && (
              <Card className="border-neutral-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {selectedTherapist.image ? (
                      <img src={selectedTherapist.image} alt={selectedTherapist.name} className="h-12 w-12 rounded-lg object-cover border border-neutral-200" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                        {selectedTherapist.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 truncate">{selectedTherapist.name}</div>
                      <div className="text-xs text-neutral-500 truncate">{selectedTherapist.credentials}</div>
                      {selectedTherapist.specializations?.length > 0 && (
                        <div className="text-xs text-primary-600 mt-0.5 truncate">{selectedTherapist.specializations.slice(0, 2).join(', ')}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle>Booking summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-700">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Session time</span>
                  <span className="font-medium text-neutral-900">
                    {selectedSlot ? new Date(selectedSlot.datetime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Select a slot'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Duration</span>
                  <span className="font-medium text-neutral-900">50 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Type</span>
                  <span className="font-medium text-neutral-900 flex items-center gap-1.5">
                    {sessionType === 'ONLINE' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    {sessionType === 'ONLINE' ? 'Online Video' : 'In Person'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-3">
                  <span className="font-medium text-neutral-900">Total</span>
                  <span className="font-bold text-neutral-900">
                    EUR {selectedTherapist ? selectedTherapist.hourlyRate.toFixed(2) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
                  <ShieldCheck className="h-5 w-5 text-primary-500 mt-0.5" />
                  <div className="text-sm text-neutral-700">
                    Payment is completed in Stripe Checkout. TherapyBook confirms the booking only after the payment webhook marks it complete.
                  </div>
                </div>

                <Button
                  variant="therapybook"
                  size="lg"
                  className="w-full"
                  disabled={!emailVerified || !selectedTherapist || !selectedSlot || isSubmitting}
                  onClick={handleCheckout}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    'Continue to secure checkout'
                  )}
                </Button>

                <p className="text-xs text-neutral-500 text-center">
                  By continuing, you agree to TherapyBook&apos;s booking and cancellation policy.
                </p>
              </CardContent>
            </Card>

            <Link href="/directory" className="block text-center text-sm text-primary-600 hover:text-primary-700">
              Back to directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
