
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkPicture {
  id?: string;
  image_url: string;
  description: string;
  service_type: string;
}

interface WorkPicturesUploadProps {
  businessId: string;
  pictures: WorkPicture[];
  onPicturesChange: (pictures: WorkPicture[]) => void;
}

const WorkPicturesUpload = ({ businessId, pictures, onPicturesChange }: WorkPicturesUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('work-pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('work-pictures')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      const newPicture: WorkPicture = {
        image_url: imageUrl,
        description: "",
        service_type: ""
      };
      onPicturesChange([...pictures, newPicture]);
    }
  };

  const updatePicture = (index: number, field: keyof WorkPicture, value: string) => {
    const updatedPictures = pictures.map((pic, i) => {
      if (i === index) {
        return { ...pic, [field]: value };
      }
      return pic;
    });
    onPicturesChange(updatedPictures);
  };

  const removePicture = (index: number) => {
    const updatedPictures = pictures.filter((_, i) => i !== index);
    onPicturesChange(updatedPictures);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg">Work Portfolio</Label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="work-picture-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            onClick={() => document.getElementById('work-picture-upload')?.click()}
            size="sm"
            disabled={uploading}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Upload className="w-4 h-4 mr-1" />
            {uploading ? "Uploading..." : "Add Picture"}
          </Button>
        </div>
      </div>
      
      {pictures.length === 0 && (
        <p className="text-slate-400 text-sm">Upload pictures of your work to showcase your skills</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pictures.map((picture, index) => (
          <div key={index} className="border border-slate-600 rounded-lg p-4 space-y-3">
            <div className="relative">
              <img
                src={picture.image_url}
                alt={`Work ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePicture(index)}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 border-none text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div>
                <Label htmlFor={`picture-service-${index}`}>Service Type</Label>
                <Input
                  id={`picture-service-${index}`}
                  value={picture.service_type}
                  onChange={(e) => updatePicture(index, 'service_type', e.target.value)}
                  placeholder="Haircut, Beard, etc."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor={`picture-description-${index}`}>Description</Label>
                <Textarea
                  id={`picture-description-${index}`}
                  value={picture.description}
                  onChange={(e) => updatePicture(index, 'description', e.target.value)}
                  placeholder="Describe this work..."
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkPicturesUpload;
