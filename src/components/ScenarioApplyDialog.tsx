import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { useScenarios } from "@/contexts/ScenariosContext";
import { ConflictCheckResult, ApplyResult } from "@/types/scenarios";
import { formatDate } from "@/utils/formatters";

interface ScenarioApplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioInstanceId: string;
  scenarioInstanceName: string;
  onApplyComplete: (result: ApplyResult) => void;
}

export const ScenarioApplyDialog: React.FC<ScenarioApplyDialogProps> = ({
  isOpen,
  onClose,
  scenarioInstanceId,
  scenarioInstanceName,
  onApplyComplete,
}) => {
  const { checkScenarioInstanceConflicts, applyScenarioInstance } =
    useScenarios();
  const [conflictCheck, setConflictCheck] =
    useState<ConflictCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [resolutionStrategy, setResolutionStrategy] = useState<
    "overwrite" | "merge" | "skip"
  >("overwrite");
  const [error, setError] = useState<string | null>(null);

  // Check for conflicts when dialog opens
  useEffect(() => {
    if (isOpen && scenarioInstanceId) {
      checkConflicts();
    }
  }, [isOpen, scenarioInstanceId]);

  const checkConflicts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkScenarioInstanceConflicts(scenarioInstanceId);
      setConflictCheck(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check conflicts"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      const result = await applyScenarioInstance(scenarioInstanceId, {
        resolution_strategy: resolutionStrategy,
      });
      onApplyComplete(result);
      if (result.success) {
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to apply scenario instance"
      );
    } finally {
      setApplying(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Clock className="h-4 w-4 animate-spin" />;
    if (conflictCheck?.has_conflicts)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (loading) return "Checking for conflicts...";
    if (conflictCheck?.has_conflicts) return "Conflicts detected";
    return "No conflicts found";
  };

  const getStatusColor = () => {
    if (loading) return "secondary";
    if (conflictCheck?.has_conflicts) return "destructive";
    return "default";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Apply Scenario Instance
            <Badge variant={getStatusColor() as any} className="text-xs">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Apply changes from "{scenarioInstanceName}" to the real instance.
            {conflictCheck?.has_conflicts &&
              " Conflicts have been detected that need resolution."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Checking for conflicts...
                </p>
              </div>
            </div>
          ) : conflictCheck ? (
            <>
              {/* Conflict Information */}
              {conflictCheck.has_conflicts && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Conflicts detected:</p>
                      <div className="text-sm space-y-1">
                        {conflictCheck.last_instance_update && (
                          <p>
                            • Instance last updated:{" "}
                            {formatDate(conflictCheck.last_instance_update)}
                          </p>
                        )}
                        {conflictCheck.last_scenario_update && (
                          <p>
                            • Scenario last updated:{" "}
                            {formatDate(conflictCheck.last_scenario_update)}
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Resolution Strategy Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Resolution Strategy
                </Label>
                <RadioGroup
                  value={resolutionStrategy}
                  onValueChange={(value) => setResolutionStrategy(value as any)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem
                      value="overwrite"
                      id="overwrite"
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="overwrite"
                        className="font-medium cursor-pointer"
                      >
                        Overwrite (Recommended)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Replace the real instance with the scenario data. This
                        will overwrite any changes made to the real instance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="merge" id="merge" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="merge"
                        className="font-medium cursor-pointer"
                      >
                        Merge
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Attempt to merge changes intelligently. This may not
                        work for all conflict types.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="skip" id="skip" className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor="skip"
                        className="font-medium cursor-pointer"
                      >
                        Skip
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Skip applying this scenario instance due to conflicts.
                        The scenario will be marked as having conflicts.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Conflict Details */}
              {conflictCheck.conflicts &&
                conflictCheck.conflicts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Conflict Details
                    </Label>
                    <div className="space-y-2">
                      {conflictCheck.conflicts.map((conflict, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {conflict.conflict_type}
                            </Badge>
                            <span className="text-sm font-medium">
                              {conflict.field}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              Scenario value: {String(conflict.scenario_value)}
                            </p>
                            <p>
                              Instance value: {String(conflict.instance_value)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Additional Information */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>What happens when you apply:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        All scenario changes will be applied to the real
                        instance
                      </li>
                      <li>The scenario instance will be marked as synced</li>
                      <li>
                        You can view the updated instance in the Instances tab
                      </li>
                      <li>
                        Future changes to the scenario will update the same real
                        instance
                      </li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          ) : null}
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={applying}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={loading || applying || !conflictCheck}
            className="w-full sm:w-auto"
          >
            {applying ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
