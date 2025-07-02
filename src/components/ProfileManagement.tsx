
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Phone, Mail, Globe, Instagram, MapPin, Upload, Copy, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Business {
  id: string;
  name: string;
  description: string | null;
  business_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  logo_url: string | null;
  booking_link: string | null;
}

const ProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    business_type: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    instagram: ""
  });

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  const fetchBusiness = async () => {
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
        setFormData({
          name: data.name || "",
          description: data.description || "",
          business_type: data.business_type || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          website: data.website || "",
          instagram: data.instagram || ""
        });
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const generateBookingLink = () => {
    const businessName = formData.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return businessName + '-' + Math.random().toString(36).substring(2, 8);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !business) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${business.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: publicUrl })
        .eq('id', business.id);

      if (updateError) throw updateError;

      setBusiness(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      
      toast({
        title: "Logo Updated",
        description: "Your business logo has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const businessData = {
        owner_id: user.id,
        name: formData.name,
        description: formData.description || null,
        business_type: formData.business_type,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        booking_link: business?.booking_link || generateBookingLink(),
        is_active: true
      };

      if (business) {
        // Update existing business
        const { error } = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', business.id);

        if (error) throw error;

        toast({
          title: "Profile Updated",
          description: "Your business profile has been updated successfully.",
        });
      } else {
        // Create new business
        const { data, error } = await supabase
          .from('businesses')
          .insert(businessData)
          .select()
          .single();

        if (error) throw error;

        setBusiness(data);
        toast({
          title: "Profile Created",
          description: "Your business profile has been created successfully.",
        });
      }

      fetchBusiness();
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

  const copyBookingLink = () => {
    if (business?.booking_link) {
      const fullLink = `${window.location.origin}/book/${business.booking_link}`;
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Booking link has been copied to clipboard.",
      });
    }
  };

  const openBookingLink = () => {
    if (business?.booking_link) {
      const fullLink = `${window.location.origin}/book/${business.booking_link}`;
      window.open(fullLink, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Business Profile</h2>
        <p className="text-muted-foreground">Manage your business information and public profile</p>
      </div>

      {business?.booking_link && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Your Booking Link
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Share this link with customers to let them book appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-muted rounded-lg text-muted-foreground font-mono text-sm">
                {window.location.origin}/book/{business.booking_link}
              </div>
              <Button
                onClick={copyBookingLink}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                onClick={openBookingLink}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Business Logo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload your business logo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={business?.logo_url || ""} alt="Business Logo" />
              <AvatarFallback className="bg-muted text-muted-foreground text-4xl">
                <Building2 className="w-16 h-16" />
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploading}
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Business Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="Your Business Name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_type" className="text-foreground">Business Type *</Label>
                    <Select value={formData.business_type} onValueChange={(value) => handleInputChange("business_type", value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <Label htmlFor="description" className="text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="Tell customers about your business..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="contact@yourbusiness.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-foreground">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-foreground">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="@yourbusiness"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.business_type}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Saving..." : business ? "Update Profile" : "Create Profile"}
            </Button>
          </form>
        </div>
      </div>

      {business && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Profile Preview</CardTitle>
            <CardDescription className="text-muted-foreground">
              This is how your business will appear to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4 p-6 bg-muted rounded-lg">
              <Avatar className="w-16 h-16">
                <AvatarImage src={business.logo_url || ""} alt={business.name} />
                <AvatarFallback className="bg-background text-foreground">
                  {business.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">{business.name}</h3>
                  <Badge variant="secondary" className="capitalize">
                    {business.business_type.replace('_', ' ')}
                  </Badge>
                </div>
                {business.description && (
                  <p className="text-muted-foreground mb-3">{business.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {business.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {business.phone}
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {business.email}
                    </div>
                  )}
                  {business.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {business.address}
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </div>
                  )}
                  {business.instagram && (
                    <div className="flex items-center">
                      <Instagram className="w-4 h-4 mr-1" />
                      {business.instagram}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileManagement;
