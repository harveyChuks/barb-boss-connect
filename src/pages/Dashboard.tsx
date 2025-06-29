import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, User, Scissors, Calendar, Settings, ArrowLeft, Users, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatisticsOverview from "@/components/StatisticsOverview";
import ProfileManagement from "@/components/ProfileManagement";
import ServicesManagement from "@/components/ServicesManagement";
import BookingsManagement from "@/components/BookingsManagement";
import SettingsSection from "@/components/SettingsSection";
import StaffManagement from "@/components/StaffManagement";
import CalendarView from "@/components/CalendarView";
import WorkPicturesManagement from "@/components/WorkPicturesManagement";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Business Dashboard</h1>
              <p className="text-slate-400 text-sm sm:text-base">Manage your business operations and track performance</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="border-slate-600 text-white hover:bg-slate-800 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-4 sm:grid-cols-8 bg-slate-800 border-slate-700 min-w-max w-full">
              <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <User className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <Scissors className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Services</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <Camera className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <Users className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Staff</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <Calendar className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <Calendar className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black px-2 sm:px-3">
                <Settings className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <StatisticsOverview />
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

          <TabsContent value="settings">
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
