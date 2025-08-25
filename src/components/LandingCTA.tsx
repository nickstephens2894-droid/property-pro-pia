import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Users, Zap } from "lucide-react";

const LandingCTA = () => {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
            <CardContent className="relative p-8 lg:p-12 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Make Smarter 
                <span className="block text-primary">Investment Decisions?</span>
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join 10,000+ successful property investors and financial advisors who rely on 
                Property Pro for accurate Australian property analysis and scenario modeling.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-primary mb-1">$2.8B+</div>
                  <div className="text-sm text-muted-foreground">Properties Analyzed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-success mb-1">15M+</div>
                  <div className="text-sm text-muted-foreground">Tax Benefits Found</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-warning mb-1">98%</div>
                  <div className="text-sm text-muted-foreground">User Satisfaction</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Access & Support</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" asChild className="min-w-[220px] group">
                  <Link to="/auth" className="flex items-center gap-2">
                    Start Your Free Analysis
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="min-w-[220px]">
                  <Link to="/auth">Book Enterprise Demo</Link>
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