
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Scissors, Calendar, Users, Star, LogIn } from "lucide-react";
import BusinessRegistrationModal from "@/components/business/BusinessRegistrationModal";
import BusinessDashboard from "@/components/dashboard/BusinessDashboard";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  if (isAuthenticated) {
    return <BusinessDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <Scissors className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold text-white">BookMyService</span>
        </div>
        <Button
          variant="outline"
          className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Grow Your Beauty Business
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            The all-in-one booking platform for barbershops, salons, spas, and beauty professionals. 
            Manage appointments, showcase your work, and grow your client base.
          </p>
          <Button
            onClick={() => setShowRegistrationModal(true)}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8 py-4"
          >
            Start Your Free Business Profile
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <Calendar className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">Easy Booking</h3>
            <p className="text-slate-300">
              Streamlined appointment scheduling with automated confirmations and reminders.
            </p>
          </div>
          
          <div className="text-center p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <Users className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">Client Management</h3>
            <p className="text-slate-300">
              Keep track of your clients, their preferences, and appointment history.
            </p>
          </div>
          
          <div className="text-center p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <Star className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">Portfolio Showcase</h3>
            <p className="text-slate-300">
              Display your best work and attract new clients with stunning portfolios.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join Thousands of Beauty Professionals
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Start accepting online bookings and grow your business today
          </p>
          <Button
            onClick={() => setShowRegistrationModal(true)}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8 py-4"
          >
            Get Started Now
          </Button>
        </div>
      </div>

      <BusinessRegistrationModal
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
      />
    </div>
  );
};

export default Index;
