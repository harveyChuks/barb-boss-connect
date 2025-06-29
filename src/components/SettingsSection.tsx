
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Clock, CreditCard, Bell } from "lucide-react";
import BusinessHoursManagement from "./BusinessHoursManagement";

const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400">Manage your business settings and preferences</p>
      </div>

      <Tabs defaultValue="hours" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
          <TabsTrigger value="hours" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Clock className="w-4 h-4" />
            <span>Business Hours</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <CreditCard className="w-4 h-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center space-x-2 text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Settings className="w-4 h-4" />
            <span>General</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <BusinessHoursManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure payment methods and processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Payment integration coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                General business settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsSection;
