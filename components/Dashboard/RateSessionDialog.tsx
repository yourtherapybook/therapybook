"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";

interface RateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  therapistName: string;
  scheduledAt: string;
  onRated: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div
      className="flex gap-1"
      role="radiogroup"
      aria-label="Session rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            className="p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(Math.min(5, value + 1));
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(Math.max(1, value - 1));
              }
            }}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-neutral-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function RateSessionDialog({
  open,
  onOpenChange,
  sessionId,
  therapistName,
  scheduledAt,
  onRated,
}: RateSessionDialogProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: feedback || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit rating");
      }

      onRated();
      onOpenChange(false);
      setRating(0);
      setFeedback("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-neutral-900">
            Rate Your Session
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            How was your session with {therapistName} on{" "}
            {new Date(scheduledAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-2">
            <StarRating value={rating} onChange={setRating} />
            <span className="text-sm text-neutral-500">
              {rating === 0
                ? "Select a rating"
                : rating <= 2
                  ? "We're sorry to hear that"
                  : rating <= 4
                    ? "Thank you for your feedback"
                    : "Glad you had a great session!"}
            </span>
          </div>

          <div>
            <label
              htmlFor="session-feedback"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Additional feedback (optional)
            </label>
            <Textarea
              id="session-feedback"
              placeholder="Share any thoughts about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Skip
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
