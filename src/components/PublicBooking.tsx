import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Phone, Mail, MapPin, Star, Calendar as CalendarIcon, Camera, Images, ChevronLeft, ChevronRight, MessageCircle, Send, X, Instagram, Globe, User, Gift, Heart } from "lucide-react";
import { Music2 } from "lucide-react"; // TikTok icon
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TimeSlotPicker from "./TimeSlotPicker";
import { ReviewModal } from "./ReviewModal";
import { CustomerAuthModal } from "./auth/CustomerAuthModal";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
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
  tiktok: string | null;
  logo_url: string | null;
  currency: string | null;
  owner_id?: string;
  banner_url?: string | null;
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
  const navigate = useNavigate();
  const { user, customerProfile, isAuthenticated, followBusiness, hasFollowedBusiness } = useCustomerAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [workPictures, setWorkPictures] = useState<WorkPicture[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [portfolioScrollPosition, setPortfolioScrollPosition] = useState(0);
  const [lastAppointmentData, setLastAppointmentData] = useState<{
    customerName: string;
    customerEmail?: string;
    appointmentId?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [discount, setDiscount] = useState<{ percentage: number; reason: string; finalPrice: number } | null>(null);
  const [messageData, setMessageData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [sendingMessage, setSendingMessage] = useState(false);
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
      setBusiness({
        ...business,
        currency: (business as any).currency || 'USD', // Default to USD if not set
        banner_url: (business as any).banner_url || null
      });

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
      } else {
        setWorkPictures(workPicturesData || []);
      }

      // Get reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      } else {
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast({
        title: "Business Not Found",
        description: "The business you're looking for doesn't exist or is no longer active.",
        variant: "destructive",
      });
      // Show empty work pictures on error
      setWorkPictures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Currency formatting function
  const formatCurrency = (amount: number) => {
    const currency = business?.currency || 'USD';
    const currencySymbols: { [key: string]: string } = {
      'NGN': '₦',
      'GHS': '₵',
      'KES': 'KSh',
      'ZAR': 'R',
      'USD': '$',
      'GBP': '£',
      'CAD': 'C$'
    };
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_services: prev.selected_services.includes(serviceId)
        ? prev.selected_services.filter(id => id !== serviceId)
        : [...prev.selected_services, serviceId]
    }));
  };

  // Calculate discount when services are selected and customer is authenticated
  useEffect(() => {
    const calculateDiscount = async () => {
      if (!isAuthenticated || !user || !business || formData.selected_services.length === 0) {
        setDiscount(null);
        return;
      }

      const selectedServices = services.filter(s => formData.selected_services.includes(s.id));
      const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);

      if (totalPrice === 0) {
        setDiscount(null);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('calculate_customer_discount', {
          p_customer_id: user.id,
          p_business_id: business.id,
          p_base_price: totalPrice
        });

        if (error) throw error;

        if (data && typeof data === 'object' && data !== null) {
          const discountData = data as { discount_percentage: number; discount_reason: string; final_price: number };
          setDiscount({
            percentage: discountData.discount_percentage,
            reason: discountData.discount_reason,
            finalPrice: discountData.final_price
          });
        }
      } catch (error) {
        console.error('Error calculating discount:', error);
      }
    };

    calculateDiscount();
  }, [formData.selected_services, isAuthenticated, user, business, services]);

  const handleSubmit = async () => {
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
      const slot = slotsData?.find((s: any) => s.slot_time === selectedTime24);

      if (!slot?.is_available) {
        toast({
          title: "Time Slot No Longer Available",
          description: "This time slot was just booked by someone else. Please select a different time.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Check for appointment conflicts with optimistic locking
      const startTime24 = convertTo24Hour(selectedTime);
      const endTime = new Date(`2000-01-01T${startTime24}`);
      endTime.setMinutes(endTime.getMinutes() + totalDuration);
      const endTimeString = endTime.toTimeString().slice(0, 8); // Include seconds

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
          customer_id: user?.id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: serviceStartTime.toTimeString().slice(0, 5),
          end_time: serviceEndTime.toTimeString().slice(0, 5),
          notes: formData.notes || null,
          status: 'pending' as const,
          discount_percentage: discount?.percentage || 0,
          discount_reason: discount?.reason || null,
          final_price: discount?.finalPrice || (service.price || 0)
        };

        return supabase.from('appointments').insert(appointmentData).select();
      });

      const results = await Promise.all(appointmentPromises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        const errorDetails = results.filter(r => r.error).map(r => r.error?.message).join(', ');
        throw new Error(`Failed to book one or more services: ${errorDetails}`);
      }

      // Get the first appointment ID from successful insertions
      const firstResult = results[0];
      const firstAppointmentId = firstResult?.data && Array.isArray(firstResult.data) && firstResult.data.length > 0
        ? firstResult.data[0]?.id
        : undefined;

      const updateOwnerData = async () => {
        if (!business.owner_id) return;
        
        const { data: ownerData } = await supabase.auth.admin.getUserById(business.owner_id);
        if (!ownerData?.user?.email) return;
        
        const serviceNames = formData.selected_services.map(sid => services.find(s => s.id === sid)?.name).join(', ');
        const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
        
        // Send notification to business owner for each appointment
        for (const result of results) {
          if (result.data && result.data[0]) {
            const appointment = result.data[0];
            const service = services.find(s => s.id === appointment.service_id);
            
            if (service) {
              supabase.functions.invoke('send-owner-notification', {
                body: {
                  ownerEmail: ownerData.user.email,
                  businessName: business.name,
                  customerName: formData.customer_name,
                  customerPhone: formData.customer_phone,
                  customerEmail: formData.customer_email || undefined,
                  serviceName: service.name,
                  appointmentDate: appointment.appointment_date,
                  startTime: appointment.start_time,
                  endTime: appointment.end_time,
                  price: service.price || 0,
                  notes: formData.notes,
                }
              }).catch(err => console.error('Error sending owner notification:', err));
            }
          }
        }
        
        // Send confirmation to customer if email provided
        if (formData.customer_email && results[0]?.data?.[0]) {
          const firstAppointment = results[0].data[0];
          
          supabase.functions.invoke('send-booking-confirmation', {
            body: {
              appointmentId: firstAppointment.id,
              customerEmail: formData.customer_email,
              customerName: formData.customer_name,
              businessName: business.name,
              serviceName: serviceNames,
              appointmentDate: firstAppointment.appointment_date,
              startTime: firstAppointment.start_time,
              endTime: firstAppointment.end_time,
              price: totalPrice,
              businessPhone: business.phone || undefined,
              notes: formData.notes,
            }
          }).catch(err => console.error('Error sending confirmation email:', err));
        }
      };
      
      // Call async function without awaiting to not block UI
      updateOwnerData();

      toast({
        title: "Booking Confirmed!",
        description: `Your appointment${selectedServices.length > 1 ? 's' : ''} for ${selectedServices.map(s => s.name).join(', ')} have been booked successfully. We'll contact you soon to confirm.`,
      });

      // Store data for review modal and show it after a brief delay
      setLastAppointmentData({
        customerName: formData.customer_name,
        customerEmail: formData.customer_email || undefined,
        appointmentId: firstAppointmentId
      });
      
      // Show review modal after 1 second to let the success toast display first
      setTimeout(() => {
        setShowReviewModal(true);
      }, 1000);

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

  const handleSendMessage = async () => {
    if (!messageData.name || !messageData.message || !business) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and message.",
        variant: "destructive",
      });
      return;
    }

    if (!messageData.email && !messageData.phone) {
      toast({
        title: "Contact Information Required",
        description: "Please provide either an email or phone number so the business can respond.",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      // Get business owner email
      if (!business.owner_id) {
        throw new Error("Cannot send message: business owner not found");
      }

      const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(business.owner_id);
      
      if (ownerError || !ownerData?.user?.email) {
        // Fallback to business email if available
        if (!business.email) {
          throw new Error("Cannot send message: no contact email available");
        }
      }

      const ownerEmail = ownerData?.user?.email || business.email;

      // Send message to business owner via email
      const { error } = await supabase.functions.invoke('send-owner-notification', {
        body: {
          ownerEmail: ownerEmail,
          businessName: business.name,
          customerName: messageData.name,
          customerPhone: messageData.phone || 'Not provided',
          customerEmail: messageData.email || 'Not provided',
          serviceName: 'Customer Message',
          appointmentDate: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          price: 0,
          notes: messageData.message,
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "The business will get back to you soon.",
      });

      setMessageData({ name: "", email: "", phone: "", message: "" });
      setShowMessageDialog(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send",
        description: "Please try contacting the business directly via phone or email.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Customer Auth Modal */}
      <CustomerAuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={() => {
          toast({
            title: "Success!",
            description: "You're now logged in and can enjoy loyalty benefits."
          });
        }}
      />

      {/* Review Modal */}
      {lastAppointmentData && (
        <ReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          businessId={business.id}
          customerName={lastAppointmentData.customerName}
          customerEmail={lastAppointmentData.customerEmail}
          appointmentId={lastAppointmentData.appointmentId}
        />
      )}

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-slate-700 fixed top-0 left-0 right-0 z-50 md:relative md:z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              bójí
            </h1>
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customer/dashboard')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                My Account
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Log in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Business Banner - Full Width */}
      {business.banner_url && (
        <div className="w-full mb-8">
          <div className="w-full aspect-[3/1] max-h-[400px]">
            <img
              src={business.banner_url}
              alt={`${business.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto pt-16 md:pt-0 px-6">
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
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-white mb-2 break-words">{business.name}</h1>
                <Badge className="mb-3 capitalize">{business.business_type.replace('_', ' ')}</Badge>
                
                {/* Rating and Social Media */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  {/* Rating */}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(Number(averageRating))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-500"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-semibold">{averageRating}</span>
                      <span className="text-slate-400">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  )}
                  
                  {/* Social Media Links */}
                  <div className="flex items-center gap-3">
                    {business.instagram && (
                      <a
                        href={business.instagram.startsWith('http') ? business.instagram : `https://instagram.com/${business.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-pink-400 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {business.tiktok && (
                      <a
                        href={business.tiktok.startsWith('http') ? business.tiktok : `https://tiktok.com/@${business.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                        title="TikTok"
                      >
                        <Music2 className="w-5 h-5" />
                      </a>
                    )}
                    {business.website && (
                      <a
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                        title="Website"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {business.description && (
                  <p className="text-slate-300 mb-4 break-words">{business.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-slate-400">
                  {business.address && (
                    <div className="flex items-center min-w-0">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="break-words">{business.address}</span>
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
              <div className="relative">
                {/* Scroll buttons */}
                {workPictures.length > 4 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 border-slate-600 hover:bg-slate-700"
                      onClick={() => {
                        const container = document.getElementById('portfolio-scroll');
                        if (container) {
                          container.scrollBy({ left: -300, behavior: 'smooth' });
                        }
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-slate-800/90 border-slate-600 hover:bg-slate-700"
                      onClick={() => {
                        const container = document.getElementById('portfolio-scroll');
                        if (container) {
                          container.scrollBy({ left: 300, behavior: 'smooth' });
                        }
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Button>
                  </>
                )}

                {/* Scrollable portfolio */}
                <div 
                  id="portfolio-scroll"
                  className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {workPictures.map((picture) => (
                    <div key={picture.id} className="relative group overflow-hidden rounded-lg flex-none w-64 h-64 snap-start">
                      <img
                        src={picture.image_url}
                        alt={picture.description || "Work sample"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Image failed to load:', picture.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          {picture.service_type && (
                            <Badge variant="secondary" className="mb-1 text-xs">
                              {picture.service_type}
                            </Badge>
                          )}
                          {picture.description && (
                            <p className="text-sm font-medium line-clamp-2">{picture.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Star className="w-5 h-5 mr-2 fill-yellow-400 text-yellow-400" />
                    Customer Reviews
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} · Average rating: {averageRating} / 5
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{review.customer_name}</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-slate-300 text-sm">{review.review_text}</p>
                    )}
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
                          <div className="text-primary font-semibold">{formatCurrency(service.price)}</div>
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
                
                {/* DEBUG: Check why TimeSlotPicker isn't rendering */}
                {(() => {
                  console.warn('🚨 PUBLICBOOKING DEBUG:', {
                    selectedDate: selectedDate,
                    selectedDateFormatted: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
                    business: business ? { id: business.id, name: business.name } : null,
                    shouldRenderTimeSlotPicker: !!(selectedDate && business),
                    servicesSelected: formData.selected_services.length
                  });
                  return null;
                })()}

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

                {/* Price Summary Section */}
                {formData.selected_services.length > 0 && (
                  <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <h3 className="text-white font-semibold text-sm">Price Summary</h3>
                    <div className="space-y-2">
                      {formData.selected_services.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        if (!service?.price) return null;
                        return (
                          <div key={serviceId} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{service.name}:</span>
                            <span className="text-white font-medium">{formatCurrency(service.price)}</span>
                          </div>
                        );
                      })}
                      {(() => {
                        const selectedServices = services.filter(s => formData.selected_services.includes(s.id));
                        const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
                        const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
                        
                        if (totalPrice > 0) {
                          return (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Total Price:</span>
                                <span className="text-white font-medium">{formatCurrency(totalPrice)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Total Duration:</span>
                                <span className="text-white font-medium">{totalDuration} minutes</span>
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="text-xs text-slate-400">
                      Payment will be collected during your visit. We'll contact you to confirm your appointment.
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
                  {submitting ? "Booking..." : "Book Appointment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Message Button */}
      <button
        onClick={() => setShowMessageDialog(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Send a message"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Message Dialog */}
      {showMessageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader className="relative">
              <button
                onClick={() => setShowMessageDialog(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <CardTitle className="text-white text-xl">Send a Message</CardTitle>
              <CardDescription className="text-slate-300">
                Contact {business?.name || 'the business'} directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message_name" className="text-white">Your Name *</Label>
                <Input
                  id="message_name"
                  type="text"
                  value={messageData.name}
                  onChange={(e) => setMessageData({...messageData, name: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="John Doe"
                  disabled={sendingMessage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message_email" className="text-white">Email</Label>
                <Input
                  id="message_email"
                  type="email"
                  value={messageData.email}
                  onChange={(e) => setMessageData({...messageData, email: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="your.email@example.com"
                  disabled={sendingMessage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message_phone" className="text-white">Phone</Label>
                <Input
                  id="message_phone"
                  type="tel"
                  value={messageData.phone}
                  onChange={(e) => setMessageData({...messageData, phone: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="+1234567890"
                  disabled={sendingMessage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message_text" className="text-white">Message *</Label>
                <Textarea
                  id="message_text"
                  value={messageData.message}
                  onChange={(e) => setMessageData({...messageData, message: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Your message..."
                  rows={4}
                  disabled={sendingMessage}
                />
              </div>

              <div className="text-xs text-slate-400">
                * Required fields. Please provide either email or phone for reply.
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowMessageDialog(false)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={sendingMessage}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageData.name || !messageData.message}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
                >
                  {sendingMessage ? (
                    "Sending..."
                  ) : (
                    <>
                      Send <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">bójí</h3>
              <p className="text-muted-foreground text-sm">
                Empowering businesses to thrive through seamless booking experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">Resources</h4>
              <div className="space-y-2">
                <Link to="/faqs" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                  FAQs
                </Link>
                <Link to="/privacy-policy" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h4 className="text-foreground font-semibold">Get in Touch</h4>
              <div className="space-y-2">
                <a
                  href="https://wa.me/2348000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Boji (WhatsApp)
                </a>
                <a
                  href="https://instagram.com/boji_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Direct Message (Instagram)
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Boji. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/boji_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicBooking;
