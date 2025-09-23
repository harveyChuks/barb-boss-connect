
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, Copy, ExternalLink, Check, QrCode, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { uploadImage } from "@/utils/imageUpload";
import QRCode from "qrcode";

type BusinessType = Database["public"]["Enums"]["business_type"];

const ProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [business, setBusiness] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Generate QR code when business data is available
  useEffect(() => {
    if (business?.booking_link) {
      generateQRCode();
    }
  }, [business]);

  const generateQRCode = async () => {
    if (!business?.booking_link) return;
    
    // Use the deployed URL instead of preview URL
    // Replace with your actual deployed domain
    const deployedDomain = window.location.hostname.includes('lovableproject.com') 
      ? 'https://your-app.lovable.app' // Replace with your actual deployed URL
      : window.location.origin;
    
    const bookingUrl = `${deployedDomain}/book/${business.booking_link}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !business?.name) return;
    
    const link = document.createElement('a');
    link.download = `${business.name}-booking-qr.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "Your booking QR code has been downloaded successfully.",
    });
  };

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

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !business || !user) return;

    setUploadingImage(true);
    try {
      const logoUrl = await uploadImage(file, 'business-logos', `${user.id}/${business.id}`);
      
      setFormData(prev => ({ ...prev, logo_url: logoUrl }));
      
      // Update the database immediately
      const { error } = await supabase
        .from('businesses')
        .update({ logo_url: logoUrl })
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Logo Updated",
        description: "Your business logo has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const copyBookingLink = async () => {
    if (!business?.booking_link) return;
    
    // Use the deployed URL instead of preview URL
    const deployedDomain = window.location.hostname.includes('lovableproject.com') 
      ? 'https://your-app.lovable.app' // Replace with your actual deployed URL
      : window.location.origin;
    
    const bookingUrl = `${deployedDomain}/book/${business.booking_link}`;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopiedLink(true);
      toast({
        title: "Booking Link Copied",
        description: "Your booking link has been copied to clipboard.",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy booking link. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const openBookingPage = () => {
    if (!business?.booking_link) return;
    const deployedDomain = window.location.hostname.includes('lovableproject.com') 
      ? 'https://your-app.lovable.app' // Replace with your actual deployed URL
      : window.location.origin;
    const bookingUrl = `${deployedDomain}/book/${business.booking_link}`;
    window.open(bookingUrl, '_blank');
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

  if (!business) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-muted-foreground">No business profile found. Please register your business first.</p>
        </CardContent>
      </Card>
    );
  }

  const deployedDomain = window.location.hostname.includes('lovableproject.com') 
    ? 'https://your-app.lovable.app' // Replace with your actual deployed URL
    : window.location.origin;
  const bookingUrl = business.booking_link ? `${deployedDomain}/book/${business.booking_link}` : '';

  return (
    <div className="space-y-6">
      {/* Booking Link Section */}
      {business.booking_link && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Booking Link & QR Code</CardTitle>
            <CardDescription className="text-muted-foreground">
              Share this link or QR code with clients so they can book appointments online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Link Section */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={bookingUrl}
                  readOnly
                  className="bg-input border-border text-foreground font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyBookingLink}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={openBookingPage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* QR Code Section */}
            {qrCodeDataUrl && (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Booking QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-foreground font-medium flex items-center">
                    <QrCode className="w-4 h-4 mr-2 text-primary" />
                    QR Code Instructions
                  </h4>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Print and display in your business</li>
                    <li>• Share on social media</li>
                    <li>• Include in business cards or flyers</li>
                    <li>• Clients can scan to book instantly</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Profile Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Business Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your business information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.logo_url} alt={formData.name} />
              <AvatarFallback className="bg-muted text-foreground text-lg">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'B'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={handleImageUpload}
                disabled={uploadingImage}
                className="border-border text-foreground hover:bg-muted"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploadingImage ? "Uploading..." : "Change Photo"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {formData.name && (
                <p className="text-muted-foreground font-medium">{formData.name}</p>
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
                className="bg-input border-border text-foreground"
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={formData.business_type} onValueChange={handleBusinessTypeChange}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
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
                className="bg-input border-border text-foreground"
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
                className="bg-input border-border text-foreground"
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
              className="bg-input border-border text-foreground"
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
              className="bg-input border-border text-foreground"
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
                className="bg-input border-border text-foreground"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="@yourbusiness"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
