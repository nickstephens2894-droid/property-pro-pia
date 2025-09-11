import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Building2, 
  FileText, 
  ArrowRight,
  CheckCircle,
  Play,
  BarChart3,
  Check,
  Star
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
  }, []);

  const steps = [
    {
      step: "01",
      title: "Set Up Your Property",
      description: "Enter basic property details including purchase price, location, and rental expectations.",
      icon: Building2,
    },
    {
      step: "02", 
      title: "Configure Investors",
      description: "Add investor details with income levels and tax rates for personalized analysis.",
      icon: Users,
    },
    {
      step: "03",
      title: "Setup Funding",
      description: "Define loan structures, interest rates, and construction funding requirements.",
      icon: Calculator,
    },
    {
      step: "04",
      title: "Analyze Results",
      description: "Review comprehensive 40-year projections with detailed cash flow and tax analysis.",
      icon: BarChart3,
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

      {/* 4-Step Process */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative border-l-4 border-l-primary">
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
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Professional-Grade Analysis Tools
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Calculator, title: "Australian Tax Engine", description: "Up-to-date calculations including negative gearing, depreciation, and CGT optimization." },
              { icon: BarChart3, title: "40-Year Projections", description: "Comprehensive long-term analysis including rental growth, expenses, and exit strategies." },
              { icon: FileText, title: "Professional Reports", description: "Bank-ready documentation and detailed analysis reports for your investment decisions." },
              { icon: TrendingUp, title: "Scenario Modeling", description: "Compare different investment strategies and see the impact of various market conditions." }
            ].map((capability, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
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

      {/* Simple Pricing */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold text-foreground">$0</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {["1 property analysis", "Basic projections", "Australian tax calculations"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Start Free
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
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
                  {["Unlimited properties", "40-year projections", "Professional reports"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-foreground">Custom</div>
                <CardDescription>For teams and advisors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {["Everything in Pro", "Multi-user access", "White-label reports"].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" onClick={() => navigate("/enterprise")}>
                  Contact Sales
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
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of investors making smarter decisions with Property Pro.
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

export default HowItWorks;