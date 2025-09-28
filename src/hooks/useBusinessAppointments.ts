import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AppointmentData {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_name: string;
  services: {
    name: string;
  };
}

export const useBusinessAppointments = (businessId: string, dateRange?: { start: Date; end: Date }) => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          customer_name,
          services:services!inner(name)
        `)
        .eq('business_id', businessId)
        .not('status', 'in', '("cancelled","no_show")');

      if (dateRange) {
        query = query
          .gte('appointment_date', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('appointment_date', format(dateRange.end, 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('appointment_date').order('start_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [businessId, dateRange?.start, dateRange?.end]);

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const hasAppointmentsOnDate = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  return {
    appointments,
    loading,
    refetch: fetchAppointments,
    getAppointmentsForDate,
    hasAppointmentsOnDate
  };
};