
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
    { value: "beauty_clinic" as BusinessType, label: "Beauty Clinic" }
  ];

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">Business Information</h3>
        <p className="text-slate-400">Tell us about your barbershop</p>
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
              {states.map((state) => (
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
    </div>
  );
};

export default BusinessInfoStep;
