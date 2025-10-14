
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BusinessHours {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_closed: boolean;
}

const BusinessHoursManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);

  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return {
      value: time24,
      label: `${hour12}:${minute} ${ampm}`
    };
  });

  useEffect(() => {
    fetchBusinessAndHours();
  }, [user]);

  const fetchBusinessAndHours = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Fetch business hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessData.id)
        .order('day_of_week');

      if (hoursError && hoursError.code !== 'PGRST116') {
        throw hoursError;
      }

      if (hoursData && hoursData.length > 0) {
        setBusinessHours(hoursData);
      } else {
        // Initialize default hours
        await initializeDefaultHours(businessData.id);
      }
    } catch (error: any) {
      console.error('Error fetching business hours:', error);
      toast({
        title: "Error",
        description: "Failed to load business hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultHours = async (businessId: string) => {
    try {
      // Call the function using a direct SQL query since TypeScript types haven't updated yet
      const { error } = await supabase
        .from('business_hours')
        .insert([
          { business_id: businessId, day_of_week: 0, start_time: '08:00', end_time: '21:00', is_closed: true },   // Sunday
          { business_id: businessId, day_of_week: 1, start_time: '08:00', end_time: '21:00', is_closed: false },  // Monday
          { business_id: businessId, day_of_week: 2, start_time: '08:00', end_time: '21:00', is_closed: false },  // Tuesday
          { business_id: businessId, day_of_week: 3, start_time: '08:00', end_time: '21:00', is_closed: false },  // Wednesday
          { business_id: businessId, day_of_week: 4, start_time: '08:00', end_time: '21:00', is_closed: false },  // Thursday
          { business_id: businessId, day_of_week: 5, start_time: '08:00', end_time: '21:00', is_closed: false },  // Friday
          { business_id: businessId, day_of_week: 6, start_time: '08:00', end_time: '21:00', is_closed: false }   // Saturday
        ]);

      if (error) throw error;

      // Fetch the newly created hours
      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week');

      if (hoursData) {
        setBusinessHours(hoursData);
      }
    } catch (error: any) {
      console.error('Error initializing default hours:', error);
    }
  };

  const updateBusinessHours = (dayOfWeek: number, field: string, value: any) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.day_of_week === dayOfWeek 
          ? { ...hour, [field]: value }
          : hour
      )
    );
  };

  const saveBusinessHours = async (hoursToSave?: BusinessHours[]) => {
    if (!business) {
      console.error('No business found');
      return;
    }

    const hours = hoursToSave || businessHours;
    console.log('Business object:', business);
    console.log('Hours to save:', hours);

    setSaving(true);
    try {
      // Ensure we have valid data
      const updates = hours.map(hour => {
        const update = {
          business_id: business.id,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time || '08:00',
          end_time: hour.end_time || '21:00',
          is_closed: hour.is_closed
        };
        console.log('Preparing update for day', hour.day_of_week, ':', update);
        return update;
      });

      console.log('About to upsert:', updates);

      const { data, error } = await supabase
        .from('business_hours')
        .upsert(updates, { 
          onConflict: 'business_id,day_of_week',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }

      console.log('Upsert successful, returned data:', data);

      // Update local state with saved data
      if (data && data.length > 0) {
        console.log('Updating local state with:', data);
        setBusinessHours(data);
      } else {
        console.warn('No data returned from upsert, refetching...');
        await fetchBusinessAndHours();
      }

      toast({
        title: "Business Hours Updated",
        description: "Your operating hours have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving business hours:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save business hours',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading business hours...</p>
        </CardContent>
      </Card>
    );
  }

  if (!business) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-muted-foreground">No business profile found. Please set up your business first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <CardTitle className="text-foreground">Business Hours</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Set your operating hours and availability for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {businessHours.map((dayHours) => (
            <div key={dayHours.day_of_week} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-4 min-w-[120px]">
                <Label className="text-foreground font-medium w-20">
                  {dayNames[dayHours.day_of_week]}
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={!dayHours.is_closed}
                    onCheckedChange={(checked) => 
                      updateBusinessHours(dayHours.day_of_week, 'is_closed', !checked)
                    }
                  />
                  <Label className="text-muted-foreground text-sm">
                    {dayHours.is_closed ? 'Closed' : 'Open'}
                  </Label>
                </div>
              </div>

              {!dayHours.is_closed && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-muted-foreground text-sm">From:</Label>
                    <select
                      value={dayHours.start_time}
                      onChange={(e) => updateBusinessHours(dayHours.day_of_week, 'start_time', e.target.value)}
                      className="bg-input border border-border text-foreground px-3 py-1 rounded text-sm"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className="text-muted-foreground text-sm">To:</Label>
                    <select
                      value={dayHours.end_time}
                      onChange={(e) => updateBusinessHours(dayHours.day_of_week, 'end_time', e.target.value)}
                      className="bg-input border border-border text-foreground px-3 py-1 rounded text-sm"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => saveBusinessHours()}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Business Hours"}
          </Button>
          
          <Button
            onClick={() => fetchBusinessAndHours()}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            Reset Changes
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="text-foreground font-medium mb-2">Quick Setup</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent"
              onClick={async () => {
                const newHours = businessHours.map(hour => ({
                  ...hour,
                  is_closed: hour.day_of_week === 0, // Close on Sunday
                  start_time: '08:00',
                  end_time: '21:00'
                }));
                setBusinessHours(newHours);
                // Pass the new hours directly to avoid async state update issues
                await saveBusinessHours(newHours);
              }}
            >
              Mon-Sat 8AM-9PM
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent"
              onClick={async () => {
                const newHours = businessHours.map(hour => ({
                  ...hour,
                  is_closed: false,
                  start_time: '09:00',
                  end_time: '18:00'
                }));
                setBusinessHours(newHours);
                // Pass the new hours directly to avoid async state update issues
                await saveBusinessHours(newHours);
              }}
            >
              All Days 9AM-6PM
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent"
              onClick={async () => {
                const newHours = businessHours.map(hour => ({
                  ...hour,
                  is_closed: hour.day_of_week === 0 || hour.day_of_week === 1, // Close Sun & Mon
                  start_time: '10:00',
                  end_time: '20:00'
                }));
                setBusinessHours(newHours);
                // Pass the new hours directly to avoid async state update issues
                await saveBusinessHours(newHours);
              }}
            >
              Tue-Sat 10AM-8PM
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursManagement;
