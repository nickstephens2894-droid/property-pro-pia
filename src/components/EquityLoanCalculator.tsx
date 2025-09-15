import { useState, useMemo } from "react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Separator } from "@/components/ui/separator";
import { Calculator, Home, AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface EquityLoanCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyEquityLoan?: (equityLoanAmount: number) => void;
}

export default function EquityLoanCalculator({ 
  open, 
  onOpenChange, 
  onApplyEquityLoan
}: EquityLoanCalculatorProps) {
  const { propertyData, updateField, calculateTotalProjectCost } = usePropertyData();
  
  // Local state for calculator inputs
  const [primaryPropertyValue, setPrimaryPropertyValue] = useState(propertyData.primaryPropertyValue);
  const [existingDebt, setExistingDebt] = useState(propertyData.existingDebt);
  const [maxLVR, setMaxLVR] = useState(propertyData.maxLVR);

  const calculations = useMemo(() => {
    // Calculate available equity
    const maxDebtAllowed = (primaryPropertyValue * maxLVR) / 100;
    const availableEquity = Math.max(0, maxDebtAllowed - existingDebt);
    
    // Calculate total project cost and funding shortfall
    const totalProjectCost = calculateTotalProjectCost();
    const mainLoanAmount = propertyData.loanAmount || 0;
    const cashDeposit = propertyData.depositAmount || 0;
    
    // Calculate how much equity loan is needed
    const fundingShortfall = totalProjectCost - mainLoanAmount - cashDeposit;
    const requiredEquityLoan = Math.max(0, fundingShortfall);
    
    // Check if equity is sufficient
    const isEquitySufficient = availableEquity >= requiredEquityLoan;
    const equityLoanAmount = Math.min(requiredEquityLoan, availableEquity);
    const remainingEquity = availableEquity - equityLoanAmount;
    
    // Calculate effective LVR on primary property after equity loan
    const newDebt = existingDebt + equityLoanAmount;
    const newLVR = primaryPropertyValue > 0 ? (newDebt / primaryPropertyValue) * 100 : 0;

    return {
      availableEquity,
      totalProjectCost,
      mainLoanAmount,
      cashDeposit,
      fundingShortfall,
      requiredEquityLoan,
      equityLoanAmount,
      remainingEquity,
      isEquitySufficient,
      newDebt,
      newLVR
    };
  }, [primaryPropertyValue, existingDebt, maxLVR, propertyData.loanAmount, propertyData.depositAmount, calculateTotalProjectCost]);

  const applyEquityLoan = () => {
    // Update the context with the calculated equity loan amount and property details
    updateField('primaryPropertyValue', primaryPropertyValue);
    updateField('existingDebt', existingDebt);
    updateField('maxLVR', maxLVR);
    
    if (onApplyEquityLoan) {
      onApplyEquityLoan(calculations.equityLoanAmount);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Equity Loan Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate how much equity you can access from your primary property to fund this investment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Investment Project Summary */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Investment Project Funding Requirement</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Total Project Cost:</span>
                <div className="font-medium">{formatCurrency(calculations.totalProjectCost)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Main Loan:</span>
                <div className="font-medium">{formatCurrency(calculations.mainLoanAmount)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Cash Deposit:</span>
                <div className="font-medium">{formatCurrency(calculations.cashDeposit)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Funding Gap:</span>
                <div className={`font-medium ${calculations.fundingShortfall > 0 ? 'text-warning' : 'text-success'}`}>
                  {formatCurrency(calculations.fundingShortfall)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equity Loan Security Property Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Equity Loan Security Property Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calc-property-value" className="text-sm font-medium">
                  Current Property Value
                </Label>
                <CurrencyInput
                  id="calc-property-value"
                  value={primaryPropertyValue}
                  onChange={setPrimaryPropertyValue}
                  placeholder="Enter property value"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc-existing-debt" className="text-sm font-medium">
                  Existing Debt
                </Label>
                <CurrencyInput
                  id="calc-existing-debt"
                  value={existingDebt}
                  onChange={setExistingDebt}
                  placeholder="Enter current debt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc-max-lvr" className="text-sm font-medium">
                  Maximum LVR Available
                </Label>
                <NumberInput
                  id="calc-max-lvr"
                  value={maxLVR}
                  onChange={setMaxLVR}
                  placeholder="e.g., 80"
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Equity Calculation Results */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Equity Calculation Results
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="text-xs text-muted-foreground">Available Equity</div>
                <div className="text-lg font-semibold text-primary">
                  {formatCurrency(calculations.availableEquity)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Max debt: {formatCurrency((primaryPropertyValue * maxLVR) / 100)}
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="text-xs text-muted-foreground">Required Equity Loan</div>
                <div className={`text-lg font-semibold ${calculations.isEquitySufficient ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(calculations.requiredEquityLoan)}
                </div>
                <div className="text-xs text-muted-foreground">
                  To cover funding gap
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="text-xs text-muted-foreground">Remaining Equity</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(calculations.remainingEquity)}
                </div>
                <div className="text-xs text-muted-foreground">
                  After equity loan
                </div>
              </div>
            </div>

            {/* Status indicator and warnings */}
            <div className="space-y-3">
              {calculations.isEquitySufficient ? (
                <div className="flex items-start gap-2 text-success text-sm p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Sufficient equity available</div>
                    <div className="mt-1 text-xs">
                      You can access {formatCurrency(calculations.equityLoanAmount)} equity loan to fund this investment.
                      Your primary property LVR will be {calculations.newLVR.toFixed(1)}%.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Insufficient equity available</div>
                    <div className="mt-1 text-xs">
                      You need {formatCurrency(calculations.requiredEquityLoan)} but only have {formatCurrency(calculations.availableEquity)} available.
                      Consider increasing your primary property value, reducing existing debt, or increasing the cash deposit.
                    </div>
                  </div>
                </div>
              )}

              {calculations.newLVR > 85 && (
                <div className="flex items-start gap-2 text-warning text-sm p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">High LVR Warning</div>
                    <div className="mt-1 text-xs">
                      Your primary property LVR will be {calculations.newLVR.toFixed(1)}%. 
                      Consider if this level of leverage is appropriate for your situation.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={applyEquityLoan}
              disabled={!calculations.isEquitySufficient}
            >
              Apply to Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}