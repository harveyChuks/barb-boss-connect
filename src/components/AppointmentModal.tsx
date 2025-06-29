import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TimeSlotPicker from "./TimeSlotPicker";
import { useTimeSlots } from "@/hooks/useTimeSlots";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated?: () => void;
}

const AppointmentModal = ({ open, onOpenChange, onAppointmentCreated }: AppointmentModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [userBusiness, setUserBusiness] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    date: "",
    time: "",
    serviceId: "",
    notes: ""
  });

  const selectedService = services.find(s => s.id === formData.serviceId);
  const { checkConflict, refetch: refetchTimeSlots, verifySlotAvailable } = useTimeSlots(
    userBusiness?.id || "",
    formData.date,
    selectedService?.duration_minutes || 60
  );

  useEffect(() => {
    if (open && user) {
      fetchBusinessData();
    }
  }, [open, user]);

  const fetchBusinessData = async () => {
    try {
      // Get user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
      
      setUserBusiness(business);

      if (business) {
        // Get services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', business.id)
          .eq('is_active', true);
        
        setServices(servicesData || []);

        // Get recent customers who had appointments with this business
        const { data: customersData } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            phone,
            email,
            appointments!inner(business_id)
          `)
          .eq('appointments.business_id', business.id)
          .limit(50);
        
        setCustomers(customersData || []);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  const convertTimeToPostgresFormat = (timeString: string) => {
    // Convert "2:00 PM" to "14:00:00"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userBusiness) {
      toast({
        title: "Error",
        description: "Business not found",
        variant: "destructive",
      });
      return;
    }

    if (!formData.time) {
      toast({
        title: "Error",
        description: "Please select a time slot",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // CRITICAL: Double-check slot availability right before booking
      const isSlotStillAvailable = await verifySlotAvailable(formData.time);
      if (!isSlotStillAvailable) {
        toast({
          title: "Time Slot No Longer Available",
          description: "This time slot was just booked by someone else. Please select a different time.",
          variant: "destructive",
        });
        // Refresh time slots to show updated availability
        refetchTimeSlots();
        setLoading(false);
        return;
      }

      let customerId = formData.customerId;
      let customerName = formData.customerName;
      let customerPhone = formData.customerPhone;
      let customerEmail = formData.customerEmail;

      // If customer is selected from dropdown, get their details
      if (customerId) {
        const selectedCustomer = customers.find(c => c.id === customerId);
        if (selectedCustomer) {
          customerName = selectedCustomer.name;
          customerPhone = selectedCustomer.phone;
          customerEmail = selectedCustomer.email;
        }
      } else if (customerName && customerPhone) {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      } else {
        throw new Error("Please select a customer or enter customer details");
      }

      if (!selectedService) {
        throw new Error("Please select a service");
      }

      const startTime = convertTimeToPostgresFormat(formData.time);
      const endTime = calculateEndTime(startTime, selectedService.duration_minutes);

      console.log('Attempting to book appointment:', {
        date: formData.date,
        startTime,
        endTime,
        businessId: userBusiness.id,
        serviceId: formData.serviceId
      });

      // FINAL conflict check before inserting
      const hasConflict = await checkConflict(formData.date, startTime, endTime);
      if (hasConflict) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot conflicts with another appointment. Please select a different time.",
          variant: "destructive",
        });
        // Refresh time slots to show updated availability
        refetchTimeSlots();
        setLoading(false);
        return;
      }

      // Use a transaction-like approach by immediately marking the slot as taken
      const { error } = await supabase
        .from('appointments')
        .insert({
          business_id: userBusiness.id,
          service_id: formData.serviceId,
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          appointment_date: formData.date,
          start_time: startTime,
          end_time: endTime,
          notes: formData.notes || null,
          status: 'pending'
        });

      if (error) {
        console.error('Database error:', error);
        // Check if it's a conflict error
        if (error.message.includes('conflict') || error.message.includes('overlapping')) {
          toast({
            title: "Double Booking Prevented",
            description: "This time slot was just booked. Please select a different time.",
            variant: "destructive",
          });
          refetchTimeSlots();
          setLoading(false);
          return;
        }
        throw error;
      }

      console.log('Appointment successfully created');

      toast({
        title: "Appointment Scheduled",
        description: `Appointment for ${customerName} on ${formData.date} at ${formData.time}`,
      });
      
      // Reset form
      setFormData({
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        date: "",
        time: "",
        serviceId: "",
        notes: ""
      });
      
      onOpenChange(false);
      onAppointmentCreated?.();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset time selection when date or service changes to force fresh slot selection
    if (field === 'date' || field === 'serviceId') {
      setFormData(prev => ({ ...prev, time: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Book a new appointment for your client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={formData.customerId} onValueChange={(value) => handleInputChange("customerId", value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select existing customer or enter new below" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id} className="text-white hover:bg-slate-600">
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!formData.customerId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="John Smith"
                    required={!formData.customerId}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="(555) 123-4567"
                    required={!formData.customerId}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="john@example.com"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Select value={formData.serviceId} onValueChange={(value) => handleInputChange("serviceId", value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id} className="text-white hover:bg-slate-600">
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-sm text-slate-400">
                        {service.duration_minutes}min - ${service.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          {/* Time Slot Picker - This now prevents double bookings */}
          {formData.date && formData.serviceId && userBusiness && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <TimeSlotPicker
                businessId={userBusiness.id}
                date={formData.date}
                durationMinutes={selectedService?.duration_minutes || 60}
                selectedTime={formData.time}
                onTimeSelect={(time) => handleInputChange("time", time)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Special requests or notes"
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
              disabled={loading || !formData.date || !formData.time || !formData.serviceId}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
