
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay, addDays, subDays } from "date-fns";

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
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

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
          services!inner(name, duration_minutes),
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
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-slate-500';
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
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendar View</h2>
          <p className="text-slate-400">Manage your appointments by date</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
            className="text-black bg-amber-500 hover:bg-amber-600"
          >
            Day
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Picker */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border border-slate-700"
            />
          </CardContent>
        </Card>

        {/* Day View */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <div className="flex items-center space-x-2">
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
                    className="border-slate-600 text-white hover:bg-slate-700"
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
              <CardDescription className="text-slate-400">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-slate-400">Loading appointments...</div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Appointments</h3>
                  <p className="text-slate-400">No appointments scheduled for this date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                                {appointment.status}
                              </Badge>
                              <div className="flex items-center text-slate-300">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center text-white">
                                <User className="w-4 h-4 mr-2" />
                                {appointment.customer_name}
                              </div>
                              <div className="text-slate-400">
                                {appointment.customer_phone}
                              </div>
                            </div>
                            <div className="text-slate-300 mb-1">
                              Service: {appointment.service?.name}
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
                              <div className="text-slate-400 text-sm mt-2">
                                Notes: {appointment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
