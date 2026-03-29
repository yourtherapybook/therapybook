"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  therapistId: string;
  datetime: string;
}

interface SessionSchedulerProps {
  therapistId: string;
  onSlotSelect: (slot: TimeSlot, date: Date) => void;
  selectedSlot?: TimeSlot;
  selectedDate?: Date;
}

interface DateAvailability {
  date: Date;
  dateStr: string;
  label: string;
  shortDate: string;
  slotCount: number;
  loading: boolean;
}

function generateDateRange(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
}

function getDateLabel(date: Date): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const SessionScheduler: React.FC<SessionSchedulerProps> = ({
  therapistId,
  onSlotSelect,
  selectedSlot,
  selectedDate,
}) => {
  const dates = useMemo(() => generateDateRange(), []);
  const [dateAvailability, setDateAvailability] = useState<Map<string, number>>(new Map());
  const [availabilityScanDone, setAvailabilityScanDone] = useState(false);
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(selectedDate || null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-scan: fetch slot counts for all 14 dates on mount
  useEffect(() => {
    let cancelled = false;

    const scanAvailability = async () => {
      const counts = new Map<string, number>();

      // Fetch slots for each date in parallel (batched in groups of 4 to avoid hammering)
      for (let i = 0; i < dates.length; i += 4) {
        const batch = dates.slice(i, i + 4);
        const results = await Promise.allSettled(
          batch.map(async (date) => {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            const res = await fetch(
              `/api/therapists/${therapistId}/slots?startDate=${start.toISOString()}&endDate=${end.toISOString()}&duration=50`
            );
            if (!res.ok) return { dateStr: date.toDateString(), count: 0 };
            const data = await res.json();
            const available = (data.slots || []).filter((s: TimeSlot) => s.available);
            return { dateStr: date.toDateString(), count: available.length };
          })
        );

        if (cancelled) return;

        for (const result of results) {
          if (result.status === "fulfilled") {
            counts.set(result.value.dateStr, result.value.count);
          }
        }

        setDateAvailability(new Map(counts));
      }

      if (!cancelled) {
        setAvailabilityScanDone(true);

        // Auto-select first date with availability
        const firstAvailable = dates.find((d) => (counts.get(d.toDateString()) || 0) > 0);
        if (firstAvailable && !selectedDate) {
          setSelectedDateState(firstAvailable);
        }
      }
    };

    void scanAvailability();
    return () => { cancelled = true; };
  }, [therapistId, dates, selectedDate]);

  // Fetch full slots for selected date
  const fetchSlots = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const res = await fetch(
        `/api/therapists/${therapistId}/slots?startDate=${start.toISOString()}&endDate=${end.toISOString()}&duration=50`
      );
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch {
      setError("Failed to load time slots");
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    if (selectedDateState) {
      void fetchSlots(selectedDateState);
    }
  }, [selectedDateState, fetchSlots]);

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available && selectedDateState) {
      onSlotSelect(slot, selectedDateState);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-neutral-900">Schedule Your Session</h3>
      </div>

      {/* Date grid with availability indicators */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Select Date</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {dates.map((date) => {
            const dateStr = date.toDateString();
            const slotCount = dateAvailability.get(dateStr);
            const isSelected = selectedDateState?.toDateString() === dateStr;
            const hasSlots = slotCount !== undefined && slotCount > 0;
            const isEmpty = slotCount !== undefined && slotCount === 0;
            const isScanning = slotCount === undefined;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateState(date)}
                disabled={isEmpty && availabilityScanDone}
                className={cn(
                  "p-2.5 rounded-lg border-2 transition-all text-center",
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : hasSlots
                      ? "border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50"
                      : isEmpty
                        ? "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-200"
                )}
              >
                <div className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-primary-700" : isEmpty ? "text-neutral-300" : "text-neutral-900"
                )}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className={cn(
                  "text-lg font-bold leading-tight",
                  isSelected ? "text-primary-700" : isEmpty ? "text-neutral-300" : "text-neutral-900"
                )}>
                  {date.getDate()}
                </div>
                <div className={cn(
                  "text-xs",
                  isSelected ? "text-primary-600" : isEmpty ? "text-neutral-300" : "text-neutral-500"
                )}>
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </div>
                {/* Availability dot */}
                <div className="mt-1 flex justify-center">
                  {isScanning ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-200 animate-pulse" />
                  ) : hasSlots ? (
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDateState && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            Available Times — {getDateLabel(selectedDateState)}
          </h4>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => void fetchSlots(selectedDateState)}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading times...
            </div>
          ) : availableSlots.filter((s) => s.available).length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableSlots
                .filter((s) => s.available)
                .map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={cn(
                      "py-2.5 px-3 rounded-lg border-2 transition-all text-sm font-medium",
                      selectedSlot?.id === slot.id
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-900"
                    )}
                  >
                    <Clock className="h-3 w-3 mx-auto mb-0.5" />
                    {slot.time}
                  </button>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500 rounded-lg border border-dashed border-neutral-200">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm">No available slots on this date</p>
              <p className="text-xs text-neutral-400 mt-1">Try another date with a green indicator</p>
            </div>
          )}
        </div>
      )}

      {/* Selected summary */}
      {selectedSlot && selectedDateState && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-sm font-medium text-green-900">
            <Clock className="h-4 w-4" />
            {getDateLabel(selectedDateState)} at {selectedSlot.time} — 50 min session
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionScheduler;
