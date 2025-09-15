import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, Users, LogIn, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LandingHero = () => {
  const { user } = useAuth();

  return (
    <section className="relative py-24 lg:py-40 overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0 gradient-hero-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-4/5" />
      
      {/* Advanced floating elements */}
      <div className="absolute top-16 left-8 w-24 h-24 bg-primary/15 rounded-full animate-float blur-md animate-pulse" />
      <div className="absolute top-32 right-16 w-20 h-20 bg-chart-4/15 rounded-full animate-float animation-delay-1000 blur-md" />
      <div className="absolute bottom-24 left-1/3 w-16 h-16 bg-success/15 rounded-full animate-bounce-subtle blur-md" />
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-chart-2/15 rounded-full animate-float animation-delay-2000 blur-sm" />
      <div className="absolute bottom-40 right-8 w-18 h-18 bg-muted/20 rounded-full animate-pulse animation-delay-1500" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-8 text-shadow">
              <span className="inline-block mb-2 md:mb-4">Smart Analysis for</span>
              <span className="gradient-text animate-glow animate-pulse">Australian Property</span>
            </h1>
          </div>
          
          <div className="animate-fade-in animation-delay-300">
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Professional-grade property investment analysis with Australian tax calculations, 
              multi-investor modeling, and 40-year projections. For individual investors and financial advisors.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-20 animate-slide-in-right animation-delay-600">
            {user ? (
              <Button size="lg" asChild className="min-w-[260px] h-14 magnetic-hover glass border-2 border-primary/30 hover:border-primary/60 text-lg font-semibold">
                <Link to="/instances">
                  <BarChart3 className="h-6 w-6 mr-3" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="min-w-[260px] h-14 magnetic-hover bg-gradient-to-r from-primary to-chart-4 hover:from-chart-4 hover:to-primary transition-all duration-500 text-lg font-semibold shadow-lg hover:shadow-xl">
                  <Link to="/signup">Start Free Analysis</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="min-w-[260px] h-14 magnetic-hover glass border-2 border-primary/30 hover:border-primary/60 text-lg font-semibold">
                  <Link to="/auth">
                    <LogIn className="h-6 w-6 mr-3" />
                    Login
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-16 sm:mt-20 lg:mt-24 max-w-4xl mx-auto animate-scale-in animation-delay-900">
            <div className="group flex flex-col items-center p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl glass magnetic-hover border-2 border-primary/30 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20">
              <div className="p-3 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:bg-primary/20 transition-all duration-300">
                <Calculator className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-primary group-hover:animate-bounce-subtle group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 gradient-text text-center">Australian Tax Engine</h3>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                Accurate Div 40/43 depreciation, stamp duty, and Medicare levy calculations
              </p>
            </div>
            
            <div className="group flex flex-col items-center p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl glass magnetic-hover border-2 border-success/30 hover:border-success/50 transition-all duration-500 hover:shadow-2xl hover:shadow-success/20">
              <div className="p-3 sm:p-4 bg-success/10 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:bg-success/20 transition-all duration-300">
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-success group-hover:animate-bounce-subtle group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 gradient-text text-center">40-Year Projections</h3>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
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