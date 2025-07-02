
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Users } from "lucide-react";

const ReportsAnalytics = () => {
  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', revenue: 2400, bookings: 45 },
    { month: 'Feb', revenue: 2800, bookings: 52 },
    { month: 'Mar', revenue: 3200, bookings: 58 },
    { month: 'Apr', revenue: 2900, bookings: 49 },
    { month: 'May', revenue: 3500, bookings: 63 },
    { month: 'Jun', revenue: 3800, bookings: 71 },
  ];

  const weeklyData = [
    { day: 'Mon', bookings: 8 },
    { day: 'Tue', bookings: 12 },
    { day: 'Wed', bookings: 15 },
    { day: 'Thu', bookings: 14 },
    { day: 'Fri', bookings: 18 },
    { day: 'Sat', bookings: 22 },
    { day: 'Sun', bookings: 16 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-600">Track your business performance and trends</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-800">$18,600</p>
                <p className="text-xs text-slate-500">+12% from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-800">308</p>
                <p className="text-xs text-slate-500">+8% from last month</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">New Clients</p>
                <p className="text-3xl font-bold text-slate-800">42</p>
                <p className="text-xs text-slate-500">+18% from last month</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Growth Rate</p>
                <p className="text-3xl font-bold text-slate-800">15.2%</p>
                <p className="text-xs text-slate-500">+2.1% from last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Monthly Revenue & Bookings</CardTitle>
            <CardDescription className="text-slate-600">
              Revenue and booking trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#1e293b'
                  }} 
                />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Weekly Booking Trend</CardTitle>
            <CardDescription className="text-slate-600">
              Daily booking patterns for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#1e293b'
                  }} 
                />
                <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Business Insights</CardTitle>
          <CardDescription className="text-slate-600">
            Key insights and recommendations for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Peak Hours</h4>
              <p className="text-slate-600 text-sm">
                Your busiest times are typically between 2 PM - 6 PM on weekdays and 10 AM - 4 PM on weekends.
              </p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Popular Services</h4>
              <p className="text-slate-600 text-sm">
                Haircuts and styling services account for 65% of your bookings, followed by beard trims at 25%.
              </p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Customer Retention</h4>
              <p className="text-slate-600 text-sm">
                78% of your clients return within 30 days, indicating strong customer satisfaction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;
