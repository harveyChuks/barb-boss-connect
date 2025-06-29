
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BusinessHour {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_closed: boolean;
}

const BusinessHoursManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Default working hours: Monday-Saturday 8am-9pm, Sunday closed
  const getDefaultHours = () => {
    return daysOfWeek.map(day => ({
      day_of_week: day.value,
      start_time: '08:00',
      end_time: '21:00',
      is_closed: day.value === 0 // Sunday closed by default
    }));
  };

  useEffect(() => {
    fetchBusinessAndHours();
  }, [user]);

  const fetchBusinessAndHours = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (businessError) throw businessError;
      setBusinessId(businessData.id);

      // Get existing business hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessData.id)
        .order('day_of_week');

      if (hoursError && hoursError.code !== 'PGRST116') {
        throw hoursError;
      }

      // If no hours exist, use defaults and save them
      if (!hoursData || hoursData.length === 0) {
        const defaultHours = getDefaultHours();
        setBusinessHours(defaultHours);
        
        // Save default hours to database
        const hoursToInsert = defaultHours.map(hour => ({
          business_id: businessData.id,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          is_closed: hour.is_closed
        }));

        const { error: insertError } = await supabase
          .from('business_hours')
          .insert(hoursToInsert);

        if (!insertError) {
          toast({
            title: "Default Hours Set",
            description: "Default working hours (Mon-Sat 8am-9pm) have been applied",
          });
        }
      } else {
        // Map existing hours to match all days
        const initialHours = daysOfWeek.map(day => {
          const existingHour = hoursData.find(h => h.day_of_week === day.value);
          return existingHour || {
            day_of_week: day.value,
            start_time: '08:00',
            end_time: '21:00',
            is_closed: day.value === 0
          };
        });
        setBusinessHours(initialHours);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
      toast({
        title: "Error",
        description: "Failed to load business hours",
        variant: "destructive",
      });
      
      // Fallback to default hours if there's an error
      setBusinessHours(getDefaultHours());
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHour = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours(prev => 
      prev.map((hour, index) => 
        index === dayIndex ? { ...hour, [field]: value } : hour
      )
    );
  };

  const saveBusinessHours = async () => {
    if (!businessId) return;

    setSaving(true);
    try {
      // Delete existing hours and insert new ones
      const { error: deleteError } = await supabase
        .from('business_hours')
        .delete()
        .eq('business_id', businessId);

      if (deleteError) throw deleteError;

      // Insert new hours
      const hoursToInsert = businessHours.map(hour => ({
        business_id: businessId,
        day_of_week: hour.day_of_week,
        start_time: hour.start_time,
        end_time: hour.end_time,
        is_closed: hour.is_closed
      }));

      const { error: insertError } = await supabase
        .from('business_hours')
        .insert(hoursToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Business hours updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving business hours:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setBusinessHours(getDefaultHours());
    toast({
      title: "Reset to Defaults",
      description: "Hours reset to Monday-Saturday 8am-9pm, Sunday closed",
    });
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Loading business hours...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Business Hours
            </CardTitle>
            <CardDescription className="text-slate-400">
              Set your operating hours for each day of the week
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={saveBusinessHours}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Hours'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-slate-400 mb-4">
          Default hours: Monday-Saturday 8:00 AM - 9:00 PM, Sunday closed
        </div>
        
        {businessHours.map((hour, index) => (
          <div key={hour.day_of_week} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-20 text-white font-medium">
                {daysOfWeek[index].label}
              </div>
              <Switch
                checked={!hour.is_closed}
                onCheckedChange={(checked) => updateBusinessHour(index, 'is_closed', !checked)}
              />
              <span className="text-sm text-slate-400">
                {hour.is_closed ? 'Closed' : 'Open'}
              </span>
            </div>
            
            {!hour.is_closed && (
              <div className="flex items-center space-x-2">
                <Label className="text-slate-300 text-sm">From:</Label>
                <Select
                  value={hour.start_time}
                  onValueChange={(value) => updateBusinessHour(index, 'start_time', value)}
                >
                  <SelectTrigger className="w-24 bg-slate-600 border-slate-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time} className="text-white">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Label className="text-slate-300 text-sm">To:</Label>
                <Select
                  value={hour.end_time}
                  onValueChange={(value) => updateBusinessHour(index, 'end_time', value)}
                >
                  <SelectTrigger className="w-24 bg-slate-600 border-slate-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time} className="text-white">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BusinessHoursManagement;
