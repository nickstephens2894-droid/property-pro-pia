import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, DollarSign, Plus, X } from 'lucide-react';

export default function Funds() {
  const [activeTab, setActiveTab] = useState('loans');
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  const [loanForm, setLoanForm] = useState({
    name: 'Home Loan',
    
    // Construction Details
    constructionPeriod: 9,
    constructionInterestRate: 7.5,
    progressPayment: {
      weeks: 4,
      percentage: 5,
      description: '4 Weeks - 5% of construction price'
    },
    
    // Financing
    loanBalance: 600000,
    interestRate: 6,
    loanTerm: 30,
    loanType: 'IO,P&I',
    ioTerm: 5,
    loanPurpose: 'Investment Mortgage',
    fundsType: 'Savings',
    fundAmount: 50000,
    fundReturn: 5
  });
  const [cashForm, setCashForm] = useState({
    name: 'Emergency Savings',
    fundType: 'Savings',
    amount: '',
    returnRate: ''
  });

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Loan form submitted:', loanForm);
    // TODO: Implement loan creation logic
    setIsLoanDialogOpen(false);
    setLoanForm({
      name: 'Home Loan',
      constructionPeriod: 9,
      constructionInterestRate: 7.5,
      progressPayment: {
        weeks: 4,
        percentage: 5,
        description: '4 Weeks - 5% of construction price'
      },
      loanBalance: 600000,
      interestRate: 6,
      loanTerm: 30,
      loanType: 'IO,P&I',
      ioTerm: 5,
      loanPurpose: 'Investment Mortgage',
      fundsType: 'Savings',
      fundAmount: 50000,
      fundReturn: 5
    });
  };

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cash form submitted:', cashForm);
    // TODO: Implement cash fund creation logic
    setIsCashDialogOpen(false);
    setCashForm({
      name: 'Emergency Savings',
      fundType: 'Savings',
      amount: '',
      returnRate: ''
    });
  };

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
                <h2 className="text-2xl font-semibold text-gray-900">Loan Funds</h2>
                <p className="text-gray-600">Manage your loan-based investment funds</p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsLoanDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Loan Fund
              </Button>
            </div>

            {/* Loan Funds Content */}
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Loan Funds Yet</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first loan fund</p>
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => setIsLoanDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Loan Fund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Cash Tab */}
        <TabsContent value="cash" className="mt-6">
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Cash Funds</h2>
                <p className="text-gray-600">Manage your cash-based investment funds</p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsCashDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cash Fund
              </Button>
            </div>

            {/* Cash Funds Content */}
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Cash Funds Yet</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first cash fund</p>
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => setIsCashDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Cash Fund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Loan Dialog */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Loan Fund</DialogTitle>
            <DialogDescription>
              Enter the loan details below. Fill in the construction details and financing information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
            <form onSubmit={handleLoanSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loanName">Loan Name</Label>
                <Input
                  id="loanName"
                  value={loanForm.name}
                  onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                  placeholder="Enter loan name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanBalance">Loan Balance</Label>
                  <Input
                    id="loanBalance"
                    value={loanForm.loanBalance}
                    onChange={(e) => setLoanForm({ ...loanForm, loanBalance: Number(e.target.value) })}
                    placeholder="Enter loan balance"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalAmount">Loan Amount</Label>
                  <Input
                    id="originalAmount"
                    value={loanForm.fundAmount}
                    onChange={(e) => setLoanForm({ ...loanForm, fundAmount: Number(e.target.value) })}
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
                    value={loanForm.interestRate}
                    onChange={(e) => setLoanForm({ ...loanForm, interestRate: Number(e.target.value) })}
                    placeholder="Enter interest rate"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Loan Term (Years)</Label>
                  <Input
                    id="term"
                    value={loanForm.loanTerm}
                    onChange={(e) => setLoanForm({ ...loanForm, loanTerm: Number(e.target.value) })}
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
                    onValueChange={(value) => setLoanForm({ ...loanForm, loanType: value })}
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
                    onChange={(e) => setLoanForm({ ...loanForm, loanPurpose: e.target.value })}
                    placeholder="Enter loan purpose"
                  />
                </div>
              </div>

              {/* Construction Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Construction Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constructionPeriod">Construction Period (months)</Label>
                    <Input
                      id="constructionPeriod"
                      type="number"
                      value={loanForm.constructionPeriod}
                      onChange={(e) => setLoanForm({ ...loanForm, constructionPeriod: Number(e.target.value) })}
                      placeholder="9"
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="constructionInterestRate">Construction Interest Rate (%)</Label>
                    <Input
                      id="constructionInterestRate"
                      type="number"
                      value={loanForm.constructionInterestRate}
                      onChange={(e) => setLoanForm({ ...loanForm, constructionInterestRate: Number(e.target.value) })}
                      placeholder="7.50"
                      min="0"
                      max="20"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Progress Payments</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Weeks</Label>
                      <Input
                        type="number"
                        value={loanForm.progressPayment.weeks}
                        onChange={(e) => {
                          const newProgressPayment = { ...loanForm.progressPayment };
                          newProgressPayment.weeks = Number(e.target.value);
                          setLoanForm({ ...loanForm, progressPayment: newProgressPayment });
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
                          const newProgressPayment = { ...loanForm.progressPayment };
                          newProgressPayment.percentage = Number(e.target.value);
                          setLoanForm({ ...loanForm, progressPayment: newProgressPayment });
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
                          const newProgressPayment = { ...loanForm.progressPayment };
                          newProgressPayment.description = e.target.value;
                          setLoanForm({ ...loanForm, progressPayment: newProgressPayment });
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
                <h3 className="text-lg font-semibold text-foreground">Financing</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ioTerm">IO Term (years)</Label>
                    <Input
                      id="ioTerm"
                      type="number"
                      value={loanForm.ioTerm}
                      onChange={(e) => setLoanForm({ ...loanForm, ioTerm: Number(e.target.value) })}
                      placeholder="5"
                      min="0"
                      max="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fundsType">Funds Type</Label>
                    <Select
                      value={loanForm.fundsType}
                      onValueChange={(value) => setLoanForm({ ...loanForm, fundsType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select funds type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Term Deposits">Term Deposits</SelectItem>
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
                      onChange={(e) => setLoanForm({ ...loanForm, fundReturn: Number(e.target.value) })}
                      placeholder="5"
                      min="0"
                      max="20"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">Savings & Term Deposit Only</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Create Loan
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
            <DialogTitle>Cash Fund</DialogTitle>
            <DialogDescription>
              This feature is currently under construction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="text-4xl">🚧</div>
              <h3 className="text-lg font-semibold">Under Construction</h3>
              <p className="text-sm text-muted-foreground">
                The Cash Fund feature is being developed and will be available soon.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCashDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
