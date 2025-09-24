import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CreditCard, Clock } from "lucide-react";

interface SubscriptionBlockerProps {
  subscription: any;
  onUpgrade: () => void;
}

const SubscriptionBlocker = ({ subscription, onUpgrade }: SubscriptionBlockerProps) => {
  const isTrialExpired = subscription?.currentStatus === 'expired' && subscription?.status === 'trial';
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isTrialExpired ? 'Trial Period Ended' : 'Subscription Required'}
          </CardTitle>
          <CardDescription>
            {isTrialExpired 
              ? 'Your free trial has ended. Upgrade to continue using BizFlow.'
              : 'Your subscription has expired. Please renew to continue.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {isTrialExpired 
                ? 'Your 30-day free trial has concluded. To continue managing appointments and accessing premium features, please choose a subscription plan.'
                : 'Renew your subscription to regain access to your business dashboard and continue serving your customers.'
              }
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button onClick={onUpgrade} className="w-full" size="lg">
              <CreditCard className="w-4 h-4 mr-2" />
              {isTrialExpired ? 'Choose Subscription Plan' : 'Renew Subscription'}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionBlocker;