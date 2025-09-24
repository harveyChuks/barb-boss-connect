import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, DollarSign, TrendingUp, Search, Ban, CheckCircle } from "lucide-react";
import VisitAnalytics from "@/components/analytics/VisitAnalytics";
import UserManagement from "@/components/admin/UserManagement";
import SubscriptionPlanManagement from "@/components/admin/SubscriptionPlanManagement";
import { FinancialDashboard } from "@/components/admin/FinancialDashboard";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SupportCommunication } from "@/components/admin/SupportCommunication";
import { SecurityAudit } from "@/components/admin/SecurityAudit";

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch all businesses with subscription data
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select(`
          *,
          business_subscriptions (
            *,
            subscription_plans (
              name,
              price_monthly
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (businessError) throw businessError;

      setBusinesses(businessData || []);

      // Fetch subscription statistics
      const { data: subscriptionData, error: subError } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            price_monthly
          )
        `);

      if (subError) throw subError;

      setSubscriptions(subscriptionData || []);

      // Calculate statistics
      const activeCount = subscriptionData?.filter(s => s.status === 'active').length || 0;
      const trialCount = subscriptionData?.filter(s => s.status === 'trial').length || 0;
      const expiredCount = subscriptionData?.filter(s => s.status === 'expired').length || 0;
      
      const monthlyRevenue = subscriptionData?.reduce((total, sub) => {
        if (sub.status === 'active' && sub.subscription_plans?.price_monthly) {
          return total + parseFloat(sub.subscription_plans.price_monthly.toString());
        }
        return total;
      }, 0) || 0;

      setStats({
        totalBusinesses: businessData?.length || 0,
        activeSubscriptions: activeCount,
        trialSubscriptions: trialCount,
        expiredSubscriptions: expiredCount,
        monthlyRevenue
      });

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
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
    fetchAdminData();
  }, []);

  const toggleBusinessStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: !currentStatus })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Business ${!currentStatus ? 'activated' : 'suspended'} successfully`,
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredBusinesses = businesses.filter((business: any) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionStatus = (business: any) => {
    const subscription = business.business_subscriptions?.[0];
    if (!subscription) return { status: 'none', color: 'secondary' };
    
    const now = new Date();
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_end_date);
      if (trialEnd > now) {
        return { status: 'trial', color: 'default' };
      } else {
        return { status: 'expired', color: 'destructive' };
      }
    }
    
    if (subscription.status === 'active') {
      return { status: 'active', color: 'default' };
    }
    
    return { status: subscription.status, color: 'destructive' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Platform Administration</h1>
          <p className="text-muted-foreground">Manage businesses, subscriptions, and platform oversight</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.trialSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <CardTitle>Business Management</CardTitle>
                <CardDescription>
                  View and manage all registered businesses
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.map((business: any) => {
                      const subStatus = getSubscriptionStatus(business);
                      return (
                        <TableRow key={business.id}>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell>{business.email}</TableCell>
                          <TableCell className="capitalize">{business.business_type}</TableCell>
                          <TableCell>
                            <Badge variant={subStatus.color as any}>
                              {subStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={business.is_active ? "default" : "secondary"}>
                              {business.is_active ? "Active" : "Suspended"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={business.is_active ? "destructive" : "default"}
                              onClick={() => toggleBusinessStatus(business.id, business.is_active)}
                            >
                              {business.is_active ? (
                                <>
                                  <Ban className="w-3 h-3 mr-1" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Overview</CardTitle>
                <CardDescription>
                  Monitor subscription status and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trial End</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription: any) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          {businesses.find((b: any) => b.id === subscription.business_id)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{subscription.subscription_plans?.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'trial' ? 'secondary' : 'destructive'
                          }>
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.trial_end_date 
                            ? new Date(subscription.trial_end_date).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          ${subscription.status === 'active' 
                            ? (subscription.subscription_plans?.price_monthly || 0)
                            : 0
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="plans">
            <SubscriptionPlanManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <VisitAnalytics />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="support">
            <SupportCommunication />
          </TabsContent>

          <TabsContent value="security">
            <SecurityAudit />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;