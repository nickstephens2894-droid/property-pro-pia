import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, Users } from "lucide-react";

const LandingHero = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Smart Analysis for
            <span className="block text-primary">Australian Property</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional-grade property investment analysis with Australian tax calculations, 
            multi-investor modeling, and 40-year projections. For individual investors and financial advisors.
          </p>
          
          <div className="flex justify-center mb-12">
            <Button size="lg" asChild className="min-w-[240px]">
              <Link to="/auth">Start Free Analysis</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
              <Calculator className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Australian Tax Engine</h3>
              <p className="text-muted-foreground text-center">
                Accurate Div 40/43 depreciation, stamp duty, and Medicare levy calculations
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
              <TrendingUp className="h-12 w-12 text-success mb-4" />
              <h3 className="text-lg font-semibold mb-2">40-Year Projections</h3>
              <p className="text-muted-foreground text-center">
                Long-term analysis with inflation, CPI adjustments, and market cycles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;