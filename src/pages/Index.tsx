
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BarChart3, Settings, Clock, Shield, Zap, Star } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import BusinessRegistrationModal from "@/components/business/BusinessRegistrationModal";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleBusinessRegister = () => {
    setShowRegisterModal(true);
  };

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent appointment booking with conflict detection and automatic reminders"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Comprehensive customer profiles with booking history and preferences"
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Detailed insights into your business performance and growth metrics"
    },
    {
      icon: Settings,
      title: "Customization",
      description: "Personalize your booking experience with custom branding and settings"
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce no-shows by 75% with automated reminders and confirmations"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: Zap,
      title: "Easy Setup",
      description: "Get your booking system running in under 5 minutes"
    },
    {
      icon: Star,
      title: "Premium Support",
      description: "24/7 customer support to help you succeed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-white">
                Barb<span className="text-[#39FF14]">S</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="text-white hover:text-[#39FF14] hover:bg-slate-800"
              >
                Sign In
              </Button>
              <Button
                onClick={handleBusinessRegister}
                className="bg-[#39FF14] hover:bg-[#32E512] text-black font-semibold"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Modern Booking for
            <span className="text-[#39FF14] block">Beauty Professionals</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Streamline your salon, barbershop, or beauty business with our intelligent booking system. 
            Reduce no-shows, increase revenue, and delight your clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleBusinessRegister}
              className="bg-[#39FF14] hover:bg-[#32E512] text-black font-semibold text-lg px-8 py-3"
            >
              Book Appointment
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLogin}
              className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#39FF14]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed specifically for beauty and wellness professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-[#39FF14]/50 transition-all duration-300">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-[#39FF14] mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose BarbS?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Join thousands of professionals who trust BarbS to grow their business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <div className="w-12 h-12 bg-[#39FF14]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-[#39FF14]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see why beauty professionals choose BarbS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleBusinessRegister}
              className="bg-[#39FF14] hover:bg-[#32E512] text-black font-semibold text-lg px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-3"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-white mb-4 md:mb-0">
              Barb<span className="text-[#39FF14]">S</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 BarbS. All rights reserved.</p>
              <p className="text-sm mt-1">Built for beauty professionals, by professionals</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <BusinessRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
};

export default Index;
