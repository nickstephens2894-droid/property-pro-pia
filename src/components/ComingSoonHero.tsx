import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Clock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const ComingSoonHero = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("You're on the waitlist! Check your email for exclusive updates.");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Clock className="h-4 w-4" />
            Launching Q1 2025
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Revolutionary Analysis for
            <span className="block text-primary">Australian Property</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl text-muted-foreground mt-4">
              Coming Soon
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Be first to access Australia's most advanced property investment platform. 
            Join 1,000+ investors already on the waitlist for exclusive early access and founding member discounts.
          </p>
          
          <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[180px]">
              <Mail className="h-4 w-4 mr-2" />
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>

          <div className="text-sm text-muted-foreground mb-12">
            🎉 <strong>Early Access Bonus:</strong> 30% off your first year + exclusive lease discounts
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
              <Calculator className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Australian Tax Engine</h3>
              <p className="text-muted-foreground text-center">
                Complete Div 40/43 depreciation, stamp duty, and Medicare levy calculations
              </p>
              <div className="mt-2 text-xs text-primary font-medium">Coming in Beta</div>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-sm">
              <TrendingUp className="h-12 w-12 text-success mb-4" />
              <h3 className="text-lg font-semibold mb-2">40-Year Projections</h3>
              <p className="text-muted-foreground text-center">
                Advanced analysis with inflation, CPI adjustments, and market cycles
              </p>
              <div className="mt-2 text-xs text-primary font-medium">Early Access Preview</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoonHero;