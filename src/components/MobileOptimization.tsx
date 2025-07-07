import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Smartphone, Wifi, Battery, Zap, Download, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileOptimizationProps {
  businessId: string;
}

const MobileOptimization = ({ businessId }: MobileOptimizationProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    pwa_enabled: true,
    offline_mode: true,
    data_saver: true,
    image_compression: true,
    lazy_loading: true,
    quick_booking: true,
    one_tap_booking: false,
    voice_input: false,
    android_priority: true,
    low_bandwidth_mode: true
  });

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<string>('fast');
  const [batteryLevel, setBatteryLevel] = useState<number>(100);

  useEffect(() => {
    // Check if app is installable
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    });

    // Check connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionSpeed(connection.effectiveType || 'fast');
      
      connection.addEventListener('change', () => {
        setConnectionSpeed(connection.effectiveType || 'fast');
      });
    }

    // Check battery level
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    // Register service worker for offline support
    if ('serviceWorker' in navigator && settings.offline_mode) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, [settings.offline_mode]);

  const installApp = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      toast({
        title: "App Installing",
        description: "BizFlow is being added to your home screen.",
      });
    }
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  const optimizationFeatures = [
    {
      id: 'pwa_enabled',
      title: 'Progressive Web App (PWA)',
      description: 'Install app on phone home screen, works like native app',
      icon: <Smartphone className="w-5 h-5" />,
      enabled: settings.pwa_enabled,
      impact: 'High',
      benefit: 'App-like experience, faster loading'
    },
    {
      id: 'offline_mode',
      title: 'Offline Support',
      description: 'View bookings and basic info without internet connection',
      icon: <Wifi className="w-5 h-5" />,
      enabled: settings.offline_mode,
      impact: 'High',
      benefit: 'Works without internet, perfect for rural areas'
    },
    {
      id: 'data_saver',
      title: 'Data Saver Mode',
      description: 'Compress data and reduce bandwidth usage',
      icon: <Zap className="w-5 h-5" />,
      enabled: settings.data_saver,
      impact: 'Medium',
      benefit: 'Saves mobile data costs'
    },
    {
      id: 'image_compression',
      title: 'Smart Image Loading',
      description: 'Automatically compress and optimize images for mobile',
      icon: <Download className="w-5 h-5" />,
      enabled: settings.image_compression,
      impact: 'Medium',
      benefit: 'Faster loading, less data usage'
    },
    {
      id: 'quick_booking',
      title: 'Quick Booking Flow',
      description: 'Streamlined booking process for mobile users',
      icon: <Zap className="w-5 h-5" />,
      enabled: settings.quick_booking,
      impact: 'High',
      benefit: 'Easier bookings on small screens'
    },
    {
      id: 'android_priority',
      title: 'Android Optimization',
      description: 'Optimized specifically for Android devices',
      icon: <Smartphone className="w-5 h-5" />,
      enabled: settings.android_priority,
      impact: 'High',
      benefit: 'Better performance on Android'
    }
  ];

  const getOptimizationScore = () => {
    const enabledFeatures = optimizationFeatures.filter(f => f.enabled);
    return Math.round((enabledFeatures.length / optimizationFeatures.length) * 100);
  };

  const getConnectionIcon = () => {
    switch (connectionSpeed) {
      case 'slow-2g':
      case '2g':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case '3g':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case '4g':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    }
  };

  const toggleFeature = (featureId: string) => {
    setSettings(prev => ({
      ...prev,
      [featureId]: !prev[featureId as keyof typeof prev]
    }));
  };

  const optimizationScore = getOptimizationScore();

  return (
    <div className="space-y-6">
      {/* Mobile Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-green-600" />
            Mobile Optimization Status
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Optimize your booking experience for mobile users across Africa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimization Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Optimization Score</Label>
              <Badge variant={optimizationScore >= 80 ? "default" : optimizationScore >= 60 ? "secondary" : "destructive"}>
                {optimizationScore}%
              </Badge>
            </div>
            <Progress value={optimizationScore} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {optimizationScore >= 80 ? "Excellent mobile optimization!" : 
               optimizationScore >= 60 ? "Good optimization, consider enabling more features" :
               "Poor optimization, enable more features for better mobile experience"}
            </p>
          </div>

          {/* Device Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Connection</Label>
              <div className="flex items-center space-x-2">
                {getConnectionIcon()}
                <span className="text-sm font-medium capitalize">{connectionSpeed}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Battery</Label>
              <div className="flex items-center space-x-2">
                <Battery className={`w-4 h-4 ${batteryLevel > 20 ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium">{batteryLevel}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">PWA Status</Label>
              <div className="flex items-center space-x-2">
                {isInstallable ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  {isInstallable ? 'Installable' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Features</Label>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">
                  {optimizationFeatures.filter(f => f.enabled).length}/{optimizationFeatures.length}
                </span>
              </div>
            </div>
          </div>

          {/* Install App Button */}
          {isInstallable && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-foreground font-medium">Install BizFlow App</h4>
                    <p className="text-sm text-muted-foreground">Add to home screen for better experience</p>
                  </div>
                  <Button onClick={installApp} className="bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Optimization Features */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Mobile Features
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enable features to optimize for mobile users in low-bandwidth environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimizationFeatures.map((feature) => (
            <Card key={feature.id} className={`border ${feature.enabled ? 'border-primary' : 'border-border'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-foreground font-medium">{feature.title}</h4>
                        <Badge variant={feature.impact === 'High' ? 'default' : 'secondary'} className="text-xs">
                          {feature.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{feature.description}</p>
                      <p className="text-xs text-green-600 font-medium">✓ {feature.benefit}</p>
                    </div>
                  </div>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* African Mobile Context */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <h4 className="text-foreground font-medium mb-2 flex items-center">
            <Smartphone className="w-4 h-4 mr-2 text-amber-600" />
            African Mobile Context
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 80% of African internet users access via mobile devices</li>
            <li>• Data costs are often expensive - optimization saves money</li>
            <li>• Many areas have slower 2G/3G connections</li>
            <li>• Android dominates the African mobile market (85%+)</li>
            <li>• Offline capability is crucial for intermittent connectivity</li>
            <li>• PWA adoption is growing rapidly across the continent</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimization;