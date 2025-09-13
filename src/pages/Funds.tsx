import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, DollarSign, Plus, X, Edit, Trash2 } from "lucide-react";
import {
  useLoanFunds,
  type LoanFund,
  type CreateLoanFundData,
} from "@/hooks/useLoanFunds";
import { useCashFunds } from "@/hooks/useCashFunds";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFunding } from "@/contexts/FundingContext";
import {
  InstanceFunding,
  CashFund,
  CreateCashFundRequest,
} from "@/types/funding";

export default function Funds() {
  const {
    loanFunds,
    loanFundsWithUsage,
    loading: loanFundsLoading,
    createLoanFund,
    updateLoanFund,
    deleteLoanFund,
  } = useLoanFunds();
  const {
    cashFunds,
    loading: cashFundsLoading,
    createCashFund,
    updateCashFund,
    deleteCashFund,
  } = useCashFunds();
  const { instanceFundings } = useFunding();

  const [activeTab, setActiveTab] = useState("loans");
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  const [editingLoanFund, setEditingLoanFund] = useState<LoanFund | null>(null);
  const [editingCashFund, setEditingCashFund] = useState<CashFund | null>(null);

  const [loanForm, setLoanForm] = useState<CreateLoanFundData>({
    name: "Home Loan",

    // Construction Details
    constructionPeriod: 9,
    constructionInterestRate: 7.5,
    progressPayment: {
      weeks: 4,
      percentage: 5,
      description: "4 Weeks - 5% of construction price",
    },

    // Financing
    loanBalance: 600000,
    interestRate: 6,
    loanTerm: 30,
    loanType: "IO,P&I",
    ioTerm: 5,
    loanPurpose: "Investment Mortgage",
    fundsType: "Savings",
    fundAmount: 50000,
    fundReturn: 5,
  });

  const [cashForm, setCashForm] = useState<CreateCashFundRequest>({
    name: "Emergency Savings",
    fund_type: "Savings",
    total_amount: 0,
    return_rate: 0,
  });

  // Helper function to get fund usage details
  const getFundUsageDetails = (fundId: string, fundType: "loan" | "cash") => {
    return instanceFundings.filter(
      (funding) => funding.fund_id === fundId && funding.fund_type === fundType
    );
  };

  // Helper function to format allocation date
  const formatAllocationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const resetLoanForm = () => {
    setLoanForm({
      name: "Home Loan",
      constructionPeriod: 9,
      constructionInterestRate: 7.5,
      progressPayment: {
        weeks: 4,
        percentage: 5,
        description: "4 Weeks - 5% of construction price",
      },
      loanBalance: 600000,
      interestRate: 6,
      loanTerm: 30,
      loanType: "IO,P&I",
      ioTerm: 5,
      loanPurpose: "Investment Mortgage",
      fundsType: "Savings",
      fundAmount: 50000,
      fundReturn: 5,
    });
    setEditingLoanFund(null);
  };

  const resetCashForm = () => {
    setCashForm({
      name: "Emergency Savings",
      fund_type: "Savings",
      total_amount: 0,
      return_rate: 0,
    });
    setEditingCashFund(null);
  };

  const openAddLoanDialog = () => {
    resetLoanForm();
    setIsLoanDialogOpen(true);
  };

  const openEditLoanDialog = (loanFund: LoanFund) => {
    setLoanForm({
      name: loanFund.name,
      constructionPeriod: loanFund.constructionPeriod,
      constructionInterestRate: loanFund.constructionInterestRate,
      progressPayment: loanFund.progressPayment,
      loanBalance: loanFund.loanBalance,
      interestRate: loanFund.interestRate,
      loanTerm: loanFund.loanTerm,
      loanType: loanFund.loanType,
      ioTerm: loanFund.ioTerm,
      loanPurpose: loanFund.loanPurpose,
      fundsType: loanFund.fundsType,
      fundAmount: loanFund.fundAmount,
      fundReturn: loanFund.fundReturn,
    });
    setEditingLoanFund(loanFund);
    setIsLoanDialogOpen(true);
  };

  const openAddCashDialog = () => {
    resetCashForm();
    setIsCashDialogOpen(true);
  };

  const openEditCashDialog = (cashFund: CashFund) => {
    setCashForm({
      name: cashFund.name,
      fund_type: cashFund.fund_type,
      total_amount: cashFund.total_amount,
      return_rate: cashFund.return_rate,
    });
    setEditingCashFund(cashFund);
    setIsCashDialogOpen(true);
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLoanFund) {
        await updateLoanFund(editingLoanFund.id, loanForm);
      } else {
        await createLoanFund(loanForm);
      }

      setIsLoanDialogOpen(false);
      resetLoanForm();
    } catch (error) {
      console.error("Error submitting loan fund:", error);
    }
  };

  const handleDeleteLoanFund = async (id: string) => {
    if (!confirm("Are you sure you want to delete this loan fund?")) {
      return;
    }

    try {
      await deleteLoanFund(id);
    } catch (error) {
      console.error("Error deleting loan fund:", error);
    }
  };

  const handleCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCashFund) {
        await updateCashFund(editingCashFund.id, cashForm);
      } else {
        await createCashFund(cashForm);
      }

      setIsCashDialogOpen(false);
      resetCashForm();
    } catch (error) {
      console.error("Error submitting cash fund:", error);
    }
  };

  const handleDeleteCashFund = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cash fund?")) {
      return;
    }

    try {
      await deleteCashFund(id);
    } catch (error) {
      console.error("Error deleting cash fund:", error);
    }
  };

  if (loanFundsLoading || cashFundsLoading) {
    return <LoadingSpinner message="Loading funds..." />;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Main Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 mx-auto">
          <TabsTrigger
            value="loans"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-primary"
          >
            Loans
          </TabsTrigger>
          <TabsTrigger
            value="cash"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-2 data-[state=active]:border-primary"
          >
            Cash
          </TabsTrigger>
        </TabsList>

        {/* Loans Tab */}
        <TabsContent value="loans" className="mt-6">
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Loan Funds
                </h2>
                <p className="text-gray-600">
                  Manage your loan-based investment funds
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={openAddLoanDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Loan Fund
              </Button>
            </div>

            {/* Loan Funds Content */}
            <div className="grid gap-4">
              {loanFundsWithUsage.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Loan Funds Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get started by creating your first loan fund
                      </p>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={openAddLoanDialog}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Loan Fund
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                loanFundsWithUsage.map((loanFund) => (
                  <Card
                    key={loanFund.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {loanFund.name}
                            </h3>
                            <Badge variant="secondary">
                              Used by{" "}
                              {loanFund.usage_percentage?.toFixed(1) || 0}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Fund Amount:
                              </span>
                              <p className="font-medium">
                                {formatCurrency(loanFund.fundAmount)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Available:</span>
                              <p className="font-medium">
                                {formatCurrency(loanFund.available_amount)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Used:</span>
                              <p className="font-medium">
                                {formatCurrency(loanFund.used_amount)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Interest Rate:
                              </span>
                              <p className="font-medium">
                                {loanFund.interestRate}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Usage Progress
                              </span>
                              <span className="font-medium">
                                {loanFund.usage_percentage?.toFixed(1) || 0}%
                              </span>
                            </div>
                            <Progress
                              value={loanFund.usage_percentage || 0}
                              className="h-2"
                            />
                          </div>
                          <div className="mt-3 text-sm text-gray-600">
                            <span>
                              Progress Payment: {loanFund.progressPayment.weeks}{" "}
                              weeks - {loanFund.progressPayment.percentage}%
                            </span>
                          </div>

                          {/* Instance Usage Details */}
                          {(() => {
                            const usageDetails = getFundUsageDetails(
                              loanFund.id,
                              "loan"
                            );
                            return usageDetails.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Used by Investment Instances
                                </h4>
                                <div className="space-y-2">
                                  {usageDetails.map((funding) => (
                                    <div
                                      key={funding.id}
                                      className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded"
                                    >
                                      <span className="font-medium">
                                        {funding.instance_name}
                                      </span>
                                      <div className="text-right">
                                        <div className="font-medium">
                                          {formatCurrency(
                                            funding.amount_allocated
                                          )}
                                        </div>
                                        <div className="text-gray-500">
                                          {formatAllocationDate(
                                            funding.allocation_date
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditLoanDialog(loanFund)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteLoanFund(loanFund.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Cash Tab */}
        <TabsContent value="cash" className="mt-6">
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Cash Funds
                </h2>
                <p className="text-gray-600">
                  Manage your cash-based investment funds
                </p>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={openAddCashDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cash Fund
              </Button>
            </div>

            {/* Cash Funds Content */}
            <div className="grid gap-4">
              {cashFunds.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Cash Funds Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get started by creating your first cash fund
                      </p>
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={openAddCashDialog}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Cash Fund
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                cashFunds.map((cashFund) => (
                  <Card
                    key={cashFund.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {cashFund.name}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Total Amount:
                              </span>
                              <p className="font-medium">
                                {formatCurrency(cashFund.total_amount)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Available:</span>
                              <p className="font-medium">
                                {formatCurrency(cashFund.available_amount)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Used:</span>
                              <p className="font-medium">
                                {formatCurrency(
                                  cashFund.total_amount -
                                    cashFund.available_amount
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Return Rate:
                              </span>
                              <p className="font-medium">
                                {cashFund.return_rate}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Usage Progress
                              </span>
                              <span className="font-medium">
                                {cashFund.total_amount > 0
                                  ? (
                                      ((cashFund.total_amount -
                                        cashFund.available_amount) /
                                        cashFund.total_amount) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                cashFund.total_amount > 0
                                  ? ((cashFund.total_amount -
                                      cashFund.available_amount) /
                                      cashFund.total_amount) *
                                    100
                                  : 0
                              }
                              className="h-2"
                            />
                          </div>
                          <div className="mt-3 text-sm text-gray-600">
                            <span>Fund Type: {cashFund.fund_type}</span>
                          </div>

                          {/* Instance Usage Details */}
                          {(() => {
                            const usageDetails = getFundUsageDetails(
                              cashFund.id,
                              "cash"
                            );
                            return usageDetails.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Used by Investment Instances
                                </h4>
                                <div className="space-y-2">
                                  {usageDetails.map((funding) => (
                                    <div
                                      key={funding.id}
                                      className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded"
                                    >
                                      <span className="font-medium">
                                        {funding.instance_name}
                                      </span>
                                      <div className="text-right">
                                        <div className="font-medium">
                                          {formatCurrency(
                                            funding.amount_allocated
                                          )}
                                        </div>
                                        <div className="text-gray-500">
                                          {formatAllocationDate(
                                            funding.allocation_date
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCashDialog(cashFund)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCashFund(cashFund.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Loan Dialog */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editingLoanFund ? "Edit Loan Fund" : "Add New Loan Fund"}
            </DialogTitle>
            <DialogDescription>
              Enter the loan details below. Fill in the construction details and
              financing information.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
            <form onSubmit={handleLoanSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loanName">Loan Name</Label>
                <Input
                  id="loanName"
                  value={loanForm.name}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, name: e.target.value })
                  }
                  placeholder="Enter loan name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanBalance">Loan Balance</Label>
                  <Input
                    id="loanBalance"
                    type="number"
                    value={loanForm.loanBalance}
                    onChange={(e) =>
                      setLoanForm({
                        ...loanForm,
                        loanBalance: Number(e.target.value),
                      })
                    }
                    placeholder="Enter loan balance"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalAmount">Loan Amount</Label>
                  <Input
                    id="originalAmount"
                    type="number"
                    value={loanForm.fundAmount}
                    onChange={(e) =>
                      setLoanForm({
                        ...loanForm,
                        fundAmount: Number(e.target.value),
                      })
                    }
                    placeholder="Enter loan amount"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={loanForm.interestRate}
                    onChange={(e) =>
                      setLoanForm({
                        ...loanForm,
                        interestRate: Number(e.target.value),
                      })
                    }
                    placeholder="Enter interest rate"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Loan Term (Years)</Label>
                  <Input
                    id="term"
                    type="number"
                    value={loanForm.loanTerm}
                    onChange={(e) =>
                      setLoanForm({
                        ...loanForm,
                        loanTerm: Number(e.target.value),
                      })
                    }
                    placeholder="Enter loan term"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select
                    value={loanForm.loanType}
                    onValueChange={(value) =>
                      setLoanForm({ ...loanForm, loanType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IO,P&I">IO,P&I</SelectItem>
                      <SelectItem value="IO">Interest Only</SelectItem>
                      <SelectItem value="P&I">Principal & Interest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Loan Purpose</Label>
                  <Input
                    id="purpose"
                    value={loanForm.loanPurpose}
                    onChange={(e) =>
                      setLoanForm({ ...loanForm, loanPurpose: e.target.value })
                    }
                    placeholder="Enter loan purpose"
                  />
                </div>
              </div>

              {/* Construction Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Construction Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constructionPeriod">
                      Construction Period (months)
                    </Label>
                    <Input
                      id="constructionPeriod"
                      type="number"
                      value={loanForm.constructionPeriod}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          constructionPeriod: Number(e.target.value),
                        })
                      }
                      placeholder="9"
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="constructionInterestRate">
                      Construction Interest Rate (%)
                    </Label>
                    <Input
                      id="constructionInterestRate"
                      type="number"
                      value={loanForm.constructionInterestRate}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          constructionInterestRate: Number(e.target.value),
                        })
                      }
                      placeholder="7.50"
                      min="0"
                      max="20"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Progress Payments
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Weeks</Label>
                      <Input
                        type="number"
                        value={loanForm.progressPayment.weeks}
                        onChange={(e) => {
                          const newProgressPayment = {
                            ...loanForm.progressPayment,
                          };
                          newProgressPayment.weeks = Number(e.target.value);
                          setLoanForm({
                            ...loanForm,
                            progressPayment: newProgressPayment,
                          });
                        }}
                        placeholder="4"
                        min="1"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Percentage (%)</Label>
                      <Input
                        type="number"
                        value={loanForm.progressPayment.percentage}
                        onChange={(e) => {
                          const newProgressPayment = {
                            ...loanForm.progressPayment,
                          };
                          newProgressPayment.percentage = Number(
                            e.target.value
                          );
                          setLoanForm({
                            ...loanForm,
                            progressPayment: newProgressPayment,
                          });
                        }}
                        placeholder="5"
                        min="0"
                        max="100"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={loanForm.progressPayment.description}
                        onChange={(e) => {
                          const newProgressPayment = {
                            ...loanForm.progressPayment,
                          };
                          newProgressPayment.description = e.target.value;
                          setLoanForm({
                            ...loanForm,
                            progressPayment: newProgressPayment,
                          });
                        }}
                        placeholder="4 Weeks - 5% of construction price"
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financing Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Financing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ioTerm">IO Term (years)</Label>
                    <Input
                      id="ioTerm"
                      type="number"
                      value={loanForm.ioTerm}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          ioTerm: Number(e.target.value),
                        })
                      }
                      placeholder="5"
                      min="0"
                      max="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fundsType">Funds Type</Label>
                    <Select
                      value={loanForm.fundsType}
                      onValueChange={(value) =>
                        setLoanForm({ ...loanForm, fundsType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select funds type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Term Deposits">
                          Term Deposits
                        </SelectItem>
                        <SelectItem value="Redraw">Redraw</SelectItem>
                        <SelectItem value="Offset">Offset</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fundReturn">Fund Return (%)</Label>
                    <Input
                      id="fundReturn"
                      type="number"
                      value={loanForm.fundReturn}
                      onChange={(e) =>
                        setLoanForm({
                          ...loanForm,
                          fundReturn: Number(e.target.value),
                        })
                      }
                      placeholder="5"
                      min="0"
                      max="20"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Savings & Term Deposit Only
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  {editingLoanFund ? "Update Loan Fund" : "Create Loan Fund"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Cash Fund Dialog */}
      <Dialog open={isCashDialogOpen} onOpenChange={setIsCashDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCashFund ? "Edit Cash Fund" : "Add New Cash Fund"}
            </DialogTitle>
            <DialogDescription>
              {editingCashFund
                ? "Update your cash fund details"
                : "Create a new cash fund for your investments"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCashSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cash-name">Fund Name</Label>
              <Input
                id="cash-name"
                value={cashForm.name}
                onChange={(e) =>
                  setCashForm({ ...cashForm, name: e.target.value })
                }
                placeholder="e.g., Emergency Savings"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-type">Fund Type</Label>
              <Select
                value={cashForm.fund_type}
                onValueChange={(value) =>
                  setCashForm({ ...cashForm, fund_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Term Deposit">Term Deposit</SelectItem>
                  <SelectItem value="High Yield Savings">
                    High Yield Savings
                  </SelectItem>
                  <SelectItem value="Money Market">Money Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-amount">Total Amount</Label>
              <Input
                id="cash-amount"
                type="number"
                value={cashForm.total_amount}
                onChange={(e) =>
                  setCashForm({
                    ...cashForm,
                    total_amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-return">Expected Return Rate (%)</Label>
              <Input
                id="cash-return"
                type="number"
                value={cashForm.return_rate}
                onChange={(e) =>
                  setCashForm({
                    ...cashForm,
                    return_rate: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCashDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingCashFund ? "Update Cash Fund" : "Create Cash Fund"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
