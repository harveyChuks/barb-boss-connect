
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface Service {
  name: string;
  price: string;
  duration: number | string;
}

interface ServicesStepProps {
  services: Service[];
  setServices: (services: Service[]) => void;
}

const ServicesStep = ({ services, setServices }: ServicesStepProps) => {
  const addService = () => {
    setServices([...services, { name: "", price: "", duration: 30 }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setServices(updated);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">Services & Pricing</h3>
        <p className="text-slate-400">Add the services you offer</p>
      </div>
      
      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={index} className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Service {index + 1}</span>
                {services.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeService(index)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Haircut"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={service.price}
                    onChange={(e) => updateService(index, 'price', e.target.value)}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="25"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={service.duration || ''}
                    onChange={(e) => updateService(index, 'duration', e.target.value ? parseInt(e.target.value) : '')}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addService}
          className="w-full border-slate-600 text-white hover:bg-slate-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>
    </div>
  );
};

export default ServicesStep;
