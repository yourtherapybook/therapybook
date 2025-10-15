import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';

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

const SessionScheduler: React.FC<SessionSchedulerProps> = ({
  therapistId,
  onSlotSelect,
  selectedSlot,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(selectedDate || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 days for booking
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) { // Start from tomorrow
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateDateRange();

  // Fetch available slots from API
  const fetchAvailableSlots = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const response = await fetch(
        `/api/therapists/${therapistId}/slots?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&duration=50`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available time slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDateState) {
      fetchAvailableSlots(selectedDateState);
    }
  }, [selectedDateState, therapistId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDateState(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available && selectedDateState) {
      onSlotSelect(slot, selectedDateState);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return formatDate(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-subtle p-6 border border-neutral-100">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-5 w-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-neutral-900">Schedule Your Session</h3>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Select Date</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {availableDates.map((date, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                selectedDateState?.toDateString() === date.toDateString()
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <div className="font-medium">{getDateLabel(date)}</div>
              <div className="text-xs text-neutral-500 mt-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDateState && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Available Times - {formatDate(selectedDateState)}
          </h4>
          
          {error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-red-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium">Error loading time slots</p>
                <p className="text-sm text-neutral-500 mt-1">{error}</p>
                <button
                  onClick={() => selectedDateState && fetchAvailableSlots(selectedDateState)}
                  className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                    selectedSlot?.id === slot.id
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : slot.available
                      ? 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                      : 'border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Clock className="h-3 w-3 mx-auto mb-1" />
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          {availableSlots.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-neutral-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No available slots for this date</p>
              <p className="text-sm">Please select another date</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && selectedDateState && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              Session scheduled for {formatDate(selectedDateState)} at {selectedSlot.time}
            </span>
          </div>
          <p className="text-xs text-primary-700 mt-1">
            50-minute video session • Confirmation will be sent via email
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionScheduler;