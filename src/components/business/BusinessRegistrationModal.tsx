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
import ServicesManager from "./ServicesManager";
import WorkPicturesUpload from "./WorkPicturesUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BusinessType = Database["public"]["Enums"]["business_type"];

interface Service {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface WorkPicture {
  image_url: string;
  description: string;
  service_type: string;
}

interface BusinessRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessCreated?: () => void;
}

const BusinessRegistrationModal = ({ open, onOpenChange, onBusinessCreated }: BusinessRegistrationModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("business");
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    business_type: "" as BusinessType,
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    instagram: ""
  });
  
  const [services, setServices] = useState<Service[]>([]);
  const [workPictures, setWorkPictures] = useState<WorkPicture[]>([]);

  const businessTypes = [
    { value: "barbershop" as BusinessType, label: "Barbershop" },
    { value: "hair_salon" as BusinessType, label: "Hair Salon" },
    { value: "makeup_artist" as BusinessType, label: "Makeup Artist" },
    { value: "nail_salon" as BusinessType, label: "Nail Salon" },
    { value: "spa" as BusinessType, label: "Spa" },
    { value: "beauty_clinic" as BusinessType, label: "Beauty Clinic" }
  ];

  const handleBusinessSubmit = async () => {
    if (!formData.name || !formData.business_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required business fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a business");
      }

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...formData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setBusinessId(data.id);
      setCurrentTab("services");
      
      toast({
        title: "Business Information Saved!",
        description: "Now let's add your services.",
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

  const handleServicesSubmit = async () => {
    if (services.length === 0) {
      toast({
        title: "No Services Added",
        description: "Please add at least one service.",
        variant: "destructive",
      });
      return;
    }

    if (!businessId) return;

    setLoading(true);
    try {
      const servicesWithBusinessId = services.map(service => ({
        ...service,
        business_id: businessId
      }));

      const { error } = await supabase
        .from('services')
        .insert(servicesWithBusinessId);

      if (error) throw error;

      setCurrentTab("portfolio");
      
      toast({
        title: "Services Added!",
        description: "Now you can add pictures of your work (optional).",
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

  const handleFinalSubmit = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      // Save work pictures if any
      if (workPictures.length > 0) {
        const picturesWithBusinessId = workPictures.map(picture => ({
          ...picture,
          business_id: businessId
        }));

        const { error } = await supabase
          .from('work_pictures')
          .insert(picturesWithBusinessId);

        if (error) throw error;
      }

      toast({
        title: "Business Registration Complete!",
        description: `${formData.name} has been successfully registered with ${services.length} services.`,
      });
      
      // Reset form
      setFormData({
        name: "",
        business_type: "" as BusinessType,
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        instagram: ""
      });
      setServices([]);
      setWorkPictures([]);
      setBusinessId(null);
      setCurrentTab("business");
      
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessTypeChange = (value: BusinessType) => {
    setFormData(prev => ({ ...prev, business_type: value }));
  };

  const canProceedToServices = formData.name && formData.business_type;
  const canProceedToPortfolio = services.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Your Business</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set up your business profile, services, and portfolio
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger 
              value="business" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
            >
              Business Info
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              disabled={!businessId}
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
            >
              Services & Pricing
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              disabled={!businessId}
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-black"
            >
              Work Portfolio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Ace Barbershop"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <Select value={formData.business_type} onValueChange={handleBusinessTypeChange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select business type" />
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Describe your business and services..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="123 Main St, City, State"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="contact@business.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://yourbusiness.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="@yourbusiness"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleBusinessSubmit}
                disabled={loading || !canProceedToServices}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {loading ? "Saving..." : "Next: Add Services"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            <ServicesManager 
              services={services} 
              onServicesChange={setServices}
            />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentTab("business")}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleServicesSubmit}
                disabled={loading || !canProceedToPortfolio}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {loading ? "Saving..." : "Next: Add Portfolio"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="portfolio" className="space-y-4">
            {businessId && (
              <WorkPicturesUpload
                businessId={businessId}
                pictures={workPictures}
                onPicturesChange={setWorkPictures}
              />
            )}
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentTab("services")}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {loading ? "Completing..." : "Complete Registration"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessRegistrationModal;
