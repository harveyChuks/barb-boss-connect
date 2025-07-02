
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Mail, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string;
  services: {
    name: string;
    price: number;
  };
}

const BookingsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      // Get user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) return;

      // Get appointments with service details
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            price
          )
        `)
        .eq('business_id', business.id)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.customer_phone.includes(searchTerm) ||
        appointment.services.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(appointment => {
            const appDate = new Date(appointment.appointment_date);
            return appDate.toDateString() === today.toDateString();
          });
          break;
        case "upcoming":
          filtered = filtered.filter(appointment => {
            const appDate = new Date(appointment.appointment_date);
            return appDate >= today;
          });
          break;
        case "past":
          filtered = filtered.filter(appointment => {
            const appDate = new Date(appointment.appointment_date);
            return appDate < today;
          });
          break;
      }
    }

    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Appointment status updated to ${newStatus}`,
      });

      fetchAppointments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      case "no_show":
        return "bg-gray-600 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-slate-50 border-slate-200 animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bookings Management</h2>
        <p className="text-slate-600">View and manage all your appointments</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-300 text-slate-800"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-300">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-300">
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-slate-600 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredAppointments.length} of {appointments.length} appointments
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800">{appointment.customer_name}</span>
                    </div>
                    <Badge className={getStatusBadgeColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{appointment.customer_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[#39FF14] font-semibold">
                      {appointment.services.name} - ${appointment.services.price}
                    </div>
                    {appointment.customer_email && (
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <Mail className="w-3 h-3" />
                        <span>{appointment.customer_email}</span>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className="text-sm text-slate-600">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Select
                    value={appointment.status}
                    onValueChange={(value: AppointmentStatus) => updateAppointmentStatus(appointment.id, value)}
                  >
                    <SelectTrigger className="bg-white border-slate-300 text-slate-800 min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-300">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAppointments.length === 0 && !loading && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No appointments found</p>
            <p className="text-sm text-slate-500">
              {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Your appointments will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingsManagement;
