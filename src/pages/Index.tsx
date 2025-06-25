import { useState, useEffect } from "react";
import { Calendar, Users, Scissors, Clock, Plus, Search, LogOut, Building, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ClientModal from "@/components/ClientModal";
import AppointmentModal from "@/components/AppointmentModal";
import AuthModal from "@/components/auth/AuthModal";
import MultiStepRegistrationModal from "@/components/business/MultiStepRegistrationModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userBusiness, setUserBusiness] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    weeklyAppointments: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchUserBusiness = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserBusiness(data);
    } catch (error: any) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!userBusiness) return;

    setLoading(true);
    try {
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name
          )
        `)
        .eq('business_id', userBusiness.id)
        .eq('appointment_date', today);

      setTodayAppointments(appointments || []);

      // Fetch recent clients
      const { data: clients } = await supabase
        .from('customers')
        .select('*')
        .limit(4);

      setRecentClients(clients || []);

      // Calculate stats
      const totalClients = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Calculate weekly appointments (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weeklyAppointments = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', userBusiness.id)
        .gte('appointment_date', sevenDaysAgo);

      // Calculate today's revenue (mock data for now)
      const todayRevenue = 480;

      setStats({
        todayAppointments: appointments?.length || 0,
        totalClients: totalClients.count || 0,
        weeklyAppointments: weeklyAppointments.count || 0,
        todayRevenue: todayRevenue || 0
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
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
    if (isAuthenticated) {
      fetchUserBusiness();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (userBusiness) {
      fetchDashboardData();
    }
  }, [userBusiness]);

  const filteredClients = recentClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignOut = async () => {
    await signOut();
    setUserBusiness(null);
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const handleAuthSuccess = () => {
    fetchUserBusiness();
  };

  const handleBusinessCreated = () => {
    fetchUserBusiness();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">BarbS</h1>
                {userBusiness && (
                  <p className="text-xs text-slate-400">{userBusiness.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {userBusiness ? (
                    <>
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        variant="outline" 
                        className="border-slate-600 text-white hover:bg-slate-800"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button 
                        onClick={() => setShowAppointmentModal(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-black"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Appointment
                      </Button>
                      <Button 
                        onClick={() => setShowClientModal(true)}
                        variant="outline" 
                        className="border-slate-600 text-white hover:bg-slate-800"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Client
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setShowBusinessModal(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Register Business
                    </Button>
                  )}
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="border-slate-600 text-white hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  Sign In / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to BarbS</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              The ultimate booking platform for barbershops, salons, and beauty professionals. 
              Manage your business, accept bookings, and grow your clientele.
            </p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8 py-3"
            >
              Get Started
            </Button>
          </div>
        ) : !userBusiness ? (
          <div className="text-center py-12">
            <Building className="w-20 h-20 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Set Up Your Business</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Complete your business registration with our step-by-step process to start accepting bookings.
            </p>
            <Button 
              onClick={() => setShowBusinessModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8 py-3"
            >
              <Building className="w-5 h-5 mr-2" />
              Complete Registration
            </Button>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Today's Appointments</p>
                      <p className="text-3xl font-bold text-white mt-2">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                      <p className="text-3xl font-bold text-white mt-2">{stats.totalClients}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">This Week</p>
                      <p className="text-3xl font-bold text-white mt-2">{stats.weeklyAppointments}</p>
                    </div>
                    <Scissors className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Revenue Today</p>
                      <p className="text-3xl font-bold text-white mt-2">${stats.todayRevenue}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Access your most used features or visit the full dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-amber-500 hover:bg-amber-600 text-black h-16 text-lg"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Full Dashboard
                    </Button>
                    <Button 
                      onClick={() => setShowAppointmentModal(true)}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700 h-16 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Book Appointment
                    </Button>
                    <Button 
                      onClick={() => setShowClientModal(true)}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700 h-16 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Appointments */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-amber-400" />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {todayAppointments.length} appointments scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {todayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white">{appointment.customer_name}</p>
                            <p className="text-sm text-slate-400">{appointment.services?.name || 'Service'}</p>
                          </div>
                          <Badge variant="outline" className="border-amber-400 text-amber-400">
                            {appointment.start_time}
                          </Badge>
                        </div>
                      ))}
                      {todayAppointments.length > 3 && (
                        <Button
                          onClick={() => navigate('/dashboard')}
                          variant="outline"
                          className="w-full border-slate-600 text-white hover:bg-slate-700"
                        >
                          View All ({todayAppointments.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">No appointments for today</p>
                      <Button
                        onClick={() => setShowAppointmentModal(true)}
                        className="mt-4 bg-amber-500 hover:bg-amber-600 text-black"
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Clients */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-amber-400" />
                    Recent Clients
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Your client database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    {filteredClients.length > 0 ? (
                      <div className="space-y-3">
                        {filteredClients.slice(0, 4).map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors cursor-pointer"
                          >
                            <div>
                              <p className="font-medium text-white">{client.name}</p>
                              <p className="text-sm text-slate-400">{client.phone}</p>
                            </div>
                            <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                              Recent
                            </Badge>
                          </div>
                        ))}
                        <Button
                          onClick={() => navigate('/dashboard')}
                          variant="outline"
                          className="w-full border-slate-600 text-white hover:bg-slate-700"
                        >
                          View All Clients
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">
                          {searchTerm ? "No clients match your search" : "No clients yet"}
                        </p>
                        {!searchTerm && (
                          <Button
                            onClick={() => setShowClientModal(true)}
                            className="mt-4 bg-amber-500 hover:bg-amber-600 text-black"
                          >
                            Add First Client
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <ClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal}
        onClientAdded={() => {
          fetchUserBusiness();
          fetchDashboardData();
        }}
      />
      <AppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal}
        onAppointmentCreated={() => {
          fetchDashboardData();
        }}
      />
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
      <MultiStepRegistrationModal 
        open={showBusinessModal} 
        onOpenChange={setShowBusinessModal}
        onBusinessCreated={handleBusinessCreated}
      />
    </div>
  );
};

export default Index;
