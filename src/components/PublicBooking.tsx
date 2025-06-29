
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TimeSlotPicker from './TimeSlotPicker';
import BookingConfirmation from './BookingConfirmation';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
}

interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const PublicBooking = () => {
  const { businessLink } = useParams();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  useEffect(() => {
    fetchBusiness();
  }, [businessLink]);

  useEffect(() => {
    if (business) {
      fetchServices();
    }
  }, [business]);

  const fetchBusiness = async () => {
    try {
      const { data: businessData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('booking_link', businessLink)
        .single();

      if (error) throw error;

      setBusiness(businessData);
    } catch (error: any) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchServices = async () => {
    if (!business) return;

    try {
      const { data: servicesData, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id);

      if (error) throw error;

      setServices(servicesData || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const appointmentDate = selectedDate.toISOString().split('T')[0];
      const [hours, minutes] = selectedTime.includes('AM') || selectedTime.includes('PM') 
        ? convertTo24Hour(selectedTime).split(':')
        : selectedTime.split(':');
      const startTime = `${hours}:${minutes}:00`;

      // Calculate end time
      const endTimeDate = new Date(`2000-01-01T${startTime}`);
      endTimeDate.setMinutes(endTimeDate.getMinutes() + selectedService.duration_minutes);
      const endTime = endTimeDate.toTimeString().split(' ')[0];

      // Calculate deposit amount
      const depositAmount = selectedService.price * 0.5;

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          business_id: business!.id,
          service_id: selectedService.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          appointment_date: appointmentDate,
          start_time: startTime,
          end_time: endTime,
          notes: notes || null,
          status: 'pending',
          deposit_amount: depositAmount,
          requires_deposit: true,
          deposit_paid: false
        })
        .select(`
          *,
          service:services(name, price, duration_minutes)
        `)
        .single();

      if (error) throw error;

      setCreatedAppointment(appointment);
      setBookingComplete(true);

      toast({
        title: "Booking Created",
        description: "Your appointment has been scheduled successfully",
      });
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handlePaymentSuccess = () => {
    setCreatedAppointment(prev => ({
      ...prev,
      deposit_paid: true
    }));
    
    toast({
      title: "Payment Successful",
      description: "Your booking is now confirmed!",
    });
  };

  if (bookingComplete && createdAppointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmation</h1>
            <p className="text-slate-400">Complete your booking by paying the required deposit</p>
          </div>
          <BookingConfirmation 
            appointment={createdAppointment}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Book Appointment</CardTitle>
            <CardDescription className="text-slate-400">
              Schedule your service with {business?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {business ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-slate-300">
                    Select Service
                  </Label>
                  <Select onValueChange={(value) => setSelectedService(services.find(s => s.id === value) || null)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} (${service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">
                    Select Date
                  </Label>
                  <TimeSlotPicker onDateSelect={setSelectedDate} />
                </div>

                {selectedDate && selectedService && (
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-slate-300">
                      Select Time
                    </Label>
                    <TimeSlotPicker
                      businessId={business.id}
                      selectedDate={selectedDate}
                      selectedService={selectedService}
                      selectedTime={selectedTime}
                      onTimeSelect={setSelectedTime}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-300">
                    Your Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Your Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-300">
                    Additional Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white resize-none"
                  />
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={loading || !selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {loading ? 'Submitting...' : 'Book Appointment'}
                </Button>
              </>
            ) : (
              <div className="text-center text-slate-400">
                <p>Loading business information...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicBooking;
