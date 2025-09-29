import { ArrowRight, Calendar, Users, BarChart3, Clock, CheckCircle, Star, TrendingUp, DollarSign, QrCode, Scissors, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageVisitTracker } from "@/hooks/usePageVisitTracker";
import { useState, useEffect } from "react";
import dashboardMockup from "@/assets/mockup-dashboard.png";
import analyticsMockup from "@/assets/mockup-analytics.png";
import profileMockup from "@/assets/mockup-profile.png";
import bookingsMockup from "@/assets/mockup-bookings.png";
import servicesMockup from "@/assets/mockup-services.png";
import chartsMockup from "@/assets/mockup-charts.png";
import reportsMockup from "@/assets/mockup-reports.png";
import performanceMockup from "@/assets/mockup-performance.png";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  usePageVisitTracker(); // Track visits to landing page
  
  const [animatedText, setAnimatedText] = useState("Earn More");
  
  useEffect(() => {
    const benefits = ["Maximize Revenue", "Streamline Operations", "Scale Efficiently", "Delight Customers", "Enhance Your Brand"];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % benefits.length;
      setAnimatedText(benefits[index]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Effortlessly manage appointments with intelligent time slot optimization and automated reminders."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Keep detailed client profiles, track preferences, and build lasting relationships with your customers."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights into your business performance with comprehensive analytics and detailed reporting."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Monitor service times, optimize workflows, and maximize your business efficiency."
    }
  ];

  const benefits = [
    "Reduce no-shows by up to 75% with automated reminders",
    "Save 3+ hours daily on administrative tasks",
    "Increase customer satisfaction with seamless booking",
    "Boost revenue with detailed performance insights",
    "Professional online presence with custom booking links",
    "Secure data management with enterprise-grade security"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      business: "Elegant Hair Studio",
      text: "BizFlow transformed how I run my salon. Booking management is now effortless!",
      rating: 5
    },
    {
      name: "Mike Chen",
      business: "Urban Barber Co.",
      text: "The analytics helped me identify peak hours and optimize my schedule perfectly.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      business: "Serenity Spa",
      text: "My clients love the easy booking system, and I love the automated reminders.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Mobile Quick Actions - Bottom Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50 md:hidden">
        <div className="flex gap-3">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="flex-1 text-base px-6 py-3 bg-primary hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="flex-1 text-base px-6 py-3"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Trust Badge */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <p className="text-xs sm:text-sm font-semibold text-primary tracking-wider uppercase">
              POWERING 500+ SUCCESSFUL BUSINESSES
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  We will Transform your Business even Better
                </h1>
                <div className="mt-4 h-12 sm:h-14 lg:h-16 overflow-hidden">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary transition-all duration-500 ease-in-out">
                    {animatedText}
                  </h2>
                </div>
                <p className="text-lg sm:text-xl text-muted-foreground mt-6 max-w-lg">
                  BizFlow empowers service businesses to automate scheduling, enhance client relationships, 
                  and accelerate growth — all from one comprehensive platform.
                </p>
              </div>
              
              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Smart Scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Business Intelligence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Professional Presence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Time Optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Growth Tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Brand Excellence</span>
                </div>
              </div>
              
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                Start Your Success Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Customer Avatars and Rating */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-background flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-red-500 border-2 border-background flex items-center justify-center text-white text-sm font-bold">
                    L
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-background flex items-center justify-center text-white text-sm font-bold">
                    +
                  </div>
                </div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">4.9/5 from 500+ business owners</p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Phone Mockups */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main Phone - Dashboard */}
                <div className="relative z-10 transform rotate-[-8deg] hover:rotate-[-5deg] transition-transform duration-300">
                  <img 
                    src={dashboardMockup} 
                    alt="BizFlow Dashboard on iPhone showing appointments, stats, and quick actions"
                    className="w-48 sm:w-60 lg:w-72 h-auto rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl"
                  />
                </div>
                
                {/* Secondary Phone - Analytics positioned behind */}
                <div className="absolute -right-4 sm:-right-6 lg:-right-8 top-12 sm:top-14 lg:top-16 z-0 transform rotate-[12deg] hover:rotate-[8deg] transition-transform duration-300">
                  <img 
                    src={analyticsMockup} 
                    alt="BizFlow Analytics showing business reports and revenue"
                    className="w-36 sm:w-44 lg:w-56 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Revenue Stats Section */}
      <section className="py-16 px-4 bg-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div className="text-4xl md:text-5xl font-bold text-foreground">₦15,750,000</div>
          </div>
          <p className="text-lg text-muted-foreground font-medium tracking-wider uppercase">
            REVENUE GENERATED BY OUR PLATFORM USERS
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Complete Business Solution You Need to <span className="text-primary">{animatedText}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for service-based businesses to excel in today's competitive marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard & Analytics Feature Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  Complete Business Overview at Your Fingertips
                </h3>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get real-time insights into your business performance with comprehensive analytics, 
                revenue tracking, and intelligent business reports that help you make data-driven decisions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Real-time revenue and booking analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Service performance breakdown</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Completion rate tracking</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 lg:gap-6 justify-center">
              <img 
                src={reportsMockup} 
                alt="Business reports showing revenue analytics"
                className="w-36 sm:w-48 lg:w-64 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[-6deg] hover:rotate-[-3deg] transition-transform duration-300"
              />
              <img 
                src={performanceMockup} 
                alt="Service performance analytics with charts"
                className="w-36 sm:w-48 lg:w-64 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[8deg] hover:rotate-[5deg] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Business Profile & Services Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex gap-3 sm:gap-4 lg:gap-6 justify-center lg:order-1">
              <img 
                src={profileMockup} 
                alt="Business profile with QR code for easy booking"
                className="w-36 sm:w-48 lg:w-64 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[5deg] hover:rotate-[2deg] transition-transform duration-300"
              />
              <img 
                src={servicesMockup} 
                alt="Services management with pricing and duration"
                className="w-36 sm:w-48 lg:w-64 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[-10deg] hover:rotate-[-7deg] transition-transform duration-300"
              />
            </div>
            <div className="space-y-6 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="h-8 w-8 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  Professional Online Presence & Service Management
                </h3>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create a professional booking experience for your clients with custom QR codes and links, 
                while efficiently managing your services, pricing, and business profile.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Custom QR codes for instant booking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Service pricing and duration management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Professional business profile setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Management Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-8 w-8 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  Effortless Appointment Management
                </h3>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Streamline your booking process with advanced filtering, search capabilities, 
                and comprehensive appointment tracking. Manage all your client interactions in one place.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Advanced appointment filtering and search</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Real-time booking status updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Client contact information management</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src={bookingsMockup} 
                alt="Bookings management showing appointment list and filtering"
                className="w-48 sm:w-60 lg:w-72 h-auto rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[-4deg] hover:rotate-[-1deg] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why BizFlow Stands Apart
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the advantages that drive business transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories from Business Leaders
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover how BizFlow transforms business operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Revolutionize Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the thousands of successful businesses leveraging BizFlow to optimize operations and accelerate growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="text-lg px-8 py-4 bg-primary hover:bg-primary/90"
            >
              Launch Your Business Transformation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              Request a Personalized Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No commitment required • Risk-free 14-day experience • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;