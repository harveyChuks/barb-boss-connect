import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ServicePoint {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  max_concurrent_slots: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServicePointFormData {
  name: string;
  description: string;
  max_concurrent_slots: number;
  is_active: boolean;
}

const ServicePointManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<ServicePoint | null>(null);
  const [formData, setFormData] = useState<ServicePointFormData>({
    name: "",
    description: "",
    max_concurrent_slots: 1,
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      fetchBusinessAndServicePoints();
    }
  }, [user]);

  const fetchBusinessAndServicePoints = async () => {
    if (!user) return;

    try {
      // Get user's business
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (businessError || !business) {
        toast({
          title: "Error",
          description: "Could not find your business. Please set up your business first.",
          variant: "destructive",
        });
        return;
      }

      setBusinessId(business.id);
      await fetchServicePoints(business.id);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicePoints = async (busId: string) => {
    const { data, error } = await supabase
      .from("service_points")
      .select("*")
      .eq("business_id", busId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service points",
        variant: "destructive",
      });
      return;
    }

    setServicePoints(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      if (editingPoint) {
        // Update existing service point
        const { error } = await supabase
          .from("service_points")
          .update({
            name: formData.name,
            description: formData.description,
            max_concurrent_slots: formData.max_concurrent_slots,
            is_active: formData.is_active,
          })
          .eq("id", editingPoint.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Service point updated successfully",
        });
      } else {
        // Create new service point
        const { error } = await supabase
          .from("service_points")
          .insert({
            business_id: businessId,
            name: formData.name,
            description: formData.description,
            max_concurrent_slots: formData.max_concurrent_slots,
            is_active: formData.is_active,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Service point created successfully",
        });
      }

      await fetchServicePoints(businessId);
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to save service point",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (point: ServicePoint) => {
    setEditingPoint(point);
    setFormData({
      name: point.name,
      description: point.description || "",
      max_concurrent_slots: point.max_concurrent_slots,
      is_active: point.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service point?")) return;

    try {
      const { error } = await supabase
        .from("service_points")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service point deleted successfully",
      });

      await fetchServicePoints(businessId);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to delete service point",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      max_concurrent_slots: 1,
      is_active: true,
    });
    setEditingPoint(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading service points...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Points
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your business service points and their booking capacity
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service Point
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPoint ? "Edit Service Point" : "Add New Service Point"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Chair 1, Room A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this service point"
                  />
                </div>
                <div>
                  <Label htmlFor="slots">Maximum Concurrent Slots</Label>
                  <Input
                    id="slots"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.max_concurrent_slots}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_concurrent_slots: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How many appointments can be booked simultaneously at this service point
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingPoint ? "Update" : "Create"} Service Point
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {servicePoints.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Service Points</h3>
            <p className="text-muted-foreground mb-4">
              Create your first service point to start managing bookings with specific capacity limits.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Point
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {servicePoints.map((point, index) => (
              <div key={point.id}>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{point.name}</h4>
                      <Badge variant={point.is_active ? "default" : "secondary"}>
                        {point.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {point.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {point.description}
                      </p>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Capacity:</span>{" "}
                      {point.max_concurrent_slots} concurrent slots
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(point)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(point.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < servicePoints.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicePointManagement;