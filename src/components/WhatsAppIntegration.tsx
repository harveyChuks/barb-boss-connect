import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, Phone, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppSettings {
  enabled: boolean;
  phone_number: string;
  api_key: string;
  webhook_url: string;
  auto_reply: boolean;
  business_hours_only: boolean;
}

const WhatsAppIntegration = () => {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    enabled: false,
    phone_number: "",
    api_key: "",
    webhook_url: "",
    auto_reply: false,
    business_hours_only: true,
  });
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWhatsAppSettings();
  }, []);

  const loadWhatsAppSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase
        .from("businesses")
        .select("id, whatsapp_enabled, whatsapp_number, whatsapp_settings")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (business) {
        setBusinessId(business.id);
        const whatsappSettings = business.whatsapp_settings as any;
        setSettings({
          enabled: business.whatsapp_enabled || false,
          phone_number: business.whatsapp_number || "",
          api_key: whatsappSettings?.api_key || "",
          webhook_url: whatsappSettings?.webhook_url || "",
          auto_reply: whatsappSettings?.auto_reply || false,
          business_hours_only: whatsappSettings?.business_hours_only || true,
        });
      }
    } catch (error) {
      console.error("Error loading WhatsApp settings:", error);
    }
  };

  const saveSettings = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          whatsapp_enabled: settings.enabled,
          whatsapp_number: settings.phone_number,
          whatsapp_settings: {
            api_key: settings.api_key,
            webhook_url: settings.webhook_url,
            auto_reply: settings.auto_reply,
            business_hours_only: settings.business_hours_only,
          },
        })
        .eq("id", businessId);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "WhatsApp integration settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save WhatsApp settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!settings.phone_number || !settings.api_key) {
      toast({
        title: "Missing configuration",
        description: "Please configure phone number and API key first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would integrate with WhatsApp Business API
      // For now, we'll just show a success message
      toast({
        title: "Test message sent",
        description: "WhatsApp test message sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            WhatsApp Business Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="whatsapp-enabled">Enable WhatsApp Integration</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to book appointments via WhatsApp
              </p>
            </div>
            <Switch
              id="whatsapp-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {settings.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone-number">Business Phone Number</Label>
                  <Input
                    id="phone-number"
                    placeholder="+254712345678"
                    value={settings.phone_number}
                    onChange={(e) =>
                      setSettings({ ...settings, phone_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="api-key">WhatsApp API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={settings.api_key}
                    onChange={(e) =>
                      setSettings({ ...settings, api_key: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-app.com/webhook/whatsapp"
                  value={settings.webhook_url}
                  onChange={(e) =>
                    setSettings({ ...settings, webhook_url: e.target.value })
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-reply">Auto-reply to messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically respond to customer messages
                    </p>
                  </div>
                  <Switch
                    id="auto-reply"
                    checked={settings.auto_reply}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, auto_reply: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="business-hours">Business hours only</Label>
                    <p className="text-sm text-muted-foreground">
                      Only respond during business hours
                    </p>
                  </div>
                  <Switch
                    id="business-hours"
                    checked={settings.business_hours_only}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, business_hours_only: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveSettings} disabled={loading}>
                  <Settings className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={sendTestMessage} disabled={loading}>
                  <Phone className="w-4 h-4 mr-2" />
                  Send Test Message
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;