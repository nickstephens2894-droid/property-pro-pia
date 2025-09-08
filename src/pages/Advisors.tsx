import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Users, 
  FileText, 
  BarChart3, 
  CheckCircle2,
  TrendingUp,
  Check,
  Star,
  Clock,
  Target,
  Briefcase,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Advisors = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Professional Tools for Financial Advisors — Property Pro";
    
    const desc = "Professional property analysis tools for financial advisors. Client management, professional reporting, and time-saving tools to enhance your advisory services.";
    
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
    canonical.href = `${window.location.origin}/advisors`;
  }, []);

  const steps = [
    {
      icon: Users,
      title: "Client Onboarding",
      description: "Set up client profiles with their specific tax situations and investment goals.",
      features: [
        "Multiple client management",
        "Individual tax profiles",
        "Investment goal tracking"
      ]
    },
    {
      icon: BarChart3,
      title: "Professional Analysis",
      description: "Generate comprehensive property analysis with professional-grade accuracy.",
      features: [
        "Detailed tax calculations",
        "Scenario comparisons",
        "Risk assessment tools"
      ]
    },
    {
      icon: FileText,
      title: "Client Reports",
      description: "Create professional reports that enhance your credibility and client relationships.",
      features: [
        "Branded professional reports",
        "Executive summaries",
        "Investment recommendations"
      ]
    },
    {
      icon: CheckCircle2,
      title: "Client Presentation",
      description: "Present clear, actionable insights that help clients make confident decisions.",
      features: [
        "Visual presentations",
        "Clear recommendations",
        "Action plan development"
      ]
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Multi-Client Management",
      description: "Organize and manage property analyses for multiple clients efficiently."
    },
    {
      icon: Clock,
      title: "Time-Saving Automation",
      description: "Reduce analysis time from hours to minutes while maintaining accuracy."
    },
    {
      icon: Briefcase,
      title: "Professional Credibility",
      description: "Enhance your professional image with bank-quality analysis reports."
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description: "Meet regulatory requirements with comprehensive documentation."
    }
  ];

  const benefits = [
    {
      title: "Increase Client Satisfaction",
      description: "Provide detailed, professional analysis that exceeds client expectations.",
      metric: "95% client satisfaction rate"
    },
    {
      title: "Save Time",
      description: "Reduce property analysis time from 2-3 hours to 15 minutes per property.",
      metric: "10x faster analysis"
    },
    {
      title: "Expand Services",
      description: "Offer comprehensive property investment advice as a value-added service.",
      metric: "30% service expansion"
    }
  ];

  const testimonials = [
    {
      name: "David Wilson",
      role: "Senior Financial Advisor",
      content: "Property Pro has transformed how I serve my clients. The professional reports give me credibility and help clients understand their investments clearly.",
      rating: 5
    },
    {
      name: "Emma Roberts",
      role: "Financial Planning Director",
      content: "We've integrated Property Pro into our standard service offering. Clients love the detailed analysis and it's become a key differentiator for our practice.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            For Financial Advisors
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Professional Tools for
            <span className="text-primary"> Financial Advisors</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Enhance your advisory services with professional property analysis tools. 
            Provide comprehensive property investment advice that builds client trust and satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Pro Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.open("mailto:demo@propertypro.com.au", "_blank")}>
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Streamlined Workflow for 
              <span className="text-primary"> Professional Advisors</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our advisor-focused workflow helps you deliver exceptional property analysis services.
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
              Features Built for 
              <span className="text-primary"> Advisory Excellence</span>
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

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Transform Your 
              <span className="text-primary"> Advisory Practice</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{benefit.metric}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Professional Pricing for 
              <span className="text-primary"> Advisors</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Affordable professional tools that pay for themselves with just one client
            </p>
          </div>

          <Card className="relative border-primary shadow-lg max-w-md mx-auto">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Most Popular for Advisors
              </Badge>
            </div>
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <div className="text-4xl font-bold text-foreground">$49</div>
              <span className="text-muted-foreground">/month</span>
              <CardDescription>Professional advisor features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {[
                  "Unlimited client properties",
                  "Professional branded reports",
                  "Multi-client management",
                  "Advanced scenario modeling",
                  "Priority support",
                  "Export capabilities"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" onClick={() => navigate("/auth")}>
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by 
              <span className="text-primary"> Financial Advisors</span>
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
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Enhance Your Advisory Services 
            <span className="text-primary"> Today</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of advisors providing exceptional property investment advice with Property Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Pro Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.open("mailto:demo@propertypro.com.au", "_blank")}>
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Advisors;