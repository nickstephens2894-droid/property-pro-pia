import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Copy, Save, FileText, Calendar, User, X, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useScenarios, type Scenario } from "@/hooks/useScenarios";
import { useProperties } from "@/hooks/useProperties";
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

  const { properties } = useProperties();

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  
  // Scenario form
  const [scenarioForm, setScenarioForm] = useState({
    name: "",
    isCore: false,
    notes: "",
    // Financing
    cashAvailable: 250000,
    // Equity Funding
    useEquityFunding: false,
    securityPropertyValue: 1200000,
    securityPropertyCurrentTotalDebt: 500000,
    securityPropertyMaxLVR: 80,
    equityReleaseIOTerm: 3,
    equityReleaseLoanType: "IO,P&I",
    equityLoanInterestRate: 6.50,
    equityLoanTerm: 30,
    // Deposit Management
    depositAmount: 140000,
    // Property Selection
    selectedProperties: [] as { id: string; name: string; propertyType: string; currentPropertyValue: number }[]
  });

  const resetScenarioForm = () => {
    setScenarioForm({
      name: "",
      isCore: false,
      notes: "",
      // Financing
      cashAvailable: 250000,
      // Equity Funding
      useEquityFunding: false,
      securityPropertyValue: 1200000,
      securityPropertyCurrentTotalDebt: 500000,
      securityPropertyMaxLVR: 80,
      equityReleaseIOTerm: 3,
      equityReleaseLoanType: "IO,P&I",
      equityLoanInterestRate: 6.50,
      equityLoanTerm: 30,
      // Deposit Management
      depositAmount: 140000,
      // Property Selection
      selectedProperties: []
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
    
    // Load existing scenario data from snapshot
    const snapshot = scenario.snapshot || {};
    
    setScenarioForm({
      name: scenario.name,
      isCore: scenario.is_core,
      notes: "",
      // Financing
      cashAvailable: snapshot.cashAvailable || 250000,
      // Equity Funding
      useEquityFunding: snapshot.useEquityFunding || false,
      securityPropertyValue: snapshot.securityPropertyValue || 1200000,
      securityPropertyCurrentTotalDebt: snapshot.securityPropertyCurrentTotalDebt || 500000,
      securityPropertyMaxLVR: snapshot.securityPropertyMaxLVR || 80,
      equityReleaseIOTerm: snapshot.equityReleaseIOTerm || 3,
      equityReleaseLoanType: snapshot.equityReleaseLoanType || "IO,P&I",
      equityLoanInterestRate: snapshot.equityLoanInterestRate || 6.50,
      equityLoanTerm: snapshot.equityLoanTerm || 30,
      // Deposit Management
      depositAmount: snapshot.depositAmount || 140000,
      // Property Selection
      selectedProperties: snapshot.selectedProperties || []
    });
    setIsDialogOpen(true);
  };

  const handleScenarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scenarioForm.name.trim()) {
      return;
    }

    try {
      // Create snapshot with all scenario parameters
      const snapshot = {
        // Financing
        cashAvailable: scenarioForm.cashAvailable,
        // Equity Funding
        useEquityFunding: scenarioForm.useEquityFunding,
        securityPropertyValue: scenarioForm.securityPropertyValue,
        securityPropertyCurrentTotalDebt: scenarioForm.securityPropertyCurrentTotalDebt,
        securityPropertyMaxLVR: scenarioForm.securityPropertyMaxLVR,
        equityReleaseIOTerm: scenarioForm.equityReleaseIOTerm,
        equityReleaseLoanType: scenarioForm.equityReleaseLoanType,
        equityLoanInterestRate: scenarioForm.equityLoanInterestRate,
        equityLoanTerm: scenarioForm.equityLoanTerm,
        // Deposit Management
        depositAmount: scenarioForm.depositAmount,
        // Property Selection
        selectedProperties: scenarioForm.selectedProperties
      };

      if (editingScenario) {
        await updateScenario(editingScenario.id, {
          name: scenarioForm.name.trim(),
          is_core: scenarioForm.isCore
        });
        // TODO: Update snapshot when scenario update supports it
      } else {
        await createScenario({
          name: scenarioForm.name.trim(),
          is_core: scenarioForm.isCore,
          snapshot: snapshot
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

  const addPropertyToScenario = (property: any) => {
    const propertyData = {
      id: property.id,
      name: property.name,
      propertyType: property.propertyType || 'Unknown',
      currentPropertyValue: property.currentPropertyValue || 0
    };
    
    setScenarioForm(prev => ({
      ...prev,
      selectedProperties: [...prev.selectedProperties, propertyData]
    }));
  };

  const removePropertyFromScenario = (propertyId: string) => {
    setScenarioForm(prev => ({
      ...prev,
      selectedProperties: prev.selectedProperties.filter(p => p.id !== propertyId)
    }));
  };

  const filteredScenarios = scenarios;

  const filters = [
    // No filters needed since client filtering is removed
  ];

  if (loading) {
    return <LoadingSpinner message="Loading scenarios..." />;
  }

  // Render the modal first, so it's always available
  const modalContent = isDialogOpen && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background border border-border shadow-2xl rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2">
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
          <form onSubmit={handleScenarioSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Basic Information</h3>
              
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
            </div>

            {/* Financing Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Financing</h3>
              
              <div className="space-y-2">
                <Label htmlFor="cash-available" className="text-sm font-medium">
                  Cash Available
                </Label>
                <Input
                  id="cash-available"
                  type="number"
                  value={scenarioForm.cashAvailable}
                  onChange={(e) => setScenarioForm(prev => ({ ...prev, cashAvailable: Number(e.target.value) }))}
                  placeholder="250000"
                  min="0"
                  step="1000"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                />
                <p className="text-xs text-muted-foreground">User input or calculated</p>
              </div>
            </div>

            {/* Equity Funding Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Equity Funding</h3>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Label htmlFor="use-equity-funding" className="text-sm font-medium">Use Equity Funding</Label>
                  <p className="text-sm text-muted-foreground">Enable equity funding for this scenario</p>
                </div>
                <Switch
                  id="use-equity-funding"
                  checked={scenarioForm.useEquityFunding}
                  onCheckedChange={(checked) => setScenarioForm(prev => ({ ...prev, useEquityFunding: checked }))}
                />
              </div>

              {scenarioForm.useEquityFunding && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="security-property-value" className="text-sm font-medium">
                        Security Property Value
                      </Label>
                      <Input
                        id="security-property-value"
                        type="number"
                        value={scenarioForm.securityPropertyValue}
                        onChange={(e) => setScenarioForm(prev => ({ ...prev, securityPropertyValue: Number(e.target.value) }))}
                        placeholder="1200000"
                        min="0"
                        step="10000"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                      />
                      <p className="text-xs text-muted-foreground">User input or calculated</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="security-property-debt" className="text-sm font-medium">
                        Security Property Current Total Debt
                      </Label>
                      <Input
                        id="security-property-debt"
                        type="number"
                        value={scenarioForm.securityPropertyCurrentTotalDebt}
                        onChange={(e) => setScenarioForm(prev => ({ ...prev, securityPropertyCurrentTotalDebt: Number(e.target.value) }))}
                        placeholder="500000"
                        min="0"
                        step="10000"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                      />
                      <p className="text-xs text-muted-foreground">User input or calculated</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="security-property-max-lvr" className="text-sm font-medium">
                        Security Property Max LVR (%)
                      </Label>
                      <Input
                        id="security-property-max-lvr"
                        type="number"
                        value={scenarioForm.securityPropertyMaxLVR}
                        onChange={(e) => setScenarioForm(prev => ({ ...prev, securityPropertyMaxLVR: Number(e.target.value) }))}
                        placeholder="80"
                        min="0"
                        max="100"
                        step="1"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                      />
                      <p className="text-xs text-muted-foreground">User input</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="equity-release-io-term" className="text-sm font-medium">
                        Equity Release IO Term (years)
                      </Label>
                      <Input
                        id="equity-release-io-term"
                        type="number"
                        value={scenarioForm.equityReleaseIOTerm}
                        onChange={(e) => setScenarioForm(prev => ({ ...prev, equityReleaseIOTerm: Number(e.target.value) }))}
                        placeholder="3"
                        min="0"
                        max="30"
                        step="1"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                      />
                      <p className="text-xs text-muted-foreground">User input</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equity-release-loan-type" className="text-sm font-medium">
                        Equity Release Loan Type
                      </Label>
                      <Select
                        value={scenarioForm.equityReleaseLoanType}
                        onValueChange={(value) => setScenarioForm(prev => ({ ...prev, equityReleaseLoanType: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IO,P&I">IO,P&I</SelectItem>
                          <SelectItem value="IO">Interest Only</SelectItem>
                          <SelectItem value="P&I">Principal & Interest</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">User input</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="equity-loan-interest-rate" className="text-sm font-medium">
                        Equity Loan Interest Rate (%)
                      </Label>
                      <Input
                        id="equity-loan-interest-rate"
                        type="number"
                        value={scenarioForm.equityLoanInterestRate}
                        onChange={(e) => setScenarioForm(prev => ({ ...prev, equityLoanInterestRate: Number(e.target.value) }))}
                        placeholder="6.50"
                        min="0"
                        max="20"
                        step="0.01"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                      />
                      <p className="text-xs text-muted-foreground">User input</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equity-loan-term" className="text-sm font-medium">
                      Equity Loan Term (years)
                    </Label>
                    <Input
                      id="equity-loan-term"
                      type="number"
                      value={scenarioForm.equityLoanTerm}
                      onChange={(e) => setScenarioForm(prev => ({ ...prev, equityLoanTerm: Number(e.target.value) }))}
                      placeholder="30"
                      min="1"
                      max="50"
                      step="1"
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                    />
                    <p className="text-xs text-muted-foreground">User input</p>
                  </div>
                </div>
              )}
            </div>

            {/* Deposit Management Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Deposit Management</h3>
              
              <div className="space-y-2">
                <Label htmlFor="deposit-amount" className="text-sm font-medium">
                  Deposit Amount (cash required)
                </Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  value={scenarioForm.depositAmount}
                  onChange={(e) => setScenarioForm(prev => ({ ...prev, depositAmount: Number(e.target.value) }))}
                  placeholder="140000"
                  min="0"
                  step="1000"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                />
                <p className="text-xs text-muted-foreground">Calculation helper + user input confirming</p>
              </div>
            </div>

            {/* Property Selection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Property Selection</h3>
              
              {properties.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">No properties available</p>
                  <p className="text-xs text-muted-foreground">
                    Create properties first from the Properties page to add them to scenarios
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Select Properties for Scenario</Label>
                    <span className="text-xs text-muted-foreground">
                      {scenarioForm.selectedProperties.length} of {properties.length} selected
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {properties.map((property) => {
                      const isSelected = scenarioForm.selectedProperties.some(p => p.id === property.id);
                      
                      return (
                        <div key={property.id} className="flex items-center space-x-3 p-2 hover:bg-muted/30 rounded-lg">
                          <input
                            type="checkbox"
                            id={`property-${property.id}`}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                addPropertyToScenario(property);
                              } else {
                                removePropertyFromScenario(property.id);
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`property-${property.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">{property.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {property.propertyType || 'Unknown'} • ${property.currentPropertyValue?.toLocaleString() || 'N/A'}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  
                  {scenarioForm.selectedProperties.length > 0 && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="text-sm font-medium text-primary mb-2">
                        Selected Properties ({scenarioForm.selectedProperties.length})
                      </div>
                      <div className="space-y-1">
                        {scenarioForm.selectedProperties.map((property) => (
                          <div key={property.id} className="flex items-center justify-between text-sm">
                            <span>{property.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePropertyFromScenario(property.id)}
                              className="text-destructive hover:text-destructive/80 h-6 px-2"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Check the properties you want to include in this scenario. Property-specific details and performance adjustments can be configured on the scenario detail page.
                  </p>
                </div>
              )}
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
                disabled={!scenarioForm.name.trim()}
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

        {/* Scenarios Grid */}
        <div className="grid gap-4">
          {filteredScenarios.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No scenarios found</p>
              </CardContent>
            </Card>
          ) : (
            filteredScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(scenario.created_at)}
                        </div>
                      </div>
                      {scenario.is_core && (
                        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Core
                        </Badge>
                      )}
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
