
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

interface BusinessInfo {
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  businessType: BusinessType;
  country: string;
  currency: string;
}

interface BusinessInfoStepProps {
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: BusinessInfo) => void;
}

const BusinessInfoStep = ({ businessInfo, setBusinessInfo }: BusinessInfoStepProps) => {
  const businessTypes = [
    { value: "barbershop" as BusinessType, label: "Barbershop" },
    { value: "hair_salon" as BusinessType, label: "Hair Salon" },
    { value: "makeup_artist" as BusinessType, label: "Makeup Artist" },
    { value: "nail_salon" as BusinessType, label: "Nail Salon" },
    { value: "spa" as BusinessType, label: "Spa" },
    { value: "beauty_clinic" as BusinessType, label: "Beauty Clinic" },
    { value: "fashion_designer" as BusinessType, label: "Fashion Designer" }
  ];

  const countries = [
    { value: "Nigeria", label: "Nigeria", currency: "NGN" },
    { value: "Ghana", label: "Ghana", currency: "GHS" },
    { value: "Kenya", label: "Kenya", currency: "KES" },
    { value: "South Africa", label: "South Africa", currency: "ZAR" },
    { value: "United States", label: "United States", currency: "USD" },
    { value: "United Kingdom", label: "United Kingdom", currency: "GBP" },
    { value: "Canada", label: "Canada", currency: "CAD" }
  ];

  const statesByCountry = {
    "United States": [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
      "Wisconsin", "Wyoming"
    ],
    "Canada": [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
      "Quebec", "Saskatchewan", "Yukon"
    ],
    "United Kingdom": [
      "England", "Scotland", "Wales", "Northern Ireland"
    ],
    "Nigeria": [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
      "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
      "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
      "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
      "FCT Abuja"
    ],
    "Ghana": [
      "Ashanti", "Brong-Ahafo", "Central", "Eastern", "Greater Accra", "Northern",
      "Upper East", "Upper West", "Volta", "Western"
    ],
    "Kenya": [
      "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
      "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
      "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
      "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
      "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
      "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
    ],
    "South Africa": [
      "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
      "Mpumalanga", "Northern Cape", "North West", "Western Cape"
    ]
  };

  const getStatesForCountry = (country: string) => {
    return statesByCountry[country as keyof typeof statesByCountry] || [];
  };

  const handleCountryChange = (selectedCountry: string) => {
    const country = countries.find(c => c.value === selectedCountry);
    setBusinessInfo({ 
      ...businessInfo, 
      country: selectedCountry,
      currency: country?.currency || "USD",
      state: "" // Reset state when country changes
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">Business Setup</h3>
        <p className="text-slate-400">Tell us about your business location and type</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={businessInfo.businessName}
          onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Ace Barbershop"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input
          id="streetAddress"
          value={businessInfo.streetAddress}
          onChange={(e) => setBusinessInfo({ ...businessInfo, streetAddress: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="123 Main Street"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={businessInfo.city}
            onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="New York"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select value={businessInfo.state} onValueChange={(value) => setBusinessInfo({ ...businessInfo, state: value })}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
              {getStatesForCountry(businessInfo.country).map((state) => (
                <SelectItem key={state} value={state} className="text-white focus:bg-slate-600">
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={businessInfo.zipCode}
            onChange={(e) => setBusinessInfo({ ...businessInfo, zipCode: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="10001"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Select value={businessInfo.businessType} onValueChange={(value: BusinessType) => setBusinessInfo({ ...businessInfo, businessType: value })}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white focus:bg-slate-600">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={businessInfo.country} onValueChange={handleCountryChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value} className="text-white focus:bg-slate-600">
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={businessInfo.currency}
            readOnly
            className="bg-slate-600 border-slate-600 text-gray-300"
            placeholder="Auto-selected"
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
