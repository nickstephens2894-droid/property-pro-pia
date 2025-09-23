import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  FileText,
  Calendar,
  User,
  X,
  Star,
  Play,
  Layers,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useScenarios } from "@/contexts/ScenariosContext";
import { useInstances } from "@/contexts/InstancesContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScenarioProjectionsEnhanced } from "@/components/ScenarioProjectionsEnhanced";
import { ScenarioInstanceCard } from "@/components/ScenarioInstanceCard";
import { CreateScenarioDialog } from "@/components/CreateScenarioDialog";
import { ScenarioInstanceDetail } from "@/components/ScenarioInstanceDetail";
import { ScenarioComparison } from "@/components/ScenarioComparison";

export default function Scenarios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    scenarios,
    currentScenario,
    loading,
    error,
    isScenariosEnabled,
    isApplyEnabled,
    createScenario,
    updateScenario,
    deleteScenario,
    setPrimaryScenario,
    addInstanceToScenario,
    createNewInstanceInScenario,
    removeInstanceFromScenario,
    refreshScenarioInstance,
    applyScenarioInstance,
    applyAllScenarioInstances,
    setCurrentScenario,
    refreshScenarios,
    clearError,
  } = useScenarios();

  const { instances } = useInstances();

  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    scenarioId: string | null;
    scenarioName: string | null;
  }>({
    isOpen: false,
    scenarioId: null,
    scenarioName: null,
  });
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [scenarioToApply, setScenarioToApply] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Get current scenario
  const currentScenarioData = selectedScenarioId
    ? scenarios.find((s) => s.id === selectedScenarioId)
    : null;

  // Handlers
  const handleCreateScenario = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      const newScenario = await createScenario(data);
      setSelectedScenarioId(newScenario.id);
      setCurrentScenario(newScenario);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating scenario:", error);
    }
  };

  // New delete functionality - completely reimplemented
  const openDeleteDialog = (scenarioId: string, scenarioName: string) => {
    setDeleteDialog({
      isOpen: true,
      scenarioId,
      scenarioName,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      scenarioId: null,
      scenarioName: null,
    });
  };

  const handleDeleteScenario = async () => {
    if (!deleteDialog.scenarioId) {
      console.error("No scenario ID provided for deletion");
      return;
    }

    try {
      // Call the delete function from context
      await deleteScenario(deleteDialog.scenarioId);

      // Clear selection if we're deleting the currently selected scenario
      if (selectedScenarioId === deleteDialog.scenarioId) {
        setSelectedScenarioId(null);
        setCurrentScenario(null);
      }

      // Close dialog
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting scenario:", error);
      // Error toast is handled in the context
    }
  };

  const handleApplyAll = async () => {
    if (!scenarioToApply) return;

    try {
      const results = await applyAllScenarioInstances(scenarioToApply);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        // Refresh scenarios to update status
        await refreshScenarios();
      }

      setIsApplyDialogOpen(false);
      setScenarioToApply(null);
    } catch (error) {
      console.error("Error applying scenario:", error);
    }
  };

  const handleAddInstance = async (instanceId: string) => {
    if (!selectedScenarioId) return;

    try {
      await addInstanceToScenario(selectedScenarioId, instanceId);
    } catch (error) {
      console.error("Error adding instance to scenario:", error);
    }
  };

  const handleRefreshInstance = async (scenarioInstanceId: string) => {
    try {
      await refreshScenarioInstance(scenarioInstanceId);
    } catch (error) {
      console.error("Error refreshing scenario instance:", error);
    }
  };

  const handleCreateNewInstance = () => {
    if (!selectedScenarioId) return;

    // Navigate to the AddInstance page with scenario context
    navigate(`/instances/add/${selectedScenarioId}`);
  };

  const handleInstanceClick = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
  };

  const handleBackToScenarios = () => {
    setSelectedInstanceId(null);
  };

  const handleOpenComparison = () => {
    setIsComparisonOpen(true);
  };

  const handleCloseComparison = () => {
    setIsComparisonOpen(false);
  };

  // Show loading state first
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner message="Loading scenarios..." />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Scenarios
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => {
                  clearError();
                  refreshScenarios();
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show feature disabled message
  if (!isScenariosEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Feature Disabled</h3>
                <p className="text-muted-foreground">
                  The Scenarios feature is currently disabled. Please contact
                  your administrator.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show comparison view
  if (isComparisonOpen) {
    return (
      <ScenarioComparison
        scenarios={scenarios}
        onClose={handleCloseComparison}
      />
    );
  }

  // Show instance detail view
  if (selectedInstanceId && currentScenarioData) {
    const scenarioInstance = currentScenarioData.scenario_instances.find(
      (si) => si.id === selectedInstanceId
    );
    if (scenarioInstance) {
      return (
        <ScenarioInstanceDetail
          scenario={currentScenarioData}
          scenarioInstance={scenarioInstance}
          onBack={handleBackToScenarios}
          onUpdate={refreshScenarios}
        />
      );
    }
  }

  // Show scenario detail view
  if (selectedScenarioId && currentScenarioData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedScenarioId(null)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Scenarios</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                  {currentScenarioData.name}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base truncate">
                  {currentScenarioData.description || "No description"}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setScenarioToApply(currentScenarioData.id);
                  setIsApplyDialogOpen(true);
                }}
                disabled={
                  !isApplyEnabled ||
                  currentScenarioData.scenario_instances.length === 0
                }
                className="w-full sm:w-auto"
              >
                <Play className="h-4 w-4 mr-2" />
                Apply All
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  openDeleteDialog(
                    currentScenarioData.id,
                    currentScenarioData.name
                  )
                }
                className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4 sm:space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="instances" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Instances</span>
                <span className="sm:hidden">Inst.</span>
                <span className="ml-1">
                  ({currentScenarioData.scenario_instances.length})
                </span>
              </TabsTrigger>
              <TabsTrigger value="projections" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Projections</span>
                <span className="sm:hidden">Proj.</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              {/* Scenario Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Scenario Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about this scenario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground break-words">
                        {currentScenarioData.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            currentScenarioData.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {currentScenarioData.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentScenarioData.created_at)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Last Updated
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentScenarioData.updated_at)}
                      </p>
                    </div>
                  </div>
                  {currentScenarioData.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {currentScenarioData.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common actions for this scenario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("instances")}
                      className="h-16 sm:h-20 flex flex-col items-center justify-center"
                    >
                      <Layers className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm">
                        Manage Instances
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("projections")}
                      className="h-16 sm:h-20 flex flex-col items-center justify-center"
                    >
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm">
                        View Projections
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCreateNewInstance}
                      className="h-16 sm:h-20 flex flex-col items-center justify-center sm:col-span-2 lg:col-span-1"
                    >
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm">
                        Create New Instance
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instances" className="space-y-4 sm:space-y-6">
              {/* Add Instance Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Add Instance to Scenario
                  </CardTitle>
                  <CardDescription>
                    Add an existing instance or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Select onValueChange={handleAddInstance}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select an existing instance" />
                      </SelectTrigger>
                      <SelectContent>
                        {instances.map((instance) => (
                          <SelectItem key={instance.id} value={instance.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {instance.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(instance.purchase_price)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleCreateNewInstance}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Instance
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Instances */}
              <div className="space-y-4">
                {currentScenarioData.scenario_instances.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No instances in scenario
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Add instances to this scenario to start experimenting
                      </p>
                      <Button onClick={handleCreateNewInstance}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Instance
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  currentScenarioData.scenario_instances.map(
                    (scenarioInstance) => (
                      <ScenarioInstanceCard
                        key={scenarioInstance.id}
                        scenarioInstance={scenarioInstance}
                        onEdit={() => handleInstanceClick(scenarioInstance.id)}
                        onRemove={() =>
                          removeInstanceFromScenario(scenarioInstance.id)
                        }
                        onRefresh={() =>
                          handleRefreshInstance(scenarioInstance.id)
                        }
                        onApply={() =>
                          applyScenarioInstance(scenarioInstance.id)
                        }
                        canApply={isApplyEnabled}
                      />
                    )
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="projections" className="space-y-6">
              <ScenarioProjectionsEnhanced
                scenario={currentScenarioData}
                onRefresh={() => refreshScenarios()}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Show scenarios list
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Scenarios</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Experiment with copies of your investment instances safely
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {scenarios.length >= 2 && (
              <Button
                variant="outline"
                onClick={handleOpenComparison}
                className="w-full sm:w-auto"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare Scenarios
              </Button>
            )}
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </div>
        </div>

        {/* Scenarios Grid */}
        {scenarios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scenarios yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first scenario to start experimenting with different
                investment strategies
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Scenario
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {scenario.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {scenario.description || "No description"}
                      </CardDescription>
                    </div>
                    {scenario.is_primary && (
                      <Badge variant="default" className="ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Instances
                      </span>
                      <span className="font-medium">
                        {scenario.scenario_instances.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={
                          scenario.status === "active" ? "default" : "secondary"
                        }
                      >
                        {scenario.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Created
                      </span>
                      <span className="text-sm">
                        {formatDate(scenario.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Modified
                      </span>
                      <span className="text-sm">
                        {formatDate(scenario.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScenarioId(scenario.id);
                      }}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(scenario.id, scenario.name);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateScenarioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateScenario}
      />

      <ConfirmationDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        title="Delete Scenario"
        description={`Are you sure you want to delete "${deleteDialog.scenarioName}"? This action cannot be undone and will remove all scenario instances.`}
        confirmText="Delete Scenario"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteScenario}
        onCancel={closeDeleteDialog}
      />

      <ConfirmationDialog
        open={isApplyDialogOpen}
        onOpenChange={(open) => {
          setIsApplyDialogOpen(open);
          if (!open) {
            setScenarioToApply(null);
          }
        }}
        title="Apply Scenario Changes"
        description="This will apply all changes from this scenario to your real instances. This action cannot be undone."
        confirmText="Apply All Changes"
        cancelText="Cancel"
        onConfirm={handleApplyAll}
        onCancel={() => {
          setIsApplyDialogOpen(false);
          setScenarioToApply(null);
        }}
      />
    </div>
  );
}
