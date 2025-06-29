
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CreditCard, Edit } from 'lucide-react';
import PaymentForm from './PaymentForm';
import BookingModificationModal from './BookingModificationModal';

interface PublicBookingConfirmationProps {
  appointment: any;
  onPaymentSuccess?: () => void;
  onModificationComplete?: () => void;
}

export const PublicBookingConfirmation: React.FC<PublicBookingConfirmationProps> = ({
  appointment,
  onPaymentSuccess,
  onModificationComplete
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showModification, setShowModification] = useState(false);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canModify = appointment.status !== 'cancelled' && appointment.status !== 'completed';
  const needsPayment = appointment.requires_deposit && !appointment.deposit_paid;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4" />
                <span>{appointment.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(appointment.appointment_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4" />
                <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-slate-300">
                <strong>Service:</strong> {appointment.service?.name}
              </div>
              <div className="text-slate-300">
                <strong>Duration:</strong> {appointment.service?.duration_minutes} minutes
              </div>
              <div className="text-slate-300">
                <strong>Price:</strong> ${appointment.service?.price}
              </div>
              {appointment.deposit_amount && (
                <div className="text-slate-300">
                  <strong>Deposit Required:</strong> ${appointment.deposit_amount}
                  {appointment.deposit_paid && (
                    <span className="ml-2 text-green-400">✓ Paid</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {needsPayment && (
              <Button
                onClick={() => setShowPayment(true)}
                className="bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay Deposit (${appointment.deposit_amount})
              </Button>
            )}
            
            {canModify && (
              <Button
                onClick={() => setShowModification(true)}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modify Appointment
              </Button>
            )}
          </div>

          {appointment.status === 'cancelled' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 font-medium">This appointment has been cancelled</p>
              {appointment.cancellation_reason && (
                <p className="text-red-300 text-sm mt-1">Reason: {appointment.cancellation_reason}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showPayment && needsPayment && (
        <PaymentForm
          appointmentId={appointment.id}
          depositAmount={appointment.deposit_amount}
          serviceName={appointment.service?.name || 'Service'}
          onPaymentSuccess={() => {
            setShowPayment(false);
            onPaymentSuccess?.();
          }}
        />
      )}

      <BookingModificationModal
        open={showModification}
        onOpenChange={setShowModification}
        appointment={appointment}
        onModificationComplete={() => {
          setShowModification(false);
          onModificationComplete?.();
        }}
      />
    </div>
  );
};

export default PublicBookingConfirmation;
