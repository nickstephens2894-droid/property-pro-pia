import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Calculator, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp 
} from "lucide-react";

const scenarios = [
  {
    icon: Building2,
    category: "Construction & Development",
    title: "Build in NSW with Equity",
    scenario: "Use $600k equity from your $1.2M investment property to build a $750k house",
    insights: [
      "Year 1 cashflow: -$8,400 (construction period)",
      "Year 10 cashflow: +$18,000/year",
      "Div 40 depreciation: $47k in benefits",
      "NSW construction stamp duty exemption applied"
    ],
    highlight: "Save $12k/year vs established purchase"
  },
  {
    icon: Calculator,
    category: "Budget & Cashflow",
    title: "What's My Maximum Budget?",
    scenario: "With $80k cash + 80% LVR, discover your optimal purchase budget",
    insights: [
      "Maximum budget: $520k (Melbourne growth areas)",
      "Projected cashflow: +$180/week positive",
      "Required income: $85k to service comfortably",
      "Optimal LVR: 85% for tax efficiency"
    ],
    highlight: "Turn cash into $520k buying power"
  },
  {
    icon: Users,
    category: "Multi-Investor Partnership",
    title: "Split Investment Optimally",
    scenario: "Two friends splitting a $900k investment property purchase",
    insights: [
      "Optimal split: 60/40 vs equal 50/50",
      "Combined tax savings: $8,200/year",
      "Individual cashflow: +$2,400 & +$1,600",
      "Exit strategy modeled over 15 years"
    ],
    highlight: "Partnership saves $8k/year in tax"
  },
  {
    icon: TrendingUp,
    category: "Construction vs Established",
    title: "New Build vs Established",
    scenario: "Compare building new $780k vs buying established $800k in QLD",
    insights: [
      "Construction saves: $12,500 stamp duty",
      "Additional depreciation: $85k over 10 years",
      "Cashflow difference: +$220/month in favor of new",
      "Total 10-year advantage: $97,500"
    ],
    highlight: "New construction wins by $97k"
  },
  {
    icon: Shield,
    category: "Advanced Strategy",
    title: "Trust vs Personal Purchase",
    scenario: "Family trust vs personal name for $650k property investment",
    insights: [
      "Trust structure saves: $4,300/year in tax",
      "But reduces CGT discount by 50%",
      "Break-even point: 8.2 years",
      "Recommended: Personal for >10yr hold"
    ],
    highlight: "Smart structure saves $43k"
  },
  {
    icon: Zap,
    category: "Optimal Funding",
    title: "Best Funding Structure",
    scenario: "Compare 5 funding options for $550k off-the-plan apartment",
    insights: [
      "Winner: 85% loan + equity funding",
      "Beats 80% + cash by: $15k/year",
      "Interest deductibility: 100% optimized",
      "Construction loan vs settlement loan analyzed"
    ],
    highlight: "Right structure = $15k/year extra"
  }
];

const LandingScenarios = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
            Smart Scenario Modeling
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            See Your Investment Strategy
            <span className="block text-primary">Before You Commit</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Real scenarios, real numbers, real insights. Each analysis includes Australian tax calculations, 
            state-specific rules, and 40-year projections with CPI adjustments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {scenarios.map((scenario, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <scenario.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {scenario.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg mb-2">{scenario.title}</CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {scenario.scenario}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  {scenario.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{insight}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                  <div className="text-sm font-medium text-primary">
                    💡 {scenario.highlight}
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full group" asChild>
                  <Link to="/auth" className="flex items-center justify-center gap-2">
                    Model This Scenario
                    <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary mb-2">
                Trusted by 10,000+ Users
              </h3>
              <p className="text-muted-foreground mb-4">
                All scenarios based on current Australian tax rates and market data
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div>
                  <div className="text-2xl font-bold text-primary">$2.8B+</div>
                  <div>Properties Analyzed</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-success">15M+</div>
                  <div>Tax Benefits Identified</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-warning">98%</div>
                  <div>User Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingScenarios;