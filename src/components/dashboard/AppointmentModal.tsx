
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Staff {
  id: string;
  name: string;
}

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onAppointmentCreated?: () => void;
}

const AppointmentModal = ({ open, onOpenChange, businessId, onAppointmentCreated }: AppointmentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service_id: "",
    staff_id: "",
    appointment_date: "",
    start_time: "",
    notes: ""
  });

  useEffect(() => {
    if (open) {
      fetchServices();
      fetchStaff();
    }
  }, [open, businessId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration_minutes')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch staff",
        variant: "destructive",
      });
    }
  };

  const calculateEndTime = (startTime: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || !startTime) return "";

    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);
    
    return endDate.toTimeString().slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_phone || !formData.service_id || 
        !formData.appointment_date || !formData.start_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create or find customer
      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', formData.customer_phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: formData.customer_name,
            phone: formData.customer_phone,
            email: formData.customer_email || null
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      const endTime = calculateEndTime(formData.start_time, formData.service_id);

      const { error } = await supabase
        .from('appointments')
        .insert({
          business_id: businessId,
          service_id: formData.service_id,
          staff_id: formData.staff_id || null,
          customer_id: customerId,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          appointment_date: formData.appointment_date,
          start_time: formData.start_time,
          end_time: endTime,
          notes: formData.notes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Appointment Created!",
        description: `Appointment for ${formData.customer_name} has been scheduled.`,
      });
      
      // Reset form
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        service_id: "",
        staff_id: "",
        appointment_date: "",
        start_time: "",
        notes: ""
      });
      
      onOpenChange(false);
      onAppointmentCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedService = services.find(s => s.id === formData.service_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Schedule a new appointment for a client
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange("customer_name", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number *</Label>
              <Input
                id="customer_phone"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer_email">Email (Optional)</Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => handleInputChange("customer_email", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="john@example.com"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_id">Service *</Label>
              <Select value={formData.service_id} onValueChange={(value) => handleInputChange("service_id", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id} className="text-white focus:bg-slate-600">
                      {service.name} - ${service.price} ({service.duration_minutes}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff Member (Optional)</Label>
              <Select value={formData.staff_id} onValueChange={(value) => handleInputChange("staff_id", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id} className="text-white focus:bg-slate-600">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange("appointment_date", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
              {selectedService && formData.start_time && (
                <p className="text-sm text-slate-400">
                  Estimated end time: {calculateEndTime(formData.start_time, formData.service_id)}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
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
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
