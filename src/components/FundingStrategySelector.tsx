import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, DollarSign, Info } from "lucide-react";
import { PropertyData } from "@/contexts/PropertyDataContext";
import { FundingMethod, FUNDING_METHODS } from "@/types/presets";
import { getFundingStrategyDescription } from "@/utils/fundingStrategyUtils";

interface FundingStrategySelectorProps {
  propertyData: PropertyData;
  onStrategySelect: (strategy: FundingMethod) => void;
  className?: string;
}

export const FundingStrategySelector: React.FC<
  FundingStrategySelectorProps
> = ({ propertyData, onStrategySelect, className = "" }) => {
  // Only show for new properties
  if (propertyData.propertyType !== "new") {
    return null;
  }

  const fundingStrategies = [
    {
      id: "loan-cash" as FundingMethod,
      title: "80% Loan + Cash",
      description: "Traditional financing with 80% loan and cash deposit",
      icon: CreditCard,
      features: [
        "80% LVR main loan",
        "Cash deposit for remaining costs",
        "Lower interest rates",
        "Simpler approval process",
      ],
      suitableFor: "First-time investors with cash savings",
    },
    {
      id: "loan-equity" as FundingMethod,
      title: "80% Loan + Equity",
      description: "Use existing property equity to fund the deposit",
      icon: TrendingUp,
      features: [
        "80% LVR main loan",
        "Equity release for deposit",
        "Leverage existing property",
        "Higher borrowing capacity",
      ],
      suitableFor: "Existing property owners with equity",
    },
    {
      id: "full-equity" as FundingMethod,
      title: "Full Equity Funding",
      description: "Use only equity from existing properties",
      icon: DollarSign,
      features: [
        "No main loan required",
        "100% equity funding",
        "No LVR restrictions",
        "Maximum flexibility",
      ],
      suitableFor: "High-equity property owners",
    },
  ];

  const handleStrategyClick = (strategy: FundingMethod) => {
    onStrategySelect(strategy);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Funding Strategy</h3>
        <p className="text-sm text-muted-foreground">
          Select how you want to fund this property purchase. The system will
          automatically calculate the required amounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fundingStrategies.map((strategy) => {
          const Icon = strategy.icon;
          const isSelected =
            propertyData.selectedFundingStrategy === strategy.id;

          return (
            <Card
              key={strategy.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleStrategyClick(strategy.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {strategy.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {strategy.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isSelected && <Badge variant="default">Selected</Badge>}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                    <ul className="text-xs space-y-1">
                      {strategy.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-current rounded-full" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Suitable for:</strong> {strategy.suitableFor}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 p-2 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-primary">
                      <Info className="h-4 w-4" />
                      <span>
                        Strategy applied - Funding amounts calculated
                        automatically
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {propertyData.selectedFundingStrategy && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">
                {FUNDING_METHODS[propertyData.selectedFundingStrategy]?.name}{" "}
                Strategy Applied
              </p>
              <p className="text-muted-foreground">
                {getFundingStrategyDescription(
                  propertyData.selectedFundingStrategy
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
