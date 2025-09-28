
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, User, Scissors, Calendar, Settings, ArrowLeft, Users, Camera, TrendingUp, MessageCircle, CreditCard, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import StatisticsOverview from "@/components/StatisticsOverview";
import ProfileManagement from "@/components/ProfileManagement";
import ServicesManagement from "@/components/ServicesManagement";
import BookingsManagement from "@/components/BookingsManagement";
import SettingsSection from "@/components/SettingsSection";
import StaffManagement from "@/components/StaffManagement";
import CalendarView from "@/components/CalendarView";
import WorkPicturesManagement from "@/components/WorkPicturesManagement";
import ReportsAnalytics from "@/components/ReportsAnalytics";
import WhatsAppIntegration from "@/components/WhatsAppIntegration";
import LocalPaymentsIntegration from "@/components/LocalPaymentsIntegration";
import SubscriptionBlocker from "@/components/SubscriptionBlocker";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userBusiness, setUserBusiness] = useState<any>(null);
  
  // Get user business data
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();
        
      setUserBusiness(data);
    };
    
    fetchBusiness();
  }, [user]);

  const { subscription, isExpired, loading: subLoading } = useSubscription(userBusiness?.id);

  if (subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  // Block access if subscription is expired
  if (isExpired) {
    return (
      <SubscriptionBlocker 
        subscription={subscription}
        onUpgrade={() => setActiveTab("subscription")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pb-20 md:pb-6">
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-1" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === "bookings" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 mb-1" />
            <span>Bookings</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === "services" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Scissors className="w-4 h-4 mb-1" />
            <span>Services</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 mb-1" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
              activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Settings className="w-4 h-4 mb-1" />
            <span>Settings</span>
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Business Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Manage your business operations and track performance</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted self-start sm:self-auto w-fit h-7 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span>Home</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex bg-card border-border min-w-max w-full gap-1">
              <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Scissors className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Services</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Staff</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2 text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <StatisticsOverview />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsAnalytics />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement />
          </TabsContent>

          <TabsContent value="portfolio">
            <WorkPicturesManagement />
          </TabsContent>

          <TabsContent value="staff">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="whatsapp">
            <WhatsAppIntegration />
          </TabsContent>

          <TabsContent value="payments">
            <LocalPaymentsIntegration />
          </TabsContent>


          <TabsContent value="settings">
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
