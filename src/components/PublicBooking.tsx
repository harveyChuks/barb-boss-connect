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
import { format, addDays, isAfter, isBefore, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from "date-fns";

interface Business {
  id: string;
  name: string;
  description: string | null;
  business_type: string;
  address: string | null;
  website: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  booking_link: string;
  city: string | null;
  state: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
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
  console.log('PublicBooking: Component initializing with businessLink:', businessLink);
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
    service_id: "",
    staff_id: "",
    notes: ""
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

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
    console.log('PublicBooking: useEffect called with businessLink:', businessLink);
    fetchBusinessData();
  }, [businessLink]);

  const fetchBusinessData = async () => {
    console.log('PublicBooking: fetchBusinessData started for:', businessLink);
    try {
      // Get business by booking link using secure function
      console.log('PublicBooking: Calling get_business_public_data with:', businessLink);
      const { data: businessData, error: businessError } = await supabase
        .rpc('get_business_public_data', { business_booking_link: businessLink });

      console.log('PublicBooking: Business data response:', { businessData, businessError });
      
      if (businessError || !businessData || businessData.length === 0) {
        console.error('PublicBooking: Business not found error');
        throw new Error('Business not found');
      }
      
      const business = businessData[0];
      console.log('PublicBooking: Setting business data:', business);
      setBusiness(business);

      // Get services
      console.log('PublicBooking: Fetching services for business_id:', business.id);
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('name');

      console.log('PublicBooking: Services response:', { servicesData, servicesError });
      
      if (servicesError) {
        console.error('PublicBooking: Services error:', servicesError);
        throw servicesError;
      }
      console.log('PublicBooking: Setting services:', servicesData || []);
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
      console.error('PublicBooking: Error in fetchBusinessData:', error);
      console.error('PublicBooking: Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        businessLink,
        errorType: typeof error,
        errorObject: error
      });
      toast({
        title: "Business Not Found",
        description: "The business you're looking for doesn't exist or is no longer active.",
        variant: "destructive",
      });
      // Show mock pictures even on error
      setWorkPictures(mockPictures);
    } finally {
      console.log('PublicBooking: fetchBusinessData completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!business || !selectedDate || !selectedTime) return;

    const selectedService = services.find(s => s.id === formData.service_id);
    if (!selectedService) return;

    setSubmitting(true);
    try {
      // Calculate end time
      const startTime = selectedTime;
      const endTime = new Date(`2000-01-01T${selectedTime}:00`);
      endTime.setMinutes(endTime.getMinutes() + selectedService.duration_minutes);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const appointmentData = {
        business_id: business.id,
        service_id: formData.service_id,
        staff_id: formData.staff_id || null,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTimeString,
        notes: formData.notes || null,
        status: 'pending' as const
      };

      const { error } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been booked successfully. We'll contact you soon to confirm.",
      });

      // Reset form
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        service_id: "",
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
                  {business.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {business.address}
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center">
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        🌐 Website
                      </a>
                    </div>
                  )}
                  {business.instagram && (
                    <div className="flex items-center">
                      <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        📸 Instagram
                      </a>
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
                <CardTitle className="text-white">Our Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.service_id === service.id
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => handleInputChange('service_id', service.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{service.name}</h3>
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
                      <p className="text-slate-400 text-sm">{service.description}</p>
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
                
                {selectedDate && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-medium">
                        Available Times for {format(selectedDate, 'MMM d, yyyy')}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {timeSlots.length} slots available
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={
                            selectedTime === time
                              ? "bg-primary hover:bg-primary/90 text-black font-medium"
                              : "border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
                          }
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
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
                {formData.service_id && services.find(s => s.id === formData.service_id)?.price && (
                  <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <h3 className="text-white font-semibold text-sm">Payment Options</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Service Price:</span>
                        <span className="text-white font-medium">
                          ${services.find(s => s.id === formData.service_id)?.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Required Deposit (50%):</span>
                        <span className="text-primary font-semibold">
                          ${((services.find(s => s.id === formData.service_id)?.price || 0) * 0.5).toFixed(2)}
                        </span>
                      </div>
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
                    !formData.service_id || 
                    !selectedDate || 
                    !selectedTime
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
                >
                  {submitting ? "Booking..." : formData.service_id && services.find(s => s.id === formData.service_id)?.price ? "Book Appointment & Pay Deposit" : "Book Appointment"}
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
