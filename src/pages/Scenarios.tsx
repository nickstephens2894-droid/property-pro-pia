import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Copy, Save, FileText, Calendar, User, X, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useScenarios, type Scenario } from "@/hooks/useScenarios";
import { useClients } from "@/hooks/useClients";
import { SearchAndFilters } from "@/components/ui/search-and-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDate } from "@/utils/formatters";

export default function Scenarios() {
  const {
    scenarios,
    loading,
    createScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    setPrimaryScenario
  } = useScenarios();

  const { clients } = useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  
  // Scenario form
  const [scenarioForm, setScenarioForm] = useState({
    name: "",
    clientId: "",
    isCore: false,
    notes: ""
  });

  const resetScenarioForm = () => {
    setScenarioForm({
      name: "",
      clientId: "",
      isCore: false,
      notes: ""
    });
    setEditingScenario(null);
  };

  const openAddDialog = () => {
    setEditingScenario(null);
    resetScenarioForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setScenarioForm({
      name: scenario.name,
      clientId: scenario.client_id,
      isCore: scenario.is_core,
      notes: ""
    });
    setIsDialogOpen(true);
  };

  const handleScenarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scenarioForm.name.trim() || !scenarioForm.clientId) {
      return;
    }

    try {
      if (editingScenario) {
        await updateScenario(editingScenario.id, {
          name: scenarioForm.name.trim(),
          client_id: scenarioForm.clientId,
          is_core: scenarioForm.isCore
        });
      } else {
        await createScenario({
          name: scenarioForm.name.trim(),
          client_id: scenarioForm.clientId,
          is_core: scenarioForm.isCore,
          snapshot: {} // Empty snapshot for now, would be populated with actual property data
        });
      }

      setIsDialogOpen(false);
      resetScenarioForm();
    } catch (error) {
      console.error('Error submitting scenario:', error);
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return;
    }
    try {
      await deleteScenario(scenarioId);
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
  };

  const handleDuplicateScenario = async (scenario: Scenario) => {
    try {
      await duplicateScenario(scenario);
    } catch (error) {
      console.error('Error duplicating scenario:', error);
    }
  };

  const handleSetPrimaryScenario = async (scenarioId: string) => {
    try {
      await setPrimaryScenario(scenarioId);
    } catch (error) {
      console.error('Error setting primary scenario:', error);
    }
  };

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === "all" || scenario.client_id === filterClient;
    
    return matchesSearch && matchesClient;
  });

  const filters = [
    {
      key: "client",
      label: "Filter by Client",
      value: filterClient,
      options: [
        { value: "all", label: "All Clients" },
        ...clients.map(client => ({
          value: client.id,
          label: client.name
        }))
      ],
      onChange: (value: string) => setFilterClient(value)
    }
  ];

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  if (loading) {
    return <LoadingSpinner message="Loading scenarios..." />;
  }

  // Render the modal first, so it's always available
  const modalContent = isDialogOpen && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background border border-border shadow-2xl rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {editingScenario ? 'Update scenario information' : 'Create a new investment scenario'}
              </p>
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <form onSubmit={handleScenarioSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="scenario-name" className="text-sm font-medium">
                Scenario Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="scenario-name"
                type="text"
                value={scenarioForm.name}
                onChange={(e) => setScenarioForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter scenario name"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario-client" className="text-sm font-medium">
                Client <span className="text-destructive">*</span>
              </Label>
              <Select
                value={scenarioForm.clientId}
                onValueChange={(value) => setScenarioForm(prev => ({ ...prev, clientId: value }))}
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

            <div className="space-y-2">
              <Label htmlFor="scenario-notes" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="scenario-notes"
                value={scenarioForm.notes}
                onChange={(e) => setScenarioForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this scenario"
                rows={3}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
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
                disabled={!scenarioForm.name.trim() || !scenarioForm.clientId}
                className="transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
              >
                {editingScenario ? 'Update Scenario' : 'Create Scenario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (scenarios.length === 0) {
    return (
      <>
        {modalContent}
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Scenarios</h1>
              <p className="text-muted-foreground">Manage your investment scenarios</p>
            </div>
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scenarios yet</h3>
              <p className="text-muted-foreground mb-4">Start creating investment scenarios to model different property strategies.</p>
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
            <h1 className="text-3xl font-bold">Scenarios</h1>
            <p className="text-muted-foreground">Manage your investment scenarios</p>
          </div>
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Scenario
          </Button>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search scenarios by name..."
          filters={filters}
        />

        {/* Scenarios Grid */}
        <div className="grid gap-4">
          {filteredScenarios.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No scenarios match your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {scenario.name}
                        {scenario.is_core && (
                          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Core
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3" />
                          {getClientName(scenario.client_id)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(scenario.created_at)}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {!scenario.is_core && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimaryScenario(scenario.id)}
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set Core
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateScenario(scenario)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(scenario)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteScenario(scenario.id)}
                        disabled={scenario.is_core}
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
    </>
  );
}
