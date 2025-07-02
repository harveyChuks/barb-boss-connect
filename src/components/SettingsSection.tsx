
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Bell, CreditCard, Users, Calendar } from "lucide-react";
import BusinessHoursManagement from "./BusinessHoursManagement";
import ThemeSettings from "./ThemeSettings";

const SettingsSection = () => {
  const settingsCategories = [
    {
      title: "Account Settings",
      description: "Manage your account preferences and security",
      icon: Shield,
      status: "Coming Soon",
      items: [
        "Change password",
        "Two-factor authentication",
        "Login history",
        "Account deletion"
      ]
    },
    {
      title: "Notification Settings",
      description: "Configure how you receive notifications",
      icon: Bell,
      status: "Coming Soon",
      items: [
        "Email notifications",
        "SMS alerts",
        "Push notifications",
        "Reminder settings"
      ]
    },
    {
      title: "Billing & Payments",
      description: "Manage your subscription and payment methods",
      icon: CreditCard,
      status: "Coming Soon",
      items: [
        "Subscription plan",
        "Payment methods",
        "Billing history",
        "Invoice settings"
      ]
    },
    {
      title: "Staff Management",
      description: "Manage team members and permissions",
      icon: Users,
      status: "Coming Soon",
      items: [
        "Add staff members",
        "Role permissions",
        "Schedule management",
        "Performance tracking"
      ]
    },
    {
      title: "Advanced Settings",
      description: "API access and advanced configurations",
      icon: Settings,
      status: "Coming Soon",
      items: [
        "API keys",
        "Webhook settings",
        "Data export",
        "Integration settings"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account and business preferences</p>
      </div>

      {/* Theme Settings - Active Feature */}
      <ThemeSettings />

      {/* Business Hours Management - Active Feature */}
      <BusinessHoursManagement />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  {category.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-muted-foreground flex items-center">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-4 border-border text-muted-foreground hover:bg-muted"
                disabled
              >
                Configure
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">More Settings Coming Soon</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            We're working on bringing you more comprehensive settings to customize your BarbS experience. 
            These features will be available in upcoming updates.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-blue-400 text-blue-400">Enhanced Security</Badge>
            <Badge variant="outline" className="border-green-400 text-green-400">Team Management</Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-400">Custom Integrations</Badge>
            <Badge variant="outline" className="border-orange-400 text-orange-400">Advanced Analytics</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
