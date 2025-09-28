import { ArrowRight, Calendar, Users, BarChart3, Clock, CheckCircle, Star, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageVisitTracker } from "@/hooks/usePageVisitTracker";
import { useState, useEffect } from "react";

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
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Trust Badge */}
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-primary tracking-wider uppercase">
              POWERING 500+ SUCCESSFUL BUSINESSES
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  We will Transform your Business even Better
                </h1>
                <div className="mt-4 h-16 overflow-hidden">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary transition-all duration-500 ease-in-out">
                    {animatedText}
                  </h2>
                </div>
                <p className="text-xl text-gray-300 mt-6 max-w-lg">
                  BizFlow empowers service businesses to automate scheduling, enhance client relationships, 
                  and accelerate growth — all from one comprehensive platform.
                </p>
              </div>
              
              {/* Feature Checklist */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-white font-medium">Smart Scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-white font-medium">Business Intelligence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-white font-medium">Professional Presence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-white font-medium">Time Optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-white font-medium">Growth Tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-white font-medium">Brand Excellence</span>
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-slate-700 flex items-center justify-center text-white text-sm font-bold">
                    S
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-slate-700 flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-red-500 border-2 border-slate-700 flex items-center justify-center text-white text-sm font-bold">
                    L
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-slate-700 flex items-center justify-center text-white text-sm font-bold">
                    +
                  </div>
                </div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">4.9/5 from 500+ business owners</p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Phone Mockups */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main Phone */}
                <div className="w-72 h-[580px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Phone Header */}
                    <div className="bg-primary h-24 flex items-center justify-center">
                      <div className="text-white font-bold text-lg">BizFlow Dashboard</div>
                    </div>
                    {/* Dashboard Content */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">42</div>
                          <div className="text-sm text-gray-600">Today's Bookings</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">₦87k</div>
                          <div className="text-sm text-gray-600">Revenue</div>
                        </div>
                      </div>
                      {/* Chart representation */}
                      <div className="bg-gray-50 h-32 rounded-lg flex items-end justify-around p-4">
                        <div className="bg-primary w-6 h-16 rounded-t"></div>
                        <div className="bg-primary w-6 h-20 rounded-t"></div>
                        <div className="bg-primary w-6 h-12 rounded-t"></div>
                        <div className="bg-primary w-6 h-24 rounded-t"></div>
                        <div className="bg-primary w-6 h-18 rounded-t"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Secondary Phone - Smaller, positioned behind */}
                <div className="absolute -right-8 top-16 w-56 h-[450px] bg-gradient-to-b from-slate-700 to-slate-800 rounded-[2.5rem] p-2 shadow-xl opacity-80">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                    <div className="bg-accent h-16 flex items-center justify-center">
                      <div className="text-white font-semibold">Client View</div>
                    </div>
                    <div className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-2">Book Appointment</div>
                        <div className="space-y-2">
                          <div className="bg-gray-100 h-8 rounded"></div>
                          <div className="bg-gray-100 h-8 rounded"></div>
                          <div className="bg-primary h-10 rounded text-white flex items-center justify-center text-sm">
                            Book Now
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Revenue Stats Section */}
      <section className="py-16 px-4 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div className="text-4xl md:text-5xl font-bold text-white">₦15,750,000</div>
          </div>
          <p className="text-lg text-gray-400 font-medium tracking-wider uppercase">
            REVENUE GENERATED BY OUR PLATFORM USERS
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The Complete Business Solution You Need to <span className="text-primary">{animatedText}</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for service-based businesses to excel in today's competitive marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why BizFlow Stands Apart
            </h2>
            <p className="text-xl text-gray-300">
              Experience the advantages that drive business transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-white text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Success Stories from Business Leaders
            </h2>
            <p className="text-xl text-gray-300">
              Discover how BizFlow transforms business operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Revolutionize Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
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
              className="text-lg px-8 py-4 border-gray-600 text-white hover:bg-slate-700"
            >
              Request a Personalized Demo
            </Button>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            No commitment required • Risk-free 14-day experience • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;