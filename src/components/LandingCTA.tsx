import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Lock } from "lucide-react";

const LandingCTA = () => {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Your Property Investment
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Analysis Today
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Join thousands of investors making smarter decisions with professional-grade analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link to="/auth">
                <span className="relative z-10">Start Free Analysis</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="group border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              asChild
            >
              <Link to="/how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              ASIC Compliant
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Bank-Level Security
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;