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
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for cache busting

  // SUPER VISIBLE DEBUG - Check exact data structure and UI logic
  console.warn('🚨 TIMESLOTPICKER RENDERING 🚨');
  console.warn('🔍 FULL SLOT DATA:', timeSlots);
  console.warn('🔍 TIME SLOTS LENGTH:', timeSlots.length);
  
  if (timeSlots.length > 0) {
    // Safe logging without forEach to avoid scoping issues
    console.warn('🕐 FIRST FEW SLOTS:', {
      slot1: timeSlots[0],
      slot2: timeSlots[1], 
      slot3: timeSlots[2],
      bookedSlots: timeSlots.filter(slot => !slot.is_available),
      availableSlots: timeSlots.filter(slot => slot.is_available),
      bookedCount: timeSlots.filter(slot => !slot.is_available).length
    });
  } else {
    console.warn('🚨 NO TIME SLOTS TO RENDER');
  }

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
    setRefreshKey(prev => prev + 1); // Force component refresh
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
    <div className="space-y-6" key={`timeslots-${refreshKey}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Select Your Time</h4>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
          <span className="text-slate-300">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500 border border-amber-600"></div>
          <span className="text-slate-300">Selected</span>
        </div>
      </div>
      
      {/* All Time Slots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {timeSlots.map((slot) => {
          const formattedTime = formatTime(slot.slot_time);
          const isAvailable = slot.is_available;
          const isSelected = selectedTime === formattedTime;
          
          if (!isAvailable) {
            // Booked slots - display as red to match legend
            return (
              <div
                key={slot.slot_time}
                className="relative h-12 border-2 border-red-500 bg-red-500/30 rounded-md flex items-center justify-center cursor-not-allowed shadow-sm"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-red-100">{formattedTime}</span>
                  <span className="text-xs text-red-200 font-medium">Booked</span>
                </div>
              </div>
            );
          }
          
          return (
            <Button
              key={slot.slot_time}
              variant="outline"
              size="sm"
              onClick={() => handleTimeSelect(formattedTime)}
              className={`relative h-12 transition-all duration-200 ${
                isSelected
                  ? "bg-amber-500 hover:bg-amber-600 text-black border-amber-600 shadow-lg scale-105"
                  : "border-green-500/30 bg-green-500/10 text-white hover:bg-green-500/20 hover:border-green-500/50 hover:scale-102"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">{formattedTime}</span>
                <span className="text-xs opacity-75">
                  {isSelected ? "Selected" : "Available"}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
      
      {availableSlots.length === 0 && (
        <div className="text-center py-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-400 font-medium">No available slots for this date</p>
            <p className="text-slate-500 text-sm mt-1">All time slots are currently booked</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{availableSlots.length}</div>
            <div className="text-slate-300">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{unavailableSlots.length}</div>
            <div className="text-slate-300">Booked</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;
