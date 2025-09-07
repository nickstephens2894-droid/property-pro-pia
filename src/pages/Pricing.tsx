import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  ArrowRight, 
  Star, 
  Users, 
  Building2, 
  Calculator,
  FileText,
  Phone,
  Mail,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // SEO for pricing page
    document.title = "Pricing — Property Pro";
    
    const desc = "Flexible pricing plans for Property Pro. Start free with basic analysis or upgrade to Pro for unlimited properties and advanced features. Enterprise plans available.";
    
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
    canonical.href = `${window.location.origin}/pricing`;

    // Add structured data for pricing
    let structuredData = document.querySelector('#pricing-structured-data') as HTMLScriptElement | null;
    if (!structuredData) {
      structuredData = document.createElement('script') as HTMLScriptElement;
      structuredData.id = 'pricing-structured-data';
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

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with property analysis",
      popular: false,
      features: [
        "1 property analysis",
        "Basic 10-year projections",
        "Australian tax calculations", 
        "Single investor support",
        "Standard reporting",
        "Email support"
      ],
      limitations: [
        "Limited to 1 property",
        "Basic features only",
        "No scenario comparison"
      ],
      cta: "Start Free",
      highlight: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "Comprehensive analysis for serious investors",
      popular: true,
      features: [
        "Unlimited properties",
        "40-year detailed projections",
        "Advanced tax optimization",
        "Multi-investor modeling",
        "Construction timeline analysis",
        "Scenario comparison",
        "Professional reports",
        "Priority support",
        "Export capabilities",
        "Advanced charts & graphs"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "Tailored solutions for financial advisors and teams",
      popular: false,
      features: [
        "Everything in Pro",
        "Multi-user access",
        "White-label reports",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Training & onboarding",
        "SLA support",
        "Custom branding",
        "Bulk analysis tools"
      ],
      limitations: [],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle."
    },
    {
      question: "Is there a free trial for the Pro plan?",
      answer: "Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start."
    },
    {
      question: "Are the tax calculations up to date?",
      answer: "Yes, our tax engine is updated annually with the latest Australian tax rates, including 2024-25 rates and Medicare levy calculations."
    },
    {
      question: "Can I analyze properties under construction?",
      answer: "Absolutely. Property Pro includes specialized modeling for construction timelines, progressive drawdowns, and interest during construction."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with Pro, we'll refund your subscription."
    },
    {
      question: "What support is included?",
      answer: "Free users get email support, Pro users get priority support, and Enterprise customers get dedicated account management."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing Plans
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Choose the Right Plan for 
            <span className="text-primary"> Your Investment Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Start free and upgrade as you grow. Professional-grade analysis 
            at a fraction of the cost of traditional valuation reports.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
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
                
                <CardHeader className="text-center pb-8">
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
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            </div>
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

      {/* Feature Comparison */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose 
              <span className="text-primary"> Property Pro?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Compare the value of professional analysis vs. traditional methods
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  Traditional Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Valuation Report</span>
                  <span className="text-sm font-medium">$400-800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Financial Advisor</span>
                  <span className="text-sm font-medium">$200-500/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accountant Review</span>
                  <span className="text-sm font-medium">$150-300/hr</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Cost per Property</span>
                  <span className="text-destructive">$750-1600+</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Property Pro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unlimited Analysis</span>
                  <span className="text-sm font-medium text-primary">Included</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tax Optimization</span>
                  <span className="text-sm font-medium text-primary">Included</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">40-Year Projections</span>
                  <span className="text-sm font-medium text-primary">Included</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>Monthly Cost</span>
                  <span className="text-primary">$49</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked 
              <span className="text-primary"> Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Need a Custom 
              <span className="text-primary"> Solution?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get in touch with our team to discuss Enterprise pricing and custom features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Questions about Enterprise features or custom pricing?
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.open("mailto:sales@propertypro.com.au", "_blank")}
                  className="w-full"
                >
                  sales@propertypro.com.au
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Schedule a Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  See Property Pro in action with a personalized demo.
                </p>
                <Button 
                  onClick={() => window.open("mailto:demo@propertypro.com.au", "_blank")}
                  className="w-full"
                >
                  Book Demo Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your 
            <span className="text-primary"> Free Analysis?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of investors making smarter decisions with Property Pro.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Start Free Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;