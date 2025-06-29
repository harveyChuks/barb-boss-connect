
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AppointmentModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    customer_name: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    can_reschedule: boolean;
    can_cancel: boolean;
  };
  onSuccess: () => void;
}

const AppointmentModificationModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onSuccess 
}: AppointmentModificationModalProps) => {
  const { toast } = useToast();
  const [modificationType, setModificationType] = useState<'reschedule' | 'cancel'>('reschedule');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(appointment.appointment_date));
  const [selectedTime, setSelectedTime] = useState(appointment.start_time);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (modificationType === 'cancel') {
        // Cancel appointment
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
          })
          .eq('id', appointment.id);

        if (updateError) throw updateError;

        // Log modification
        const { error: logError } = await supabase
          .from('appointment_modifications')
          .insert({
            appointment_id: appointment.id,
            modification_type: 'cancel',
            old_status: appointment.status,
            new_status: 'cancelled',
            reason,
            modified_by: 'customer'
          });

        if (logError) throw logError;

        toast({
          title: "Appointment Cancelled",
          description: "Your appointment has been cancelled successfully.",
        });
      } else {
        // Reschedule appointment
        if (!selectedDate) {
          toast({
            title: "Error",
            description: "Please select a date",
            variant: "destructive",
          });
          return;
        }

        const newDate = format(selectedDate, 'yyyy-MM-dd');
        const newEndTime = `${(parseInt(selectedTime.split(':')[0]) + 1).toString().padStart(2, '0')}:${selectedTime.split(':')[1]}`;

        // Check for conflicts
        const { data: conflictCheck } = await supabase
          .rpc('check_appointment_conflict', {
            p_business_id: appointment.business_id,
            p_appointment_date: newDate,
            p_start_time: selectedTime,
            p_end_time: newEndTime,
            p_exclude_appointment_id: appointment.id
          });

        if (conflictCheck) {
          toast({
            title: "Time Slot Unavailable",
            description: "This time slot is already booked. Please choose another time.",
            variant: "destructive",
          });
          return;
        }

        // Update appointment
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            appointment_date: newDate,
            start_time: selectedTime,
            end_time: newEndTime
          })
          .eq('id', appointment.id);

        if (updateError) throw updateError;

        // Log modification
        const { error: logError } = await supabase
          .from('appointment_modifications')
          .insert({
            appointment_id: appointment.id,
            modification_type: 'reschedule',
            old_date: appointment.appointment_date,
            old_start_time: appointment.start_time,
            old_end_time: appointment.end_time,
            new_date: newDate,
            new_start_time: selectedTime,
            new_end_time: newEndTime,
            reason,
            modified_by: 'customer'
          });

        if (logError) throw logError;

        toast({
          title: "Appointment Rescheduled",
          description: "Your appointment has been rescheduled successfully.",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error modifying appointment:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Modify Appointment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-slate-300">
            <p><strong>Customer:</strong> {appointment.customer_name}</p>
            <p><strong>Current Date:</strong> {format(new Date(appointment.appointment_date), 'PPP')}</p>
            <p><strong>Current Time:</strong> {appointment.start_time}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Action</Label>
            <Select value={modificationType} onValueChange={(value: 'reschedule' | 'cancel') => setModificationType(value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {appointment.can_reschedule && (
                  <SelectItem value="reschedule" className="text-white">Reschedule</SelectItem>
                )}
                {appointment.can_cancel && (
                  <SelectItem value="cancel" className="text-white">Cancel</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {modificationType === 'reschedule' && (
            <>
              <div className="space-y-2">
                <Label className="text-white">New Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border border-slate-600 bg-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">New Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time} className="text-white">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-white">Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for this change..."
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? 'Processing...' : modificationType === 'cancel' ? 'Cancel Appointment' : 'Reschedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModificationModal;
