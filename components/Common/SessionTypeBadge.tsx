"use client";

import { Video, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SessionTypeBadgeProps {
  type: string;
  location?: string | null;
  showLabel?: boolean;
}

export function SessionTypeBadge({ type, location, showLabel = true }: SessionTypeBadgeProps) {
  const isOnline = type === 'ONLINE';

  return (
    <Badge
      variant="outline"
      className={isOnline
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-purple-50 text-purple-700 border-purple-200"
      }
      title={!isOnline && location ? location : undefined}
    >
      {isOnline ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
      {showLabel && (isOnline ? 'Online' : 'In Person')}
    </Badge>
  );
}

export function SessionLocationInfo({ type, location }: { type: string; location?: string | null }) {
  if (type !== 'IN_PERSON' || !location) return null;

  return (
    <div className="flex items-start gap-1.5 text-xs text-neutral-500 mt-1">
      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <span>{location}</span>
    </div>
  );
}
