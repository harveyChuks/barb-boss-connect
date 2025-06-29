
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar as CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EnhancedPublicBookingProps {
  businessLink: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string;
}

interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

const EnhancedPublicBooking = ({ businessLink }: EnhancedPublicBookingProps) => {
  const { toast } = useToast();
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    fetchBusinessAndServices();
  }, [businessLink]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  const fetchBusinessAndServices = async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('booking_link', businessLink)
        .eq('is_active', true)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('is_active', true);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error",
        description: "Could not load booking information",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedService || !selectedDate || !business) return;

    try {
      const { data: slotsData, error } = await supabase
        .rpc('get_available_time_slots', {
          p_business_id: business.id,
          p_date: format(selectedDate, 'yyyy-MM-dd'),
          p_duration_minutes: selectedService.duration_minutes
        });

      if (error) throw error;
      setAvailableSlots(slotsData || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Error",
        description: "Could not load available time slots",
        variant: "destructive",
      });
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate end time
      const startTime = selectedTime;
      const [hours, minutes] = startTime.split(':').map(Number);
      const endTime = `${String(hours + Math.floor(selectedService.duration_minutes / 60)).padStart(2, '0')}:${String((minutes + selectedService.duration_minutes % 60) % 60).padStart(2, '0')}`;

      // Create customer if doesn't exist
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerInfo.phone)
        .single();

      let customerId = existingCustomer?.id;

      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Create appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          business_id: business.id,
          service_id: selectedService.id,
          customer_id: customerId,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          notes: customerInfo.notes,
          status: 'pending'
        });

      if (appointmentError) throw appointmentError;

      setBookingComplete(true);
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been booked successfully.",
      });
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-slate-300 mb-4">
              Thank you for booking with {business.name}. You will receive a confirmation shortly.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 text-left space-y-2">
              <p className="text-white"><strong>Service:</strong> {selectedService?.name}</p>
              <p className="text-white"><strong>Date:</strong> {selectedDate && format(selectedDate, 'PPP')}</p>
              <p className="text-white"><strong>Time:</strong> {selectedTime}</p>
              <p className="text-white"><strong>Duration:</strong> {selectedService?.duration_minutes} minutes</p>
              {selectedService?.price && (
                <p className="text-white"><strong>Price:</strong> ${selectedService.price}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book with {business.name}</h1>
          <p className="text-slate-400">{business.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Selection */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                    selectedService?.id === service.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <p className="text-slate-400 text-sm">{service.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-slate-700 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.duration_minutes} min
                        </Badge>
                        {service.price && (
                          <Badge className="bg-amber-500 text-black">
                            ${service.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedService ? (
                <>
                  <div>
                    <Label className="text-white">Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border border-slate-600"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="text-white">Available Times</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.slot_time}
                            variant={selectedTime === slot.slot_time ? "default" : "outline"}
                            size="sm"
                            disabled={!slot.is_available}
                            onClick={() => setSelectedTime(slot.slot_time)}
                            className={`${
                              selectedTime === slot.slot_time
                                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                : 'border-slate-600 text-white hover:bg-slate-700'
                            } ${!slot.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {slot.slot_time}
                          </Button>
                        ))}
                      </div>
                      {availableSlots.length === 0 && (
                        <p className="text-slate-400 text-sm mt-2">
                          No available slots for this date
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Please select a service first</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Information */}
        {selectedService && selectedTime && (
          <Card className="bg-slate-800/50 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Name *</Label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label className="text-white">Phone *</Label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Email</Label>
                <Input
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Your email address"
                  type="email"
                />
              </div>
              <div>
                <Label className="text-white">Additional Notes</Label>
                <Textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Any special requests or notes..."
                />
              </div>
              
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedPublicBooking;
