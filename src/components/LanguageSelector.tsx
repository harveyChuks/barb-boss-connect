import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Languages, Globe } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as Language, name: t('language.english'), nativeName: 'English' },
    { code: 'sw' as Language, name: t('language.swahili'), nativeName: 'Kiswahili' },
    { code: 'ig' as Language, name: t('language.igbo'), nativeName: 'Igbo' },
    { code: 'yo' as Language, name: t('language.yoruba'), nativeName: 'Yorùbá' },
    { code: 'ha' as Language, name: t('language.hausa'), nativeName: 'هَرْشَن هَوْسَ' },
    { code: 'fr' as Language, name: t('language.french'), nativeName: 'Français' },
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Languages className="w-5 h-5 text-primary [.light_&]:text-green-500" />
          </div>
          <div>
            <CardTitle className="text-foreground text-lg">{t('settings.language')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your preferred language for the interface
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('language.current')}:</span>
          <Badge variant="outline" className="border-primary text-primary [.light_&]:border-green-500 [.light_&]:text-green-500">
            <Globe className="w-3 h-3 mr-1" />
            {currentLanguage?.nativeName}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('language.select')}
          </label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('language.select')} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-sm text-muted-foreground">({lang.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">
          Language changes will be applied immediately across the entire application.
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;