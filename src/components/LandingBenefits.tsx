import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calculator, 
  Clock, 
  Shield, 
  Zap, 
  TrendingUp 
} from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    title: "Australian Market Expertise",
    description: "Built specifically for Australian property laws, tax regulations, and market conditions",
    highlight: "Local expertise"
  },
  {
    icon: Calculator,
    title: "Precise Tax Calculations",
    description: "Accurate Div 40/43 depreciation, state-specific stamp duty, and Medicare levy calculations",
    highlight: "Tax compliant"
  },
  {
    icon: Clock,
    title: "40-Year Analysis Horizon",
    description: "Long-term projections with inflation, CPI adjustments, and market cycle considerations",
    highlight: "Long-term view"
  },
  {
    icon: Shield,
    title: "Professional Grade Security",
    description: "Bank-level encryption, compliance documentation, and secure data handling",
    highlight: "Enterprise secure"
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Instant calculations and updates as you modify scenarios and assumptions",
    highlight: "Lightning fast"
  },
  {
    icon: TrendingUp,
    title: "Proven ROI Improvements",
    description: "Users typically identify 15-30% more tax benefits and investment opportunities",
    highlight: "Results driven"
  }
];

const LandingBenefits = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
            Why Choose Property Pro
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            The Smart Choice for 
            <span className="block text-primary">Australian Property Analysis</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of investors and advisors who trust Property Pro for accurate, 
            comprehensive property investment analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center text-center p-8 rounded-xl bg-card shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                
                <Badge variant="outline" className="mb-3 text-xs">
                  {benefit.highlight}
                </Badge>
                
                <h3 className="text-xl font-bold mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">
                Trusted by 10,000+ Users
              </h3>
              <p className="text-muted-foreground mb-4">
                Individual investors, financial advisors, and property professionals across Australia
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div>
                  <div className="text-2xl font-bold text-primary">$2.8B+</div>
                  <div>Properties Analyzed</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-success">15M+</div>
                  <div>Tax Benefits Identified</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-warning">98%</div>
                  <div>User Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBenefits;