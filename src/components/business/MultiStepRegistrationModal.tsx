
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type BusinessType = Database["public"]["Enums"]["business_type"];

interface Service {
  name: string;
  price: string;
  duration: number;
}

interface MultiStepRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessCreated?: () => void;
}

const MultiStepRegistrationModal = ({ open, onOpenChange, onBusinessCreated }: MultiStepRegistrationModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data states
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    businessType: "" as BusinessType
  });

  const [professionalProfile, setProfessionalProfile] = useState({
    bio: "",
    yearsExperience: "",
    specialties: ""
  });

  const [services, setServices] = useState<Service[]>([
    { name: "", price: "", duration: 30 }
  ]);

  const businessTypes = [
    { value: "barbershop" as BusinessType, label: "Barbershop" },
    { value: "hair_salon" as BusinessType, label: "Hair Salon" },
    { value: "makeup_artist" as BusinessType, label: "Makeup Artist" },
    { value: "nail_salon" as BusinessType, label: "Nail Salon" },
    { value: "spa" as BusinessType, label: "Spa" },
    { value: "beauty_clinic" as BusinessType, label: "Beauty Clinic" }
  ];

  const experienceOptions = [
    { value: "0-1", label: "0-1 years" },
    { value: "2-5", label: "2-5 years" },
    { value: "6-10", label: "6-10 years" },
    { value: "11-15", label: "11-15 years" },
    { value: "16+", label: "16+ years" }
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

  const addService = () => {
    setServices([...services, { name: "", price: "", duration: 30 }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setServices(updated);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return personalInfo.fullName && personalInfo.email && personalInfo.phone;
      case 2:
        return businessInfo.businessName && businessInfo.streetAddress && businessInfo.city && 
               businessInfo.state && businessInfo.zipCode && businessInfo.businessType;
      case 3:
        return professionalProfile.bio && professionalProfile.yearsExperience;
      case 4:
        return services.some(service => service.name && service.price);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a business");
      }

      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessInfo.businessName,
          business_type: businessInfo.businessType,
          description: professionalProfile.bio,
          address: `${businessInfo.streetAddress}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}`,
          phone: personalInfo.phone,
          email: personalInfo.email,
          owner_id: user.id
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create services
      const validServices = services.filter(service => service.name && service.price);
      if (validServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('services')
          .insert(
            validServices.map(service => ({
              business_id: business.id,
              name: service.name,
              price: parseFloat(service.price),
              duration_minutes: service.duration
            }))
          );

        if (servicesError) throw servicesError;
      }

      toast({
        title: "Business Created!",
        description: `${businessInfo.businessName} has been successfully registered.`,
      });
      
      // Reset form
      setCurrentStep(1);
      setPersonalInfo({ fullName: "", email: "", phone: "" });
      setBusinessInfo({ businessName: "", streetAddress: "", city: "", state: "", zipCode: "", businessType: "" as BusinessType });
      setProfessionalProfile({ bio: "", yearsExperience: "", specialties: "" });
      setServices([{ name: "", price: "", duration: 30 }]);
      
      onOpenChange(false);
      onBusinessCreated?.();
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              <p className="text-slate-400">Let's start with your basic details</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="john@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        );

      case 2:
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
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ace Barbershop"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                value={businessInfo.streetAddress}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, streetAddress: e.target.value }))}
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
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="New York"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={businessInfo.state} onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, state: value }))}>
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
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="10001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessInfo.businessType} onValueChange={(value: BusinessType) => setBusinessInfo(prev => ({ ...prev, businessType: value }))}>
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

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white">Professional Profile</h3>
              <p className="text-slate-400">Show clients what makes you special</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={professionalProfile.bio}
                onChange={(e) => setProfessionalProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Tell clients about your experience and passion for your craft..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Select value={professionalProfile.yearsExperience} onValueChange={(value) => setProfessionalProfile(prev => ({ ...prev, yearsExperience: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {experienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white focus:bg-slate-600">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Textarea
                id="specialties"
                value={professionalProfile.specialties}
                onChange={(e) => setProfessionalProfile(prev => ({ ...prev, specialties: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Hair cuts, beard trims, styling, etc."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white">Services & Pricing</h3>
              <p className="text-slate-400">Add the services you offer</p>
            </div>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Service {index + 1}</span>
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Service Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          className="bg-slate-600 border-slate-500 text-white"
                          placeholder="Haircut"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', e.target.value)}
                          className="bg-slate-600 border-slate-500 text-white"
                          placeholder="25"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Duration (min)</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(index, 'duration', parseInt(e.target.value) || 30)}
                          className="bg-slate-600 border-slate-500 text-white"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addService}
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Your Business</DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete your business profile in {4} simple steps
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicator */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-600 text-slate-400'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevious}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? "Creating..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepRegistrationModal;
