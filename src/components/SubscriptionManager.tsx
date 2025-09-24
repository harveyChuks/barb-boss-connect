import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CreditCard, Clock, CheckCircle } from "lucide-react";

interface SubscriptionManagerProps {
  businessId: string;
}

const SubscriptionManager = ({ businessId }: SubscriptionManagerProps) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        // Fetch current subscription
        const { data: subData } = await supabase
          .from('business_subscriptions')
          .select(`
            *,
            subscription_plans (*)
          `)
          .eq('business_id', businessId)
          .single();

        setSubscription(subData);

        // Fetch available plans
        const { data: plansData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .neq('name', 'Free Trial')
          .order('price_monthly', { ascending: true });

        setPlans(plansData || []);
      } catch (error: any) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [businessId]);

  const upgradeSubscription = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('business_subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('business_id', businessId);

      if (error) throw error;

      toast({
        title: "Subscription Updated",
        description: "Your subscription has been successfully updated!",
      });

      // Refresh subscription data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading subscription details...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const isTrialActive = subscription?.status === 'trial' && new Date(subscription.trial_end_date) > new Date();
  const trialDaysLeft = subscription?.trial_end_date ? getTimeRemaining(subscription.trial_end_date) : 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{subscription?.subscription_plans?.name || 'No Active Plan'}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription?.subscription_plans?.description}
                </p>
              </div>
              <Badge variant={
                subscription?.status === 'active' ? 'default' :
                subscription?.status === 'trial' ? 'secondary' : 'destructive'
              }>
                {subscription?.status || 'inactive'}
              </Badge>
            </div>

            {isTrialActive && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your free trial ends in <strong>{trialDaysLeft} days</strong>. 
                  Upgrade now to continue using all features.
                </AlertDescription>
              </Alert>
            )}

            {subscription?.status === 'active' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {(subscription?.status === 'trial' || subscription?.status === 'expired') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-2xl font-bold">
                  ${plan.price_monthly}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => upgradeSubscription(plan.id)}
                  className="w-full"
                  variant={plan.name === 'Professional' ? 'default' : 'outline'}
                >
                  {subscription?.status === 'trial' ? 'Upgrade Now' : 'Reactivate'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;