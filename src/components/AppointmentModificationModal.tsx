
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  customer_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  can_reschedule: boolean;
  can_cancel: boolean;
}

interface AppointmentModificationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const AppointmentModificationModal = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
}: AppointmentModificationModalProps) => {
  const { toast } = useToast();
  const [action, setAction] = useState<'reschedule' | 'cancel' | ''>('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment && isOpen) {
      setNewDate(appointment.appointment_date);
      setNewStartTime(appointment.start_time);
      setNewEndTime(appointment.end_time);
      setReason('');
      setAction('');
    }
  }, [appointment, isOpen]);

  const handleReschedule = async () => {
    if (!appointment) return;

    setLoading(true);
    try {
      // Get business_id from the full appointment data
      const { data: fullAppointment, error: fetchError } = await supabase
        .from('appointments')
        .select('business_id')
        .eq('id', appointment.id)
        .single();

      if (fetchError) throw fetchError;

      // Check for conflicts
      const hasConflict = await supabase.rpc('check_appointment_conflict', {
        p_business_id: fullAppointment.business_id,
        p_appointment_date: newDate,
        p_start_time: newStartTime,
        p_end_time: newEndTime,
        p_exclude_appointment_id: appointment.id
      });

      if (hasConflict.data) {
        toast({
          title: "Conflict Detected",
          description: "The selected time slot conflicts with another appointment.",
          variant: "destructive",
        });
        return;
      }

      // Record the modification
      await supabase.from('appointment_modifications').insert({
        appointment_id: appointment.id,
        modification_type: 'reschedule',
        old_date: appointment.appointment_date,
        old_start_time: appointment.start_time,
        old_end_time: appointment.end_time,
        new_date: newDate,
        new_start_time: newStartTime,
        new_end_time: newEndTime,
        reason,
        modified_by: 'customer'
      });

      // Update the appointment
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;

    setLoading(true);
    try {
      // Record the modification
      await supabase.from('appointment_modifications').insert({
        appointment_id: appointment.id,
        modification_type: 'cancel',
        old_status: appointment.status,
        new_status: 'cancelled',
        reason,
        modified_by: 'customer'
      });

      // Update the appointment
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Modify Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-slate-300">
            <p><strong>Customer:</strong> {appointment.customer_name}</p>
            <p><strong>Current Date:</strong> {appointment.appointment_date}</p>
            <p><strong>Current Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
          </div>

          {!action && (
            <div className="space-y-3">
              {appointment.can_reschedule && (
                <Button
                  onClick={() => setAction('reschedule')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Reschedule Appointment
                </Button>
              )}
              {appointment.can_cancel && (
                <Button
                  onClick={() => setAction('cancel')}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}
            </div>
          )}

          {action === 'reschedule' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-date">New Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="new-start-time">Start Time</Label>
                  <Input
                    id="new-start-time"
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="new-end-time">End Time</Label>
                  <Input
                    id="new-end-time"
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rescheduling..."
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReschedule}
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
                </Button>
                <Button
                  onClick={() => setAction('')}
                  variant="outline"
                  className="border-slate-600"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {action === 'cancel' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                <Textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="bg-slate-700 border-slate-600"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  disabled={loading || !reason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
                <Button
                  onClick={() => setAction('')}
                  variant="outline"
                  className="border-slate-600"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModificationModal;
