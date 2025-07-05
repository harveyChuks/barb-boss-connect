
import { useState, useEffect } from "react";
import { Calendar, Users, Scissors, Clock, Plus, Search, LogOut, Building, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden text-white">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-slate-900 border-slate-700">
        <div className="flex flex-col space-y-4 pt-8">
          {isAuthenticated ? (
            <>
              {userBusiness ? (
                <>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="outline" 
                    className="justify-start"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => setShowAppointmentModal(true)}
                    className="justify-start"
                    style={{ backgroundColor: '#39FF14', color: 'black' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#32e612';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#39FF14';
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Appointment
                  </Button>
                  <Button 
                    onClick={() => setShowClientModal(true)}
                    variant="outline" 
                    className="justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowBusinessModal(true)}
                  className="justify-start"
                  style={{ backgroundColor: '#39FF14', color: 'black' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#32e612';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#39FF14';
                  }}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Register Business
                </Button>
              )}
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="justify-start"
              style={{ backgroundColor: '#39FF14', color: 'black' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#32e612';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#39FF14';
              }}
            >
              Sign In / Sign Up
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Three glowing colors - purple right, blue middle, light blue left - hidden in light mode */}
      <div className="fixed inset-0 pointer-events-none dark:block hidden">
        {/* Left corner - light blue */}
        <div 
          className="absolute bottom-0 left-0 w-[1000px] h-[1000px] rounded-full opacity-40 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #38b6ff 0%, transparent 70%)',
            transform: 'translate(-50%, 50%)'
          }}
        />
        {/* Middle - blue */}
        <div 
          className="absolute bottom-0 left-1/2 w-[1000px] h-[1000px] rounded-full opacity-35 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #5271ff 0%, transparent 70%)',
            transform: 'translate(-50%, 50%)'
          }}
        />
        {/* Right corner - purple */}
        <div 
          className="absolute bottom-0 right-0 w-[1000px] h-[1000px] rounded-full opacity-40 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #5e17eb 0%, transparent 70%)',
            transform: 'translate(50%, 50%)'
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-slate-700 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/ecb463b2-bc28-446c-8f61-df6f20be56b1.png" 
                alt="BizFlow Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-white">BizFlow</h1>
                {userBusiness && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">{userBusiness.name}</p>
                )}
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {userBusiness ? (
                    <>
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button 
                        onClick={() => setShowAppointmentModal(true)}
                        style={{ backgroundColor: '#39FF14', color: 'black' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#32e612';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#39FF14';
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Appointment
                      </Button>
                      <Button 
                        onClick={() => setShowClientModal(true)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Client
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setShowBusinessModal(true)}
                      style={{ backgroundColor: '#39FF14', color: 'black' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#32e612';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#39FF14';
                      }}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Register Business
                    </Button>
                  )}
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  style={{ backgroundColor: '#39FF14', color: 'black' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#32e612';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#39FF14';
                  }}
                >
                  Sign In / Sign Up
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <img 
              src="/lovable-uploads/ecb463b2-bc28-446c-8f61-df6f20be56b1.png" 
              alt="BizFlow Logo" 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg mx-auto mb-6"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Welcome to BizFlow</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto px-4">
              The complete business management platform for service-based businesses. 
              Manage appointments, track analytics, and grow your business efficiently.
            </p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="text-lg px-8 py-3"
              style={{ backgroundColor: '#39FF14', color: 'black' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#32e612';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#39FF14';
              }}
            >
              Get Started
            </Button>
          </div>
        ) : !userBusiness ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6" style={{ color: '#39FF14' }} />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Set Up Your Business</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto px-4">
              Complete your business registration with our step-by-step process to start accepting bookings.
            </p>
            <Button 
              onClick={() => setShowBusinessModal(true)}
              className="text-lg px-8 py-3"
              style={{ backgroundColor: '#39FF14', color: 'black' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#32e612';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#39FF14';
              }}
            >
              <Building className="w-5 h-5 mr-2" />
              Complete Registration
            </Button>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-card border-border hover:bg-accent transition-colors">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs sm:text-sm font-medium">Today's Appointments</p>
                      <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:bg-accent transition-colors">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs sm:text-sm font-medium">Total Clients</p>
                      <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.totalClients}</p>
                    </div>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:bg-accent transition-colors">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs sm:text-sm font-medium">This Week</p>
                      <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.weeklyAppointments}</p>
                    </div>
                    <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:bg-accent transition-colors">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs sm:text-sm font-medium">Revenue Today</p>
                      <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">${stats.todayRevenue}</p>
                    </div>
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-6 sm:mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-foreground text-lg sm:text-xl">Quick Actions</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm sm:text-base">
                    Access your most used features or visit the full dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="h-12 sm:h-16 text-sm sm:text-lg"
                      style={{ backgroundColor: '#39FF14', color: 'black' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#32e612';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#39FF14';
                      }}
                    >
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Full Dashboard
                    </Button>
                    <Button 
                      onClick={() => setShowAppointmentModal(true)}
                      variant="outline"
                      className="h-12 sm:h-16 text-sm sm:text-lg"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Book Appointment
                    </Button>
                    <Button 
                      onClick={() => setShowClientModal(true)}
                      variant="outline"
                      className="h-12 sm:h-16 text-sm sm:text-lg"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Today's Appointments */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: '#39FF14' }} />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {todayAppointments.length} appointments scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {todayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm sm:text-base truncate">{appointment.customer_name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{appointment.services?.name || 'Service'}</p>
                          </div>
                          <Badge variant="outline" className="text-xs sm:text-sm ml-2 flex-shrink-0" style={{ borderColor: '#39FF14', color: '#39FF14' }}>
                            {appointment.start_time}
                          </Badge>
                        </div>
                      ))}
                      {todayAppointments.length > 3 && (
                          <Button
                            onClick={() => navigate('/dashboard')}
                            variant="outline"
                            className="w-full text-sm sm:text-base"
                          >
                            View All ({todayAppointments.length})
                          </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm sm:text-base">No appointments for today</p>
                      <Button
                        onClick={() => setShowAppointmentModal(true)}
                        className="mt-4 text-sm sm:text-base"
                        style={{ backgroundColor: '#39FF14', color: 'black' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#32e612';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#39FF14';
                        }}
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Clients */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" style={{ color: '#39FF14' }} />
                    Recent Clients
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    Your client database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-input border-border text-foreground placeholder-muted-foreground text-sm sm:text-base"
                      />
                    </div>
                    {filteredClients.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {filteredClients.slice(0, 4).map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-2 sm:p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm sm:text-base truncate">{client.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{client.phone}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                              Recent
                            </Badge>
                          </div>
                        ))}
                        <Button
                          onClick={() => navigate('/dashboard')}
                          variant="outline"
                          className="w-full text-sm sm:text-base"
                        >
                          View All Clients
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {searchTerm ? "No clients match your search" : "No clients yet"}
                        </p>
                        {!searchTerm && (
                          <Button
                            onClick={() => setShowClientModal(true)}
                            className="mt-4 text-sm sm:text-base"
                            style={{ backgroundColor: '#39FF14', color: 'black' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#32e612';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#39FF14';
                            }}
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
