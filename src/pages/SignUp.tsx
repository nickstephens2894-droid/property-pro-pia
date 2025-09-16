import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calculator, TrendingUp, Shield, Clock, Users, Star } from 'lucide-react';

const SignUp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (!loading && user) {
      navigate('/properties');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // SEO and meta tags
    document.title = 'Sign Up - Property Pro | Australian Property Investment Analysis';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join Property Pro and start making informed property investment decisions with our Australian tax-compliant analysis tools. Start your free analysis today.');
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/signup`);
    }
  }, []);

  const features = [
    {
      icon: Calculator,
      title: 'Australian Tax Engine',
      description: 'ATO-compliant calculations for depreciation, capital gains, and rental income tax',
    },
    {
      icon: TrendingUp,
      title: '40-Year Projections',
      description: 'Long-term financial modeling with inflation, growth, and market cycle analysis',
    },
    {
      icon: Shield,
      title: 'Professional Grade',
      description: 'Used by financial advisors, accountants, and property investment professionals',
    },
    {
      icon: Clock,
      title: 'Save Hours of Work',
      description: 'Automated calculations that would take hours to do manually in spreadsheets',
    },
  ];

  const testimonials = [
    {
      quote: "Property Pro has transformed how I analyze investments for my clients. The Australian tax calculations are spot on.",
      author: "Sarah Mitchell",
      role: "Financial Advisor",
    },
    {
      quote: "Finally, a tool that understands Australian property investment rules. Saves me hours on every analysis.",
      author: "David Chen",
      role: "Property Investor",
    },
  ];

  const faqs = [
    {
      question: "Is the free tier really free?",
      answer: "Yes, completely free with no credit card required. Analyze up to 3 properties with full features.",
    },
    {
      question: "How accurate are the tax calculations?",
      answer: "Our calculations follow ATO guidelines and are regularly updated for compliance. Used by professional advisors.",
    },
    {
      question: "Can I export my analysis?",
      answer: "Yes, export detailed reports as PDF or CSV for client presentations and record keeping.",
    },
    {
      question: "Do you support all Australian states?",
      answer: "Yes, we include stamp duty, land tax, and other costs for all Australian states and territories.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5">
              <Star className="w-4 h-4 mr-1" />
              Trusted by 10,000+ Property Professionals
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Make Smarter Property Investment Decisions
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of investors, advisors, and accountants using Australia's most comprehensive 
              property analysis platform. Get ATO-compliant calculations and 40-year projections in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth">Start Free Analysis</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/auth">Already have an account? Sign In</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                3 free property analyses
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Full feature access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Property Professionals Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the Australian market with features you won't find anywhere else
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Start Free, Scale as You Grow</h2>
            <p className="text-xl text-muted-foreground">
              Perfect for individual investors and professional advisory practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Tier</CardTitle>
                <CardDescription className="text-lg">Perfect to get started</CardDescription>
                <div className="text-4xl font-bold text-primary mt-4">$0</div>
                <div className="text-muted-foreground">Forever free</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Up to 3 property analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Full Australian tax calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    40-year projections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    PDF & CSV exports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription className="text-lg">For serious investors & advisors</CardDescription>
                <div className="text-4xl font-bold mt-4">$29</div>
                <div className="text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Unlimited property analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Client management tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Advanced reporting features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Priority support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">Trusted by Professionals</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make Better Investment Decisions?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of property professionals who trust Property Pro for their investment analysis. 
            Start your free analysis in under 2 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/pricing">View Full Pricing</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Setup in 2 minutes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;