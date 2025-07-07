import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Phone, Send, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppIntegrationProps {
  businessId: string;
}

const WhatsAppIntegration = ({ businessId }: WhatsAppIntegrationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    whatsapp_number: "",
    whatsapp_enabled: false,
    auto_confirmations: true,
    reminder_24h: true,
    reminder_2h: true,
    booking_confirmation_template: "Hi {{customer_name}}! Your appointment for {{service_name}} is confirmed for {{date}} at {{time}}. See you soon! 📅✨",
    reminder_template: "Hi {{customer_name}}! Reminder: Your {{service_name}} appointment is tomorrow at {{time}}. Looking forward to seeing you! 💫",
    booking_link_template: "Book your appointment easily: {{booking_link}} 📱"
  });

  useEffect(() => {
    fetchWhatsAppSettings();
  }, [businessId]);

  const fetchWhatsAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('whatsapp_number, whatsapp_enabled, whatsapp_settings')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(prev => ({
          ...prev,
          whatsapp_number: data.whatsapp_number || "",
          whatsapp_enabled: data.whatsapp_enabled || false,
          ...(data.whatsapp_settings || {})
        }));
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          whatsapp_number: settings.whatsapp_number,
          whatsapp_enabled: settings.whatsapp_enabled,
          whatsapp_settings: {
            auto_confirmations: settings.auto_confirmations,
            reminder_24h: settings.reminder_24h,
            reminder_2h: settings.reminder_2h,
            booking_confirmation_template: settings.booking_confirmation_template,
            reminder_template: settings.reminder_template,
            booking_link_template: settings.booking_link_template
          }
        })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "WhatsApp Settings Saved",
        description: "Your WhatsApp integration settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = () => {
    if (!settings.whatsapp_number) {
      toast({
        title: "Add WhatsApp Number",
        description: "Please add your WhatsApp business number first.",
        variant: "destructive",
      });
      return;
    }

    const testMessage = encodeURIComponent("Test message from BizFlow! Your WhatsApp integration is working. 🎉");
    const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${testMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateBookingLink = () => {
    const businessLink = window.location.origin + "/book/your-business-link"; // This would be dynamic
    const message = settings.booking_link_template.replace('{{booking_link}}', businessLink);
    return encodeURIComponent(message);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp Business Integration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Connect WhatsApp to send automated booking confirmations and reminders to your clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Enable WhatsApp Integration</Label>
                <p className="text-sm text-muted-foreground">Automatically send messages for bookings and reminders</p>
              </div>
              <Switch
                checked={settings.whatsapp_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, whatsapp_enabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Business Number</Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="+1234567890"
                  className="bg-input border-border text-foreground"
                />
                <Button
                  onClick={sendTestMessage}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US, +234 for Nigeria, +254 for Kenya)
              </p>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Automation Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Auto-Confirmations</Label>
                  <p className="text-xs text-muted-foreground">Send booking confirmations instantly</p>
                </div>
                <Switch
                  checked={settings.auto_confirmations}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_confirmations: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">24H Reminders</Label>
                  <p className="text-xs text-muted-foreground">Send reminder 24 hours before</p>
                </div>
                <Switch
                  checked={settings.reminder_24h}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_24h: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">2H Reminders</Label>
                  <p className="text-xs text-muted-foreground">Send reminder 2 hours before</p>
                </div>
                <Switch
                  checked={settings.reminder_2h}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reminder_2h: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Message Templates */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium">Message Templates</h3>
            <p className="text-sm text-muted-foreground">
              Customize your automated messages. Use these variables: {{customer_name}}, {{service_name}}, {{date}}, {{time}}, {{booking_link}}
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking_confirmation">Booking Confirmation</Label>
                <Textarea
                  id="booking_confirmation"
                  value={settings.booking_confirmation_template}
                  onChange={(e) => setSettings(prev => ({ ...prev, booking_confirmation_template: e.target.value }))}
                  className="bg-input border-border text-foreground"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_template">Appointment Reminder</Label>
                <Textarea
                  id="reminder_template"
                  value={settings.reminder_template}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminder_template: e.target.value }))}
                  className="bg-input border-border text-foreground"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_link_template">Booking Link Share</Label>
                <Textarea
                  id="booking_link_template"
                  value={settings.booking_link_template}
                  onChange={(e) => setSettings(prev => ({ ...prev, booking_link_template: e.target.value }))}
                  className="bg-input border-border text-foreground"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Saving..." : "Save Settings"}
              </Button>
              
              <Button
                onClick={() => {
                  const message = generateBookingLink();
                  const whatsappUrl = `https://wa.me/?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share Booking Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;