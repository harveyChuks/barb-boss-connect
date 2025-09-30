import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Ban, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface BusinessSubscription {
  id: string;
  business_id: string;
  status: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  businesses: {
    name: string;
    email: string;
    is_blocked: boolean;
    blocked_at: string | null;
    block_reason: string | null;
  };
}

const BusinessSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<BusinessSubscription | null>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [extendMonths, setExtendMonths] = useState("1");
  const [blockReason, setBlockReason] = useState("");
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          businesses (
            name,
            email,
            is_blocked,
            blocked_at,
            block_reason
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data as any[] || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
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
    fetchSubscriptions();
  }, []);

  const handleExtendTrial = async () => {
    if (!selectedSubscription) return;

    try {
      const currentEndDate = new Date(selectedSubscription.trial_end_date || Date.now());
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + parseInt(extendMonths));

      const { error } = await supabase
        .from('business_subscriptions')
        .update({
          trial_end_date: newEndDate.toISOString(),
          status: 'trial'
        })
        .eq('id', selectedSubscription.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Trial extended by ${extendMonths} month(s)`,
      });

      setIsExtendDialogOpen(false);
      setSelectedSubscription(null);
      setExtendMonths("1");
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBlockBusiness = async () => {
    if (!selectedSubscription) return;

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          is_blocked: true,
          blocked_at: new Date().toISOString(),
          block_reason: blockReason
        })
        .eq('id', selectedSubscription.business_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business has been blocked",
      });

      setIsBlockDialogOpen(false);
      setSelectedSubscription(null);
      setBlockReason("");
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnblockBusiness = async (businessId: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          is_blocked: false,
          blocked_at: null,
          block_reason: null
        })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business has been unblocked",
      });

      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.businesses?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.businesses?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Business Subscription Management
        </CardTitle>
        <CardDescription>
          Manage subscriptions, extend trials, and block businesses
        </CardDescription>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name, email or status..."
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
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial End Date</TableHead>
              <TableHead>Blocked</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.businesses?.name}</TableCell>
                <TableCell>{sub.businesses?.email}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(sub.status)}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sub.trial_end_date ? (
                    <span className="text-sm">
                      {format(new Date(sub.trial_end_date), 'dd/MM/yyyy')}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {sub.businesses?.is_blocked ? (
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="h-3 w-3" />
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {sub.status === 'trial' && !sub.businesses?.is_blocked && (
                      <Dialog 
                        open={isExtendDialogOpen && selectedSubscription?.id === sub.id} 
                        onOpenChange={(open) => {
                          setIsExtendDialogOpen(open);
                          if (!open) setSelectedSubscription(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubscription(sub)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Extend Trial
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Extend Trial Period</DialogTitle>
                            <DialogDescription>
                              Extend the trial period for {sub.businesses?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Current Trial End Date</Label>
                              <p className="text-sm text-muted-foreground">
                                {sub.trial_end_date ? format(new Date(sub.trial_end_date), 'dd MMMM yyyy') : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="extend_months">Extend By (Months)</Label>
                              <Input
                                id="extend_months"
                                type="number"
                                min="1"
                                max="12"
                                value={extendMonths}
                                onChange={(e) => setExtendMonths(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsExtendDialogOpen(false);
                                  setSelectedSubscription(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleExtendTrial}>
                                Extend Trial
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {sub.businesses?.is_blocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockBusiness(sub.business_id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Unblock
                      </Button>
                    ) : (
                      <Dialog 
                        open={isBlockDialogOpen && selectedSubscription?.id === sub.id}
                        onOpenChange={(open) => {
                          setIsBlockDialogOpen(open);
                          if (!open) setSelectedSubscription(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedSubscription(sub)}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Block
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Block Business</DialogTitle>
                            <DialogDescription>
                              Block {sub.businesses?.name} from accessing the platform
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="block_reason">Reason for Blocking</Label>
                              <Textarea
                                id="block_reason"
                                placeholder="Enter reason for blocking this business..."
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsBlockDialogOpen(false);
                                  setSelectedSubscription(null);
                                  setBlockReason("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleBlockBusiness}
                                disabled={!blockReason.trim()}
                              >
                                Block Business
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BusinessSubscriptionManagement;
