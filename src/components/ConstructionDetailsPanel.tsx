import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Percent, DollarSign, Clock } from "lucide-react";
import { PropertyData } from "@/contexts/PropertyDataContext";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface ConstructionDetailsPanelProps {
  propertyData: PropertyData;
  updateField: (field: keyof PropertyData, value: any) => void;
  isEditMode: boolean;
}

export const ConstructionDetailsPanel: React.FC<
  ConstructionDetailsPanelProps
> = ({ propertyData, updateField, isEditMode }) => {
  if (!propertyData.isConstructionProject) {
    return null;
  }

  const constructionDetails = {
    period: propertyData.constructionPeriod || 0,
    interestRate: propertyData.constructionInterestRate || 0,
    postConstructionReduction: propertyData.postConstructionRateReduction || 0,
    ongoingRate:
      (propertyData.constructionInterestRate || 0) -
      (propertyData.postConstructionRateReduction || 0),
    progressPayments: propertyData.constructionProgressPayments || [],
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Construction Details
        </CardTitle>
        <CardDescription>
          Configure construction timeline, interest rates, and progress payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Construction Timeline */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Construction Timeline
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="constructionPeriod"
                className="text-sm font-medium"
              >
                Construction Period (months)
              </Label>
              {isEditMode ? (
                <Input
                  id="constructionPeriod"
                  type="number"
                  value={constructionDetails.period}
                  onChange={(e) =>
                    updateField(
                      "constructionPeriod",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="e.g., 12"
                  min={1}
                  max={60}
                  className="min-h-[44px]"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {constructionDetails.period} months
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Estimated Completion
              </Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {constructionDetails.period > 0
                    ? new Date(
                        Date.now() +
                          constructionDetails.period * 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()
                    : "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Rates */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Interest Rates
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="constructionInterestRate"
                className="text-sm font-medium"
              >
                Construction Period Rate
              </Label>
              {isEditMode ? (
                <div className="relative">
                  <Input
                    id="constructionInterestRate"
                    type="number"
                    value={constructionDetails.interestRate}
                    onChange={(e) =>
                      updateField(
                        "constructionInterestRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 7.5"
                    min={0}
                    max={20}
                    step="0.01"
                    className="min-h-[44px] pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatPercentage(constructionDetails.interestRate)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="postConstructionRateReduction"
                className="text-sm font-medium"
              >
                Rate Reduction After Construction
              </Label>
              {isEditMode ? (
                <div className="relative">
                  <Input
                    id="postConstructionRateReduction"
                    type="number"
                    value={constructionDetails.postConstructionReduction}
                    onChange={(e) =>
                      updateField(
                        "postConstructionRateReduction",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 0.5"
                    min={0}
                    max={5}
                    step="0.01"
                    className="min-h-[44px] pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatPercentage(
                      constructionDetails.postConstructionReduction
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ongoing Rate Display */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Ongoing Rate After Construction
              </span>
              <Badge
                variant="secondary"
                className="text-blue-700 dark:text-blue-300"
              >
                {formatPercentage(constructionDetails.ongoingRate)}
              </Badge>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This rate will apply for the remainder of the loan term
            </p>
          </div>
        </div>

        {/* Progress Payments */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Progress Payments
          </h4>

          {constructionDetails.progressPayments.length > 0 ? (
            <div className="space-y-3">
              {constructionDetails.progressPayments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Month {payment.month}</Badge>
                    <span className="font-medium">
                      {formatPercentage(payment.percentage)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {payment.description}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(
                      (propertyData.constructionValue || 0) *
                        (payment.percentage / 100)
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No progress payments configured</p>
              <p className="text-sm">
                Progress payments will be calculated based on construction
                timeline
              </p>
            </div>
          )}
        </div>

        {/* Construction Cost Summary */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Construction Cost Summary</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Land Value
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(propertyData.landValue || 0)}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Construction Value
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(propertyData.constructionValue || 0)}
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="text-sm text-primary mb-1">
                Total Project Cost
              </div>
              <div className="text-lg font-semibold text-primary">
                {formatCurrency(
                  (propertyData.landValue || 0) +
                    (propertyData.constructionValue || 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
