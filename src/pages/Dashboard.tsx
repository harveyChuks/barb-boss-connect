
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Business Dashboard</h1>
            <p className="text-slate-400">Manage your business operations and track performance</p>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

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
