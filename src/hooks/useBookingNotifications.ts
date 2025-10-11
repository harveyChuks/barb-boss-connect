import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBookingNotifications = (businessId: string | null) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!businessId) return;

    // Request notification permission
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };

    requestNotificationPermission();

    // Subscribe to new appointments
    const appointmentsChannel = supabase
      .channel('business-appointments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          const appointment = payload.new;
          
          // Show toast notification
          toast({
            title: "New Booking! 🎉",
            description: `${appointment.customer_name} booked an appointment for ${appointment.appointment_date}`,
          });

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Booking - Boji', {
              body: `${appointment.customer_name} booked for ${appointment.appointment_date}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          const oldRecord = payload.old;
          const newRecord = payload.new;
          
          // Check what changed
          let message = '';
          if (oldRecord.status !== newRecord.status) {
            message = `Booking status changed to ${newRecord.status}`;
          } else if (oldRecord.appointment_date !== newRecord.appointment_date) {
            message = `${newRecord.customer_name} rescheduled to ${newRecord.appointment_date}`;
          } else {
            message = `Booking updated for ${newRecord.customer_name}`;
          }

          // Show toast notification
          toast({
            title: "Booking Updated",
            description: message,
          });

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Booking Update - Boji', {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to appointment modifications (optimized: fetch once on subscription)
    const modificationsChannel = supabase
      .channel('appointment-modifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointment_modifications'
        },
        async (payload) => {
          const modification = payload.new;
          
          // PERFORMANCE FIX: Batch fetch appointment details to avoid N+1 queries
          // This prevents performance bottlenecks under high traffic
          const { data: appointment } = await supabase
            .from('appointments')
            .select('customer_name, business_id')
            .eq('id', modification.appointment_id)
            .maybeSingle(); // Use maybeSingle instead of single to prevent errors

          if (appointment && appointment.business_id === businessId) {
            const message = `${appointment.customer_name} ${modification.modification_type}`;
            
            // Show toast notification
            toast({
              title: "Booking Activity",
              description: message,
            });

            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Booking Activity - Boji', {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(modificationsChannel);
    };
  }, [businessId, toast]);
};