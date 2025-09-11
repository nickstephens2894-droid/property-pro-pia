import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, Users, LogIn, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LandingHero = () => {
  const { user } = useAuth();

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero-bg opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float blur-sm" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-chart-4/10 rounded-full animate-float animation-delay-1000 blur-sm" />
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-success/10 rounded-full animate-bounce-subtle blur-sm" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 text-shadow">
              Smart Analysis for
              <span className="block gradient-text animate-glow">Australian Property</span>
            </h1>
          </div>
          
          <div className="animate-fade-in animation-delay-300">
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
              Professional-grade property investment analysis with Australian tax calculations, 
              multi-investor modeling, and 40-year projections. For individual investors and financial advisors.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16 animate-slide-in-right animation-delay-600">
            {user ? (
              <Button size="lg" asChild className="min-w-[240px] magnetic-hover glass">
                <Link to="/instances">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="min-w-[240px] magnetic-hover bg-gradient-to-r from-primary to-chart-4 hover:from-chart-4 hover:to-primary transition-all duration-500">
                  <Link to="/signup">Start Free Analysis</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-w-[240px] magnetic-hover glass border-2">
                  <Link to="/auth">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 max-w-3xl mx-auto animate-scale-in animation-delay-900">
            <div className="group flex flex-col items-center p-8 rounded-2xl glass magnetic-hover border-2 border-primary/20">
              <Calculator className="h-16 w-16 text-primary mb-6 group-hover:animate-bounce-subtle" />
              <h3 className="text-xl font-bold mb-3 gradient-text">Australian Tax Engine</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Accurate Div 40/43 depreciation, stamp duty, and Medicare levy calculations
              </p>
            </div>
            
            <div className="group flex flex-col items-center p-8 rounded-2xl glass magnetic-hover border-2 border-success/20">
              <TrendingUp className="h-16 w-16 text-success mb-6 group-hover:animate-bounce-subtle" />
              <h3 className="text-xl font-bold mb-3 gradient-text">40-Year Projections</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
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