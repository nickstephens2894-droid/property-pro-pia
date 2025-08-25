import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  User, 
  Building2, 
  Calculator, 
  TrendingUp, 
  Users, 
  FileBarChart, 
  Shield, 
  Briefcase 
} from "lucide-react";

const LandingAudiences = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Built for Your Success
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're an individual investor or managing multiple clients, 
            Property Pro adapts to your specific needs.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Individual Investors */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                For Individual Investors
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Make confident property investment decisions with professional-grade analysis tools.
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
                <Calculator className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Personal Tax Optimization</h4>
                  <p className="text-muted-foreground text-sm">
                    Calculate exact tax benefits based on your income bracket and circumstances
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
                <Building2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Property Comparison</h4>
                  <p className="text-muted-foreground text-sm">
                    Compare multiple properties side-by-side with detailed ROI analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
                <TrendingUp className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Long-term Projections</h4>
                  <p className="text-muted-foreground text-sm">
                    See exactly how your investment will perform over 40 years
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Success Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic mb-4">
                  "Property Pro helped me identify $47,000 in additional tax benefits I would have missed. 
                  The detailed projections gave me confidence to proceed with my investment."
                </p>
                <p className="font-semibold">— Sarah M., Property Investor</p>
              </CardContent>
            </Card>
            
            <div className="text-center lg:text-left">
              <Button size="lg" asChild>
                <Link to="/auth">Start Your Free Analysis</Link>
              </Button>
            </div>
          </div>
          
          {/* Financial Advisors */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-6">
                <Briefcase className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                For Financial Advisors
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Manage multiple client portfolios with enterprise-grade tools and compliance features.
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
                <Users className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Client Portfolio Management</h4>
                  <p className="text-muted-foreground text-sm">
                    Organize and track unlimited client properties and investment scenarios
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
                <FileBarChart className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Professional Reports</h4>
                  <p className="text-muted-foreground text-sm">
                    Generate branded reports with executive summaries and detailed analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
                <Shield className="h-6 w-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Compliance & Security</h4>
                  <p className="text-muted-foreground text-sm">
                    Bank-level security with audit trails and compliance documentation
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardHeader>
                <CardTitle className="text-success">Enterprise Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unlimited client accounts and properties</li>
                  <li>• White-label reporting with your branding</li>
                  <li>• Advanced permission controls</li>
                  <li>• Dedicated account management</li>
                  <li>• API integration capabilities</li>
                </ul>
              </CardContent>
            </Card>
            
            <div className="text-center lg:text-left">
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAudiences;