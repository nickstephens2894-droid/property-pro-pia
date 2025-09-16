import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  CheckCircle2,
  Check,
  Star,
  Shield,
  Zap,
  Settings,
  Globe,
  Lock,
  Phone,
  Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Enterprise = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Enterprise Solutions for Advisory Businesses — Property Pro";
    
    const desc = "Enterprise property analysis solutions for advisory businesses. Team collaboration, white-label reports, API integrations, and custom solutions for large advisory firms.";
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/enterprise`;
  }, []);

  const steps = [
    {
      icon: Building2,
      title: "Enterprise Setup",
      description: "Custom deployment with your branding, user management, and team structure.",
      features: [
        "Custom branding & white-labeling",
        "Team user management",
        "Role-based access controls"
      ]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Enable your team to collaborate on analyses with shared templates and standards.",
      features: [
        "Shared analysis templates",
        "Team collaboration tools",
        "Standardized reporting"
      ]
    },
    {
      icon: Zap,
      title: "API Integration",
      description: "Integrate Property Pro into your existing systems and workflows.",
      features: [
        "REST API access",
        "Custom integrations",
        "Automated workflows"
      ]
    },
    {
      icon: BarChart3,
      title: "Bulk Analysis",
      description: "Process multiple properties simultaneously with enterprise-grade tools.",
      features: [
        "Bulk property upload",
        "Batch processing",
        "Portfolio analysis"
      ]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Advanced security features including SSO, audit trails, and compliance reporting."
    },
    {
      icon: Settings,
      title: "Custom Configuration",
      description: "Tailored calculation engines and reporting templates for your specific needs."
    },
    {
      icon: Globe,
      title: "Multi-Region Support",
      description: "Deploy across multiple regions with local compliance and data residency."
    },
    {
      icon: Lock,
      title: "Data Privacy",
      description: "Complete data control with on-premises options and strict privacy policies."
    }
  ];

  const enterpriseFeatures = [
    "Everything in Pro plan",
    "Unlimited team users",
    "White-label branding",
    "API access & integrations",
    "Custom calculation rules",
    "Bulk analysis tools",
    "SSO & enterprise security",
    "Dedicated account manager",
    "Priority phone support",
    "Custom training program",
    "SLA guarantees",
    "On-premises deployment options"
  ];

  const useCases = [
    {
      title: "Large Advisory Firms",
      description: "Scale property analysis across hundreds of advisors with consistent branding and reporting.",
      benefits: ["Standardized processes", "Brand consistency", "Scale efficiency"]
    },
    {
      title: "Financial Planning Groups",
      description: "Integrate property analysis into existing financial planning workflows and systems.",
      benefits: ["Workflow integration", "Client portal access", "Automated reporting"]
    },
    {
      title: "Property Investment Platforms",
      description: "White-label property analysis capabilities for your own investment platform.",
      benefits: ["API integration", "Custom branding", "Seamless experience"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Enterprise Solutions
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Enterprise Solutions for
            <span className="text-primary"> Advisory Businesses</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Scalable property analysis platform designed for large advisory firms. 
            White-label solutions, API integrations, and enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.open("mailto:sales@propertypro.com.au", "_blank")}>
              Contact Sales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.open("mailto:demo@propertypro.com.au", "_blank")}>
              Book Enterprise Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise Implementation 
              <span className="text-primary"> Process</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our structured approach ensures smooth deployment and adoption across your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative">
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <CardHeader className="pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise-Grade 
              <span className="text-primary"> Capabilities</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Perfect for 
              <span className="text-primary"> Large Organizations</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features List */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise Plan 
              <span className="text-primary"> Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive features designed for large-scale deployment
            </p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enterpriseFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 pt-8 border-t">
              <p className="text-lg font-semibold mb-4">Custom Pricing Based on Your Needs</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.open("mailto:sales@propertypro.com.au", "_blank")}>
                  Get Custom Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.open("mailto:demo@propertypro.com.au", "_blank")}>
                  Schedule Demo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your 
              <span className="text-primary"> Organization?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Contact our enterprise team to discuss your specific requirements and get a custom solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Enterprise Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Discuss custom solutions, pricing, and implementation timelines.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.open("mailto:sales@propertypro.com.au", "_blank")}
                  className="w-full"
                >
                  sales@propertypro.com.au
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Enterprise Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  See Property Pro Enterprise in action with a personalized demo.
                </p>
                <Button 
                  onClick={() => window.open("mailto:demo@propertypro.com.au", "_blank")}
                  className="w-full"
                >
                  Book Enterprise Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Scale Property Analysis 
            <span className="text-primary"> Across Your Organization</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join leading advisory firms using Property Pro Enterprise to deliver exceptional property investment advice.
          </p>
          <Button size="lg" onClick={() => window.open("mailto:sales@propertypro.com.au", "_blank")}>
            Contact Enterprise Sales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Enterprise;