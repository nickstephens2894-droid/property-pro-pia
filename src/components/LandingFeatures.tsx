import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Building, 
  Calculator, 
  FileText, 
  PieChart, 
  Zap,
  DollarSign,
  Calendar,
  Users2
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Advanced Tax Calculations",
    description: "Australian-compliant calculations including Div 40/43 depreciation, stamp duty, and Medicare levy across all states."
  },
  {
    icon: Building,
    title: "Property Comparison Engine",
    description: "Compare established vs construction properties with detailed cost-benefit analysis and risk assessment."
  },
  {
    icon: BarChart3,
    title: "40-Year Cash Flow Projections",
    description: "Comprehensive projections with CPI adjustments, rental growth, and capital appreciation scenarios."
  },
  {
    icon: Users2,
    title: "Multi-Investor Modeling",
    description: "Complex ownership structures, trust entities, and investor-specific tax treatment analysis."
  },
  {
    icon: PieChart,
    title: "Scenario Management",
    description: "Create and compare multiple investment scenarios with different variables and assumptions."
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description: "Generate detailed investment reports for clients, lenders, and stakeholders with executive summaries."
  },
  {
    icon: DollarSign,
    title: "Construction Period Analysis",
    description: "Specialized calculations for construction loans, progress payments, and pre-settlement costs."
  },
  {
    icon: Calendar,
    title: "Real-Time Updates",
    description: "Automatic updates to interest rates, tax brackets, and market data for accurate projections."
  },
  {
    icon: Zap,
    title: "Instant Calculations",
    description: "Lightning-fast processing of complex scenarios with real-time results as you adjust parameters."
  }
];

const LandingFeatures = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Professional-Grade Features
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to analyze Australian property investments with precision and confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mb-4">
                  <feature.icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;