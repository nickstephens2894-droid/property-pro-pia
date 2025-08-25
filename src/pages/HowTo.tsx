import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Building2, 
  PiggyBank, 
  FileText, 
  DollarSign,
  Target,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowTo() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Property Analysis",
      description: "Comprehensive investment property analysis with automated calculations",
      details: "Calculate rental yields, capital growth projections, tax benefits, and total returns"
    },
    {
      icon: Users,
      title: "Multi-Investor Support", 
      description: "Analyze tax outcomes across multiple investors with different income levels",
      details: "Optimize ownership percentages based on individual tax situations"
    },
    {
      icon: TrendingUp,
      title: "Financial Projections",
      description: "10-year projections with detailed cash flow and equity analysis",
      details: "Factor in CPI growth, interest rate changes, and construction timelines"
    },
    {
      icon: PiggyBank,
      title: "Funding Analysis",
      description: "Calculate holding costs, interest during construction, and funding requirements",
      details: "Monthly compounding with progressive drawdown calculations"
    },
    {
      icon: FileText,
      title: "Scenario Modeling",
      description: "Compare different investment scenarios and strategies",
      details: "Save and compare multiple analysis versions for decision making"
    },
    {
      icon: Calculator,
      title: "Tax Calculations",
      description: "Australian tax calculations including CGT, depreciation, and negative gearing",
      details: "Compliant with 2024-25 tax rates and Medicare levy calculations"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Set Up Your Property",
      description: "Start by creating a new property with basic details like purchase price, location, and property type.",
      example: "Example: $800,000 investment property in Brisbane with 6% rental yield"
    },
    {
      step: 2, 
      title: "Add Investor Details",
      description: "Configure investor information including income levels, tax rates, and ownership percentages.",
      example: "Example: Two investors - one earning $120k (37% tax rate), another earning $80k (32.5% tax rate)"
    },
    {
      step: 3,
      title: "Configure Funding",
      description: "Set up loan details, interest rates, and any construction timelines if applicable.",
      example: "Example: 80% LVR at 6.5% interest with 12-month construction period"
    },
    {
      step: 4,
      title: "Review Projections",
      description: "Analyze the 10-year projections including cash flow, tax benefits, and total returns.",
      example: "Example: View detailed year-by-year breakdown of rental income, expenses, and equity growth"
    }
  ];

  const examples = [
    {
      title: "New Build Investment Property",
      description: "A couple purchasing an off-the-plan apartment as an investment",
      details: [
        "Purchase price: $650,000",
        "Construction period: 18 months", 
        "Rental yield: 5.2%",
        "Two investors with different tax rates",
        "Interest during construction: $45,000"
      ],
      result: "Total 10-year return: 8.7% p.a. with $89,000 in tax benefits"
    },
    {
      title: "Established Property Renovation",
      description: "Single investor buying an established property with renovation costs",
      details: [
        "Purchase price: $750,000",
        "Renovation budget: $80,000",
        "Rental yield: 6.1%", 
        "High-income investor (45% tax rate)",
        "Immediate rental commencement"
      ],
      result: "Strong negative gearing benefits with $156,000 total tax savings"
    },
    {
      title: "Development Project",
      description: "Small-scale development with multiple construction stages",
      details: [
        "Land value: $400,000",
        "Construction cost: $850,000",
        "24-month build timeline",
        "Progressive funding drawdowns",
        "Multiple unit sales strategy"
      ],
      result: "Projected profit margin of 22% after all holding costs and taxes"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
          How to Use Property Pro
        </h1>
        <p className="text-base md:text-xl text-muted-foreground mb-4 md:mb-6 max-w-3xl mx-auto px-2">
          Your comprehensive guide to analyzing Australian investment properties with advanced tax calculations, 
          multi-investor support, and detailed financial projections.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
          <Button onClick={() => navigate('/properties/create')} size="lg" className="w-full sm:w-auto">
            Start Your First Analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/instances')} size="lg" className="w-full sm:w-auto">
            View Examples
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm p-2 md:p-3">
            Platform Overview
          </TabsTrigger>
          <TabsTrigger value="getting-started" className="text-xs sm:text-sm p-2 md:p-3">
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="examples" className="text-xs sm:text-sm p-2 md:p-3">
            Real Examples
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-xs sm:text-sm p-2 md:p-3">
            Tips & Best Practices
          </TabsTrigger>
        </TabsList>

        {/* Platform Overview */}
        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What Property Pro Does
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Property Pro is an advanced Australian property investment analysis platform that helps investors 
                make informed decisions through comprehensive financial modeling and tax optimization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <feature.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                          <p className="text-xs text-muted-foreground">{feature.details}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Accurate Australian tax calculations (2024-25 rates)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Multi-investor optimization with ownership percentages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Monthly compounding interest calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Progressive construction drawdown modeling</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">10-year financial projections with CPI indexation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Comprehensive holding cost calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Scenario comparison and analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">CGT estimation and exit strategy planning</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Getting Started */}
        <TabsContent value="getting-started" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Step-by-Step Guide</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Follow these steps to create your first property analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3 md:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-sm md:text-base">{step.title}</h4>
                      <p className="text-muted-foreground mb-2 text-xs md:text-sm">{step.description}</p>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs md:text-sm"><strong>Example:</strong> {step.example}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Property Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Required Information:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground text-xs md:text-sm">
                    <li>• Purchase price and settlement date</li>
                    <li>• Property type and location</li>
                    <li>• Expected rental yield</li>
                    <li>• Construction timeline (if applicable)</li>
                    <li>• Loan details and interest rates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Investor Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>For Each Investor:</strong>
                  <ul className="mt-1 space-y-1 text-muted-foreground text-xs md:text-sm">
                    <li>• Annual income level</li>
                    <li>• Marginal tax rate</li>
                    <li>• Ownership percentage</li>
                    <li>• Medicare levy eligibility</li>
                    <li>• Other investment income</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Examples */}
        <TabsContent value="examples" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Real-World Scenarios</CardTitle>
              <CardDescription className="text-sm md:text-base">
                See how Property Pro analyzes different types of investment properties
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4 md:space-y-6">
            {examples.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">{example.title}</CardTitle>
                  <CardDescription className="text-sm">{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-sm md:text-base">Scenario Details</h5>
                      <ul className="space-y-2">
                        {example.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs md:text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-3 text-sm md:text-base">Analysis Result</h5>
                      <div className="bg-success/10 border border-success/20 rounded-lg p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="font-medium text-success text-sm">Projected Outcome</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">{example.result}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tips & Best Practices */}
        <TabsContent value="tips" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-semibold">Optimize Tax Outcomes</h5>
                  <p className="text-sm text-muted-foreground">
                    Use different ownership percentages between partners to maximize negative gearing benefits 
                    for the higher-income earner.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h5 className="font-semibold">Construction Timeline Impact</h5>
                  <p className="text-sm text-muted-foreground">
                    Longer construction periods significantly impact holding costs. Factor in realistic 
                    timelines and potential delays.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h5 className="font-semibold">Compare Scenarios</h5>
                  <p className="text-sm text-muted-foreground">
                    Create multiple scenarios with different assumptions to understand the range of 
                    possible outcomes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h5 className="font-semibold">Tax Calculations</h5>
                  <p className="text-sm text-muted-foreground">
                    All tax calculations are estimates based on current rates. Consult a tax professional 
                    for specific advice.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h5 className="font-semibold">Market Assumptions</h5>
                  <p className="text-sm text-muted-foreground">
                    Growth projections use historical averages. Actual market performance may vary 
                    significantly from projections.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h5 className="font-semibold">Interest Rate Changes</h5>
                  <p className="text-sm text-muted-foreground">
                    The platform uses fixed rates for projections. Consider sensitivity analysis for 
                    rate changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting the Most Accurate Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Data Quality</Badge>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Use actual contract prices</li>
                    <li>• Get current market rental rates</li>
                    <li>• Include all associated costs</li>
                    <li>• Verify loan terms with lender</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Regular Updates</Badge>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Update interest rates quarterly</li>
                    <li>• Revise rental yields annually</li>
                    <li>• Adjust for tax law changes</li>
                    <li>• Monitor construction progress</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Sensitivity Analysis</Badge>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Test different growth rates</li>
                    <li>• Model interest rate increases</li>
                    <li>• Consider vacancy periods</li>
                    <li>• Plan for unexpected costs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Ready to Start Your Analysis?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of investors using Property Pro to make smarter investment decisions 
          with comprehensive Australian property analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/properties/create')} size="lg">
            <Building2 className="mr-2 h-4 w-4" />
            Create Your First Property Analysis
          </Button>
          <Button onClick={() => navigate('/instances')} variant="outline" size="lg">
            <FileText className="mr-2 h-4 w-4" />
            Browse Example Analyses
          </Button>
        </div>
      </div>
    </div>
  );
}