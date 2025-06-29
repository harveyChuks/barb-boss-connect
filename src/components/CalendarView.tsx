
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  service: {
    name: string;
    duration_minutes: number;
  };
  staff?: {
    name: string;
  };
}

const CalendarView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchBusinessAndAppointments();
  }, [user, selectedDate]);

  const fetchBusinessAndAppointments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Get appointments for selected date
      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services!inner(name, duration_minutes),
          staff(name)
        `)
        .eq('business_id', businessData.id)
        .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
        .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'pending': return 'bg-amber-500 hover:bg-amber-600';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      case 'no_show': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 7) : addDays(selectedDate, 7));
    } else {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 30) : addDays(selectedDate, 30));
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  if (!business) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-400">No business profile found. Please register your business first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Calendar</h2>
          <p className="text-slate-400 text-sm sm:text-base">Manage your appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg bg-slate-800 p-1">
            {['day', 'week', 'month'].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode as any)}
                className={`flex-1 sm:flex-none ${viewMode === mode 
                  ? "bg-amber-500 hover:bg-amber-600 text-black" 
                  : "text-white hover:bg-slate-700"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
          <Button className="bg-amber-500 hover:bg-amber-600 text-black text-sm sm:text-base">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Mini Calendar */}
        <Card className="bg-slate-800/50 border-slate-700 xl:block hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-slate-700 w-full"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                <span className="text-slate-300">Confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-amber-500"></div>
                <span className="text-slate-300">Pending</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-slate-300">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Calendar View */}
        <div className="xl:col-span-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">
                    {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    {viewMode === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`}
                    {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className="border-slate-600 text-white hover:bg-slate-700 px-2 sm:px-4 text-sm"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('next')}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-slate-400">Loading appointments...</div>
                </div>
              ) : (
                <>
                  {/* Week View */}
                  {viewMode === 'week' && (
                    <div className="space-y-3 sm:space-y-4">
                      {getWeekDays().map((day) => {
                        const dayAppointments = getAppointmentsForDate(day);
                        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                        
                        return (
                          <div key={day.toISOString()} className={`border-l-4 pl-3 sm:pl-4 py-2 ${isToday ? 'border-amber-500 bg-amber-500/5' : 'border-slate-600'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className={`font-semibold text-sm sm:text-base ${isToday ? 'text-amber-400' : 'text-white'}`}>
                                {format(day, 'EEEE, MMM d')}
                                {isToday && <Badge className="ml-2 bg-amber-500 text-black text-xs">Today</Badge>}
                              </h3>
                              <span className="text-slate-400 text-xs sm:text-sm">
                                {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {dayAppointments.length === 0 ? (
                              <p className="text-slate-500 text-xs sm:text-sm italic">No appointments scheduled</p>
                            ) : (
                              <div className="grid gap-2">
                                {dayAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-2 sm:p-3 hover:bg-slate-700/70 transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                          <Badge className={`${getStatusColor(appointment.status)} text-white text-xs w-fit`}>
                                            {appointment.status}
                                          </Badge>
                                          <div className="flex items-center text-slate-300 text-xs sm:text-sm">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                          </div>
                                        </div>
                                        <div className="flex items-center text-white font-medium mb-1 text-sm sm:text-base">
                                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                          <span className="truncate">{appointment.customer_name}</span>
                                        </div>
                                        <div className="text-slate-300 text-xs sm:text-sm">
                                          <span className="truncate">{appointment.service?.name}</span>
                                          {appointment.staff && (
                                            <span className="text-slate-400 ml-2 hidden sm:inline">
                                              • {appointment.staff.name}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Day View */}
                  {viewMode === 'day' && (
                    <div className="space-y-3">
                      {appointments.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Appointments</h3>
                          <p className="text-slate-400 text-sm sm:text-base">No appointments scheduled for this date.</p>
                        </div>
                      ) : (
                        appointments.map((appointment) => (
                          <Card key={appointment.id} className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-colors cursor-pointer">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <Badge className={`${getStatusColor(appointment.status)} text-white text-xs w-fit`}>
                                      {appointment.status}
                                    </Badge>
                                    <div className="flex items-center text-slate-300 text-sm">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-white font-semibold mb-2 text-sm sm:text-base">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                    <span className="truncate">{appointment.customer_name}</span>
                                  </div>
                                  <div className="text-slate-300 mb-1 text-sm">
                                    Service: <span className="truncate">{appointment.service?.name}</span>
                                    {appointment.service?.duration_minutes && (
                                      <span className="text-slate-400 ml-2">
                                        ({appointment.service.duration_minutes} min)
                                      </span>
                                    )}
                                  </div>
                                  {appointment.staff && (
                                    <div className="text-slate-400 text-sm">
                                      Staff: {appointment.staff.name}
                                    </div>
                                  )}
                                  {appointment.notes && (
                                    <div className="text-slate-400 text-sm mt-2 italic">
                                      "{appointment.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {/* Month View */}
                  {viewMode === 'month' && (
                    <div className="text-center py-8 sm:py-12">
                      <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Month View</h3>
                      <p className="text-slate-400 text-sm sm:text-base">Month view coming soon. Use day or week view for now.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
