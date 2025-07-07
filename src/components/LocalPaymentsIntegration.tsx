import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, DollarSign, Settings, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocalPaymentsIntegrationProps {
  businessId: string;
}

const LocalPaymentsIntegration = ({ businessId }: LocalPaymentsIntegrationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    payments_enabled: false,
    default_currency: "USD",
    deposit_required: true,
    deposit_percentage: 50,
    // M-Pesa (Kenya/Tanzania)
    mpesa_enabled: false,
    mpesa_shortcode: "",
    mpesa_passkey: "",
    // Paystack (Nigeria/Ghana/South Africa)
    paystack_enabled: false,
    paystack_public_key: "",
    paystack_secret_key: "",
    // Flutterwave (Multi-country)
    flutterwave_enabled: false,
    flutterwave_public_key: "",
    flutterwave_secret_key: "",
    // MTN Mobile Money (Uganda/Ghana/etc)
    mtn_momo_enabled: false,
    mtn_momo_api_key: "",
    mtn_momo_user_id: "",
    // Airtel Money
    airtel_money_enabled: false,
    airtel_money_client_id: "",
    airtel_money_secret: ""
  });

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '📱',
      description: 'Kenya, Tanzania mobile payments',
      countries: ['Kenya', 'Tanzania'],
      enabled: settings.mpesa_enabled,
      fields: ['mpesa_shortcode', 'mpesa_passkey']
    },
    {
      id: 'paystack',
      name: 'Paystack',
      icon: '💳',
      description: 'Cards, Bank transfers, USSD',
      countries: ['Nigeria', 'Ghana', 'South Africa'],
      enabled: settings.paystack_enabled,
      fields: ['paystack_public_key', 'paystack_secret_key']
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      icon: '🌊',
      description: 'Multi-country payments',
      countries: ['Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Rwanda'],
      enabled: settings.flutterwave_enabled,
      fields: ['flutterwave_public_key', 'flutterwave_secret_key']
    },
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      icon: '📱',
      description: 'MTN MoMo payments',
      countries: ['Uganda', 'Ghana', 'Cameroon'],
      enabled: settings.mtn_momo_enabled,
      fields: ['mtn_momo_api_key', 'mtn_momo_user_id']
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      icon: '📱',
      description: 'Airtel mobile payments',
      countries: ['Uganda', 'Tanzania', 'Zambia'],
      enabled: settings.airtel_money_enabled,
      fields: ['airtel_money_client_id', 'airtel_money_secret']
    }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'UGX' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];

  useEffect(() => {
    fetchPaymentSettings();
  }, [businessId]);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('payment_settings')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      if (data?.payment_settings) {
        setSettings(prev => ({
          ...prev,
          ...data.payment_settings
        }));
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          payment_settings: settings
        })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Payment Settings Saved",
        description: "Your payment integration settings have been updated successfully.",
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

  const togglePaymentMethod = (methodId: string) => {
    const enabledKey = `${methodId}_enabled` as keyof typeof settings;
    setSettings(prev => ({
      ...prev,
      [enabledKey]: !prev[enabledKey]
    }));
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEnabledMethodsCount = () => {
    return paymentMethods.filter(method => method.enabled).length;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-green-600" />
            Local Payments Integration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Accept payments from your customers using popular African payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Enable Online Payments</Label>
                <p className="text-sm text-muted-foreground">Allow customers to pay deposits online when booking</p>
              </div>
              <Switch
                checked={settings.payments_enabled}
                onCheckedChange={(checked) => updateSetting('payments_enabled', checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={settings.default_currency} onValueChange={(value) => updateSetting('default_currency', value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit_percentage">Deposit Percentage</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="deposit_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.deposit_percentage}
                    onChange={(e) => updateSetting('deposit_percentage', parseInt(e.target.value) || 0)}
                    className="bg-input border-border text-foreground"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of service price required as deposit
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Require Deposit</Label>
                <p className="text-sm text-muted-foreground">Require customers to pay a deposit when booking</p>
              </div>
              <Switch
                checked={settings.deposit_required}
                onCheckedChange={(checked) => updateSetting('deposit_required', checked)}
              />
            </div>
          </div>

          {/* Payment Methods Status */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-foreground font-medium">Payment Methods Status</h3>
              <Badge variant={getEnabledMethodsCount() > 0 ? "default" : "secondary"}>
                {getEnabledMethodsCount()} of {paymentMethods.length} enabled
              </Badge>
            </div>
            {getEnabledMethodsCount() === 0 && (
              <div className="flex items-center text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                No payment methods enabled. Enable at least one to accept online payments.
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-foreground font-medium flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Payment Methods
            </h3>
            
            {paymentMethods.map((method) => (
              <Card key={method.id} className={`border ${method.enabled ? 'border-primary' : 'border-border'}`}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Method Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="text-foreground font-medium">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {method.countries.map((country) => (
                              <Badge key={country} variant="outline" className="text-xs">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => togglePaymentMethod(method.id)}
                      />
                    </div>

                    {/* Configuration Fields */}
                    {method.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border">
                        {method.fields.map((field) => (
                          <div key={field} className="space-y-1">
                            <Label className="text-sm">
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            <Input
                              value={settings[field as keyof typeof settings] as string}
                              onChange={(e) => updateSetting(field as keyof typeof settings, e.target.value)}
                              className="bg-input border-border text-foreground text-sm"
                              placeholder={field.includes('secret') || field.includes('key') ? '••••••••••••••••' : ''}
                              type={field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Guide */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h4 className="text-foreground font-medium mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                Integration Guide
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• M-Pesa: Get shortcode and passkey from Safaricom developer portal</li>
                <li>• Paystack: Create account at paystack.com and get API keys</li>
                <li>• Flutterwave: Sign up at flutterwave.com for multi-country support</li>
                <li>• MTN MoMo: Apply for API access through MTN developer portal</li>
                <li>• Airtel Money: Contact Airtel Business for API credentials</li>
              </ul>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
          >
            {loading ? "Saving..." : "Save Payment Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalPaymentsIntegration;