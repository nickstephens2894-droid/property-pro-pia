import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Users, Zap } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

const LandingCTA = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-4/5 to-background" />
      <div className="absolute inset-0 gradient-hero-bg opacity-30" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="relative overflow-hidden glass border-2 border-primary/20 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-4/5" />
            <div className="absolute top-0 left-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            
            <CardContent className="relative p-8 lg:p-16 text-center">
              <div className="animate-scale-in">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 text-shadow">
                  Ready to Make Smarter 
                  <span className="block gradient-text animate-glow">Investment Decisions?</span>
                </h2>
              </div>
              
              <div className="animate-fade-in animation-delay-300">
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                  Join <span className="font-bold text-primary">10,000+</span> successful property investors and financial advisors who rely on 
                  Property Pro for accurate Australian property analysis and scenario modeling.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto animate-slide-in-right animation-delay-600">
                <div className="text-center p-6 rounded-2xl glass border border-primary/20 magnetic-hover">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    $<AnimatedCounter end={2.8} suffix="B+" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Properties Analyzed</div>
                </div>
                <div className="text-center p-6 rounded-2xl glass border border-success/20 magnetic-hover">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={15} suffix="M+" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Tax Benefits Found</div>
                </div>
                <div className="text-center p-6 rounded-2xl glass border border-warning/20 magnetic-hover">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={98} suffix="%" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">User Satisfaction</div>
                </div>
                <div className="text-center p-6 rounded-2xl glass border border-chart-4/20 magnetic-hover">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={24} suffix="/7" />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Access & Support</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in animation-delay-900">
                <Button size="lg" asChild className="min-w-[280px] h-14 group magnetic-hover bg-gradient-to-r from-primary to-chart-4 hover:from-chart-4 hover:to-primary transition-all duration-500 text-lg">
                  <Link to="/signup" className="flex items-center gap-3">
                    Start Your Free Analysis
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="min-w-[280px] h-14 magnetic-hover glass border-2 text-lg hover:bg-primary/10">
                  <Link to="/signup">Book Enterprise Demo</Link>
                </Button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Trusted by leading financial advisory firms across Australia
                </p>
                <div className="flex items-center justify-center gap-8 opacity-60">
                  <div className="text-xs font-medium">ASIC Compliant</div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="text-xs font-medium">Bank-Level Security</div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="text-xs font-medium">Australian Owned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Have questions? <Link to="/auth" className="text-primary hover:underline">Contact our property investment specialists</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;