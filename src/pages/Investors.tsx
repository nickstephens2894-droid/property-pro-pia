import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, User, Building2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useClients, type Client, type Investor } from "@/hooks/useClients";
import { SearchAndFilters } from "@/components/ui/search-and-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/utils/formatters";
import { Checkbox } from "@/components/ui/checkbox";

type EntityType = 'client' | 'investor';

export default function Investors() {
  const {
    clients,
    investors,
    loading,
    createClient,
    updateClient,
    deleteClient,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    getInvestorsForClient
  } = useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "archived">("all");
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Client | Investor | null>(null);
  const [editingType, setEditingType] = useState<'client' | 'investor'>('client');
  const [clientForm, setClientForm] = useState({
    name: ''
  });
  const [investorForm, setInvestorForm] = useState({
    name: '',
    client_id: '',
    annualIncome: 0,
    otherIncome: 0,
    ownershipPercentage: 0,
    loanSharePercentage: 0,
    cashContribution: 0,
    hasMedicareLevy: false
  });

  // Debug: Track when isDialogOpen changes
  const prevDialogOpen = useRef(isDialogOpen);
  useEffect(() => {
    if (prevDialogOpen.current !== isDialogOpen) {
      console.log('🔍 isDialogOpen changed from', prevDialogOpen.current, 'to', isDialogOpen);
      prevDialogOpen.current = isDialogOpen;
    }
  }, [isDialogOpen]);

  // Debug: Track all state changes
  useEffect(() => {
    console.log('🔄 Component re-rendered with state:', { isDialogOpen, editingType, editingItem });
  });

  const resetForms = () => {
    setClientForm({
      name: ''
    });
    setInvestorForm({
      name: '',
      client_id: '',
      annualIncome: 0,
      otherIncome: 0,
      ownershipPercentage: 0,
      loanSharePercentage: 0,
      cashContribution: 0,
      hasMedicareLevy: false
    });
    setEditingItem(null);
    setEditingType('client');
  };

  const openAddDialog = useCallback((type: 'client' | 'investor') => {
    console.log('=== openAddDialog called ===');
    console.log('Type:', type);
    console.log('Current isDialogOpen:', isDialogOpen);
    console.log('Current editingType:', editingType);
    console.log('Current editingItem:', editingItem);
    
    setEditingType(type);
    setEditingItem(null);
    
    if (type === 'client') {
      setClientForm({ name: '' });
    } else {
      setInvestorForm({
        name: '',
        client_id: '',
        annualIncome: 0,
        otherIncome: 0,
        ownershipPercentage: 0,
        loanSharePercentage: 0,
        cashContribution: 0,
        hasMedicareLevy: false
      });
    }
    
    setIsDialogOpen(true);
  }, [isDialogOpen, editingType, editingItem]);

  const openEditDialog = useCallback((item: Client | Investor, type: 'client' | 'investor') => {
    console.log('=== openEditDialog called ===');
    console.log('Item:', item);
    console.log('Type:', type);
    console.log('Current isDialogOpen:', isDialogOpen);
    
    setEditingType(type);
    setEditingItem(item);
    
    if (type === 'client') {
      setClientForm({ name: item.name });
    } else {
      const investor = item as Investor;
      setInvestorForm({
        name: investor.name,
        client_id: investor.client_id,
        annualIncome: investor.annualIncome,
        otherIncome: investor.otherIncome,
        ownershipPercentage: investor.ownershipPercentage,
        loanSharePercentage: investor.loanSharePercentage,
        cashContribution: investor.cashContribution,
        hasMedicareLevy: investor.hasMedicareLevy
      });
    }
    
    setIsDialogOpen(true);
  }, [isDialogOpen]);

  const closeDialog = useCallback(() => {
    console.log('=== closeDialog called ===');
    setIsDialogOpen(false);
    resetForms();
  }, []);

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateClient(editingItem.id, clientForm);
      } else {
        await createClient(clientForm);
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateInvestor(editingItem.id, investorForm);
      } else {
        await createInvestor(investorForm);
      }
      closeDialog();
    } catch (error) {
      console.error('Error saving investor:', error);
    }
  };

  const handleDelete = async (id: string, type: 'client' | 'investor') => {
    try {
      if (type === 'client') {
        await deleteClient(id);
      } else {
        await deleteInvestor(id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvestors = investors.filter(investor => {
    const client = clients.find(c => c.id === investor.client_id);
    return investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return <LoadingSpinner message="Loading investors..." />;
  }

  const modalContent = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? `Edit ${editingType === 'client' ? 'Client' : 'Investor'}` : `Add New ${editingType === 'client' ? 'Client' : 'Investor'}`}
          </DialogTitle>
          <DialogDescription>
            {editingType === 'client' 
              ? 'Add a new client to your portfolio.' 
              : 'Add a new investor with their financial details.'
            }
          </DialogDescription>
        </DialogHeader>

        {editingType === 'client' ? (
          <form onSubmit={handleClientSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientForm.name}
                onChange={(e) => setClientForm({ name: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'} Client
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleInvestorSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="investorName">Investor Name</Label>
              <Input
                id="investorName"
                value={investorForm.name}
                onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                placeholder="Enter investor name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSelect">Associated Client</Label>
              <Select
                value={investorForm.client_id}
                onValueChange={(value) => setInvestorForm({ ...investorForm, client_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input
                  id="annualIncome"
                  type="number"
                  value={investorForm.annualIncome}
                  onChange={(e) => setInvestorForm({ ...investorForm, annualIncome: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherIncome">Other Income</Label>
                <Input
                  id="otherIncome"
                  type="number"
                  value={investorForm.otherIncome}
                  onChange={(e) => setInvestorForm({ ...investorForm, otherIncome: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownershipPercentage">Ownership %</Label>
                <Input
                  id="ownershipPercentage"
                  type="number"
                  value={investorForm.ownershipPercentage}
                  onChange={(e) => setInvestorForm({ ...investorForm, ownershipPercentage: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="loanSharePercentage">Loan Share %</Label>
                  <Input
                    id="loanSharePercentage"
                    type="number"
                    value={investorForm.loanSharePercentage}
                    onChange={(e) => setInvestorForm({ ...investorForm, loanSharePercentage: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashContribution">Cash Contribution</Label>
                  <Input
                    id="cashContribution"
                    type="number"
                    value={investorForm.cashContribution}
                    onChange={(e) => setInvestorForm({ ...investorForm, cashContribution: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasMedicareLevy"
                checked={investorForm.hasMedicareLevy}
                onCheckedChange={(checked) => setInvestorForm({ ...investorForm, hasMedicareLevy: checked as boolean })}
              />
              <Label htmlFor="hasMedicareLevy">Subject to Medicare Levy Surcharge</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'} Investor
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );

  // Show empty state if no data
  if (clients.length === 0 && investors.length === 0) {
    return (
      <>
        {modalContent}
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Investors</h1>
              <p className="text-muted-foreground">Manage your clients and investors</p>
            </div>
          </div>

          {/* General Clients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">General Clients</h2>
                <Badge variant="secondary" className="text-xs">
                  0 clients
                </Badge>
              </div>
              <Button size="sm" onClick={() => openAddDialog('client')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Client
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-8">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No clients found</p>
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
                  0 investors
                </Badge>
              </div>
              <Button size="sm" onClick={() => openAddDialog('investor')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Investor
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No investors found</p>
              </CardContent>
            </Card>
          </div>
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
            <p className="text-muted-foreground">Manage your clients and investors</p>
          </div>
        </div>

        {/* General Clients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">General Clients</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredClients.length} clients
              </Badge>
            </div>
            <Button size="sm" onClick={() => openAddDialog('client')}>
              <Plus className="h-4 w-4 mr-1" />
              Add Client
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No clients found</p>
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {investors.filter(inv => inv.client_id === client.id).length} investors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(client, 'client')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(client.id, 'client')}
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
            <Button size="sm" onClick={() => openAddDialog('investor')}>
              <Plus className="h-4 w-4 mr-1" />
              Add Investor
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredInvestors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No investors found</p>
                </CardContent>
              </Card>
            ) : (
              filteredInvestors.map((investor) => {
                const client = clients.find(c => c.id === investor.client_id);
                return (
                  <Card key={investor.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">{investor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {client ? `Client: ${client.name}` : 'No client assigned'}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Income: ${formatCurrency(investor.annualIncome)}</span>
                              <span>Ownership: {investor.ownershipPercentage}%</span>
                              <span>Loan Share: {investor.loanSharePercentage}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(investor, 'investor')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(investor.id, 'investor')}
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
