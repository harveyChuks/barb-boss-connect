
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Camera, Trash2, Image } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WorkPicturesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    service_type: '',
    image_url: ''
  });

  useEffect(() => {
    fetchPictures();
  }, [user]);

  const fetchPictures = async () => {
    if (!user) return;

    try {
      // Get user's business first
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) return;

      const { data, error } = await supabase
        .from('work_pictures')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPictures(data || []);
    } catch (error: any) {
      console.error('Error fetching pictures:', error);
      toast({
        title: "Error",
        description: "Failed to load pictures",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `work-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('work-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('work-pictures')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.image_url) return;

    setLoading(true);
    try {
      // Get user's business first
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) throw new Error('Business not found');

      const { error } = await supabase
        .from('work_pictures')
        .insert([{
          ...formData,
          business_id: business.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Picture added successfully",
      });

      resetForm();
      fetchPictures();
    } catch (error: any) {
      console.error('Error saving picture:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pictureId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('work_pictures')
        .delete()
        .eq('id', pictureId);

      if (error) throw error;

      // Delete from storage
      const filePath = imageUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('work-pictures')
          .remove([`work-pictures/${filePath}`]);
      }

      toast({
        title: "Success",
        description: "Picture deleted successfully",
      });
      fetchPictures();
    } catch (error: any) {
      console.error('Error deleting picture:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      service_type: '',
      image_url: ''
    });
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Work Portfolio</h2>
          <p className="text-slate-600">Showcase your best work to attract new clients</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Picture
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-50 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Add Work Picture</DialogTitle>
              <DialogDescription className="text-slate-600">
                Upload a picture of your work to showcase your skills
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-slate-700">Upload Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-white border-slate-300 text-slate-800"
                />
                {uploading && <p className="text-sm text-slate-600">Uploading...</p>}
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-md border border-slate-300"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type" className="text-slate-700">Service Type</Label>
                <Input
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="e.g., Haircut, Beard Trim, Styling"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Brief description of the work"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={loading || !formData.image_url}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {loading ? "Adding..." : "Add Picture"}
                </Button>
                <Button variant="outline" onClick={resetForm} className="border-slate-300 text-slate-700 hover:bg-slate-100">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pictures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pictures.map((picture: any) => (
          <Card key={picture.id} className="bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors overflow-hidden">
            <div className="relative">
              <img 
                src={picture.image_url} 
                alt={picture.description || 'Work picture'}
                className="w-full h-48 object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(picture.id, picture.image_url)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                {picture.service_type && (
                  <div className="inline-block px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full">
                    {picture.service_type}
                  </div>
                )}
                {picture.description && (
                  <p className="text-slate-600 text-sm">{picture.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pictures.length === 0 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="text-center py-12">
            <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No pictures yet</h3>
            <p className="text-slate-600 mb-4">Start building your portfolio by adding pictures of your work</p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Camera className="w-4 h-4 mr-2" />
              Add Your First Picture
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkPicturesManagement;
