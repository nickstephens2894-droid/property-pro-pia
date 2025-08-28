import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, HeadphonesIcon, TrendingUp, Users, DollarSign, Clock, Shield } from "lucide-react";

const EarlyAccessBenefits = () => {
  const benefits = [
    {
      icon: Crown,
      title: "Founding Member Status",
      description: "Lifetime recognition as a founding member with exclusive perks and priority support",
      highlight: "Exclusive",
    },
    {
      icon: DollarSign,
      title: "30% Launch Discount",
      description: "Save 30% on your first year subscription - a $300+ value for founding members",
      highlight: "Limited Time",
    },
    {
      icon: Zap,
      title: "Beta Feature Access",
      description: "First access to new features and tools before they're released to the public",
      highlight: "Early Access",
    },
    {
      icon: HeadphonesIcon,
      title: "Priority Support",
      description: "Direct line to our team with priority response times and personalized onboarding",
      highlight: "VIP",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics Preview",
      description: "Exclusive access to our premium analytics suite during the beta period",
      highlight: "Coming Soon",
    },
    {
      icon: Shield,
      title: "Lease Rate Protection",
      description: "Lock in founding member rates - never pay more than your initial subscription price",
      highlight: "Guaranteed",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Early Access Benefits
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            What's Coming for
            <span className="block text-primary">Founding Members</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our exclusive founding member program and unlock premium benefits that will transform 
            your property investment journey from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{benefit.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {benefit.highlight}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
            <div className="text-muted-foreground">Investors on Waitlist</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">$300+</div>
            <div className="text-muted-foreground">Value in Launch Bonuses</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">Q1 2025</div>
            <div className="text-muted-foreground">Expected Launch Date</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarlyAccessBenefits;