import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, Zap } from "lucide-react";

const LaunchTimeline = () => {
  const milestones = [
    {
      title: "Core Engine Development",
      description: "Australian tax calculations and property analysis algorithms",
      status: "completed",
      date: "Q3 2024",
    },
    {
      title: "Beta Testing Phase",
      description: "Closed beta with select investors and financial advisors",
      status: "current",
      date: "Q4 2024",
    },
    {
      title: "Early Access Launch",
      description: "Founding members get exclusive access to the platform",
      status: "upcoming",
      date: "Q1 2025",
    },
    {
      title: "Public Launch",
      description: "Full platform availability with all premium features",
      status: "upcoming", 
      date: "Q2 2025",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-success" />;
      case "current":
        return <Zap className="h-6 w-6 text-primary animate-pulse" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "current":
        return <Badge className="bg-primary text-primary-foreground animate-pulse">In Progress</Badge>;
      default:
        return <Badge variant="outline">Coming Soon</Badge>;
    }
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Clock className="h-3 w-3 mr-1" />
            Development Roadmap
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Our Path to
            <span className="block text-primary">Launch</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track our progress as we build Australia's most comprehensive property investment platform. 
            Join early to be part of the journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative">
                  <Card className={`ml-0 md:ml-20 ${milestone.status === 'current' ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="absolute -left-12 top-6 hidden md:block">
                          {getStatusIcon(milestone.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="md:hidden">
                                {getStatusIcon(milestone.status)}
                              </div>
                              <h3 className="text-xl font-semibold">{milestone.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(milestone.status)}
                              <span className="text-sm text-muted-foreground font-medium">
                                {milestone.date}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{milestone.description}</p>
                          
                          {milestone.status === 'current' && (
                            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                              <p className="text-sm text-primary font-medium">
                                🚀 Currently in development - Join the waitlist for immediate access when we launch!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaunchTimeline;