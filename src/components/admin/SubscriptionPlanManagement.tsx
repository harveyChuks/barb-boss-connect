import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, DollarSign, Users, Trash2 } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: any[];
  max_appointments_per_month: number;
  is_active: boolean;
  created_at: string;
}

const SubscriptionPlanManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_monthly: "",
    price_yearly: "",
    max_appointments_per_month: "",
    features: "",
    is_active: true
  });
  const { toast } = useToast();
  const { currencySymbol, currency } = useLocation();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans((data as any[]) || []);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price_monthly: "",
      price_yearly: "",
      max_appointments_per_month: "",
      features: "",
      is_active: true
    });
  };

  const handleCreatePlan = async () => {
    try {
      const features = formData.features.split(',').map(f => f.trim()).filter(f => f);
      
      const { error } = await supabase
        .from('subscription_plans')
        .insert({
          name: formData.name,
          description: formData.description,
          price_monthly: parseFloat(formData.price_monthly),
          price_yearly: formData.price_yearly ? parseFloat(formData.price_yearly) : null,
          max_appointments_per_month: formData.max_appointments_per_month ? parseInt(formData.max_appointments_per_month) : null,
          features,
          is_active: formData.is_active
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan created successfully",
      });

      resetForm();
      setIsCreateDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan) return;

    try {
      const features = formData.features.split(',').map(f => f.trim()).filter(f => f);
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: formData.name,
          description: formData.description,
          price_monthly: parseFloat(formData.price_monthly),
          price_yearly: formData.price_yearly ? parseFloat(formData.price_yearly) : null,
          max_appointments_per_month: formData.max_appointments_per_month ? parseInt(formData.max_appointments_per_month) : null,
          features,
          is_active: formData.is_active
        })
        .eq('id', selectedPlan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });

      resetForm();
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan deactivated successfully",
      });

      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price_monthly: plan.price_monthly.toString(),
      price_yearly: plan.price_yearly?.toString() || "",
      max_appointments_per_month: plan.max_appointments_per_month?.toString() || "",
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      is_active: plan.is_active
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Subscription Plans
              </CardTitle>
              <CardDescription>
                Create and manage subscription plans for your platform
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Subscription Plan</DialogTitle>
                  <DialogDescription>
                    Define the details for a new subscription plan
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Professional"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_appointments">Max Appointments/Month</Label>
                      <Input
                        id="max_appointments"
                        type="number"
                        placeholder="100"
                        value={formData.max_appointments_per_month}
                        onChange={(e) => setFormData({ ...formData, max_appointments_per_month: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Plan description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_monthly">Monthly Price ({currencySymbol})</Label>
                      <Input
                        id="price_monthly"
                        type="number"
                        step="0.01"
                        placeholder="29.99"
                        value={formData.price_monthly}
                        onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_yearly">Yearly Price ({currencySymbol})</Label>
                      <Input
                        id="price_yearly"
                        type="number"
                        step="0.01"
                        placeholder="299.99"
                        value={formData.price_yearly}
                        onChange={(e) => setFormData({ ...formData, price_yearly: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Textarea
                      id="features"
                      placeholder="Unlimited appointments, Priority support, Advanced analytics"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active Plan</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { resetForm(); setIsCreateDialogOpen(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlan} disabled={!formData.name || !formData.price_monthly}>
                    Create Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Yearly Price</TableHead>
                <TableHead>Max Appointments</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{currencySymbol}{plan.price_monthly}</TableCell>
                  <TableCell>{plan.price_yearly ? `${currencySymbol}${plan.price_yearly}` : '-'}</TableCell>
                  <TableCell>
                    {plan.max_appointments_per_month ? (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {plan.max_appointments_per_month}
                      </Badge>
                    ) : 'Unlimited'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(plan.features) ? plan.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      )) : null}
                      {Array.isArray(plan.features) && plan.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={!plan.is_active}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the details for this subscription plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Plan Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_max_appointments">Max Appointments/Month</Label>
                <Input
                  id="edit_max_appointments"
                  type="number"
                  value={formData.max_appointments_per_month}
                  onChange={(e) => setFormData({ ...formData, max_appointments_per_month: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_price_monthly">Monthly Price ({currencySymbol})</Label>
                <Input
                  id="edit_price_monthly"
                  type="number"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_price_yearly">Yearly Price ({currencySymbol})</Label>
                <Input
                  id="edit_price_yearly"
                  type="number"
                  step="0.01"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({ ...formData, price_yearly: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_features">Features (comma-separated)</Label>
              <Textarea
                id="edit_features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Active Plan</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false); setSelectedPlan(null); }}>
              Cancel
            </Button>
            <Button onClick={handleEditPlan} disabled={!formData.name || !formData.price_monthly}>
              Update Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlanManagement;