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
    title: "Australian Tax Engine",
    description: "Precise negative gearing, depreciation, and CGT calculations specific to Australian tax law with up-to-date rates"
  },
  {
    icon: BarChart3,
    title: "40-Year Projections",
    description: "Comprehensive long-term analysis including rental growth, market cycles, and wealth accumulation tracking"
  },
  {
    icon: Users2,
    title: "Multi-Investor Support",
    description: "Analyze complex ownership structures with multiple investors, varying tax rates, and optimal splits"
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description: "Generate bank-ready documentation and detailed analysis reports for confident investment decisions"
  },
  {
    icon: Building,
    title: "Construction Modeling", 
    description: "Model off-the-plan purchases with progressive payments, timing analysis, and holding costs"
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Instant recalculations as you modify scenarios, saving hours of manual spreadsheet work"
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="h-full group magnetic-hover glass border-2 border-primary/10 hover:border-primary/30 transition-all duration-500"
              style={{ 
                animationDelay: `${index * 100}ms` 
              }}
            >
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-6">
                <div className="mb-4 sm:mb-6 relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-chart-4/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary group-hover:animate-bounce-subtle" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-3 group-hover:gradient-text transition-all duration-300 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
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