import { ArrowRight, Calendar, Users, BarChart3, Clock, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/bce9e11a-cca6-47fb-9dc5-04383b2359db.png" 
              alt="BizFlow Logo" 
              className="w-24 h-24 mx-auto mb-6 rounded-xl"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Streamline Your 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Business</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The complete business management platform designed for service-based businesses. 
              Manage appointments, track analytics, and grow your business efficiently.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="text-lg px-8 py-4 bg-primary hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Free Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>14-Day Trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help service-based businesses thrive in today's competitive market.
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

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose BizFlow?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of businesses already growing with BizFlow
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
              Loved by Business Owners
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say about BizFlow
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
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already using BizFlow to streamline their operations and boost growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="text-lg px-8 py-4 bg-primary hover:bg-primary/90"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              Schedule a Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;