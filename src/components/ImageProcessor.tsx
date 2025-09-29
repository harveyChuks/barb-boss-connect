import React from 'react';
import { Button } from '@/components/ui/button';
import { processMockupImages } from '@/utils/processImages';
import { useToast } from '@/components/ui/use-toast';

export const ImageProcessor = () => {
  const { toast } = useToast();

  const handleProcessImages = async () => {
    try {
      toast({
        title: "Processing Images",
        description: "Starting background removal for all mockup images...",
      });
      
      await processMockupImages();
      
      toast({
        title: "Success",
        description: "All images processed successfully! Check your downloads folder.",
      });
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error",
        description: "Failed to process images. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={handleProcessImages}
        className="bg-primary hover:bg-primary/90"
      >
        Remove Background from All Mockup Images
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        This will process all 9 mockup images and download them with transparent backgrounds.
      </p>
    </div>
  );
};