import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  RotateCcw,
  DollarSign,
  Building2,
  PiggyBank,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useScenarioFundingContext } from "@/contexts/ScenarioFundingContext";
import { useScenarios } from "@/contexts/ScenariosContext";
import { useLoanFunds } from "@/hooks/useLoanFunds";
import { useCashFunds } from "@/hooks/useCashFunds";
import { toast } from "sonner";
import {
  ScenarioInstanceFunding,
  CreateScenarioFundingRequest,
  UpdateScenarioFundingRequest,
} from "@/types/scenarios";

interface ScenarioFundingPanelProps {
  scenarioInstanceId: string;
  onApplyFunding?: () => void;
  onRollbackFunding?: () => void;
}

export const ScenarioFundingPanel: React.FC<ScenarioFundingPanelProps> = ({
  scenarioInstanceId,
  onApplyFunding,
  onRollbackFunding,
}) => {
  const {
    scenarioFundings,
    fundingApplications,
    addScenarioFunding,
    updateScenarioFunding,
    removeScenarioFunding,
    applyScenarioFunding,
    rollbackScenarioFunding,
    loading,
  } = useScenarioFundingContext();

  const { scenarios } = useScenarios();
  const { loanFundsWithUsage } = useLoanFunds();
  const { cashFunds } = useCashFunds();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFunding, setEditingFunding] =
    useState<ScenarioInstanceFunding | null>(null);
  const [formData, setFormData] = useState<CreateScenarioFundingRequest>({
    scenario_instance_id: scenarioInstanceId,
    fund_id: "",
    fund_type: "loan",
    amount_allocated: 0,
    notes: "",
  });

  const handleAddFunding = async () => {
    if (!formData.fund_id || formData.amount_allocated <= 0) {
      return;
    }

    const success = await addScenarioFunding(formData);
    if (success) {
      setFormData({
        scenario_instance_id: scenarioInstanceId,
        fund_id: "",
        fund_type: "loan",
        amount_allocated: 0,
        notes: "",
      });
      setShowAddDialog(false);
    }
  };

  const handleEditFunding = (funding: ScenarioInstanceFunding) => {
    setEditingFunding(funding);
    setFormData({
      scenario_instance_id: scenarioInstanceId,
      fund_id: funding.fund_id,
      fund_type: funding.fund_type,
      amount_allocated: funding.amount_allocated,
      notes: funding.notes || "",
    });
    setShowAddDialog(true);
  };

  const handleUpdateFunding = async () => {
    if (!editingFunding) return;

    const updates: UpdateScenarioFundingRequest = {
      amount_allocated: formData.amount_allocated,
      notes: formData.notes,
    };

    const success = await updateScenarioFunding(editingFunding.id, updates);
    if (success) {
      setEditingFunding(null);
      setFormData({
        scenario_instance_id: scenarioInstanceId,
        fund_id: "",
        fund_type: "loan",
        amount_allocated: 0,
        notes: "",
      });
      setShowAddDialog(false);
    }
  };

  const handleRemoveFunding = async (id: string) => {
    await removeScenarioFunding(id);
  };

  const handleApplyFunding = async () => {
    // Find the scenario instance to get the target instance ID
    const scenarioInstance = scenarios
      .flatMap((s) => s.scenario_instances)
      .find((si) => si.id === scenarioInstanceId);

    if (!scenarioInstance?.original_instance_id) {
      toast.error(
        "Cannot apply funding: No target instance found. This scenario instance was not copied from an existing instance."
      );
      return;
    }

    const success = await applyScenarioFunding(
      scenarioInstance.original_instance_id
    );
    if (success && onApplyFunding) {
      onApplyFunding();
    }
  };

  const handleRollbackFunding = async () => {
    const success = await rollbackScenarioFunding();
    if (success && onRollbackFunding) {
      onRollbackFunding();
    }
  };

  const getFundName = (fundId: string, fundType: "loan" | "cash") => {
    if (fundType === "loan") {
      const fund = loanFundsWithUsage.find((f) => f.id === fundId);
      return fund?.name || "Unknown Loan Fund";
    } else {
      const fund = cashFunds.find((f) => f.id === fundId);
      return fund?.name || "Unknown Cash Fund";
    }
  };

  const getFundIcon = (fundType: "loan" | "cash") => {
    return fundType === "loan" ? (
      <Building2 className="h-4 w-4" />
    ) : (
      <PiggyBank className="h-4 w-4" />
    );
  };

  const getApplicationStatus = () => {
    const latestApplication = fundingApplications[0];
    if (!latestApplication) return null;

    return {
      status: latestApplication.status,
      appliedAt: latestApplication.applied_at,
      errorMessage: latestApplication.error_message,
    };
  };

  const applicationStatus = getApplicationStatus();

  // Check if this scenario instance has a target instance to apply to
  const scenarioInstance = scenarios
    .flatMap((s) => s.scenario_instances)
    .find((si) => si.id === scenarioInstanceId);
  const hasTargetInstance = !!scenarioInstance?.original_instance_id;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Scenario Funding</CardTitle>
            <CardDescription>
              Manage funding allocations for this scenario instance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {applicationStatus && (
              <Badge
                variant={
                  applicationStatus.status === "success"
                    ? "default"
                    : applicationStatus.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {applicationStatus.status}
              </Badge>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Funding
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">
              Loading funding data...
            </div>
          </div>
        ) : scenarioFundings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No funding allocated yet</div>
            <div className="text-xs mt-1">
              Click "Add Funding" to get started
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!hasTargetInstance && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> This scenario instance was not copied
                  from an existing instance, so funding cannot be applied to a
                  real instance.
                </div>
              </div>
            )}
            {scenarioFundings.map((funding, index) => {
              // Check if this is a duplicate fund (same fund_id as previous entries)
              const isDuplicateFund = scenarioFundings
                .slice(0, index)
                .some((f) => f.fund_id === funding.fund_id);

              return (
                <div
                  key={funding.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    isDuplicateFund ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getFundIcon(funding.fund_type)}
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {getFundName(funding.fund_id, funding.fund_type)}
                        {isDuplicateFund && (
                          <Badge variant="outline" className="text-xs">
                            Additional Allocation
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {funding.fund_type === "loan"
                          ? "Loan Fund"
                          : "Cash Fund"}{" "}
                        • {formatDate(funding.allocation_date)}
                      </div>
                      {funding.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {funding.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(funding.amount_allocated)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Available:{" "}
                        {formatCurrency(funding.fund_available_amount || 0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditFunding(funding)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFunding(funding.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Funding Summary */}
        {scenarioFundings.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2">Funding Summary</div>
            <div className="space-y-1">
              {Object.entries(
                scenarioFundings.reduce((acc, funding) => {
                  const fundName = getFundName(
                    funding.fund_id,
                    funding.fund_type
                  );
                  if (!acc[fundName]) {
                    acc[fundName] = {
                      total: 0,
                      count: 0,
                      type: funding.fund_type,
                    };
                  }
                  acc[fundName].total += funding.amount_allocated;
                  acc[fundName].count += 1;
                  return acc;
                }, {} as Record<string, { total: number; count: number; type: string }>)
              ).map(([fundName, data]) => (
                <div key={fundName} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {fundName} ({data.count} allocation
                    {data.count !== 1 ? "s" : ""})
                  </span>
                  <span className="font-medium">
                    {formatCurrency(data.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {scenarioFundings.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={handleApplyFunding}
              disabled={!hasTargetInstance}
              className="flex-1"
              title={
                !hasTargetInstance
                  ? "Cannot apply funding: No target instance found"
                  : "Apply funding to real instance"
              }
            >
              <Play className="h-4 w-4 mr-2" />
              Apply Funding
            </Button>
            {applicationStatus?.status === "success" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRollbackFunding}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Rollback
              </Button>
            )}
          </div>
        )}

        {/* Add/Edit Funding Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFunding ? "Edit Funding" : "Add Funding"}
              </DialogTitle>
              <DialogDescription>
                {editingFunding
                  ? "Update the funding allocation for this scenario instance"
                  : "Allocate funding from your available funds to this scenario instance"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fund-type">Fund Type</Label>
                <Select
                  value={formData.fund_type}
                  onValueChange={(value: "loan" | "cash") =>
                    setFormData({ ...formData, fund_type: value, fund_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan">Loan Fund</SelectItem>
                    <SelectItem value="cash">Cash Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fund-id">Fund</Label>
                <Select
                  value={formData.fund_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fund_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fund" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.fund_type === "loan"
                      ? loanFundsWithUsage.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name} -{" "}
                            {formatCurrency(fund.available_amount)}
                          </SelectItem>
                        ))
                      : cashFunds.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            {fund.name} -{" "}
                            {formatCurrency(fund.available_amount)}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount Allocated</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount_allocated}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount_allocated: Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any notes about this funding allocation..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingFunding(null);
                    setFormData({
                      scenario_instance_id: scenarioInstanceId,
                      fund_id: "",
                      fund_type: "loan",
                      amount_allocated: 0,
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    editingFunding ? handleUpdateFunding : handleAddFunding
                  }
                  disabled={!formData.fund_id || formData.amount_allocated <= 0}
                >
                  {editingFunding ? "Update" : "Add"} Funding
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
