"use client";
import React, { useState } from 'react';
import { Calendar, Clock, X, Edit, AlertTriangle, CheckCircle } from 'lucide-react';
import SessionScheduler from './SessionScheduler';

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  meetingUrl?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

interface SessionManagerProps {
  session: Session;
  onSessionUpdate: (updatedSession: Session) => void;
  userRole: 'client' | 'therapist';
}

const SessionManager: React.FC<SessionManagerProps> = ({
  session,
  onSessionUpdate,
  userRole
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sessionDate = new Date(session.scheduledAt);
  const now = new Date();
  const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  const canCancel = session.status === 'SCHEDULED' && hoursUntilSession > 24;
  const canReschedule = session.status === 'SCHEDULED' && hoursUntilSession > 24;

  const handleCancelSession = async () => {
    if (!cancellationReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: cancellationReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel session');
      }

      const data = await response.json();
      onSessionUpdate(data.session);
      setSuccess('Session cancelled successfully. You will receive a confirmation email.');
      setIsCancelling(false);
    } catch (err) {
      console.error('Error cancelling session:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel session');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSession = async (newSlot: any, newDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      const newDateTime = new Date(newSlot.datetime);

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledAt: newDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule session');
      }

      const data = await response.json();
      onSessionUpdate(data.session);
      setSuccess('Session rescheduled successfully. You will receive a confirmation email.');
      setIsRescheduling(false);
    } catch (err) {
      console.error('Error rescheduling session:', err);
      setError(err instanceof Error ? err.message : 'Failed to reschedule session');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { date, time } = formatDateTime(session.scheduledAt);

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-subtle p-6 border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Session Details</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
          session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          session.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {session.status.replace('_', ' ')}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-700">Date & Time</p>
            <p className="text-neutral-900">{date}</p>
            <p className="text-neutral-600">{time}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">Duration</p>
            <p className="text-neutral-900">{session.duration} minutes</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-700">
            {userRole === 'client' ? 'Therapist' : 'Client'}
          </p>
          <p className="text-neutral-900">
            {userRole === 'client' 
              ? `${session.therapist.firstName} ${session.therapist.lastName}`
              : `${session.client.firstName} ${session.client.lastName}`
            }
          </p>
        </div>

        {session.payment && (
          <div>
            <p className="text-sm font-medium text-neutral-700">Payment</p>
            <p className="text-neutral-900">
              {session.payment.currency} {session.payment.amount} - {session.payment.status}
            </p>
          </div>
        )}

        {session.status === 'SCHEDULED' && (
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex flex-wrap gap-3">
              {session.meetingUrl && (
                <a
                  href={session.meetingUrl}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Join Session
                </a>
              )}
              
              {canReschedule && (
                <button
                  onClick={() => setIsRescheduling(true)}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  <Edit className="h-4 w-4" />
                  <span>Reschedule</span>
                </button>
              )}
              
              {canCancel && (
                <button
                  onClick={() => setIsCancelling(true)}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {!canCancel && !canReschedule && hoursUntilSession > 0 && (
              <p className="text-sm text-neutral-500 mt-2">
                Sessions can only be cancelled or rescheduled at least 24 hours in advance.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {isCancelling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Cancel Session</h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to cancel this session? Please provide a reason:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full p-3 border border-neutral-300 rounded-lg resize-none h-24 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsCancelling(false);
                  setCancellationReason('');
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Keep Session
              </button>
              <button
                onClick={handleCancelSession}
                disabled={loading || !cancellationReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cancelling...' : 'Cancel Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rescheduling Modal */}
      {isRescheduling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Reschedule Session</h3>
              <button
                onClick={() => {
                  setIsRescheduling(false);
                  setError(null);
                }}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-neutral-600 mb-6">
              Select a new date and time for your session:
            </p>
            <SessionScheduler
              therapistId={session.therapist.id}
              onSlotSelect={handleRescheduleSession}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;