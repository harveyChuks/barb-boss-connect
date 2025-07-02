
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, Phone, Mail, Search, Filter, Plus, Edit, Check, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
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

const BookingsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'cancel' | 'complete'>('confirm');
  const [actionAppointment, setActionAppointment] = useState<Appointment | null>(null);
  const [userBusiness, setUserBusiness] = useState<any>(null);

  useEffect(() => {
    fetchBusinessAndAppointments();
  }, [user]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter, dateFilter]);

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
        
        // Get appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            services:service_id (name, duration_minutes, price),
            staff:staff_id (name, avatar_url)
          `)
          .eq('business_id', business.id)
          .order('appointment_date', { ascending: false })
          .order('start_time', { ascending: true });

        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.customer_phone.includes(searchQuery) ||
        (apt.customer_email && apt.customer_email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === "today") {
      const today = format(now, 'yyyy-MM-dd');
      filtered = filtered.filter(apt => apt.appointment_date === today);
    } else if (dateFilter === "upcoming") {
      const today = format(now, 'yyyy-MM-dd');
      filtered = filtered.filter(apt => apt.appointment_date >= today);
    } else if (dateFilter === "past") {
      const today = format(now, 'yyyy-MM-dd');
      filtered = filtered.filter(apt => apt.appointment_date < today);
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Appointment has been ${newStatus}.`,
      });

      fetchBusinessAndAppointments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (appointment: Appointment, action: 'confirm' | 'cancel' | 'complete') => {
    setActionAppointment(appointment);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (actionAppointment && actionType) {
      handleStatusChange(actionAppointment.id, actionType === 'confirm' ? 'confirmed' : actionType === 'cancel' ? 'cancelled' : 'completed');
    }
    setShowConfirmDialog(false);
    setActionAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'cancelled':
        return <X className="w-3 h-3" />;
      case 'completed':
        return <Check className="w-3 h-3" />;
      case 'no_show':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bookings Management</h2>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        
        <Button
          onClick={() => setShowAppointmentModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, email..."
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Results</label>
              <div className="flex items-center h-10 px-3 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  {filteredAppointments.length} appointments
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {appointments.length === 0 
                  ? "You don't have any appointments yet." 
                  : "No appointments match your current filters."
                }
              </p>
              <Button
                onClick={() => setShowAppointmentModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {appointment.customer_name}
                        </h3>
                        <Badge className={`${getStatusColor(appointment.status)} flex items-center space-x-1`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.start_time} - {appointment.end_time}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{appointment.customer_phone}</span>
                        </div>
                        
                        {appointment.customer_email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{appointment.customer_email}</span>
                          </div>
                        )}
                        
                        {appointment.service && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{appointment.service.name}</span>
                            {appointment.service.price && (
                              <span>(${appointment.service.price})</span>
                            )}
                          </div>
                        )}
                        
                        {appointment.staff && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={appointment.staff.avatar_url || ""} />
                              <AvatarFallback className="text-xs">
                                {appointment.staff.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{appointment.staff.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-foreground">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAppointment(appointment)}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {appointment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(appointment, 'confirm')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                    
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(appointment, 'cancel')}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(appointment, 'complete')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSave={() => {
            fetchBusinessAndAppointments();
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' && 'Confirm Appointment'}
              {actionType === 'cancel' && 'Cancel Appointment'}
              {actionType === 'complete' && 'Complete Appointment'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {actionType === 'confirm' && 'Are you sure you want to confirm this appointment?'}
              {actionType === 'cancel' && 'Are you sure you want to cancel this appointment?'}
              {actionType === 'complete' && 'Are you sure you want to mark this appointment as completed?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={
                actionType === 'cancel' 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }
            >
              {actionType === 'confirm' && 'Confirm'}
              {actionType === 'cancel' && 'Cancel Appointment'}
              {actionType === 'complete' && 'Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsManagement;
