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
import { Building2, Home, Info } from "lucide-react";
import { PropertyData } from "@/contexts/PropertyDataContext";

interface PropertyTypeSelectorProps {
  propertyData: PropertyData;
  onPropertyTypeChange: (type: "new" | "current") => void;
  className?: string;
  disabled?: boolean;
}

export const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  propertyData,
  onPropertyTypeChange,
  className = "",
  disabled = false,
}) => {
  const propertyTypes = [
    {
      id: "new",
      title: "New Property",
      subtitle: "To Be Purchased",
      description:
        "Calculate projected cashflow and investment returns for a property you plan to purchase. Includes full funding strategy validation and loan calculations.",
      icon: Building2,
      features: [
        "Funding strategy selection",
        "Loan amount validation",
        "Purchase cost calculations",
        "Equity loan calculations",
        "Full project cost validation",
      ],
      badge: "Rigid/Validated Workflow",
    },
    {
      id: "current",
      title: "Current Property",
      subtitle: "Already Owned",
      description:
        "Input your current property details and loan balances to project future tax and cashflow. No funding validation required.",
      icon: Home,
      features: [
        "Current property value input",
        "Historical purchase data",
        "Current loan balances",
        "Forward projections only",
        "Tax calculation optimization",
      ],
      badge: "Input-Based Workflow",
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Property Type</h3>
        <p className="text-sm text-muted-foreground">
          Choose whether this is a new property you plan to purchase or a
          current property you already own.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = propertyData.propertyWorkflowType === type.id;

          return (
            <Card
              key={type.id}
              className={`transition-all duration-200 ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:shadow-md"
              } ${
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : disabled
                  ? ""
                  : "hover:border-primary/50"
              }`}
              onClick={
                disabled
                  ? undefined
                  : () => onPropertyTypeChange(type.id as "new" | "current")
              }
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
                      <CardTitle className="text-base">{type.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {type.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isSelected ? "default" : "secondary"}>
                    {type.badge}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {type.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <ul className="text-xs space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-current rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isSelected && (
                  <div className="mt-4 p-2 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-primary">
                      <Info className="h-4 w-4" />
                      <span>
                        Selected - This workflow will be used for validation and
                        calculations
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {propertyData.propertyType && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">
                {propertyData.propertyType === "new"
                  ? "New Property Workflow"
                  : "Current Property Workflow"}
              </p>
              <p className="text-muted-foreground">
                {propertyData.propertyType === "new"
                  ? "You can select funding strategies and the system will validate that all funding covers the total project cost."
                  : "You can input your current loan balances and historical purchase data. No funding validation will be performed."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
