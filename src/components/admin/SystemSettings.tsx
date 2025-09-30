import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Database, Mail, Bell, Globe, Server, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_businesses_per_user: number;
  default_trial_days: number;
  support_email: string;
  platform_name: string;
  platform_description: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  backup_enabled: boolean;
  backup_frequency: string;
}

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    registration_enabled: true,
    max_businesses_per_user: 5,
    default_trial_days: 90,
    support_email: 'support@bizflow.com',
    platform_name: 'BizFlow',
    platform_description: 'Business appointment booking platform',
    email_notifications: true,
    sms_notifications: false,
    backup_enabled: true,
    backup_frequency: 'daily'
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // In a real implementation, you'd save these settings to a system_settings table
      // For now, we'll just show a success message
      toast({
        title: "Settings Saved",
        description: `${section} settings have been updated successfully`
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Manage platform-wide settings and configurations</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          System Active
        </Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={settings.platform_name}
                    onChange={(e) => handleInputChange('platform_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => handleInputChange('support_email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform_description">Platform Description</Label>
                <Textarea
                  id="platform_description"
                  value={settings.platform_description}
                  onChange={(e) => handleInputChange('platform_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_businesses">Max Businesses per User</Label>
                  <Input
                    id="max_businesses"
                    type="number"
                    value={settings.max_businesses_per_user}
                    onChange={(e) => handleInputChange('max_businesses_per_user', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trial_days">Default Trial Days</Label>
                  <Input
                    id="trial_days"
                    type="number"
                    value={settings.default_trial_days}
                    onChange={(e) => handleInputChange('default_trial_days', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow new users to register on the platform
                  </div>
                </div>
                <Switch
                  checked={settings.registration_enabled}
                  onCheckedChange={(checked) => handleInputChange('registration_enabled', checked)}
                />
              </div>

              <Button onClick={() => handleSave('General')} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto logout after 30 minutes of inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">IP Whitelist</h4>
                    <p className="text-sm text-muted-foreground">Restrict admin access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button onClick={() => handleSave('Security')} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system-wide notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </div>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Send SMS notifications (requires SMS provider setup)
                  </div>
                </div>
                <Switch
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
                />
              </div>

              <Button onClick={() => handleSave('Notifications')} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Settings
              </CardTitle>
              <CardDescription>Configure automatic backup and data retention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable automatic database backups
                  </div>
                </div>
                <Switch
                  checked={settings.backup_enabled}
                  onCheckedChange={(checked) => handleInputChange('backup_enabled', checked)}
                />
              </div>

              {settings.backup_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">Backup Frequency</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={settings.backup_frequency}
                    onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Create Manual Backup
                </Button>
                <Button variant="outline" className="w-full">
                  View Backup History
                </Button>
              </div>

              <Button onClick={() => handleSave('Backup')} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Backup Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Maintenance Mode
              </CardTitle>
              <CardDescription>Control platform availability and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Disable platform access for maintenance
                  </div>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                />
              </div>

              {settings.maintenance_mode && (
                <div className="p-4 border rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Platform is in Maintenance Mode
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Users will see a maintenance page and cannot access the platform.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  View System Status Page
                </Button>
                <Button variant="outline" className="w-full">
                  Send Maintenance Notification
                </Button>
              </div>

              <Button 
                onClick={() => handleSave('Maintenance')} 
                disabled={saving} 
                className="w-full"
                variant={settings.maintenance_mode ? "destructive" : "default"}
              >
                {saving ? 'Saving...' : 'Save Maintenance Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};