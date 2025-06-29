
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CreditCard, CheckCircle } from 'lucide-react';
import PaymentForm from './PaymentForm';

interface BookingConfirmationProps {
  appointment: any;
  onPaymentSuccess?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  onPaymentSuccess
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(appointment.deposit_paid || false);

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

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    onPaymentSuccess?.();
  };

  const needsPayment = appointment.requires_deposit && !paymentCompleted;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Confirmation
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
                <strong>Total Price:</strong> ${appointment.service?.price}
              </div>
              {appointment.deposit_amount && (
                <div className="text-slate-300">
                  <strong>Deposit Required:</strong> ${appointment.deposit_amount}
                  {paymentCompleted && (
                    <span className="ml-2 text-green-400 inline-flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Paid
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {needsPayment && !showPayment && (
            <div className="pt-4 border-t border-slate-600">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                <p className="text-amber-400 font-medium mb-2">Payment Required</p>
                <p className="text-amber-300 text-sm">
                  A 50% deposit of ${appointment.deposit_amount} is required to confirm your appointment.
                </p>
              </div>
              <Button
                onClick={() => setShowPayment(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay Deposit (${appointment.deposit_amount})
              </Button>
            </div>
          )}

          {paymentCompleted && (
            <div className="pt-4 border-t border-slate-600">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Booking Confirmed
                </p>
                <p className="text-green-300 text-sm mt-1">
                  Your appointment is confirmed and your deposit has been processed.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showPayment && needsPayment && (
        <PaymentForm
          appointmentId={appointment.id}
          depositAmount={appointment.deposit_amount}
          serviceName={appointment.service?.name || 'Service'}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default BookingConfirmation;
