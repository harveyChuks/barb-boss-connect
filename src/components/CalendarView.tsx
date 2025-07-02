
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfDay, addWeeks, subWeeks } from "date-fns";
import AppointmentModal from "./AppointmentModal";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
  service?: {
    name: string;
    duration_minutes: number;
    price: number | null;
  };
  staff?: {
    name: string;
    avatar_url: string | null;
  };
}

const CalendarView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [userBusiness, setUserBusiness] = useState<any>(null);

  useEffect(() => {
    fetchBusinessAndAppointments();
  }, [user, currentWeek, selectedDate]);

  const fetchBusinessAndAppointments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (business) {
        setUserBusiness(business);
        
        // Determine date range based on view
        let startDate, endDate;
        if (view === 'week') {
          startDate = startOfWeek(currentWeek);
          endDate = endOfWeek(currentWeek);
        } else {
          startDate = startOfDay(selectedDate);
          endDate = startOfDay(addDays(selectedDate, 1));
        }

        // Get appointments for the date range
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            services:service_id (name, duration_minutes, price),
            staff:staff_id (name, avatar_url)
          `)
          .eq('business_id', business.id)
          .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
          .lt('appointment_date', format(endDate, 'yyyy-MM-dd'))
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true });

        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-primary text-primary-foreground';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Calendar</h2>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className={view === 'day' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'}
            >
              Day
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'}
            >
              Week
            </Button>
          </div>
          
          <Button
            onClick={() => setShowAppointmentModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {view === 'week' ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Week of {format(startOfWeek(currentWeek), 'MMM d, yyyy')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(new Date())}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {/* Time column header */}
              <div className="text-center font-medium text-muted-foreground p-2">
                Time
              </div>
              
              {/* Day headers */}
              {getWeekDays().map((day) => (
                <div key={day.toISOString()} className="text-center p-2">
                  <div className="font-medium text-foreground">{format(day, 'EEE')}</div>
                  <div className={`text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1 ${
                    isSameDay(day, new Date()) 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
              
              {/* Time slots and appointments */}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="text-xs text-muted-foreground p-2 border-r border-border">
                    {time}
                  </div>
                  {getWeekDays().map((day) => {
                    const dayAppointments = getAppointmentsForDate(day).filter(
                      apt => apt.start_time === time
                    );
                    
                    return (
                      <div key={`${day.toISOString()}-${time}`} className="p-1 border-b border-border min-h-[60px]">
                        {dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={() => handleAppointmentClick(appointment)}
                            className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(appointment.status)}`}
                          >
                            <div className="font-medium truncate">{appointment.customer_name}</div>
                            <div className="truncate opacity-90">
                              {appointment.service?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('prev')}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDay('next')}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled for this day</p>
                  <Button
                    onClick={() => setShowAppointmentModal(true)}
                    className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Appointment
                  </Button>
                </div>
              ) : (
                getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => handleAppointmentClick(appointment)}
                    className="flex items-center space-x-4 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {appointment.start_time} - {appointment.end_time}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{appointment.customer_name}</span>
                        <Badge className={getStatusColor(appointment.status)} variant="secondary">
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {appointment.service && (
                          <span>{appointment.service.name}</span>
                        )}
                        {appointment.customer_phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {appointment.customer_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {appointment.staff && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={appointment.staff.avatar_url || ""} alt={appointment.staff.name} />
                          <AvatarFallback className="bg-background text-foreground text-xs">
                            {appointment.staff.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{appointment.staff.name}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showAppointmentModal && (
        <AppointmentModal
          open={showAppointmentModal}
          onOpenChange={(open) => {
            setShowAppointmentModal(open);
            if (!open) setSelectedAppointment(null);
          }}
          onAppointmentCreated={() => {
            fetchBusinessAndAppointments();
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;
