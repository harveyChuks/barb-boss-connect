
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AppointmentModal from "./AppointmentModal";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  service: {
    name: string;
    price: number;
  };
  staff?: {
    name: string;
  };
}

interface Business {
  id: string;
  name: string;
  business_type: string;
}

const BusinessDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const fetchBusinessData = async () => {
    if (!user) return;

    try {
      // Fetch business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, business_type')
        .eq('owner_id', user.id)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch appointments with service and staff info
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          customer_name,
          customer_phone,
          customer_email,
          appointment_date,
          start_time,
          end_time,
          status,
          notes,
          services (name, price),
          staff (name)
        `)
        .eq('business_id', businessData.id)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      const formattedAppointments = appointmentsData.map(apt => ({
        ...apt,
        service: apt.services,
        staff: apt.staff
      }));

      setAppointments(formattedAppointments);
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

  useEffect(() => {
    fetchBusinessData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'no_show': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return <div className="p-6 text-white">Loading dashboard...</div>;
  }

  if (!business) {
    return (
      <div className="p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">No Business Found</h2>
        <p className="text-slate-400">Please register your business first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{business.name}</h1>
          <p className="text-slate-400 capitalize">{business.business_type.replace('_', ' ')}</p>
        </div>
        <Button
          onClick={() => setShowAppointmentModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {appointments.filter(apt => 
                apt.appointment_date === new Date().toISOString().split('T')[0]
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {appointments.filter(apt => apt.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {appointments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Appointments</CardTitle>
          <CardDescription className="text-slate-400">
            Manage your upcoming and recent appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No appointments yet</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 10).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-white">{formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-white">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-white font-medium">{appointment.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400 text-sm">{appointment.customer_phone}</span>
                      </div>
                      <div className="text-amber-500 text-sm font-medium">
                        {appointment.service.name} - ${appointment.service.price}
                      </div>
                    </div>
                    
                    <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
        businessId={business.id}
        onAppointmentCreated={fetchBusinessData}
      />
    </div>
  );
};

export default BusinessDashboard;
