import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
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
  const { timeSlots, loading, refetch } = useTimeSlots(businessId, date, durationMinutes, staffId);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 30 seconds to keep availability current
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTimeSelect = (time: string) => {
    // Clear previous selection first
    onTimeSelect("");
    // Then set new selection
    setTimeout(() => onTimeSelect(time), 100);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>No available time slots for this date</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.is_available);
  const unavailableSlots = timeSlots.filter(slot => !slot.is_available);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Available Times</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableSlots.map((slot) => {
          const formattedTime = formatTime(slot.slot_time);
          return (
            <Button
              key={slot.slot_time}
              variant={selectedTime === formattedTime ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeSelect(formattedTime)}
              className={`${
                selectedTime === formattedTime
                  ? "bg-amber-500 hover:bg-amber-600 text-black"
                  : "border-slate-600 text-white hover:bg-slate-700"
              }`}
            >
              {formattedTime}
            </Button>
          );
        })}
      </div>
      
      {availableSlots.length === 0 && (
        <p className="text-slate-400 text-sm">No available slots for this date</p>
      )}

      {unavailableSlots.length > 0 && (
        <div>
          <h4 className="text-slate-400 font-medium mb-3 text-sm">Already Booked</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {unavailableSlots.slice(0, 8).map((slot) => (
              <Badge
                key={slot.slot_time}
                variant="secondary"
                className="bg-red-900/30 border border-red-700/50 text-red-300 justify-center py-2"
              >
                {formatTime(slot.slot_time)}
              </Badge>
            ))}
            {unavailableSlots.length > 8 && (
              <Badge variant="secondary" className="bg-red-900/30 border border-red-700/50 text-red-300 justify-center py-2">
                +{unavailableSlots.length - 8} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
