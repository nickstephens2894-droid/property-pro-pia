import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import { ArrowLeft, Save, Building2, Loader2 } from "lucide-react";
import { PROPERTY_METHODS } from "@/types/presets";
import { calculateStampDuty, type Jurisdiction } from "@/utils/stampDuty";
import { useProperties } from "@/contexts/PropertiesContext";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface EditPropertyForm {
  name: string;
  description: string;
  property_type: 'Apartment' | 'House' | 'Townhouse' | 'Unit' | 'Land' | 'Commercial';
  purchase_price: number;
  weekly_rent: number;
  location: Jurisdiction;
  property_method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner';
  // Property Basics
  construction_year: number;
  is_construction_project: boolean;
  land_value: number;
  construction_value: number;
  construction_period: number;
  construction_interest_rate: number;
  building_value: number;
  plant_equipment_value: number;
  // Transaction Costs
  stamp_duty: number;
  legal_fees: number;
  inspection_fees: number;
  council_fees: number;
  architect_fees: number;
  site_costs: number;
  // Ongoing Income & Expenses
  rental_growth_rate: number;
  vacancy_rate: number;
  property_management: number;
  council_rates: number;
  insurance: number;
  repairs: number;
  // Depreciation
  depreciation_method: 'prime-cost' | 'diminishing-value';
  is_new_property: boolean;
}

