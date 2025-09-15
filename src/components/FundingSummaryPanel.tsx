import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { InstanceFunding, FundingSummary } from "@/types/funding";
import { useFunding } from "@/contexts/FundingContext";

interface FundingSummaryPanelProps {
  instanceId: string;
  totalRequired: number;
  onAddFunding: () => void;
}

export function FundingSummaryPanel({
  instanceId,
  totalRequired,
  onAddFunding,
}: FundingSummaryPanelProps) {
  const { instanceFundings } = useFunding();

  // Filter fundings for this specific instance
  const fundings = instanceFundings.filter((f) => f.instance_id === instanceId);
  const totalAllocated = fundings.reduce(
    (sum, funding) => sum + funding.amount_allocated,
    0
  );
  const totalUsed = fundings.reduce(
    (sum, funding) => sum + funding.amount_used,
    0
  );
  const shortfall = Math.max(0, totalRequired - totalAllocated);
  const surplus = Math.max(0, totalAllocated - totalRequired);
  const allocationPercentage =
    totalRequired > 0 ? (totalAllocated / totalRequired) * 100 : 0;

  const getStatusColor = () => {
    if (allocationPercentage >= 100) return "text-green-600";
    if (allocationPercentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (allocationPercentage >= 100) return <CheckCircle className="h-4 w-4" />;
    if (allocationPercentage >= 80)
      return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (allocationPercentage >= 100) return "Fully Funded";
    if (allocationPercentage >= 80) return "Mostly Funded";
    return "Under Funded";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Required</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(totalRequired)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Allocated</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(totalAllocated)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(totalUsed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funding Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Funding Progress</CardTitle>
            {/* <Button onClick={onAddFunding} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Funding
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Allocation Progress</span>
              <span>{allocationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={allocationPercentage} className="h-3" />
          </div>

          {/* Shortfall/Surplus Indicators */}
          {shortfall > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Funding Shortfall
                </p>
                <p className="text-sm text-red-600">
                  {formatCurrency(shortfall)} still needed to fully fund this
                  project
                </p>
              </div>
            </div>
          )}

          {surplus > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Funding Surplus
                </p>
                <p className="text-sm text-green-600">
                  {formatCurrency(surplus)} allocated above project requirements
                </p>
              </div>
            </div>
          )}

          {/* Fund Breakdown */}
          {fundings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Fund Breakdown</h4>
              <div className="space-y-3">
                {(() => {
                  // Group fundings by fund_id and fund_type
                  const groupedFundings = fundings.reduce((acc, funding) => {
                    const key = `${funding.fund_id}-${funding.fund_type}`;
                    if (!acc[key]) {
                      acc[key] = {
                        fund_name: funding.fund_name,
                        fund_type: funding.fund_type,
                        allocations: [],
                      };
                    }
                    acc[key].allocations.push(funding);
                    return acc;
                  }, {} as Record<string, { fund_name: string; fund_type: string; allocations: InstanceFunding[] }>);

                  return Object.values(groupedFundings).map(
                    (group, groupIndex) => {
                      const totalFromFund = group.allocations.reduce(
                        (sum, alloc) => sum + alloc.amount_allocated,
                        0
                      );

                      return (
                        <div key={groupIndex} className="space-y-1">
                          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  group.fund_type === "loan"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {group.fund_type}
                              </Badge>
                              <span className="text-sm font-medium">
                                {group.fund_name}
                              </span>
                              {group.allocations.length > 1 && (
                                <span className="text-xs text-muted-foreground">
                                  ({group.allocations.length} allocations)
                                </span>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {formatCurrency(totalFromFund)}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                (
                                {(
                                  (totalFromFund / totalAllocated) *
                                  100
                                ).toFixed(1)}
                                %)
                              </span>
                            </div>
                          </div>
                          {/* Show individual allocations if more than one */}
                          {group.allocations.length > 1 && (
                            <div className="ml-4 space-y-1">
                              {group.allocations.map(
                                (allocation, allocIndex) => (
                                  <div
                                    key={allocation.id}
                                    className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded"
                                  >
                                    <span>
                                      Allocation #{allocIndex + 1} -{" "}
                                      {new Date(
                                        allocation.allocation_date
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(
                                        allocation.amount_allocated
                                      )}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  );
                })()}
              </div>
            </div>
          )}

          {fundings.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Funding Added
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add funding sources to track your project's financial resources
              </p>
              <Button onClick={onAddFunding}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Funding
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
