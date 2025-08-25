import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useInstances } from "@/contexts/InstancesContext";
import { Database } from "@/integrations/supabase/types";

type Instance = Database['public']['Tables']['instances']['Row'];

const Instances = () => {
  const navigate = useNavigate();
  const { instances, loading, error } = useInstances();

  const handleAddInstance = () => {
    navigate('/instances/add');
  };

  const handleInstanceClick = (instanceId: string) => {
    navigate(`/instances/${instanceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Instead of showing error, show the header and empty state
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header - Same style as Properties page */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Property Investment Instances</h1>
              <p className="text-muted-foreground">Create and manage property investment instances for analysis and projections</p>
            </div>
            <Button onClick={handleAddInstance} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Instance
            </Button>
          </div>

          {/* Empty State - Centered below header */}
          <div className="flex items-center justify-center h-64">
            <EmptyState
              icon={Building2}
              title="No instances yet"
              description="Create your first property investment instance to get started with analysis and projections."
              actionLabel="Create First Instance"
              onAction={handleAddInstance}
            />
          </div>
        </div>
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Header - Same style as Properties page */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Property Investment Instances</h1>
              <p className="text-muted-foreground">Create and manage property investment instances for analysis and projections</p>
            </div>
            <Button onClick={handleAddInstance} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Instance
            </Button>
          </div>

          {/* Empty State - Centered below header */}
          <div className="flex items-center justify-center h-64">
            <EmptyState
              icon={Building2}
              title="No instances yet"
              description="Create your first property investment instance to get started with analysis and projections."
              actionLabel="Create First Instance"
              onAction={handleAddInstance}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Property Investment Instances</h1>
            <p className="text-muted-foreground">Manage and analyze your property investment instances</p>
          </div>
          <Button onClick={handleAddInstance} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Instance
          </Button>
        </div>

        {/* Instances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Card 
              key={instance.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleInstanceClick(instance.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{instance.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {instance.property_method || 'Property'}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    instance.status === 'active' ? 'bg-green-100 text-green-800' :
                    instance.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {instance.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Purchase Price</span>
                    <span className="font-medium">
                      ${instance.purchase_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weekly Rent</span>
                    <span className="text-sm">
                      ${instance.weekly_rent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {new Date(instance.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instances; 