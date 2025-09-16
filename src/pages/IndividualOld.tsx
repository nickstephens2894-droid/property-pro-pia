import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Calculator, 
  FileText, 
  BarChart3, 
  CheckCircle2,
  TrendingUp,
  Check,
  Star,
  DollarSign,
  Target,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Individual = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Property Analysis for Individual Investors — Property Pro";
    
    const desc = "Comprehensive property investment analysis for individual investors. Personal tax optimization, simple property comparison, and free tier available. Start your property investment journey.";
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/individual`;
  }, []);

  const steps = [
    {
      icon: Calculator,
      title: "Enter Property Details",
      description: "Input basic property information, purchase price, and your personal tax situation.",
      features: [
        "Simple property data entry",
        "Personal tax profile setup",
        "Loan structure configuration"
      ]
    },
    {
      icon: TrendingUp,
      title: "Personal Tax Analysis",
      description: "Our engine calculates your specific tax benefits including negative gearing and depreciation.",
      features: [
        "Personal tax bracket optimization",
        "Negative gearing calculations",
        "Depreciation schedules"
      ]
    },
    {
      icon: BarChart3,
      title: "Long-term Projections",
      description: "See 40-year projections showing rental growth, capital gains, and your wealth accumulation.",
      features: [
        "Rental income forecasts",
        "Capital growth scenarios",
        "Wealth accumulation tracking"
      ]
    },
    {
      icon: FileText,
      title: "Investment Report",
      description: "Receive a comprehensive report you can use for loan applications and investment decisions.",
      features: [
        "Bank-ready documentation",
        "Investment summary",
        "Exit strategy planning"
      ]
    }
  ];

  const features = [
    {
      icon: DollarSign,
      title: "Personal Tax Optimization",
      description: "Maximize your tax benefits with calculations specific to your income and situation."
    },
    {
      icon: Target,
      title: "Investment Goal Tracking",
      description: "Set and track your property investment goals with clear milestone planning."
    },
    {
      icon: Clock,
      title: "Quick Analysis",
      description: "Get comprehensive analysis in minutes, not hours of manual calculations."
    },
    {
      icon: CheckCircle2,
      title: "Simple Decision Making",
      description: "Clear recommendations help you make confident investment decisions."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "First-time Property Investor",
      content: "Property Pro helped me understand the real costs and benefits of my first investment property. The tax calculations saved me thousands.",
      rating: 5
    },
    {
      name: "Michael Thompson",
      role: "Property Investor",
      content: "I've analyzed 5 properties with Property Pro. The insights helped me choose the best investment and avoid costly mistakes.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            For Individual Investors
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Make Smarter
            <span className="text-primary"> Property Investment</span> Decisions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professional-grade property analysis designed for individual investors. 
            Understand your tax benefits, project your returns, and build wealth through property.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Your Free Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/how-it-works")}>
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              How Property Pro Works for 
              <span className="text-primary"> Individual Investors</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our simple 4-step process helps you analyze any property investment opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative">
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <CardHeader className="pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Features Designed for 
              <span className="text-primary"> Individual Success</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Start Free, Upgrade When 
              <span className="text-primary"> You're Ready</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold text-foreground">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {["1 property analysis", "Basic 10-year projections", "Australian tax calculations", "Standard reporting"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Start Free Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-foreground">$49</div>
                <span className="text-muted-foreground">/month</span>
                <CardDescription>For serious investors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {["Unlimited properties", "40-year detailed projections", "Advanced tax optimization", "Professional reports", "Scenario comparison"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Start Pro Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories from 
              <span className="text-primary"> Individual Investors</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Start Your Property Investment 
            <span className="text-primary"> Journey Today</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of individual investors making smarter decisions with Property Pro.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Start Your Free Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Individual;