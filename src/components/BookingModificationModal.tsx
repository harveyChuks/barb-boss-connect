import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TimeSlotPicker from './TimeSlotPicker';

interface BookingModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onModificationComplete: () => void;
}

export const BookingModificationModal: React.FC<BookingModificationModalProps> = ({
  open,
  onOpenChange,
  appointment,
  onModificationComplete
}) => {
  const [modificationType, setModificationType] = useState<'reschedule' | 'cancel'>('reschedule');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modificationType === 'cancel') {
        // Cancel appointment
        const { error: cancelError } = await supabase
          .from('appointments')
          .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
          })
          .eq('id', appointment.id);

        if (cancelError) throw cancelError;

        // Log the modification
        await supabase
          .from('booking_modifications')
          .insert({
            appointment_id: appointment.id,
            modification_type: 'cancel',
            reason,
            old_date: appointment.appointment_date,
            old_start_time: appointment.start_time,
            old_end_time: appointment.end_time
          });

        toast({
          title: "Appointment Cancelled",
          description: "Your appointment has been cancelled successfully.",
        });
      } else {
        // Reschedule appointment
        if (!newDate || !newTime) {
          throw new Error("Please select a new date and time");
        }

        const convertTimeToPostgresFormat = (timeString: string) => {
          const [time, period] = timeString.split(' ');
          let [hours, minutes] = time.split(':');
          
          if (period === 'PM' && hours !== '12') {
            hours = String(parseInt(hours) + 12);
          } else if (period === 'AM' && hours === '12') {
            hours = '00';
          }
          
          return `${hours.padStart(2, '0')}:${minutes}:00`;
        };

        const calculateEndTime = (startTime: string, durationMinutes: number) => {
          const [hours, minutes] = startTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + durationMinutes;
          const endHours = Math.floor(totalMinutes / 60);
          const endMinutes = totalMinutes % 60;
          
          return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
        };

        const newStartTime = convertTimeToPostgresFormat(newTime);
        const newEndTime = calculateEndTime(newStartTime, appointment.service?.duration_minutes || 60);

        // Update appointment
        const { error: rescheduleError } = await supabase
          .from('appointments')
          .update({
            appointment_date: newDate,
            start_time: newStartTime,
            end_time: newEndTime,
            status: 'pending' // Reset to pending after reschedule
          })
          .eq('id', appointment.id);

        if (rescheduleError) throw rescheduleError;

        // Log the modification
        await supabase
          .from('booking_modifications')
          .insert({
            appointment_id: appointment.id,
            modification_type: 'reschedule',
            reason,
            old_date: appointment.appointment_date,
            old_start_time: appointment.start_time,
            old_end_time: appointment.end_time,
            new_date: newDate,
            new_start_time: newStartTime,
            new_end_time: newEndTime
          });

        toast({
          title: "Appointment Rescheduled",
          description: `Your appointment has been moved to ${newDate} at ${newTime}`,
        });
      }

      onOpenChange(false);
      onModificationComplete();
    } catch (error: any) {
      console.error('Error modifying appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to modify appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modify Appointment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Reschedule or cancel your appointment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Modification Type</Label>
            <Select value={modificationType} onValueChange={(value: 'reschedule' | 'cancel') => setModificationType(value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="reschedule" className="text-white hover:bg-slate-600">
                  Reschedule Appointment
                </SelectItem>
                <SelectItem value="cancel" className="text-white hover:bg-slate-600">
                  Cancel Appointment
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {modificationType === 'reschedule' && (
            <>
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              {newDate && appointment?.service && (
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  <TimeSlotPicker
                    businessId={appointment.business_id}
                    selectedDate={new Date(newDate)}
                    selectedService={appointment.service}
                    selectedTime={newTime}
                    onTimeSelect={setNewTime}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Please let us know the reason for this change..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (modificationType === 'reschedule' && (!newDate || !newTime))}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? 'Processing...' : modificationType === 'cancel' ? 'Cancel Appointment' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModificationModal;
