
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Bell, CreditCard, Users, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BusinessHoursManagement from "./BusinessHoursManagement";
import ThemeSettings from "./ThemeSettings";
import WhatsAppIntegration from "./WhatsAppIntegration";
import LocalPaymentsIntegration from "./LocalPaymentsIntegration";
import OfflineCapabilities from "./OfflineCapabilities";
import SubscriptionManager from "./SubscriptionManager";
import LanguageSelector from "./LanguageSelector";

const SettingsSection = () => {
  const { t } = useLanguage();
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
  
  const settingsCategories = [
    {
      title: t('settings.account'),
      description: "Manage your account preferences and security",
      icon: Shield,
      status: t('settings.comingSoon'),
      items: [
        "Change password",
        "Two-factor authentication",
        "Login history",
        "Account deletion"
      ]
    },
    {
      title: t('settings.notifications'),
      description: "Configure how you receive notifications",
      icon: Bell,
      status: t('settings.comingSoon'),
      items: [
        "Email notifications",
        "SMS alerts",
        "Push notifications",
        "Reminder settings"
      ]
    },
    {
      title: t('settings.billing'),
      description: "Manage your subscription and payment methods",
      icon: CreditCard,
      status: t('settings.comingSoon'),
      items: [
        "Subscription plan",
        "Payment methods",
        "Billing history",
        "Invoice settings"
      ]
    },
    {
      title: t('settings.staff'),
      description: "Manage team members and permissions",
      icon: Users,
      status: t('settings.comingSoon'),
      items: [
        "Add staff members",
        "Role permissions",
        "Schedule management",
        "Performance tracking"
      ]
    },
    {
      title: t('settings.advanced'),
      description: "API access and advanced configurations",
      icon: Settings,
      status: t('settings.comingSoon'),
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

      {/* Language Settings - Active Feature */}
      <LanguageSelector />

      {/* Theme Settings - Active Feature */}
      <ThemeSettings />

      {/* Business Hours Management - Active Feature */}
      <BusinessHoursManagement />

      {/* WhatsApp Integration - Active Feature */}
      <WhatsAppIntegration />

      {/* Local Payments Integration - Active Feature */}
      <LocalPaymentsIntegration />

      {/* Offline Capabilities - Active Feature */}
      <OfflineCapabilities />

      {/* Subscription Management - Active Feature */}
      <SubscriptionManager businessId={userBusiness?.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary [.light_&]:text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary text-primary [.light_&]:border-green-500 [.light_&]:text-green-500">
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
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('settings.moreFeatures')}</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t('settings.moreDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-blue-400 text-blue-400">Enhanced Security</Badge>
            <Badge variant="outline" className="border-green-400 text-green-400">Team Management</Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-400">Custom Integrations</Badge>
            <Badge variant="outline" className="border-[#39FF14] text-[#39FF14] [.light_&]:border-green-500 [.light_&]:text-green-500">Advanced Analytics</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;
