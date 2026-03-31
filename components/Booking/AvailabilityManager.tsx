"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Save, Trash2, AlertCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface UnavailableSlot {
  id: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

interface AvailabilityManagerProps {
  therapistId: string;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ therapistId }) => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newUnavailableSlot, setNewUnavailableSlot] = useState({
    startDateTime: '',
    endDateTime: '',
    reason: '',
  });

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    fetchAvailability();
  }, [therapistId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/therapists/${therapistId}/availability`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setAvailability(data.availability || []);
      setUnavailableSlots(data.unavailableSlots || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addAvailability = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/therapists/${therapistId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'availability',
          ...newAvailability,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add availability' }));
        throw new Error(errorData.error || 'Failed to add availability');
      }

      const data = await response.json();
      setAvailability([...availability, data.availability]);
      setNewAvailability({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      });
      setSuccess('Availability added successfully');
    } catch (err) {
      console.error('Error adding availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to add availability');
    } finally {
      setSaving(false);
    }
  };

  const addUnavailableSlot = async () => {
    if (!newUnavailableSlot.startDateTime || !newUnavailableSlot.endDateTime) {
      setError('Please provide both start and end date/time');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/therapists/${therapistId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unavailable',
          ...newUnavailableSlot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add unavailable slot' }));
        throw new Error(errorData.error || 'Failed to add unavailable slot');
      }

      const data = await response.json();
      setUnavailableSlots([...unavailableSlots, data.unavailableSlot]);
      setNewUnavailableSlot({
        startDateTime: '',
        endDateTime: '',
        reason: '',
      });
      setSuccess('Unavailable slot added successfully');
    } catch (err) {
      console.error('Error adding unavailable slot:', err);
      setError(err instanceof Error ? err.message : 'Failed to add unavailable slot');
    } finally {
      setSaving(false);
    }
  };

  const deleteAvailability = async (availabilityId: string) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/therapists/${therapistId}/availability`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availabilityId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Operation failed" }));
        throw new Error(errorData.error || 'Failed to delete availability');
      }

      setAvailability(availability.filter(a => a.id !== availabilityId));
      setSuccess('Availability deleted successfully');
    } catch (err) {
      console.error('Error deleting availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete availability');
    } finally {
      setSaving(false);
    }
  };

  const deleteUnavailableSlot = async (slotId: string) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/therapists/${therapistId}/availability`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unavailableSlotId: slotId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Operation failed" }));
        throw new Error(errorData.error || 'Failed to delete unavailable slot');
      }

      setUnavailableSlots(unavailableSlots.filter(s => s.id !== slotId));
      setSuccess('Unavailable slot deleted successfully');
    } catch (err) {
      console.error('Error deleting unavailable slot:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete unavailable slot');
    } finally {
      setSaving(false);
    }
  };

  const startEditAvailability = (avail: Availability) => {
    setEditingId(avail.id);
    setNewAvailability({
      dayOfWeek: avail.dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime,
      isActive: avail.isActive,
    });
  };

  const updateAvailability = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/therapists/${therapistId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityId: editingId, ...newAvailability }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Operation failed" }));
        throw new Error(errorData.error || 'Failed to update');
      }
      const data = await response.json();
      setAvailability(availability.map((a) => (a.id === editingId ? data.availability : a)));
      setSuccess('Availability updated');
      setEditingId(null);
      setNewAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-subtle p-6 border border-neutral-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Regular Availability */}
      <div className="bg-white rounded-xl shadow-subtle p-6 border border-neutral-100">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Weekly Availability</h3>
        </div>

        {/* Visual Week Calendar */}
        <div className="mb-6">
          {availability.length === 0 ? (
            <p className="text-neutral-500 text-center py-4">No availability set. Add your first slot below.</p>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((day, dayIndex) => {
                const daySlots = availability.filter((a) => a.dayOfWeek === dayIndex);
                return (
                  <div key={dayIndex} className="text-center">
                    <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase">{day.slice(0, 3)}</div>
                    <div className="min-h-[60px] space-y-1">
                      {daySlots.length > 0 ? daySlots.map((avail) => (
                        <button
                          key={avail.id}
                          onClick={() => startEditAvailability(avail)}
                          className={`w-full rounded-md px-1 py-1.5 text-xs font-medium transition-colors ${
                            editingId === avail.id
                              ? 'bg-primary-500 text-white'
                              : avail.isActive
                                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                                : 'bg-neutral-100 text-neutral-400'
                          }`}
                          title={`${avail.startTime} - ${avail.endTime} (click to edit)`}
                        >
                          <div>{avail.startTime}</div>
                          <div>{avail.endTime}</div>
                        </button>
                      )) : (
                        <div className="h-[60px] rounded-md border border-dashed border-neutral-200" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Availability */}
        <div className="border-t border-neutral-200 pt-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">{editingId ? 'Edit Availability' : 'Add New Availability'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={String(newAvailability.dayOfWeek)}
              onValueChange={(value) => setNewAvailability({ ...newAvailability, dayOfWeek: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day, index) => (
                  <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={newAvailability.startTime}
              onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
            />
            <Input
              type="time"
              value={newAvailability.endTime}
              onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
            />
            <div className="flex gap-2">
              <Button
                onClick={editingId ? updateAvailability : addAvailability}
                disabled={saving}
                className="flex-1"
              >
                {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? 'Save' : 'Add'}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setNewAvailability({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true });
                  }}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unavailable Slots */}
      <div className="bg-white rounded-xl shadow-subtle p-6 border border-neutral-100">
        <div className="flex items-center space-x-2 mb-6">
          <X className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Unavailable Periods</h3>
        </div>

        {/* Current Unavailable Slots */}
        <div className="space-y-3 mb-6">
          {unavailableSlots.length === 0 ? (
            <p className="text-neutral-500 text-center py-4">No unavailable periods set.</p>
          ) : (
            unavailableSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="font-medium text-neutral-900">
                    {formatDateTime(slot.startDateTime)} - {formatDateTime(slot.endDateTime)}
                  </div>
                  {slot.reason && (
                    <div className="text-sm text-neutral-600 mt-1">{slot.reason}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteUnavailableSlot(slot.id)}
                  disabled={saving}
                  className="text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Unavailable Slot */}
        <div className="border-t border-neutral-200 pt-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Add Unavailable Period</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newUnavailableSlot.startDateTime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setNewUnavailableSlot({ ...newUnavailableSlot, startDateTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newUnavailableSlot.endDateTime}
                  min={newUnavailableSlot.startDateTime || new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setNewUnavailableSlot({ ...newUnavailableSlot, endDateTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reason (Optional)</Label>
              <Input
                type="text"
                value={newUnavailableSlot.reason}
                onChange={(e) => setNewUnavailableSlot({ ...newUnavailableSlot, reason: e.target.value })}
                placeholder="e.g., Vacation, Conference, Personal"
              />
            </div>
            <Button
              variant="destructive"
              onClick={addUnavailableSlot}
              disabled={saving || !newUnavailableSlot.startDateTime || !newUnavailableSlot.endDateTime}
            >
              <Plus className="h-4 w-4" />
              Add Unavailable Period
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;