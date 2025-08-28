import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Clock, Gift, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const WaitlistCTA = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Welcome to the waitlist! Check your email for exclusive updates and early access details.");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
          <CardContent className="relative p-8 lg:p-12">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Gift className="h-3 w-3 mr-1" />
                Exclusive Launch Offer
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Don't Miss Out on
                <span className="block text-primary">Founding Member Benefits</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join over 1,000 smart investors who are already securing their spot for exclusive early access 
                and founding member discounts up to 30% off.
              </p>
            </div>

            <form onSubmit={handleWaitlistSignup} className="max-w-lg mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 text-base"
                  required
                />
                <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 px-8">
                  <Mail className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Securing Spot..." : "Secure My Spot"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">1,000+</div>
                  <div className="text-sm text-muted-foreground">Waitlist Members</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Q1 2025</div>
                  <div className="text-sm text-muted-foreground">Launch Timeline</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50">
                <Gift className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">30% Off</div>
                  <div className="text-sm text-muted-foreground">Launch Discount</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                🔒 No spam, just exclusive updates and early access notifications. 
                Unsubscribe anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WaitlistCTA;