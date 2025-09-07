import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // SEO for how it works page
    document.title = "How It Works — Property Pro";
    
    const desc = "Learn how Property Pro analyzes Australian property investments with advanced tax calculations, multi-investor modeling, and detailed financial projections.";
    
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
      icon: Calculator,
      title: "Australian Tax Engine",
      description: "Accurate 2024-25 tax calculations including CGT, depreciation, and negative gearing benefits."
    },
    {
      icon: TrendingUp,
      title: "40-Year Projections",
      description: "Detailed financial modeling with CPI indexation, rental growth, and equity analysis."
    },
    {
      icon: Users,
      title: "Multi-Investor Optimization",
      description: "Optimize ownership structures across multiple investors with different tax situations."
    },
    {
      icon: DollarSign,
      title: "Construction Modeling",
      description: "Progressive drawdown calculations with interest during construction analysis."
    },
    {
      icon: Target,
      title: "Scenario Comparison",
      description: "Compare different investment strategies and funding structures side-by-side."
    },
    {
      icon: FileText,
      title: "Professional Reports",
      description: "Generate comprehensive reports for clients, advisors, and stakeholders."
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
            <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
              View Pricing
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

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Analyze Your 
            <span className="text-primary"> Investment?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of investors using Property Pro for professional-grade analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Start Free Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
              View Pricing Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;