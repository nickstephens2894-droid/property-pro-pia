import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Building2, Layers, DollarSign, User, Phone, Mail, MapPin, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";

interface Investor {
  id: string;
  name: string;
  annual_income: number;
  other_income: number;
  non_taxable_income: number;
  has_medicare_levy: boolean;
  created_at: string;
  updated_at: string;
}

interface PropertyInvestor {
  id: string;
  property_id: string;
  ownership_percentage: number;
  cash_contribution: number;
  notes?: string;
  properties: {
    id: string;
    name: string;
    type: string;
    purchase_price: number;
    weekly_rent: number;
    location?: string;
  };
}

interface InstanceInvestor {
  id: string;
  name: string;
  property_type: string;
  purchase_price: number;
  weekly_rent: number;
  location: string;
  weekly_cashflow_year1: number;
  tax_savings_year1: number;
  ownership_percentage?: number;
}

export default function InvestorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [properties, setProperties] = useState<PropertyInvestor[]>([]);
  const [instances, setInstances] = useState<InstanceInvestor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    loadInvestorData();
  }, [user, id]);

  const loadInvestorData = async () => {
    if (!user || !id) return;
    
    setLoading(true);
    try {
      // Load investor details
      const { data: investorData, error: investorError } = await supabase
        .from('investors')
        .select('*')
        .eq('id', id)
        .eq('owner_user_id', user.id)
        .single();

      if (investorError) throw investorError;
      setInvestor(investorData);

      // Load properties linked to this investor
      const { data: propertyData, error: propertyError } = await supabase
        .from('property_investors')
        .select(`
          id,
          property_id,
          ownership_percentage,
          cash_contribution,
          notes,
          properties!inner(
            id,
            name,
            type,
            purchase_price,
            weekly_rent,
            location,
            owner_user_id
          )
        `)
        .eq('investor_id', id);

      if (propertyError) throw propertyError;
      
      // Filter to only show properties owned by the current user
      const userProperties = (propertyData || []).filter(
        prop => prop.properties?.owner_user_id === user.id
      );
      setProperties(userProperties);

      // Load instances where this investor is involved
      const { data: instancesData, error: instancesError } = await supabase
        .from('instances')
        .select(`
          id,
          name,
          property_type,
          purchase_price,
          weekly_rent,
          location,
          weekly_cashflow_year1,
          tax_savings_year1,
          investors,
          ownership_allocations
        `)
        .eq('user_id', user.id);

      if (instancesError) throw instancesError;

      // Filter instances where this investor is involved and calculate their ownership
      const investorInstances: InstanceInvestor[] = [];
      
      (instancesData || []).forEach(instance => {
        const investors = Array.isArray(instance.investors) ? instance.investors : [];
        const allocations = Array.isArray(instance.ownership_allocations) ? instance.ownership_allocations : [];
        
        // Check if this investor is in the instance
        const isInvolved = investors.some((inv: any) => inv.id === id);
        
        if (isInvolved) {
          // Find their ownership percentage
          const allocation = allocations.find((alloc: any) => 
            typeof alloc === 'object' && alloc !== null && 
            'investorId' in alloc && alloc.investorId === id
          );
          const ownershipPercentage = (allocation && typeof allocation === 'object' && 'ownershipPercentage' in allocation) 
            ? (allocation as any).ownershipPercentage || 0 
            : 0;
          
          investorInstances.push({
            id: instance.id,
            name: instance.name,
            property_type: instance.property_type,
            purchase_price: instance.purchase_price,
            weekly_rent: instance.weekly_rent,
            location: instance.location,
            weekly_cashflow_year1: instance.weekly_cashflow_year1,
            tax_savings_year1: instance.tax_savings_year1,
            ownership_percentage: ownershipPercentage
          });
        }
      });

      setInstances(investorInstances);
    } catch (error) {
      console.error('Error loading investor data:', error);
      toast.error('Failed to load investor details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading investor details..." />;
  }

  if (!investor) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Investor Not Found</h1>
          <p className="text-muted-foreground mb-4">The investor you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/investors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Investors
          </Button>
        </div>
      </div>
    );
  }

  const totalIncome = investor.annual_income + investor.other_income;
  const totalPropertyValue = properties.reduce((sum, prop) => sum + (prop.properties.purchase_price || 0), 0);
  const totalInstanceValue = instances.reduce((sum, inst) => sum + (inst.purchase_price || 0), 0);
  const totalCashflow = instances.reduce((sum, inst) => sum + (inst.weekly_cashflow_year1 * (inst.ownership_percentage || 0) / 100), 0);
  const totalTaxSavings = instances.reduce((sum, inst) => sum + (inst.tax_savings_year1 * (inst.ownership_percentage || 0) / 100), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/investors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{investor.name}</h1>
            <p className="text-muted-foreground">Investor Details & Portfolio</p>
          </div>
        </div>
      </div>

      {/* Investor Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Annual Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(investor.annual_income)}</div>
            <p className="text-xs text-muted-foreground">Primary income source</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Including other income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">Active investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instances.length}</div>
            <p className="text-xs text-muted-foreground">Analysis scenarios</p>
          </CardContent>
        </Card>
      </div>

      {/* Investor Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Investor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Annual Income</Label>
              <p className="text-lg font-semibold">{formatCurrency(investor.annual_income)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Other Income</Label>
              <p className="text-lg font-semibold">{formatCurrency(investor.other_income)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Non-taxable Income</Label>
              <p className="text-lg font-semibold">{formatCurrency(investor.non_taxable_income)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Medicare Levy</Label>
              <Badge variant={investor.has_medicare_levy ? "default" : "secondary"}>
                {investor.has_medicare_levy ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Property Value</Label>
              <p className="text-lg font-semibold">{formatCurrency(totalPropertyValue)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Weekly Cashflow</Label>
              <p className={`text-lg font-semibold ${totalCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalCashflow))} {totalCashflow >= 0 ? 'positive' : 'negative'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Annual Tax Savings</Label>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(totalTaxSavings)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Net Annual Benefit</Label>
              <p className={`text-lg font-semibold ${(totalCashflow * 52 + totalTaxSavings) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalCashflow * 52 + totalTaxSavings))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Properties ({properties.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-sm text-muted-foreground">
                This investor is not currently linked to any properties.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((propertyInvestor) => (
                <div key={propertyInvestor.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{propertyInvestor.properties.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Type: {propertyInvestor.properties.type}</span>
                          <span>Value: {formatCurrency(propertyInvestor.properties.purchase_price)}</span>
                          <span>Rent: {formatCurrency(propertyInvestor.properties.weekly_rent)}/week</span>
                          {propertyInvestor.properties.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {propertyInvestor.properties.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{propertyInvestor.ownership_percentage}% ownership</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(propertyInvestor.cash_contribution)} contribution
                      </div>
                    </div>
                  </div>
                  {propertyInvestor.notes && (
                    <div className="mt-2 text-sm text-muted-foreground bg-muted rounded p-2">
                      {propertyInvestor.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instances Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Analysis Instances ({instances.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Instances Found</h3>
              <p className="text-sm text-muted-foreground">
                This investor is not currently part of any analysis scenarios.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {instances.map((instance) => (
                <div key={instance.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">
                          <Link 
                            to={`/instances/${instance.id}`} 
                            className="hover:text-primary transition-colors"
                          >
                            {instance.name}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Type: {instance.property_type}</span>
                          <span>Value: {formatCurrency(instance.purchase_price)}</span>
                          <span>Rent: {formatCurrency(instance.weekly_rent)}/week</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {instance.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{instance.ownership_percentage}% ownership</div>
                      <div className="text-sm text-muted-foreground">
                        Weekly: {formatCurrency(Math.abs(instance.weekly_cashflow_year1 * (instance.ownership_percentage || 0) / 100))} 
                        {(instance.weekly_cashflow_year1 * (instance.ownership_percentage || 0) / 100) >= 0 ? ' positive' : ' negative'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weekly Cashflow: </span>
                      <span className={instance.weekly_cashflow_year1 >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(Math.abs(instance.weekly_cashflow_year1))} 
                        {instance.weekly_cashflow_year1 >= 0 ? ' positive' : ' negative'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Annual Tax Savings: </span>
                      <span className="text-green-600">{formatCurrency(instance.tax_savings_year1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Simple Label component
function Label({ className = "", children, ...props }: React.ComponentProps<'label'>) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}