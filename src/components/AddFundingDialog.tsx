import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, DollarSign, Building2 } from "lucide-react";
import { useLoanFunds } from "@/hooks/useLoanFunds";
import { useCashFunds } from "@/hooks/useCashFunds";
import { useFunding } from "@/contexts/FundingContext";
import { formatCurrency } from "@/utils/formatters";
import { InstanceFunding, CreateInstanceFundingRequest } from "@/types/funding";

interface AddFundingDialogProps {
  instanceId: string;
  onFundingAdded: (funding: InstanceFunding) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundingDialog({
  instanceId,
  onFundingAdded,
  open,
  onOpenChange,
}: AddFundingDialogProps) {
  const [activeTab, setActiveTab] = useState<"loan" | "cash">("loan");
  const [selectedFundId, setSelectedFundId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    isAvailable: boolean;
    message?: string;
  } | null>(null);

  const { loanFundsWithUsage, getFundAvailability: checkLoanAvailability } =
    useLoanFunds();
  const { cashFunds, getFundAvailability: checkCashAvailability } =
    useCashFunds();
  const { addInstanceFunding, checkFundAvailability } = useFunding();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedFundId("");
      setAmount("");
      setNotes("");
      setAvailabilityCheck(null);
    }
  }, [open]);

  // Check availability when amount or fund changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedFundId || !amount) {
        setAvailabilityCheck(null);
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setAvailabilityCheck({
          isAvailable: false,
          message: "Amount must be greater than 0",
        });
        return;
      }

      try {
        const result = await checkFundAvailability(
          selectedFundId,
          activeTab,
          amountNum
        );
        setAvailabilityCheck({
          isAvailable: result.isAvailable,
          message: result.message,
        });
      } catch (error) {
        setAvailabilityCheck({
          isAvailable: false,
          message: "Error checking availability",
        });
      }
    };

    const timeoutId = setTimeout(checkAvailability, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [selectedFundId, amount, activeTab, checkFundAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFundId || !amount) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (!availabilityCheck?.isAvailable) return;

    setIsSubmitting(true);
    try {
      const fundingData: CreateInstanceFundingRequest = {
        instance_id: instanceId,
        fund_id: selectedFundId,
        fund_type: activeTab,
        amount_allocated: amountNum,
        notes: notes.trim() || undefined,
      };

      const newFunding = await addInstanceFunding(fundingData);
      if (newFunding) {
        onFundingAdded(newFunding);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding funding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableFunds = activeTab === "loan" ? loanFundsWithUsage : cashFunds;
  const selectedFund = availableFunds.find(
    (fund) => fund.id === selectedFundId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Funding to Instance</DialogTitle>
          <DialogDescription>
            Select a fund and allocate an amount to this property investment
            instance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "loan" | "cash")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="loan" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Loan Funds
              </TabsTrigger>
              <TabsTrigger value="cash" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cash Funds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="loan" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan-fund">Select Loan Fund</Label>
                <Select
                  value={selectedFundId}
                  onValueChange={setSelectedFundId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a loan fund" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanFundsWithUsage.map((fund) => (
                      <SelectItem key={fund.id} value={fund.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{fund.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {formatCurrency(fund.available_amount)} available
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="cash" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cash-fund">Select Cash Fund</Label>
                <Select
                  value={selectedFundId}
                  onValueChange={setSelectedFundId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a cash fund" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashFunds.map((fund) => (
                      <SelectItem key={fund.id} value={fund.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{fund.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {formatCurrency(fund.available_amount)} available
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {selectedFund && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedFund.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Total Amount:
                      </span>
                      <p className="font-medium">
                        {formatCurrency(
                          selectedFund.fundAmount || selectedFund.total_amount
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedFund.available_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Used:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedFund.used_amount || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usage:</span>
                      <p className="font-medium">
                        {selectedFund.usage_percentage?.toFixed(1) || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Allocate</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
            {availabilityCheck && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  availabilityCheck.isAvailable
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>{availabilityCheck.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this funding allocation"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedFundId ||
                !amount ||
                !availabilityCheck?.isAvailable ||
                isSubmitting
              }
            >
              {isSubmitting ? "Adding..." : "Add Funding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
