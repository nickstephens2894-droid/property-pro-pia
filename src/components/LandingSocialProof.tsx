import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Star, Shield, Award } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen", 
    role: "Property Investor",
    content: "Identified $47,000 in additional tax benefits I would have missed. The detailed projections gave me confidence to proceed.",
    rating: 5
  },
  {
    name: "Michael Thompson",
    role: "Financial Advisor", 
    content: "Property Pro saves me 3+ hours per client analysis while delivering professional-grade reports my clients love.",
    rating: 5
  }
];

const trustSignals = [
  { icon: Shield, text: "Bank-Level Security" },
  { icon: Award, text: "ASIC Compliant" },
  { icon: Star, text: "98% User Satisfaction" }
];

const LandingSocialProof = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Trusted Results
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Real Results from 
            <span className="block text-primary">Real Investors</span>
          </h2>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="text-center p-4 sm:p-0">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
              <AnimatedCounter end={2800} suffix="M+" prefix="$" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">Properties Analyzed</p>
          </div>
          <div className="text-center p-4 sm:p-0">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-success mb-2">
              <AnimatedCounter end={15} suffix="M+" prefix="$" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">Tax Benefits Identified</p>
          </div>
          <div className="text-center p-4 sm:p-0">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-warning mb-2">
              <AnimatedCounter end={98} suffix="%" />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">User Satisfaction</p>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-destructive">Without Property Pro</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>• Hours spent on complex spreadsheets</li>
                <li>• Missing tax optimization opportunities</li>
                <li>• Uncertainty about long-term returns</li>
                <li>• Generic analysis that doesn't fit your situation</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-success">With Property Pro</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>• Professional analysis in minutes</li>
                <li>• Maximize tax benefits automatically</li>
                <li>• Clear 40-year projections with confidence</li>
                <li>• Personalized to your exact circumstances</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-3 sm:mb-4 italic text-sm sm:text-base leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {trustSignals.map((signal, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <signal.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{signal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSocialProof;