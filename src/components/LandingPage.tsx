import { ArrowRight, Calendar, Users, BarChart3, MessageSquare, Globe, Smartphone, QrCode, CheckCircle, Star, TrendingUp, Wifi, Bot, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const features = [
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Share links, QR codes & WhatsApp integration for seamless client booking"
    },
    {
      icon: Users,
      title: "Multi-Staff Profiles",
      description: "Role-based dashboards for Admin, Staff, Assistants"
    },
    {
      icon: BarChart3,
      title: "Smart Reports",
      description: "Daily sales, top customers, peak hours insights"
    },
    {
      icon: MessageSquare,
      title: "Client Reminders",
      description: "WhatsApp or SMS reminders to reduce no-shows"
    },
    {
      icon: Globe,
      title: "Multilingual Interface",
      description: "English, Swahili, Igbo, Yoruba, Hausa, French support"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Clean, mobile-first design that works even on slow connections"
    }
  ];

  const businessTypes = [
    { title: "Salons & Barbers", icon: "💇🏾" },
    { title: "Clinics & Health", icon: "🏥" },
    { title: "Tutors & Trainers", icon: "📚" },
    { title: "Churches & Counselors", icon: "⛪" }
  ];

  const whyDifferent = [
    {
      icon: TrendingUp,
      title: "AI Business Tips",
      description: "Know your best days, clients & services"
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Still functions with weak or no internet"
    },
    {
      icon: Bot,
      title: "WhatsApp Bot Booking",
      description: "Book via chat—no app download needed"
    },
    {
      icon: MapPin,
      title: "Hyperlocal Discovery",
      description: "Help clients find you nearby"
    }
  ];

  const testimonials = [
    {
      name: "Ade",
      business: "Lagos",
      text: "This app changed the way I manage my barbershop. No more guesswork—just growth.",
      rating: 5
    },
    {
      name: "Aisha",
      business: "Nairobi",
      text: "Clients love the WhatsApp booking. I love the weekly insights.",
      rating: 5
    },
    {
      name: "Kwame",
      business: "Accra",
      text: "M-Pesa integration made payments so much easier for my clients.",
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
              Run Your Business, Book Clients, and Get Paid —
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> All in One App</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Empowering African entrepreneurs with bookings, payments, and smart insights — whether you're online or offline.
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
            <Button 
              variant="secondary" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              📲 Download for Android & iOS
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
              Everything You Need in One App
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help African businesses thrive in today's competitive market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Why Different Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Not Just Booking. It's Business Growth.
            </h2>
            <p className="text-xl text-muted-foreground">
              Why we're different from other booking platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyDifferent.map((item, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Market Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who Is This For?
            </h2>
            <p className="text-xl text-muted-foreground">
              From the salon to the classroom, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessTypes.map((type, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground">{type.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by African Entrepreneurs
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from business owners across Africa
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
            Ready to grow your business without the chaos?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of African entrepreneurs already using BizFlow to streamline their operations and boost growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="text-lg px-8 py-4 bg-primary hover:bg-primary/90"
            >
              🔥 Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              📲 Download for Android & iOS
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="text-lg px-8 py-4"
            >
              🎥 Book a Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Cancel anytime
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-muted-foreground">
            <span>💳 M-Pesa</span>
            <span>💳 Paystack</span>
            <span>💳 Flutterwave</span>
            <span>💳 MTN MoMo</span>
            <span>💬 WhatsApp</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;