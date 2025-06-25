
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

const ProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    business_type: "" as BusinessType,
    phone: "",
    email: "",
    address: "",
    website: "",
    instagram: "",
    logo_url: ""
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, [user]);

  const fetchBusinessProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching business profile for user:', user.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching business:', error);
        throw error;
      }

      if (data) {
        console.log('Business data fetched:', data);
        setBusiness(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          business_type: data.business_type || "barbershop",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          website: data.website || "",
          instagram: data.instagram || "",
          logo_url: data.logo_url || ""
        });
      } else {
        console.log('No business found for user');
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessTypeChange = (value: BusinessType) => {
    setFormData(prev => ({ ...prev, business_type: value }));
  };

  const handleSave = async () => {
    if (!business) return;

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        business_type: formData.business_type,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website,
        instagram: formData.instagram,
        logo_url: formData.logo_url
      };

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your business profile has been successfully updated.",
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

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    toast({
      title: "Coming Soon",
      description: "Photo upload functionality will be available soon.",
    });
  };

  if (!business) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-400">No business profile found. Please register your business first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Business Profile</CardTitle>
        <CardDescription className="text-slate-400">
          Manage your business information and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.logo_url} alt={formData.name} />
            <AvatarFallback className="bg-slate-700 text-white text-lg">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'B'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={handleImageUpload}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            {formData.name && (
              <p className="text-slate-300 font-medium">{formData.name}</p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter your business name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_type">Business Type</Label>
            <Select value={formData.business_type} onValueChange={handleBusinessTypeChange}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="barbershop">Barbershop</SelectItem>
                <SelectItem value="hair_salon">Hair Salon</SelectItem>
                <SelectItem value="makeup_artist">Makeup Artist</SelectItem>
                <SelectItem value="nail_salon">Nail Salon</SelectItem>
                <SelectItem value="spa">Spa</SelectItem>
                <SelectItem value="beauty_clinic">Beauty Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Business phone number"
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
              placeholder="Business email address"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            rows={3}
            placeholder="Describe your business services and specialties"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Business address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="https://yourwebsite.com"
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

        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileManagement;
