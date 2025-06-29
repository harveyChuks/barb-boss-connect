
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

export const useTimeSlots = (businessId: string, date: string, durationMinutes: number, staffId?: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTimeSlots = async () => {
    if (!businessId || !date || !durationMinutes) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_available_time_slots', {
        p_business_id: businessId,
        p_date: date,
        p_duration_minutes: durationMinutes,
        p_staff_id: staffId || null
      });

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error: any) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [businessId, date, durationMinutes, staffId]);

  const checkConflict = async (
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_appointment_conflict', {
        p_business_id: businessId,
        p_appointment_date: appointmentDate,
        p_start_time: startTime,
        p_end_time: endTime,
        p_staff_id: staffId || null,
        p_exclude_appointment_id: excludeAppointmentId || null
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking appointment conflict:', error);
      return true; // Return true to prevent booking if there's an error
    }
  };

  return {
    timeSlots,
    loading,
    refetch: fetchTimeSlots,
    checkConflict
  };
};
