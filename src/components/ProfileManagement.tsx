
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Camera, MapPin, Phone, Mail, Globe, Instagram } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState({
    name: '',
    description: '',
    business_type: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, [user]);

  const fetchBusinessProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBusiness(data);
      }
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      toast({
        title: "Error",
        description: "Failed to load business profile",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update(business)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating business profile:', error);
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
    setBusiness(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Business Profile</h2>
          <p className="text-slate-600">Manage your business information and public profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-amber-500" />
              Business Logo
            </CardTitle>
            <CardDescription className="text-slate-600">
              Upload your business logo or profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                {business.logo_url ? (
                  <img 
                    src={business.logo_url} 
                    alt="Business Logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                <Camera className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="lg:col-span-2 bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Basic Information</CardTitle>
            <CardDescription className="text-slate-600">
              Update your business details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Business Name</Label>
                <Input
                  id="name"
                  value={business.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Enter business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type" className="text-slate-700">Business Type</Label>
                <Select value={business.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    <SelectItem value="barbershop">Barbershop</SelectItem>
                    <SelectItem value="hair_salon">Hair Salon</SelectItem>
                    <SelectItem value="makeup_artist">Makeup Artist</SelectItem>
                    <SelectItem value="nail_salon">Nail Salon</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="beauty_clinic">Beauty Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">Business Description</Label>
              <Textarea
                id="description"
                value={business.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                placeholder="Describe your business..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="address"
                  value={business.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Enter business address"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Contact Information</CardTitle>
          <CardDescription className="text-slate-600">
            How customers can reach you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  value={business.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={business.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-700">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="website"
                  value={business.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Enter website URL"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-slate-700">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="instagram"
                  value={business.instagram || ''}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileManagement;
