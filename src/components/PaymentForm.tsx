
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const stripePromise = loadStripe(process.env.NODE_ENV === 'production' 
  ? 'pk_live_...' // Replace with your live publishable key
  : 'pk_test_51...' // Replace with your test publishable key
);

interface PaymentFormProps {
  appointmentId: string;
  depositAmount: number;
  serviceName: string;
  onPaymentSuccess: () => void;
}

const PaymentCheckoutForm: React.FC<PaymentFormProps> = ({
  appointmentId,
  depositAmount,
  serviceName,
  onPaymentSuccess
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      // Create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { appointmentId }
      });

      if (error) throw error;

      const { client_secret } = data;

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Update appointment as paid
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ deposit_paid: true })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      toast({
        title: "Payment Successful",
        description: `Deposit of $${depositAmount} paid for ${serviceName}`,
      });

      onPaymentSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-slate-600 rounded-lg bg-slate-700/50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#94a3b8',
                },
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-amber-500 hover:bg-amber-600 text-black"
      >
        {processing ? 'Processing...' : `Pay Deposit $${depositAmount}`}
      </Button>
    </form>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Secure Payment</CardTitle>
          <p className="text-slate-400 text-sm">
            Pay 50% deposit to confirm your appointment
          </p>
        </CardHeader>
        <CardContent>
          <PaymentCheckoutForm {...props} />
        </CardContent>
      </Card>
    </Elements>
  );
};

export default PaymentForm;
