
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

type BusinessType = Database["public"]["Enums"]["business_type"];

interface BusinessRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessCreated?: () => void;
}

const BusinessRegistrationModal = ({ open, onOpenChange, onBusinessCreated }: BusinessRegistrationModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const businessTypes = [
    { value: "barbershop" as BusinessType, label: "Barbershop" },
    { value: "hair_salon" as BusinessType, label: "Hair Salon" },
    { value: "makeup_artist" as BusinessType, label: "Makeup Artist" },
    { value: "nail_salon" as BusinessType, label: "Nail Salon" },
    { value: "spa" as BusinessType, label: "Spa" },
    { value: "beauty_clinic" as BusinessType, label: "Beauty Clinic" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a business");
      }

      const { error } = await supabase
        .from('businesses')
        .insert({
          ...formData,
          owner_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Business Created!",
        description: `${formData.name} has been successfully registered.`,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Your Business</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set up your business profile to start accepting bookings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              type="submit"
              disabled={loading || !formData.name || !formData.business_type}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? "Creating..." : "Create Business"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessRegistrationModal;
