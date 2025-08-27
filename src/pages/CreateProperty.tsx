import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import { ArrowLeft, Save, Building2, Home, Receipt, DollarSign, Calculator } from "lucide-react";
import { PROPERTY_METHODS } from "@/types/presets";
import { calculateStampDuty, type Jurisdiction } from "@/utils/stampDuty";
import { useProperties } from "@/contexts/PropertiesContext";
import { ConstructionStagesTable } from "@/components/ConstructionStagesTable";
import { useToast } from "@/components/ui/use-toast";
import { CreatePropertyFormData } from '@/types/propertyModels';

interface CreatePropertyForm extends CreatePropertyFormData {
  location: Jurisdiction;
}

const CreateProperty = () => {
  const navigate = useNavigate();
  const { addProperty } = useProperties();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["basic-information"]);
  const [formData, setFormData] = useState<CreatePropertyForm>({
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
    construction_period: 8,
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

  const handleInputChange = (field: keyof CreatePropertyForm, value: any) => {
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

  // Auto-calculate stamp duty when location, purchase price, or land value changes
  useEffect(() => {
    if (formData.location) {
      let dutiableValue = 0;
      
      if (formData.is_construction_project && formData.land_value > 0) {
        dutiableValue = formData.land_value;
      } else if (formData.purchase_price > 0) {
        dutiableValue = formData.purchase_price;
      }
      
      if (dutiableValue > 0) {
        const calculatedDuty = calculateStampDuty(dutiableValue, formData.location);
        setFormData(prev => {
          if (prev.stamp_duty !== calculatedDuty) {
            return {
              ...prev,
              stamp_duty: calculatedDuty
            };
          }
          return prev;
        });
      } else {
        setFormData(prev => {
          if (prev.stamp_duty !== 0) {
            return {
              ...prev,
              stamp_duty: 0
            };
          }
          return prev;
        });
      }
    }
  }, [formData.location, formData.purchase_price, formData.is_construction_project, formData.land_value]);


  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a property name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addProperty(formData);
      
      toast({
        title: "Property Created!",
        description: `"${formData.name}" has been successfully created and added to your properties list.`,
        variant: "default",
      });
      
      navigate('/properties');
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/properties');
  };

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
            <h1 className="text-3xl font-bold">Create Property</h1>
            <p className="text-muted-foreground">
              Create a reusable property template for quick instance setup
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="w-full border-2 border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b-2 border-primary/20">
                <CardTitle className="flex items-center gap-3 text-primary text-xl">
                  <Building2 className="h-6 w-6" />
                  <div>
                    <div>Property Creation Form</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Configure your property details across different categories
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion 
                  type="multiple" 
                  value={openSections} 
                  onValueChange={setOpenSections}
                  className="w-full"
                >
                  {/* Basic Information */}
                  <AccordionItem value="basic-information" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="font-medium">Basic Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
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
                            placeholder="Describe this property..."
                            rows={3}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location (State)</Label>
                            <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NSW">New South Wales</SelectItem>
                                <SelectItem value="VIC">Victoria</SelectItem>
                                <SelectItem value="QLD">Queensland</SelectItem>
                                <SelectItem value="WA">Western Australia</SelectItem>
                                <SelectItem value="SA">South Australia</SelectItem>
                                <SelectItem value="TAS">Tasmania</SelectItem>
                                <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                                <SelectItem value="NT">Northern Territory</SelectItem>
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Property Details */}
                  <AccordionItem value="property-details" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">Property Details</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
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
                              placeholder="0"
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
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="construction_year">Construction Year</Label>
                            <NumberInput
                              id="construction_year"
                              value={formData.construction_year}
                              onChange={(value) => handleInputChange('construction_year', value)}
                              placeholder="2024"
                              formatThousands={false}
                            />
                          </div>
                          {formData.is_construction_project && (
                            <div className="space-y-2">
                              <Label htmlFor="construction_period">Construction Period (months)</Label>
                              <NumberInput
                                id="construction_period"
                                value={formData.construction_period}
                                onChange={(value) => handleInputChange('construction_period', value)}
                                placeholder="8"
                              />
                            </div>
                          )}
                        </div>

                        {formData.is_construction_project && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="land_value">Land Value</Label>
                              <CurrencyInput
                                id="land_value"
                                value={formData.land_value}
                                onChange={(value) => handleInputChange('land_value', value)}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="construction_value">Construction Value</Label>
                              <CurrencyInput
                                id="construction_value"
                                value={formData.construction_value}
                                onChange={(value) => handleInputChange('construction_value', value)}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Transaction Costs */}
                  <AccordionItem value="transaction-costs" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="font-medium">Transaction Costs</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="stamp_duty">Stamp Duty (Auto-calculated)</Label>
                            <CurrencyInput
                              id="stamp_duty"
                              value={formData.stamp_duty}
                              onChange={(value) => handleInputChange('stamp_duty', value)}
                              placeholder="0"
                              disabled={true}
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                              Based on {formData.location} rates for {formData.is_construction_project ? 'land value' : 'purchase price'}
                              {formData.stamp_duty > 0 && (
                                <span className="block mt-1 font-medium text-green-600">
                                  Calculated: ${formData.stamp_duty.toLocaleString()}
                                </span>
                              )}
                            </p>
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
                          <div className="space-y-2">
                            <Label htmlFor="inspection_fees">Inspection Fees</Label>
                            <CurrencyInput
                              id="inspection_fees"
                              value={formData.inspection_fees}
                              onChange={(value) => handleInputChange('inspection_fees', value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Ongoing Income & Expenses */}
                  <AccordionItem value="ongoing-expenses" className="border-b">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">Ongoing Income & Expenses</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="rental_growth_rate">Rental Growth Rate (%)</Label>
                            <NumberInput
                              id="rental_growth_rate"
                              value={formData.rental_growth_rate}
                              onChange={(value) => handleInputChange('rental_growth_rate', value)}
                              placeholder="3.0"
                              step="0.1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vacancy_rate">Vacancy Rate (%)</Label>
                            <NumberInput
                              id="vacancy_rate"
                              value={formData.vacancy_rate}
                              onChange={(value) => handleInputChange('vacancy_rate', value)}
                              placeholder="2.0"
                              step="0.1"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="property_management">Property Management (%)</Label>
                            <NumberInput
                              id="property_management"
                              value={formData.property_management}
                              onChange={(value) => handleInputChange('property_management', value)}
                              placeholder="8.0"
                              step="0.1"
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Depreciation */}
                  <AccordionItem value="depreciation" className="border-b-0">
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                      <div className="flex items-center gap-2 w-full">
                        <Calculator className="h-4 w-4 text-primary" />
                        <span className="font-medium">Depreciation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label>Depreciation Method</Label>
                          <Select value={formData.depreciation_method} onValueChange={(value: 'prime-cost' | 'diminishing-value') => handleInputChange('depreciation_method', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prime-cost">Prime Cost (Straight Line)</SelectItem>
                              <SelectItem value="diminishing-value">Diminishing Value</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_new_property"
                            checked={formData.is_new_property}
                            onChange={(e) => handleInputChange('is_new_property', e.target.checked)}
                            className="rounded border-border"
                          />
                          <Label htmlFor="is_new_property">New Property (eligible for building depreciation)</Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Property...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Property
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

export default CreateProperty;