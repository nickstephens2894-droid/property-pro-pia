import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConstructionStage {
  id: string;
  percentage: number;
  month: number;
  description: string;
}

interface ConstructionStagesTableProps {
  stages: ConstructionStage[];
  onChange: (stages: ConstructionStage[]) => void;
  constructionValue: number;
  constructionPeriod: number;
}

export const ConstructionStagesTable = ({ 
  stages, 
  onChange, 
  constructionValue,
  constructionPeriod 
}: ConstructionStagesTableProps) => {
  
  const totalPercentage = stages.reduce((sum, stage) => sum + stage.percentage, 0);
  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01;

  const updateStage = (index: number, field: keyof ConstructionStage, value: any) => {
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    onChange(updatedStages);
  };

  const addStage = () => {
    const newStage: ConstructionStage = {
      id: Date.now().toString(),
      percentage: 0,
      month: constructionPeriod,
      description: 'New stage'
    };
    onChange([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      const updatedStages = stages.filter((_, i) => i !== index);
      onChange(updatedStages);
    }
  };

  const resetToDefaults = () => {
    const defaultStages: ConstructionStage[] = [
      { id: '1', percentage: 10, month: 1, description: 'Site preparation & slab' },
      { id: '2', percentage: 20, month: 2, description: 'Frame & roof' },
      { id: '3', percentage: 25, month: 4, description: 'Lock-up stage' },
      { id: '4', percentage: 25, month: 6, description: 'Fixing stage' },
      { id: '5', percentage: 20, month: 8, description: 'Completion' }
    ];
    
    // Adjust months based on construction period
    const adjustedStages = defaultStages.map((stage, index) => ({
      ...stage,
      month: Math.max(1, Math.round((stage.month / 8) * constructionPeriod))
    }));
    
    onChange(adjustedStages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4" />
          Construction Progress Payments
        </CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Define payment stages throughout the construction period
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Payment Stages</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStage}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stage
          </Button>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div key={stage.id} className="grid grid-cols-12 gap-3 items-end bg-muted/30 p-3 rounded-lg">
              <div className="col-span-5">
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  value={stage.description}
                  onChange={(e) => updateStage(index, 'description', e.target.value)}
                  className="mt-1 text-sm"
                  placeholder="Stage description"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Percentage</Label>
                <div className="relative">
                  <NumberInput
                    id={`percentage-${stage.id}`}
                    value={stage.percentage}
                    onChange={(value) => updateStage(index, 'percentage', value)}
                    className="mt-1 text-sm pr-8"
                    placeholder="0"
                    min={0}
                    max={100}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Month</Label>
                <NumberInput
                  id={`month-${stage.id}`}
                  value={stage.month}
                  onChange={(value) => updateStage(index, 'month', value)}
                  className="mt-1 text-sm"
                  placeholder="1"
                  min={1}
                  max={constructionPeriod || 60}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Amount</Label>
                <div className="text-sm font-medium text-primary mt-1 px-2 py-1.5 bg-primary/5 rounded">
                  ${Math.round((stage.percentage / 100) * constructionValue).toLocaleString()}
                </div>
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStage(index)}
                  disabled={stages.length <= 1}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={`rounded-lg p-3 border ${
          isValidTotal 
            ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
            : 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800'
        }`}>
          <div className={`text-sm font-medium ${
            isValidTotal 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-orange-700 dark:text-orange-300'
          }`}>
            Total: {totalPercentage.toFixed(1)}% 
            {!isValidTotal && (
              <span className="ml-2">⚠️ Should total 100%</span>
            )}
          </div>
          {constructionValue > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Total construction value: ${constructionValue.toLocaleString()}
            </div>
          )}
        </div>

        {!isValidTotal && (
          <Alert>
            <AlertDescription>
              Construction stages should total exactly 100% for accurate payment planning.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};