import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Calculator, 
  BarChart3, 
  CheckCircle2,
  Check,
  Star,
  DollarSign,
  Target
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
      description: "Input basic property information and your tax situation."
    },
    {
      icon: BarChart3,
      title: "Get Analysis",
      description: "Receive comprehensive 40-year projections and tax optimization."
    },
    {
      icon: CheckCircle2,
      title: "Make Decision",
      description: "Use professional reports for confident investment decisions."
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

      {/* Simple Process */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Simple 3-Step Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Built for Individual Success
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Personal Tax Optimization</CardTitle>
                <CardDescription>Maximize your tax benefits with calculations specific to your income and situation.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Investment Goal Tracking</CardTitle>
                <CardDescription>Set and track your property investment goals with clear milestone planning.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Start Free, Upgrade When Ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  Start Free Analysis
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg">
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
                  {["Unlimited properties", "40-year projections", "Professional reports"].map((feature, idx) => (
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

      {/* Final CTA */}
      <section className="py-16 px-4">
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