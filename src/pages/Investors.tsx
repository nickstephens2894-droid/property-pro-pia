import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { useRepo, type Investor } from "@/services/repository";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/utils/formatters";

export default function Investors() {
  const { investors, addInvestor, updateInvestor, removeInvestor } = useRepo();

  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Investor | null>(null);
  const [investorForm, setInvestorForm] = useState({
    name: '',
    annualIncome: 0,
    otherIncome: 0,
    nonTaxableIncome: 0,
    hasMedicareLevy: false
  });

  const resetForms = () => {
    setInvestorForm({
      name: '',
      annualIncome: 0,
      otherIncome: 0,
      nonTaxableIncome: 0,
      hasMedicareLevy: false
    });
    setEditingItem(null);
  };

  const openAddDialog = useCallback(() => {
    setEditingItem(null);
    resetForms();
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((investor: Investor) => {
    setEditingItem(investor);
    setInvestorForm({
      name: investor.name,
      annualIncome: investor.annualIncome || 0,
      otherIncome: investor.otherIncome || 0,
      nonTaxableIncome: investor.nonTaxableIncome || 0,
      hasMedicareLevy: investor.hasMedicareLevy || false
    });
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetForms();
  }, []);

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting investor form:', { editingItem, investorForm });
    
    try {
      if (editingItem) {
        console.log('Updating existing investor:', editingItem.id);
        await updateInvestor(editingItem.id, investorForm);
      } else {
        console.log('Creating new investor');
        const newInvestor: Omit<Investor, 'id' | 'created_at' | 'updated_at'> = {
          ...investorForm,
          ownershipPercentage: 0,
          loanSharePercentage: 0,
          cashContribution: 0
        };
        console.log('New investor data:', newInvestor);
        await addInvestor({ ...newInvestor, id: crypto.randomUUID() } as Investor);
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving investor:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeInvestor(id);
    } catch (error) {
      console.error('Error deleting investor:', error);
    }
  };

  const filteredInvestors = investors.filter(investor => {
    return investor.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (investors.length === 0) {
    return <LoadingSpinner message="Loading investors..." />;
  }

  const modalContent = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg">
            {editingItem ? 'Edit Investor' : 'Add New Investor'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter the investor's information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvestorSubmit} className="space-y-6">
          {/* Personal Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Personal Profile</h3>
            
            <div className="space-y-2">
              <Label htmlFor="investorName" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="investorName"
                value={investorForm.name}
                onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                placeholder="Enter investor name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualIncome" className="text-sm font-medium">
                Annual Income
              </Label>
              <Input
                id="annualIncome"
                type="number"
                value={investorForm.annualIncome}
                onChange={(e) => setInvestorForm({ ...investorForm, annualIncome: Number(e.target.value) })}
                placeholder="150000"
              />
              <p className="text-sm text-muted-foreground">Gross annual income from employment</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherIncome" className="text-sm font-medium">
                Other Income
              </Label>
              <Input
                id="otherIncome"
                type="number"
                value={investorForm.otherIncome}
                onChange={(e) => setInvestorForm({ ...investorForm, otherIncome: Number(e.target.value) })}
                placeholder="20000"
              />
              <p className="text-sm text-muted-foreground">Income from other sources (rental, dividends, etc.)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nonTaxableIncome" className="text-sm font-medium">
                Non-taxable Income
              </Label>
              <Input
                id="nonTaxableIncome"
                type="number"
                value={investorForm.nonTaxableIncome || 0}
                onChange={(e) => setInvestorForm({ ...investorForm, nonTaxableIncome: Number(e.target.value) })}
                placeholder="5000"
              />
              <p className="text-sm text-muted-foreground">Income that is not subject to tax</p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label htmlFor="hasMedicareLevy" className="text-sm font-medium">Medicare Levy</Label>
                <p className="text-sm text-muted-foreground">Is this investor subject to Medicare levy?</p>
              </div>
              <Switch
                id="hasMedicareLevy"
                checked={investorForm.hasMedicareLevy}
                onCheckedChange={(checked) => setInvestorForm({ ...investorForm, hasMedicareLevy: checked })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" size="sm" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingItem ? 'Update' : 'Create'} Investor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Show empty state if no investors
  if (investors.length === 0) {
    return (
      <>
        {modalContent}
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Investors</h1>
              <p className="text-muted-foreground">Manage your investment portfolio</p>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add Investor
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No investors found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first investor to track their financial details and investment contributions.
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-1" />
                Add Investor
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {modalContent}
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Investors</h1>
            <p className="text-muted-foreground">Manage your investment portfolio</p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-1" />
            Add Investor
          </Button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Annual Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatCurrency(investors.reduce((sum, inv) => sum + (inv.annualIncome || 0), 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Other Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatCurrency(investors.reduce((sum, inv) => sum + (inv.otherIncome || 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investors Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Investors</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredInvestors.length} investors
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredInvestors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No investors found matching your search</p>
                </CardContent>
              </Card>
            ) : (
              filteredInvestors.map((investor) => {
                return (
                  <Card key={investor.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">
                              <Link 
                                to={`/investors/${investor.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {investor.name}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Income: ${formatCurrency(investor.annualIncome || 0)}</span>
                              <span>Other: ${formatCurrency(investor.otherIncome || 0)}</span>
                              <span>Non-taxable: ${formatCurrency(investor.nonTaxableIncome || 0)}</span>
                              <span>Medicare: {investor.hasMedicareLevy ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(investor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(investor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
