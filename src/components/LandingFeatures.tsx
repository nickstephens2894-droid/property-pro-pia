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
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-8 gradient-text">
            Professional-Grade Features
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Everything you need to analyze Australian property investments with precision and confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="h-full group magnetic-hover glass border-2 border-primary/10 hover:border-primary/30 transition-all duration-500"
              style={{ 
                animationDelay: `${index * 100}ms` 
              }}
            >
              <CardHeader className="pb-6">
                <div className="mb-6 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-primary group-hover:animate-bounce-subtle" />
                  </div>
                </div>
                <CardTitle className="text-xl mb-3 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base">
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