import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyData } from '@/contexts/PropertyDataContext';
import { userDataService, UserScenario } from '@/services/userDataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Star, 
  StarOff, 
  Plus,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function ScenarioManager() {
  const { user } = useAuth();
  const { loadScenario, propertyData } = usePropertyData();
  const [scenarios, setScenarios] = useState<UserScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<UserScenario | null>(null);

  // Load user scenarios on mount
  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user]);

  const loadScenarios = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userScenarios = await userDataService.getUserScenarios(user.id);
      setScenarios(userScenarios);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast.error('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!user || !scenarioName.trim()) {
      toast.error('Please enter a scenario name');
      return;
    }

    setLoading(true);
    try {
      const success = await userDataService.saveScenario(user.id, {
        name: scenarioName.trim(),
        isPrimary: scenarios.length === 0, // First scenario becomes primary
        propertyData
      });
      if (success) {
        toast.success('Scenario saved successfully');
        setScenarioName('');
        setScenarioDescription('');
        setSaveDialogOpen(false);
        await loadScenarios(); // Refresh the list
      } else {
        toast.error('Failed to save scenario');
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast.error('Failed to save scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadScenario = async (scenario: UserScenario) => {
    try {
      // Update the property data context with the loaded scenario
      loadScenario(scenario.propertyData);
      toast.success(`Loaded scenario: ${scenario.name}`);
      setSelectedScenario(scenario);
    } catch (error) {
      console.error('Error loading scenario:', error);
      toast.error('Failed to load scenario');
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const success = await userDataService.deleteScenario(scenarioId);
      if (success) {
        toast.success('Scenario deleted successfully');
        await loadScenarios(); // Refresh the list
      } else {
        toast.error('Failed to delete scenario');
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast.error('Failed to delete scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (scenarioId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const success = await userDataService.setPrimaryScenario(user.id, scenarioId);
      if (success) {
        toast.success('Primary scenario updated');
        await loadScenarios(); // Refresh the list
      } else {
        toast.error('Failed to update primary scenario');
      }
    } catch (error) {
      console.error('Error setting primary scenario:', error);
      toast.error('Failed to update primary scenario');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Scenarios</h3>
          <p className="text-sm text-muted-foreground">
            Save and manage your property analysis scenarios
          </p>
        </div>
        
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSaveDialogOpen(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Scenario</DialogTitle>
              <DialogDescription>
                Save your current property analysis as a new scenario.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scenario-name">Scenario Name</Label>
                <Input
                  id="scenario-name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., Investment Property 1, First Home, etc."
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveScenario()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveScenario} disabled={loading || !scenarioName.trim()}>
                {loading ? 'Saving...' : 'Save Scenario'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scenarios List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading scenarios...</p>
        </div>
      ) : scenarios.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No scenarios yet</h4>
            <p className="text-muted-foreground mb-4">
              Save your first property analysis to get started
            </p>
            <Button onClick={() => setSaveDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Save First Scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      {scenario.isPrimary && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(scenario.updatedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(scenario.updatedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadScenario(scenario)}
                    >
                      <FolderOpen className="h-4 w-4 mr-1" />
                      Load
                    </Button>
                    
                    {!scenario.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(scenario.id)}
                        disabled={loading}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteScenario(scenario.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 