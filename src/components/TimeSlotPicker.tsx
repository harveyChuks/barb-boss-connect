
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import { useTimeSlots } from '@/hooks/useTimeSlots';

interface TimeSlotPickerProps {
  businessId: string;
  date: string;
  durationMinutes: number;
  staffId?: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const TimeSlotPicker = ({
  businessId,
  date,
  durationMinutes,
  staffId,
  selectedTime,
  onTimeSelect
}: TimeSlotPickerProps) => {
  const { timeSlots, loading } = useTimeSlots(businessId, date, durationMinutes, staffId);

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-slate-300">Loading available times...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-slate-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>No available time slots for this date</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.is_available);
  const unavailableSlots = timeSlots.filter(slot => !slot.is_available);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-white font-medium mb-3">Available Times</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map((slot) => (
            <Button
              key={slot.slot_time}
              variant={selectedTime === formatTime(slot.slot_time) ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeSelect(formatTime(slot.slot_time))}
              className={`${
                selectedTime === formatTime(slot.slot_time)
                  ? "bg-amber-500 hover:bg-amber-600 text-black"
                  : "border-slate-600 text-white hover:bg-slate-700"
              }`}
            >
              {formatTime(slot.slot_time)}
            </Button>
          ))}
        </div>
        {availableSlots.length === 0 && (
          <p className="text-slate-400 text-sm">No available slots for this date</p>
        )}
      </div>

      {unavailableSlots.length > 0 && (
        <div>
          <h4 className="text-slate-400 font-medium mb-3 text-sm">Unavailable Times</h4>
          <div className="flex flex-wrap gap-2">
            {unavailableSlots.slice(0, 6).map((slot) => (
              <Badge
                key={slot.slot_time}
                variant="secondary"
                className="bg-slate-600 text-slate-300"
              >
                {formatTime(slot.slot_time)}
              </Badge>
            ))}
            {unavailableSlots.length > 6 && (
              <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                +{unavailableSlots.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
