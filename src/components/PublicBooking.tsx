import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Phone, Mail, MapPin, Star, Calendar as CalendarIcon, Camera, Images, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TimeSlotPicker from "./TimeSlotPicker";
import { format, addDays, isAfter, isBefore, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from "date-fns";

interface Business {
  id: string;
  name: string;
  description: string | null;
  business_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  logo_url: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
}

interface Staff {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  specialties: string[] | null;
}

interface WorkPicture {
  id: string;
  image_url: string;
  description: string | null;
  service_type: string | null;
  created_at: string;
}

interface PublicBookingProps {
  businessLink: string;
}

const PublicBooking = ({ businessLink }: PublicBookingProps) => {
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [workPictures, setWorkPictures] = useState<WorkPicture[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    selected_services: [] as string[], // Changed to array for multiple services
    staff_id: "",
    notes: ""
  });


  // Mock pictures for demonstration
  const mockPictures = [
    {
      id: 'mock-1',
      image_url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=400&fit=crop',
      description: 'Modern fade haircut with clean lines',
      service_type: 'Haircut',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-2', 
      image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop',
      description: 'Classic beard trim and styling',
      service_type: 'Beard Styling',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      image_url: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&h=400&fit=crop',
      description: 'Professional business cut',
      service_type: 'Haircut',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      image_url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop',
      description: 'Creative hair color and styling',
      service_type: 'Hair Color',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchBusinessData();
  }, [businessLink]);

  const fetchBusinessData = async () => {
    try {
      // Get business by booking link using secure function
      const { data: businessData, error: businessError } = await supabase
        .rpc('get_business_public_data', { business_booking_link: businessLink });

      if (businessError) throw businessError;
      if (!businessData || businessData.length === 0) {
        throw new Error('Business not found');
      }
      
      const business = businessData[0];
      setBusiness(business);

      // Get services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('name');

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Get staff
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('name');

      if (staffError) throw staffError;
      setStaff(staffData || []);

      // Get work pictures
      const { data: workPicturesData, error: workPicturesError } = await supabase
        .from('work_pictures')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (workPicturesError) {
        console.error('Error fetching work pictures:', workPicturesError);
        // Use mock data if error or no pictures
        setWorkPictures(mockPictures);
      } else {
        // Use real pictures or mock data if none exist
        setWorkPictures(workPicturesData?.length > 0 ? workPicturesData : mockPictures);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast({
        title: "Business Not Found",
        description: "The business you're looking for doesn't exist or is no longer active.",
        variant: "destructive",
      });
      // Show mock pictures even on error
      setWorkPictures(mockPictures);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_services: prev.selected_services.includes(serviceId)
        ? prev.selected_services.filter(id => id !== serviceId)
        : [...prev.selected_services, serviceId]
    }));
  };

  const handleSubmit = async () => {
    alert('BOOKING FUNCTION TRIGGERED!');
    console.log('=== BOOKING STARTED ===');
    if (!business || !selectedDate || !selectedTime || formData.selected_services.length === 0) return;

    const selectedServices = services.filter(s => formData.selected_services.includes(s.id));
    if (selectedServices.length === 0) return;

    setSubmitting(true);
    try {
      // Calculate total duration for all selected services
      const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);
      
      // CRITICAL: Verify slot is still available before booking
      const { data: slotsData, error: slotsError } = await supabase.rpc('get_available_time_slots', {
        p_business_id: business.id,
        p_date: format(selectedDate, 'yyyy-MM-dd'),
        p_duration_minutes: totalDuration,
        p_staff_id: formData.staff_id || null
      });

      if (slotsError) {
        throw new Error("Failed to verify slot availability");
      }

      // Check if the selected time slot is still available
      console.log('Available slots data:', slotsData);
      console.log('Looking for selected time:', selectedTime);
      
      // Convert selectedTime (12-hour format) to 24-hour format for comparison
      const convertTo24Hour = (time12h: string): string => {
        const [time, period] = time12h.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        
        if (period.toLowerCase() === 'pm' && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toLowerCase() === 'am' && hour24 === 12) {
          hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
      };

      const selectedTime24 = convertTo24Hour(selectedTime);
      console.log('Selected time in 24h format:', selectedTime24);
      
      const slot = slotsData?.find((s: any) => {
        console.log('Comparing slot:', s.slot_time, 'with selected:', selectedTime24);
        return s.slot_time === selectedTime24;
      });

      console.log('Found slot:', slot);
      console.log('Slot availability:', slot?.is_available);

      if (!slot?.is_available) {
        console.log('BLOCKING: Slot not available');
        toast({
          title: "Time Slot No Longer Available",
          description: "This time slot was just booked by someone else. Please select a different time.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      console.log('ALLOWING: Slot appears available, proceeding...');

      // Check for appointment conflicts
      const startTime24 = convertTo24Hour(selectedTime);
      const endTime = new Date(`2000-01-01T${startTime24}`);
      endTime.setMinutes(endTime.getMinutes() + totalDuration);
      const endTimeString = endTime.toTimeString().slice(0, 8); // Include seconds

      console.log('Booking conflict check:', {
        selectedTime,
        startTime24,
        endTimeString,
        totalDuration,
        businessId: business.id,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd')
      });

      const { data: conflictData, error: conflictError } = await supabase.rpc('check_appointment_conflict', {
        p_business_id: business.id,
        p_appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        p_start_time: startTime24,
        p_end_time: endTimeString,
        p_staff_id: formData.staff_id || null,
        p_exclude_appointment_id: null
      });

      if (conflictError) {
        throw new Error("Failed to check for appointment conflicts");
      }

      if (conflictData) {
        toast({
          title: "Time Slot Conflict",
          description: "This time slot conflicts with existing appointments. Please select a different time.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Create separate appointments for each service (this ensures proper tracking and pricing)
      const appointmentPromises = selectedServices.map(async (service, index) => {
        // Calculate start time for each subsequent service using 24-hour format
        const baseStartTime = convertTo24Hour(selectedTime);
        const serviceStartTime = new Date(`2000-01-01T${baseStartTime}`);
        const previousDuration = selectedServices.slice(0, index).reduce((sum, s) => sum + s.duration_minutes, 0);
        serviceStartTime.setMinutes(serviceStartTime.getMinutes() + previousDuration);
        
        const serviceEndTime = new Date(serviceStartTime);
        serviceEndTime.setMinutes(serviceEndTime.getMinutes() + service.duration_minutes);

        const appointmentData = {
          business_id: business.id,
          service_id: service.id,
          staff_id: formData.staff_id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: serviceStartTime.toTimeString().slice(0, 5),
          end_time: serviceEndTime.toTimeString().slice(0, 5),
          notes: formData.notes || null,
          status: 'pending' as const
        };

        return supabase.from('appointments').insert(appointmentData);
      });

      const results = await Promise.all(appointmentPromises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        throw new Error("Failed to book one or more services");
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your appointment${selectedServices.length > 1 ? 's' : ''} for ${selectedServices.map(s => s.name).join(', ')} have been booked successfully. We'll contact you soon to confirm.`,
      });

      // Reset form
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        selected_services: [],
        staff_id: "",
        notes: ""
      });
      setSelectedDate(undefined);
      setSelectedTime("");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    setCalendarDate(direction === 'prev' ? subMonths(calendarDate, 1) : addMonths(calendarDate, 1));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(calendarDate);
    const end = endOfMonth(calendarDate);
    const weeks = eachWeekOfInterval({ start, end });
    
    return weeks.map(week => 
      eachDayOfInterval({ 
        start: startOfWeek(week), 
        end: endOfWeek(week) 
      })
    );
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date())) || isAfter(date, addDays(new Date(), 30));
  };

  const isDateAvailable = (date: Date) => {
    // Mock availability - you can integrate with real availability data
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0; // Example: closed on Sundays
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Business Not Found</h2>
            <p className="text-slate-400">The business you're looking for doesn't exist or is no longer accepting bookings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Business Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={business.logo_url || ""} alt={business.name} />
                <AvatarFallback className="bg-slate-700 text-white text-2xl">
                  {business.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{business.name}</h1>
                <Badge className="mb-3 capitalize">{business.business_type.replace('_', ' ')}</Badge>
                {business.description && (
                  <p className="text-slate-300 mb-4">{business.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-slate-400">
                  {business.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {business.phone}
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {business.email}
                    </div>
                  )}
                  {business.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {business.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Portfolio Section */}
        {workPictures.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Images className="w-5 h-5 mr-2" />
                Our Work Portfolio
              </CardTitle>
              <CardDescription className="text-slate-400">
                See examples of our previous work and craftsmanship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {workPictures.slice(0, 8).map((picture) => (
                  <div key={picture.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={picture.image_url}
                        alt={picture.description || "Work sample"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end">
                      <div className="p-3 text-white">
                        {picture.service_type && (
                          <Badge variant="secondary" className="mb-1 text-xs">
                            {picture.service_type}
                          </Badge>
                        )}
                        {picture.description && (
                          <p className="text-sm font-medium">{picture.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services & Staff */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Choose Your Services</CardTitle>
                <CardDescription className="text-slate-400">
                  Select one or more services for your appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.selected_services.includes(service.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.selected_services.includes(service.id)
                            ? 'border-primary bg-primary'
                            : 'border-slate-400'
                        }`}>
                          {formData.selected_services.includes(service.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <h3 className="font-semibold text-white">{service.name}</h3>
                      </div>
                      <div className="text-right">
                        {service.price && (
                          <div className="text-primary font-semibold">${service.price}</div>
                        )}
                        <div className="text-slate-400 text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.duration_minutes} min
                        </div>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-slate-400 text-sm ml-8">{service.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {staff.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Choose Your Stylist (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.staff_id === ""
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => handleInputChange('staff_id', '')}
                  >
                    <div className="text-white font-medium">Any Available Stylist</div>
                  </div>
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.staff_id === member.id
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => handleInputChange('staff_id', member.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar_url || ""} alt={member.name} />
                          <AvatarFallback className="bg-slate-700 text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{member.name}</div>
                          {member.specialties && member.specialties.length > 0 && (
                            <div className="text-slate-400 text-sm">
                              {member.specialties.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Custom Calendar View */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {format(calendarDate, 'MMMM yyyy')}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCalendar('prev')}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCalendarDate(new Date())}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateCalendar('next')}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-slate-400 text-sm font-medium p-2">
                        {day}
                      </div>
                    ))}
                    
                    {getDaysInMonth().flat().map((date, index) => {
                      const isCurrentMonth = isSameMonth(date, calendarDate);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const isDisabled = isDateDisabled(date);
                      const isAvailable = isDateAvailable(date) && isCurrentMonth && !isDisabled;
                      const isToday = isSameDay(date, new Date());

                      return (
                        <button
                          key={index}
                          onClick={() => isAvailable && setSelectedDate(date)}
                          disabled={!isAvailable}
                          className={`
                            aspect-square p-2 text-sm rounded-lg transition-colors relative
                            ${!isCurrentMonth ? 'text-slate-600' : ''}
                            ${isSelected ? 'bg-primary text-black font-semibold' : ''}
                            ${isToday && !isSelected ? 'bg-slate-600 text-white font-semibold' : ''}
                            ${isAvailable && !isSelected && !isToday ? 'text-white hover:bg-slate-700' : ''}
                            ${!isAvailable ? 'text-slate-600 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          {format(date, 'd')}
                          {!isAvailable && isCurrentMonth && !isDisabled && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {selectedDate && business && (
                  <div className="space-y-3">
                    <Label className="text-white font-medium">
                      Available Times for {format(selectedDate, 'MMM d, yyyy')}
                    </Label>
                    <TimeSlotPicker
                      businessId={business.id}
                      date={format(selectedDate, 'yyyy-MM-dd')}
                      durationMinutes={formData.selected_services.length > 0 
                        ? services
                            .filter(s => formData.selected_services.includes(s.id))
                            .reduce((sum, service) => sum + service.duration_minutes, 0)
                        : 60} // Default to 60 minutes if no services selected
                      staffId={formData.staff_id || undefined}
                      selectedTime={selectedTime}
                      onTimeSelect={setSelectedTime}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-white">Full Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange("customer_name", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="text-white">Phone Number *</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Your phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_email" className="text-white">Email (Optional)</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleInputChange("customer_email", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-white">Special Requests (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                {/* Deposit Payment Section */}
                {formData.selected_services.length > 0 && (
                  <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <h3 className="text-white font-semibold text-sm">Payment Information</h3>
                    <div className="space-y-2">
                      {formData.selected_services.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        if (!service?.price) return null;
                        return (
                          <div key={serviceId} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{service.name}:</span>
                            <span className="text-white font-medium">${service.price}</span>
                          </div>
                        );
                      })}
                      {(() => {
                        const selectedServices = services.filter(s => formData.selected_services.includes(s.id));
                        const totalPrice = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
                        const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);
                        
                        if (totalPrice > 0) {
                          return (
                            <>
                              <hr className="border-slate-600" />
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Total Price:</span>
                                <span className="text-white font-medium">${totalPrice}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Total Duration:</span>
                                <span className="text-white font-medium">{totalDuration} minutes</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Required Deposit (50%):</span>
                                <span className="text-primary font-semibold">${(totalPrice * 0.5).toFixed(2)}</span>
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="text-xs text-slate-400">
                      A 50% deposit is required to secure your appointment. You can pay the remaining balance during your visit.
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitting || 
                    !formData.customer_name || 
                    !formData.customer_phone || 
                    formData.selected_services.length === 0 || 
                    !selectedDate || 
                    !selectedTime
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
                >
                  {submitting 
                    ? "Booking..." 
                    : (() => {
                        const selectedServices = services.filter(s => formData.selected_services.includes(s.id));
                        const hasPrice = selectedServices.some(s => s.price);
                        return hasPrice ? "Book Appointment & Pay Deposit" : "Book Appointment";
                      })()
                  }
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
