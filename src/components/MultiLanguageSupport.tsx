import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages, Settings, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MultiLanguageSupportProps {
  businessId: string;
}

const MultiLanguageSupport = ({ businessId }: MultiLanguageSupportProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    multilingual_enabled: false,
    default_language: "en",
    auto_detect_language: true,
    enabled_languages: ["en"],
    translations: {} as Record<string, Record<string, string>>
  });

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸', region: 'Global' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪', region: 'East Africa' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬', region: 'West Africa' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬', region: 'Nigeria' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬', region: 'Nigeria' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹', region: 'Ethiopia' },
    { code: 'or', name: 'Oromo', flag: '🇪🇹', region: 'Ethiopia' },
    { code: 'ti', name: 'Tigrinya', flag: '🇪🇷', region: 'Eritrea/Ethiopia' },
    { code: 'fr', name: 'French', flag: '🇫🇷', region: 'West/Central Africa' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', region: 'North Africa' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', region: 'Angola/Mozambique' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦', region: 'South Africa' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦', region: 'South Africa' },
    { code: 'xh', name: 'Xhosa', flag: '🇿🇦', region: 'South Africa' }
  ];

  const commonTranslationKeys = [
    'book_appointment',
    'select_service',
    'choose_date',
    'choose_time',
    'customer_name',
    'phone_number',
    'email_address',
    'booking_confirmed',
    'appointment_reminder',
    'cancel_appointment',
    'reschedule_appointment',
    'services',
    'staff',
    'about_us',
    'contact_info',
    'working_hours',
    'book_now',
    'confirm_booking',
    'payment_required',
    'deposit_amount',
    'total_price'
  ];

  const defaultTranslations = {
    en: {
      book_appointment: "Book Appointment",
      select_service: "Select Service",
      choose_date: "Choose Date",
      choose_time: "Choose Time",
      customer_name: "Customer Name",
      phone_number: "Phone Number",
      email_address: "Email Address",
      booking_confirmed: "Booking Confirmed",
      appointment_reminder: "Appointment Reminder",
      cancel_appointment: "Cancel Appointment",
      reschedule_appointment: "Reschedule Appointment",
      services: "Services",
      staff: "Staff",
      about_us: "About Us",
      contact_info: "Contact Information",
      working_hours: "Working Hours",
      book_now: "Book Now",
      confirm_booking: "Confirm Booking",
      payment_required: "Payment Required",
      deposit_amount: "Deposit Amount",
      total_price: "Total Price"
    },
    sw: {
      book_appointment: "Weka Miadi",
      select_service: "Chagua Huduma",
      choose_date: "Chagua Tarehe",
      choose_time: "Chagua Wakati",
      customer_name: "Jina la Mteja",
      phone_number: "Nambari ya Simu",
      email_address: "Anwani ya Barua Pepe",
      booking_confirmed: "Miadi Imethibitishwa",
      appointment_reminder: "Kikumbusho cha Miadi",
      cancel_appointment: "Ghairi Miadi",
      reschedule_appointment: "Badilisha Miadi",
      services: "Huduma",
      staff: "Wafanyakazi",
      about_us: "Kuhusu Sisi",
      contact_info: "Maelezo ya Mawasiliano",
      working_hours: "Masaa ya Kazi",
      book_now: "Weka Sasa",
      confirm_booking: "Thibitisha Kuweka",
      payment_required: "Malipo Yanahitajika",
      deposit_amount: "Kiasi cha Amana",
      total_price: "Bei Jumla"
    },
    ha: {
      book_appointment: "Yi Appointment",
      select_service: "Zaɓi Sabis",
      choose_date: "Zaɓi Kwanan Wata",
      choose_time: "Zaɓi Lokaci",
      customer_name: "Sunan Abokin Ciniki",
      phone_number: "Lambar Waya",
      email_address: "Adireshin Imel",
      booking_confirmed: "An Tabbatar da Appointment",
      appointment_reminder: "Tunatarwa na Appointment",
      cancel_appointment: "Soke Appointment",
      reschedule_appointment: "Sake Tsara Appointment",
      services: "Ayyuka",
      staff: "Ma'aikata",
      about_us: "Game da Mu",
      contact_info: "Bayanan Tuntuɓar Mu",
      working_hours: "Lokutan Aiki",
      book_now: "Yi Appointment Yanzu",
      confirm_booking: "Tabbatar da Appointment",
      payment_required: "Ana Buƙatar Biya",
      deposit_amount: "Adadin Ajiya",
      total_price: "Jimlar Farashi"
    },
    fr: {
      book_appointment: "Prendre Rendez-vous",
      select_service: "Sélectionner un Service",
      choose_date: "Choisir la Date",
      choose_time: "Choisir l'Heure",
      customer_name: "Nom du Client",
      phone_number: "Numéro de Téléphone",
      email_address: "Adresse Email",
      booking_confirmed: "Réservation Confirmée",
      appointment_reminder: "Rappel de Rendez-vous",
      cancel_appointment: "Annuler le Rendez-vous",
      reschedule_appointment: "Reprogrammer le Rendez-vous",
      services: "Services",
      staff: "Personnel",
      about_us: "À Propos de Nous",
      contact_info: "Informations de Contact",
      working_hours: "Heures de Travail",
      book_now: "Réserver Maintenant",
      confirm_booking: "Confirmer la Réservation",
      payment_required: "Paiement Requis",
      deposit_amount: "Montant de l'Acompte",
      total_price: "Prix Total"
    }
  };

  useEffect(() => {
    fetchLanguageSettings();
  }, [businessId]);

  const fetchLanguageSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('language_settings')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      if (data?.language_settings && typeof data.language_settings === 'object') {
        const languageSettings = data.language_settings as any;
        setSettings(prev => ({
          ...prev,
          ...languageSettings,
          translations: {
            ...defaultTranslations,
            ...(languageSettings.translations || {})
          }
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          translations: defaultTranslations
        }));
      }
    } catch (error) {
      console.error('Error fetching language settings:', error);
      setSettings(prev => ({
        ...prev,
        translations: defaultTranslations
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          language_settings: settings
        })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Language Settings Saved",
        description: "Your multilingual settings have been updated successfully.",
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

  const toggleLanguage = (languageCode: string) => {
    const currentLanguages = settings.enabled_languages;
    if (currentLanguages.includes(languageCode)) {
      // Don't allow removing the default language
      if (languageCode === settings.default_language) {
        toast({
          title: "Cannot Remove Default Language",
          description: "Please select a different default language first.",
          variant: "destructive",
        });
        return;
      }
      setSettings(prev => ({
        ...prev,
        enabled_languages: currentLanguages.filter(lang => lang !== languageCode)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        enabled_languages: [...currentLanguages, languageCode]
      }));
      
      // Initialize translations for new language if not exists
      if (!settings.translations[languageCode]) {
        setSettings(prev => ({
          ...prev,
          translations: {
            ...prev.translations,
            [languageCode]: defaultTranslations[languageCode as keyof typeof defaultTranslations] || {}
          }
        }));
      }
    }
  };

  const updateTranslation = (languageCode: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [languageCode]: {
          ...prev.translations[languageCode],
          [key]: value
        }
      }
    }));
  };

  const autoTranslate = async (targetLanguage: string) => {
    // This would integrate with a translation service like Google Translate
    // For now, we'll show a placeholder
    toast({
      title: "Auto-translation Coming Soon",
      description: "Automatic translation feature will be available in a future update.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            Multi-Language Support
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Make your booking page accessible to customers in multiple African languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Enable Multi-Language Support</Label>
                <p className="text-sm text-muted-foreground">Allow customers to view your booking page in their preferred language</p>
              </div>
              <Switch
                checked={settings.multilingual_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, multilingual_enabled: checked }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_language">Default Language</Label>
                <Select 
                  value={settings.default_language} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, default_language: value }))}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select default language" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Auto-Detect Language</Label>
                  <p className="text-xs text-muted-foreground">Detect customer's browser language</p>
                </div>
                <Switch
                  checked={settings.auto_detect_language}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_detect_language: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-medium flex items-center">
                <Languages className="w-4 h-4 mr-2" />
                Enabled Languages
              </h3>
              <Badge>{settings.enabled_languages.length} languages</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableLanguages.map((lang) => (
                <Card 
                  key={lang.code} 
                  className={`cursor-pointer transition-colors ${
                    settings.enabled_languages.includes(lang.code) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => toggleLanguage(lang.code)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <p className="text-foreground font-medium text-sm">{lang.name}</p>
                          <p className="text-muted-foreground text-xs">{lang.region}</p>
                        </div>
                      </div>
                      {settings.enabled_languages.includes(lang.code) && (
                        <Badge variant="default" className="text-xs">
                          {lang.code === settings.default_language ? 'Default' : 'Enabled'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Translation Management */}
          {settings.multilingual_enabled && settings.enabled_languages.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-foreground font-medium flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Translation Management
              </h3>
              
              {settings.enabled_languages.map((langCode) => {
                const language = availableLanguages.find(l => l.code === langCode);
                if (!language) return null;
                
                return (
                  <Card key={langCode} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          {language.flag} {language.name}
                          {langCode === settings.default_language && (
                            <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                          )}
                        </CardTitle>
                        {langCode !== 'en' && (
                          <Button
                            onClick={() => autoTranslate(langCode)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Auto-translate
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {commonTranslationKeys.map((key) => (
                          <div key={key} className="space-y-1">
                            <Label className="text-xs font-medium">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            <Input
                              value={settings.translations[langCode]?.[key] || ''}
                              onChange={(e) => updateTranslation(langCode, key, e.target.value)}
                              className="bg-input border-border text-foreground text-sm"
                              placeholder={settings.translations['en']?.[key] || key}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Usage Tips */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h4 className="text-foreground font-medium mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                Usage Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Choose languages spoken by your local customer base</li>
                <li>• English is recommended as a fallback language</li>
                <li>• Auto-detection helps show the right language automatically</li>
                <li>• Test your booking page in different languages</li>
                <li>• Consider regional dialects and variations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
          >
            {loading ? "Saving..." : "Save Language Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiLanguageSupport;