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

export default function Clients() {
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
    
    console.log('About to set isDialogOpen to true');
    setIsDialogOpen(true);
    console.log('isDialogOpen set to true');
  }, [isDialogOpen, editingType, editingItem]);

  const openEditDialog = (item: Client | Investor, type: 'client' | 'investor') => {
    setEditingType(type);
    setEditingItem(item);
    if (type === 'client') {
      const client = item as Client;
      setClientForm({
        name: client.name
      });
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
  };

  const closeAddDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setEditingType('client');
  };

  const closeEditDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setEditingType('client');
  };

  const editClient = (client: Client) => {
    openEditDialog(client, 'client');
  };

  const editInvestor = (investor: Investor) => {
    openEditDialog(investor, 'investor');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvestors = investors.filter(investor => {
    const client = clients.find(c => c.id === investor.client_id);
    return (
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filters = [
    {
      key: "type",
      label: "Filter Type",
      value: filterType,
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "archived", label: "Archived" }
      ],
      onChange: (value: string) => setFilterType(value as "all" | "active" | "archived")
    }
  ];

  const getDialogTitle = () => {
    if (editingItem) {
      return editingType === 'client' ? 'Edit Client' : 'Edit Investor';
    }
    return editingType === 'client' ? 'Add New Client' : 'Add New Investor';
  };

  const getDialogDescription = () => {
    if (editingItem) {
      return editingType === 'client' ? 'Update client information' : 'Update investor information';
    }
    return editingType === 'client' 
      ? 'Create a new client for your property investments'
      : 'Add an investor to a client';
  };

  const isFormValid = () => {
    if (editingType === 'client') {
      return clientForm.name.trim().length > 0;
    } else {
      return investorForm.name.trim().length > 0 && investorForm.client_id;
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateClient(editingItem.id, clientForm);
      } else {
        await createClient(clientForm);
      }
      setIsDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error submitting client:', error);
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
      setIsDialogOpen(false);
      resetForms();
    } catch (error) {
      console.error('Error submitting investor:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated investors.')) {
      return;
    }
    try {
      await deleteClient(clientId);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleDeleteInvestor = async (investorId: string) => {
    if (!confirm('Are you sure you want to delete this investor?')) {
      return;
    }
    try {
      await deleteInvestor(investorId);
    } catch (error) {
      console.error('Error deleting investor:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading clients..." />;
  }

  // Debug logging
  console.log('Current state:', { isDialogOpen, editingType, editingItem });

  // Add visible debug info on the page
  const debugInfo = `Dialog Open: ${isDialogOpen}, Type: ${editingType}, Editing: ${editingItem ? 'Yes' : 'No'}`;

  // Render the modal first, so it's always available
  const modalContent = isDialogOpen && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background border border-border shadow-2xl rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">{getDialogTitle()}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{getDialogDescription()}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="h-8 w-8 p-0 hover:bg-background/80 ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {/* Entity Type Selection - Only show when adding new */}
          {!editingItem && (
            <div className="space-y-2">
              <Label htmlFor="entity-type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={editingType}
                onValueChange={(value) => setEditingType(value as 'client' | 'investor')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select entity type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Client Form */}
          {editingType === 'client' && (
            <form onSubmit={handleClientSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="client-name" className="text-sm font-medium">
                  Client Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-name"
                  type="text"
                  value={clientForm.name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="transition-all duration-200 hover:bg-muted order-2 sm:order-1 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid()}
                  className="transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
                >
                  {editingItem ? 'Update Client' : 'Create Client'}
                </Button>
              </div>
            </form>
          )}

          {/* Investor Form */}
          {editingType === 'investor' && (
            <form onSubmit={handleInvestorSubmit} className="space-y-4 sm:space-y-5">
              {!editingItem && (
                <div className="space-y-2">
                  <Label htmlFor="investor-client" className="text-sm font-medium">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={investorForm.client_id || ""}
                    onValueChange={(value) => setInvestorForm(prev => ({ ...prev, client_id: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a client..." />
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
              )}

              <div className="space-y-2">
                <Label htmlFor="investor-name" className="text-sm font-medium">
                  Investor Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="investor-name"
                  type="text"
                  value={investorForm.name}
                  onChange={(e) => setInvestorForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter investor name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="investor-annual-income" className="text-sm font-medium">Annual Income (AUD)</Label>
                  <Input
                    id="investor-annual-income"
                    type="number"
                    min="0"
                    value={investorForm.annualIncome}
                    onChange={(e) => setInvestorForm(prev => ({ ...prev, annualIncome: Number(e.target.value) }))}
                    placeholder="0"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-other-income" className="text-sm font-medium">Other Income (AUD)</Label>
                  <Input
                    id="investor-other-income"
                    type="number"
                    min="0"
                    value={investorForm.otherIncome}
                    onChange={(e) => setInvestorForm(prev => ({ ...prev, otherIncome: Number(e.target.value) }))}
                    placeholder="0"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="investor-ownership" className="text-sm font-medium">Ownership (%)</Label>
                  <Input
                    id="investor-ownership"
                    type="number"
                    min="0"
                    max="100"
                    value={investorForm.ownershipPercentage}
                    onChange={(e) => setInvestorForm(prev => ({ ...prev, ownershipPercentage: Number(e.target.value) }))}
                    placeholder="0"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-loan-share" className="text-sm font-medium">Loan Share (%)</Label>
                  <Input
                    id="investor-loan-share"
                    type="number"
                    min="0"
                    max="100"
                    value={investorForm.loanSharePercentage}
                    onChange={(e) => setInvestorForm(prev => ({ ...prev, loanSharePercentage: Number(e.target.value) }))}
                    placeholder="0"
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investor-cash-contribution" className="text-sm font-medium">Cash Contribution (AUD)</Label>
                <Input
                  id="investor-cash-contribution"
                  type="number"
                  min="0"
                  value={investorForm.cashContribution}
                  onChange={(e) => setInvestorForm(prev => ({ ...prev, cashContribution: Number(e.target.value) }))}
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="investor-medicare"
                  checked={investorForm.hasMedicareLevy}
                  onCheckedChange={(checked) => setInvestorForm(prev => ({ ...prev, hasMedicareLevy: checked as boolean }))}
                />
                <Label htmlFor="investor-medicare" className="text-sm font-medium cursor-pointer">
                  Subject to Medicare Levy
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="transition-all duration-200 hover:bg-muted order-2 sm:order-1 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid()}
                  className="transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
                >
                  {editingItem ? 'Update Investor' : 'Create Investor'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (clients.length === 0 && investors.length === 0) {
    return (
      <>
        {modalContent}
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Clients</h1>
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
            <h1 className="text-3xl font-bold">Clients</h1>
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
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {client.name}
                          <Badge variant="secondary" className="text-xs">
                            {getInvestorsForClient(client.id).length} investors
                          </Badge>
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editClient(client)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
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
              filteredInvestors.map((investor) => (
                <Card key={investor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {investor.name}
                          <Badge variant="outline" className="text-xs">
                            {getClientName(investor.client_id)}
                          </Badge>
                        </CardTitle>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Income: {formatCurrency(investor.annualIncome)}</div>
                          <div>Ownership: {investor.ownershipPercentage}%</div>
                          <div>Loan Share: {investor.loanSharePercentage}%</div>
                          <div>Medicare Levy: {investor.hasMedicareLevy ? 'Yes' : 'No'}</div>
                          {investor.otherIncome > 0 && (
                            <div>Other Income: {formatCurrency(investor.otherIncome)}</div>
                          )}
                          {investor.cashContribution > 0 && (
                            <div>Cash Contribution: {formatCurrency(investor.cashContribution)}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editInvestor(investor)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInvestor(investor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