const EditProperty = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { getPropertyById, refreshPropertyById, updateProperty } = useProperties();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<EditPropertyForm>({
    name: '',
    description: '',
    property_type: 'Apartment',
    purchase_price: 0,
    weekly_rent: 0,
    location: 'NSW',
    property_method: 'built-first-owner',
    construction_year: new Date().getFullYear(),
    is_construction_project: false,
    land_value: 0,
    construction_value: 0,
    construction_period: 0,
    construction_interest_rate: 0,
    building_value: 0,
    plant_equipment_value: 0,
    stamp_duty: 0,
    legal_fees: 0,
    inspection_fees: 0,
    council_fees: 0,
    architect_fees: 0,
    site_costs: 0,
    rental_growth_rate: 3.0,
    vacancy_rate: 2.0,
    property_management: 8.0,
    council_rates: 0,
    insurance: 0,
    repairs: 0,
    depreciation_method: 'prime-cost',
    is_new_property: true,
  });

  // Load existing property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        toast({
          title: "Error",
          description: "Property ID not found",
          variant: "destructive",
        });
        navigate('/properties');
        return;
      }

      try {
        let property = getPropertyById(propertyId);
        
        // If property not found in local state, try to fetch from backend
        if (!property) {
          property = await refreshPropertyById(propertyId);
        }
        
        if (!property) {
          toast({
            title: "Property Not Found",
            description: "The property you're trying to edit doesn't exist",
            variant: "destructive",
          });
          navigate('/properties');
          return;
        }

        // Map the property data to the form
        setFormData({
          name: property.name || '',
          description: property.description || '',
          property_type: property.property_type || 'Apartment',
          purchase_price: property.purchase_price || 0,
          weekly_rent: property.weekly_rent || 0,
          location: (property.location as any) || 'NSW',
          property_method: property.property_method || 'built-first-owner',
          construction_year: property.construction_year || new Date().getFullYear(),
          is_construction_project: property.is_construction_project || false,
          land_value: property.land_value || 0,
          construction_value: property.construction_value || 0,
          construction_period: property.construction_period || 0,
          construction_interest_rate: property.construction_interest_rate || 0,
          building_value: property.building_value || 0,
          plant_equipment_value: property.plant_equipment_value || 0,
          stamp_duty: property.stamp_duty || 0,
          legal_fees: property.legal_fees || 0,
          inspection_fees: property.inspection_fees || 0,
          council_fees: property.council_fees || 0,
          architect_fees: property.architect_fees || 0,
          site_costs: property.site_costs || 0,
          rental_growth_rate: property.rental_growth_rate || 3.0,
          vacancy_rate: property.vacancy_rate || 2.0,
          property_management: property.property_management || 8.0,
          council_rates: property.council_rates || 0,
          insurance: property.insurance || 0,
          repairs: property.repairs || 0,
          depreciation_method: property.depreciation_method || 'prime-cost',
          is_new_property: property.is_new_property || true,
        });
      } catch (error) {
        console.error('Error loading property:', error);
        toast({
          title: "Error",
          description: "Failed to load property data",
          variant: "destructive",
        });
        navigate('/properties');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, getPropertyById, navigate, toast]);

  // Auto-calculate stamp duty when location or purchase price changes
  useEffect(() => {
    if (formData.location && formData.purchase_price > 0) {
      const duty = calculateStampDuty(
        formData.is_construction_project ? formData.land_value : formData.purchase_price,
        formData.location
      );
      setFormData(prev => ({ ...prev, stamp_duty: duty }));
    }
  }, [formData.location, formData.purchase_price, formData.is_construction_project, formData.land_value]);

  // Auto-calculate purchase price for House & Land - Construction
  useEffect(() => {
    if (formData.property_method === 'house-land-construction') {
      const calculatedPrice = formData.land_value + formData.construction_value;
      setFormData(prev => {
        if (prev.purchase_price !== calculatedPrice) {
          return {
            ...prev,
            purchase_price: calculatedPrice
          };
        }
        return prev;
      });
    }
  }, [formData.property_method, formData.land_value, formData.construction_value]);

  const handleInputChange = (field: keyof EditPropertyForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyMethodChange = (method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner') => {
    setFormData(prev => ({
      ...prev,
      property_method: method,
      is_construction_project: method === 'house-land-construction'
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a property name",
        variant: "destructive",
      });
      return;
    }

    if (!propertyId) {
      toast({
        title: "Error",
        description: "Property ID not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update the property
      await updateProperty(propertyId, { ...formData, id: propertyId });
      
      // Show success message
      toast({
        title: "Property Updated!",
        description: `"${formData.name}" has been successfully updated.`,
        variant: "default",
      });
      
      // Navigate back to properties page
      navigate('/properties');
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground">
              Update your property template
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Define the basic details of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Sydney CBD Apartment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Unit">Unit</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your property..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACT">ACT</SelectItem>
                        <SelectItem value="NSW">NSW</SelectItem>
                        <SelectItem value="NT">NT</SelectItem>
                        <SelectItem value="QLD">QLD</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="TAS">TAS</SelectItem>
                        <SelectItem value="VIC">VIC</SelectItem>
                        <SelectItem value="WA">WA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_method">Property Method</Label>
                    <Select value={formData.property_method} onValueChange={handlePropertyMethodChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PROPERTY_METHODS).map(([key, method]) => (
                          <SelectItem key={key} value={key}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Key property information and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">
                      Purchase Price
                      {formData.property_method === 'house-land-construction' && (
                        <span className="text-xs text-muted-foreground ml-1">(Auto-calculated)</span>
                      )}
                    </Label>
                    <CurrencyInput
                      id="purchase_price"
                      value={formData.purchase_price}
                      onChange={(value) => handleInputChange('purchase_price', value)}
                      placeholder="Enter purchase price"
                      disabled={formData.property_method === 'house-land-construction'}
                      className={formData.property_method === 'house-land-construction' ? "bg-muted" : ""}
                    />
                    {formData.property_method === 'house-land-construction' && (
                      <p className="text-xs text-muted-foreground">
                        Calculated as Land Value + Construction Value
                        {formData.purchase_price > 0 && (
                          <span className="block mt-1 font-medium text-green-600">
                            ${formData.land_value.toLocaleString()} + ${formData.construction_value.toLocaleString()} = ${formData.purchase_price.toLocaleString()}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly_rent">Weekly Rent</Label>
                    <CurrencyInput
                      id="weekly_rent"
                      value={formData.weekly_rent}
                      onChange={(value) => handleInputChange('weekly_rent', value)}
                      placeholder="Enter weekly rent"
                    />
                  </div>
                </div>

                {formData.is_construction_project && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="land_value">Land Value</Label>
                      <CurrencyInput
                        id="land_value"
                        value={formData.land_value}
                        onChange={(value) => handleInputChange('land_value', value)}
                        placeholder="Enter land value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="construction_value">Construction Value</Label>
                      <CurrencyInput
                        id="construction_value"
                        value={formData.construction_value}
                        onChange={(value) => handleInputChange('construction_value', value)}
                        placeholder="Enter construction value"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="construction_year">Construction Year</Label>
                    <NumberInput
                      id="construction_year"
                      value={formData.construction_year}
                      onChange={(value) => handleInputChange('construction_year', value)}
                      placeholder="2020"
                      min={1900}
                      max={new Date().getFullYear() + 10}
                      formatThousands={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rental_growth_rate">Rental Growth Rate (%)</Label>
                    <NumberInput
                      id="rental_growth_rate"
                      value={formData.rental_growth_rate}
                      onChange={(value) => handleInputChange('rental_growth_rate', Number(value))}
                      placeholder="3.0"
                      min={0}
                      max={20}
                       step="0.1"
                      formatThousands={false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Costs</CardTitle>
                <CardDescription>
                  One-time costs associated with the property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stamp_duty">Stamp Duty</Label>
                    <CurrencyInput
                      id="stamp_duty"
                      value={formData.stamp_duty}
                      onChange={(value) => handleInputChange('stamp_duty', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal_fees">Legal Fees</Label>
                    <CurrencyInput
                      id="legal_fees"
                      value={formData.legal_fees}
                      onChange={(value) => handleInputChange('legal_fees', value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inspection_fees">Inspection Fees</Label>
                    <CurrencyInput
                      id="inspection_fees"
                      value={formData.inspection_fees}
                      onChange={(value) => handleInputChange('inspection_fees', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="council_fees">Council Fees</Label>
                    <CurrencyInput
                      id="council_fees"
                      value={formData.council_fees}
                      onChange={(value) => handleInputChange('council_fees', value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Ongoing Expenses</CardTitle>
                <CardDescription>
                  Annual recurring costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="property_management">Property Management (%)</Label>
                    <NumberInput
                      id="property_management"
                      value={formData.property_management}
                      onChange={(value) => handleInputChange('property_management', Number(value))}
                      placeholder="8.0"
                      min={0}
                      max={20}
                      step="0.1"
                      formatThousands={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="council_rates">Council Rates (annual)</Label>
                    <CurrencyInput
                      id="council_rates"
                      value={formData.council_rates}
                      onChange={(value) => handleInputChange('council_rates', value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance (annual)</Label>
                    <CurrencyInput
                      id="insurance"
                      value={formData.insurance}
                      onChange={(value) => handleInputChange('insurance', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repairs">Repairs & Maintenance (annual)</Label>
                    <CurrencyInput
                      id="repairs"
                      value={formData.repairs}
                      onChange={(value) => handleInputChange('repairs', value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Property Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="font-medium">{formData.property_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Purchase Price:</span>
                    <span className="font-medium">${formData.purchase_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Rent:</span>
                    <span className="font-medium">${formData.weekly_rent.toLocaleString()}</span>
                  </div>
                  {formData.purchase_price > 0 && formData.weekly_rent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Yield:</span>
                      <span className="font-medium">
                        {((formData.weekly_rent * 52 / formData.purchase_price) * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{PROPERTY_METHODS[formData.property_method].name}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading || !formData.name.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating Property...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Property
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="w-full">
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
