
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Star, TrendingUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StatisticsOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    avgRating: 4.8,
    todayBookings: 0,
    weeklyBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!business) return;

      // Get total clients
      const { count: clientCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get today's bookings
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('appointment_date', today);

      // Get this week's bookings
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: weeklyCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('appointment_date', weekStart.toISOString().split('T')[0]);

      // Get total bookings
      const { count: totalCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);

      setStats({
        totalBookings: totalCount || 0,
        monthlyRevenue: 2400, // Mock data for now
        totalClients: clientCount || 0,
        avgRating: 4.8, // Mock data for now
        todayBookings: todayCount || 0,
        weeklyBookings: weeklyCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Today's Bookings",
      value: stats.todayBookings.toString(),
      description: "Appointments scheduled for today",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      description: "Registered clients",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      description: "Revenue this month",
      icon: DollarSign,
      color: "text-[#39FF14]"
    },
    {
      title: "Average Rating",
      value: stats.avgRating.toString(),
      description: "Customer satisfaction",
      icon: Star,
      color: "text-purple-600"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      description: "All time appointments",
      icon: TrendingUp,
      color: "text-[#39FF14]"
    },
    {
      title: "This Week",
      value: stats.weeklyBookings.toString(),
      description: "Bookings this week",
      icon: Clock,
      color: "text-indigo-600"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-50 border-slate-200 animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatisticsOverview;
