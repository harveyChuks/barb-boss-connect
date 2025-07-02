
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Clock, DollarSign, Scissors } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ServicesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    is_active: true
  });

  useEffect(() => {
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
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
        .from('services')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's business first
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) throw new Error('Business not found');

      const serviceData = {
        ...formData,
        business_id: business.id,
        price: parseFloat(formData.price) || 0,
        duration_minutes: parseInt(formData.duration_minutes) || 30
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Service added successfully",
        });
      }

      resetForm();
      fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      fetchServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      is_active: true
    });
    setEditingService(null);
    setShowAddDialog(false);
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price?.toString() || '',
      duration_minutes: service.duration_minutes?.toString() || '',
      is_active: service.is_active
    });
    setEditingService(service);
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Services Management</h2>
          <p className="text-slate-600">Manage your services, pricing, and availability</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-50 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {editingService ? 'Update service details' : 'Create a new service for your business'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="e.g., Classic Haircut"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  placeholder="Service description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-700">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-700">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                    className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="text-slate-700">Active Service</Label>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSave} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {loading ? "Saving..." : editingService ? "Update" : "Add"} Service
                </Button>
                <Button variant="outline" onClick={resetForm} className="border-slate-300 text-slate-700 hover:bg-slate-100">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: any) => (
          <Card key={service.id} className="bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                    <Scissors className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-800 text-lg">{service.name}</CardTitle>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs text-slate-600">{service.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {service.description && (
                  <p className="text-slate-600 text-sm">{service.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-slate-800">${service.price}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-600 text-sm">{service.duration_minutes} min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="text-center py-12">
            <Scissors className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No services yet</h3>
            <p className="text-slate-600 mb-4">Add your first service to start accepting bookings</p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServicesManagement;
