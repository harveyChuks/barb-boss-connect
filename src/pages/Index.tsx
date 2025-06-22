
import { useState } from "react";
import { Calendar, Users, Scissors, Clock, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ClientModal from "@/components/ClientModal";
import AppointmentModal from "@/components/AppointmentModal";

const Index = () => {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const todayAppointments = [
    { id: 1, client: "John Smith", time: "10:00 AM", service: "Haircut & Beard" },
    { id: 2, client: "Mike Johnson", time: "11:30 AM", service: "Classic Cut" },
    { id: 3, client: "David Wilson", time: "2:00 PM", service: "Beard Trim" },
  ];

  const recentClients = [
    { id: 1, name: "John Smith", lastVisit: "Today", phone: "(555) 123-4567" },
    { id: 2, name: "Mike Johnson", lastVisit: "2 days ago", phone: "(555) 234-5678" },
    { id: 3, name: "David Wilson", lastVisit: "1 week ago", phone: "(555) 345-6789" },
    { id: 4, name: "Alex Brown", lastVisit: "2 weeks ago", phone: "(555) 456-7890" },
  ];

  const stats = [
    { title: "Today's Appointments", value: "8", icon: Calendar, color: "text-blue-600" },
    { title: "Total Clients", value: "156", icon: Users, color: "text-green-600" },
    { title: "This Week", value: "42", icon: Scissors, color: "text-purple-600" },
    { title: "Revenue Today", value: "$480", icon: Clock, color: "text-orange-600" },
  ];

  const filteredClients = recentClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white">BarbS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowAppointmentModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
              <Button 
                onClick={() => setShowClientModal(true)}
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-400" />
                Today's Appointments
              </CardTitle>
              <CardDescription className="text-slate-400">
                {todayAppointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{appointment.client}</p>
                      <p className="text-sm text-slate-400">{appointment.service}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-400 text-amber-400">
                      {appointment.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Clients */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-amber-400" />
                Recent Clients
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your client base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="text-sm text-slate-400">{client.phone}</p>
                      </div>
                      <Badge variant="secondary" className="bg-slate-600 text-slate-300">
                        {client.lastVisit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <ClientModal open={showClientModal} onOpenChange={setShowClientModal} />
      <AppointmentModal open={showAppointmentModal} onOpenChange={setShowAppointmentModal} />
    </div>
  );
};

export default Index;
