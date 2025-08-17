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
    balance: '',
    originalAmount: '',
    interestRate: '',
    term: '',
    loanType: 'Principal & Interest',
    purpose: 'Investment property'
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
      balance: '',
      originalAmount: '',
      interestRate: '',
      term: '',
      loanType: 'Principal & Interest',
      purpose: 'Investment property'
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Add New Loan
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLoanDialogOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Enter the loan details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLoanSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="loanBalance">Loan Balance</Label>
              <Input
                id="loanBalance"
                value={loanForm.balance}
                onChange={(e) => setLoanForm({ ...loanForm, balance: e.target.value })}
                placeholder="Enter loan balance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalAmount">Original Loan Amount</Label>
              <Input
                id="originalAmount"
                value={loanForm.originalAmount}
                onChange={(e) => setLoanForm({ ...loanForm, originalAmount: e.target.value })}
                placeholder="Enter loan amount"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  value={loanForm.interestRate}
                  onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                  placeholder="Enter interest rate"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term (years)</Label>
                <Input
                  id="term"
                  value={loanForm.term}
                  onChange={(e) => setLoanForm({ ...loanForm, term: e.target.value })}
                  placeholder="Enter loan term"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select
                value={loanForm.loanType}
                onValueChange={(value) => setLoanForm({ ...loanForm, loanType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Principal & Interest">Principal & Interest</SelectItem>
                  <SelectItem value="Interest Only">Interest Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (optional)</Label>
              <Input
                id="purpose"
                value={loanForm.purpose}
                onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                placeholder="Enter loan purpose"
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Create Loan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Cash Fund Dialog */}
      <Dialog open={isCashDialogOpen} onOpenChange={setIsCashDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Add New Fund
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCashDialogOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Enter the fund details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCashSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fundName">Fund Name</Label>
              <Input
                id="fundName"
                value={cashForm.name}
                onChange={(e) => setCashForm({ ...cashForm, name: e.target.value })}
                placeholder="Enter fund name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fundType">Fund Type</Label>
              <Select
                value={cashForm.fundType}
                onValueChange={(value) => setCashForm({ ...cashForm, fundType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Term Deposit">Term Deposit</SelectItem>
                  <SelectItem value="Redraw">Redraw</SelectItem>
                  <SelectItem value="Offset">Offset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Redraw/Offset Note */}
            {(cashForm.fundType === 'Redraw' || cashForm.fundType === 'Offset') && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                Redraw/Offset reduce loan interest instead of earning returns
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={cashForm.amount}
                onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnRate">Return Rate (%)</Label>
              <Input
                id="returnRate"
                value={cashForm.returnRate}
                onChange={(e) => setCashForm({ ...cashForm, returnRate: e.target.value })}
                placeholder="Enter return rate"
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Create Fund
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
