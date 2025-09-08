import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Building2, 
  PiggyBank, 
  FileText, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Play,
  BarChart3,
  Target,
  Zap,
  Check,
  Star,
  User,
  UserCheck,
  Building,
  Shield,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "How It Works & Pricing — Property Pro";
    
    const desc = "Learn how Property Pro's 4-step process provides comprehensive Australian property investment analysis. View pricing plans for individuals, advisors, and advisory businesses.";
    
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
    canonical.href = `${window.location.origin}/how-it-works`;

    // Add structured data for pricing
    let structuredData = document.querySelector('#how-it-works-structured-data') as HTMLScriptElement | null;
    if (!structuredData) {
      structuredData = document.createElement('script') as HTMLScriptElement;
      structuredData.id = 'how-it-works-structured-data';
      structuredData.type = 'application/ld+json';
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Property Pro",
        "description": "Professional Australian property investment analysis platform",
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Plan",
            "price": "0",
            "priceCurrency": "AUD",
            "description": "Basic property analysis with limited features"
          },
          {
            "@type": "Offer", 
            "name": "Pro Plan",
            "price": "49",
            "priceCurrency": "AUD",
            "description": "Unlimited properties with advanced analysis features"
          }
        ]
      });
      document.head.appendChild(structuredData);
    }
  }, []);

  const steps = [
    {
      step: "01",
      title: "Set Up Your Property",
      description: "Enter basic property details including purchase price, location, and rental expectations.",
      icon: Building2,
      features: ["Property value & location", "Expected rental yield", "Construction timeline", "Transaction costs"]
    },
    {
      step: "02", 
      title: "Configure Investors",
      description: "Add investor details with income levels and tax rates for personalized analysis.",
      icon: Users,
      features: ["Multiple investor support", "Individual tax rates", "Ownership percentages", "Income optimization"]
    },
    {
      step: "03",
      title: "Setup Funding",
      description: "Define loan structures, interest rates, and construction funding requirements.",
      icon: PiggyBank,
      features: ["Loan details & LVR", "Interest rate scenarios", "Construction finance", "Progressive drawdowns"]
    },
    {
      step: "04",
      title: "Analyze Results",
      description: "Review comprehensive 40-year projections with detailed cash flow and tax analysis.",
      icon: BarChart3,
      features: ["40-year projections", "Tax optimization", "Cash flow analysis", "Scenario comparison"]
    }
  ];

  const capabilities = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Enterprise-grade encryption and data protection for your investment information."
    },
    {
      icon: Calculator,
      title: "Australian Tax Engine",
      description: "Up-to-date calculations including negative gearing, depreciation, and CGT optimization."
    },
    {
      icon: BarChart3,
      title: "40-Year Projections",
      description: "Comprehensive long-term analysis including rental growth, expenses, and exit strategies."
    },
    {
      icon: FileText,
      title: "Professional Reports",
      description: "Bank-ready documentation and detailed analysis reports for your investment decisions."
    },
    {
      icon: TrendingUp,
      title: "Scenario Modeling",
      description: "Compare different investment strategies and see the impact of various market conditions."
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Instant recalculations as you adjust parameters, saving hours of manual work."
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      popular: false,
      features: [
        "1 property analysis",
        "Basic 10-year projections",
        "Australian tax calculations",
        "Standard reporting"
      ],
      cta: "Start Free",
      highlight: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For serious investors",
      popular: true,
      features: [
        "Unlimited properties",
        "40-year detailed projections",
        "Advanced tax optimization",
        "Professional reports",
        "Scenario comparison"
      ],
      cta: "Start Pro Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "Tailored solutions for teams",
      popular: false,
      features: [
        "Everything in Pro",
        "Multi-user access",
        "White-label reports",
        "API access",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  const audiences = [
    {
      icon: User,
      title: "Individual Investors",
      description: "Personal property analysis and tax optimization for building wealth through property investment.",
      features: ["Personal tax optimization", "Simple property comparison", "Free tier available"],
      link: "/individual",
      cta: "View for Individuals"
    },
    {
      icon: UserCheck,
      title: "Financial Advisors",
      description: "Professional tools for advisors to provide comprehensive property analysis to clients.",
      features: ["Client management", "Professional reporting", "Time-saving tools"],
      link: "/advisors",
      cta: "View for Advisors"
    },
    {
      icon: Building,
      title: "Advisory Businesses",
      description: "Enterprise solutions for advisory firms with team collaboration and white-label options.",
      features: ["Team collaboration", "White-label reports", "API integrations"],
      link: "/enterprise",
      cta: "View Enterprise Solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            How It Works
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Professional Property Analysis 
            <span className="text-primary"> Made Simple</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Learn how Property Pro transforms complex Australian property investment analysis 
            into clear, actionable insights with our four-step process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              <Play className="mr-2 h-4 w-4" />
              Start Free Analysis
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/signup")}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Four Simple Steps to 
              <span className="text-primary"> Professional Analysis</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process takes you from property idea to comprehensive financial analysis in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Professional-Grade 
              <span className="text-primary"> Analysis Tools</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Australian property investment with accurate tax calculations and comprehensive modeling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <capability.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{capability.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {capability.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example Results */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              See What You'll 
              <span className="text-primary"> Discover</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Property Pro reveals insights that traditional calculators miss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-5 w-5" />
                  Investment Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">40-Year Total Return</span>
                    <span className="font-semibold text-success">8.7% p.a.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tax Benefits (10 years)</span>
                    <span className="font-semibold">$89,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Equity Growth</span>
                    <span className="font-semibold">$445,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Optimal 70/30 ownership split for tax efficiency</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Construction timeline adds $12k in holding costs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Breakeven achieved in year 3 with rental growth</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Overview Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Pricing Plans
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Choose the Right Plan for 
              <span className="text-primary"> Your Investment Journey</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free and upgrade as you grow. Professional-grade analysis at a fraction of traditional costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.highlight ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period !== "contact us" && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.highlight ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      if (plan.name === "Enterprise") {
                        window.open("mailto:sales@propertypro.com.au", "_blank");
                      } else {
                        navigate("/auth");
                      }
                    }}
                  >
                    {plan.cta}
                    {plan.name !== "Enterprise" && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Selector Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Tailored Solutions for 
              <span className="text-primary"> Your Needs</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover how Property Pro works specifically for your role and requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {audiences.map((audience, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <audience.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{audience.title}</CardTitle>
                  <CardDescription>{audience.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {audience.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(audience.link)}
                  >
                    {audience.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your 
            <span className="text-primary"> Investment Analysis?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of investors making smarter decisions with professional-grade analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/signup")}>
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;