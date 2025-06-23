
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

interface Service {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface ServicesManagerProps {
  services: Service[];
  onServicesChange: (services: Service[]) => void;
}

const ServicesManager = ({ services, onServicesChange }: ServicesManagerProps) => {
  const addService = () => {
    const newService: Service = {
      name: "",
      description: "",
      price: 0,
      duration_minutes: 30
    };
    onServicesChange([...services, newService]);
  };

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    onServicesChange(updatedServices);
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = services.map((service, i) => {
      if (i === index) {
        return { ...service, [field]: value };
      }
      return service;
    });
    onServicesChange(updatedServices);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg">Services & Pricing *</Label>
        <Button
          type="button"
          onClick={addService}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Service
        </Button>
      </div>
      
      {services.length === 0 && (
        <p className="text-slate-400 text-sm">Add at least one service to continue</p>
      )}
      
      {services.map((service, index) => (
        <div key={index} className="border border-slate-600 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Service {index + 1}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeService(index)}
              className="border-slate-600 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`service-name-${index}`}>Service Name</Label>
              <Input
                id={`service-name-${index}`}
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
                placeholder="Haircut, Beard Trim, etc."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor={`service-price-${index}`}>Price ($)</Label>
              <Input
                id={`service-price-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={service.price}
                onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor={`service-duration-${index}`}>Duration (minutes)</Label>
              <Input
                id={`service-duration-${index}`}
                type="number"
                min="5"
                step="5"
                value={service.duration_minutes}
                onChange={(e) => updateService(index, 'duration_minutes', parseInt(e.target.value) || 30)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor={`service-description-${index}`}>Description</Label>
            <Textarea
              id={`service-description-${index}`}
              value={service.description}
              onChange={(e) => updateService(index, 'description', e.target.value)}
              placeholder="Describe this service..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesManager;
