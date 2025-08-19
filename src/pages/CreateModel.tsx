import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { NumberInput } from "@/components/ui/number-input";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { PROPERTY_METHODS } from "@/types/presets";
import StampDutyCalculator from "@/components/StampDutyCalculator";
import { useModels } from "@/contexts/ModelsContext";

interface CreateModelForm {
  name: string;
  description: string;
  propertyType: string;
  purchasePrice: number;
  weeklyRent: number;
  location: string;
  propertyMethod: 'house-land-construction' | 'built-first-owner' | 'built-second-owner';
  // Property Basics
  constructionYear: number;
  isConstructionProject: boolean;
  landValue: number;
  constructionValue: number;
  constructionPeriod: number;
  constructionInterestRate: number;
  buildingValue: number;
  plantEquipmentValue: number;
  // Transaction Costs
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  councilFees: number;
  architectFees: number;
  siteCosts: number;
  // Ongoing Income & Expenses
  rentalGrowthRate: number;
  vacancyRate: number;
  propertyManagement: number;
  councilRates: number;
  insurance: number;
  repairs: number;
  // Depreciation
  depreciationMethod: string;
  isNewProperty: boolean;
}

const CreateModel = () => {
  const navigate = useNavigate();
  const { addModel } = useModels();
  const [loading, setLoading] = useState(false);
  const [dutyCalcOpen, setDutyCalcOpen] = useState(false);
  const [formData, setFormData] = useState<CreateModelForm>({
    name: '',
    description: '',
    propertyType: 'Apartment',
    purchasePrice: 0,
    weeklyRent: 0,
    location: 'NSW',
    propertyMethod: 'built-first-owner',
    constructionYear: new Date().getFullYear(),
    isConstructionProject: false,
    landValue: 0,
    constructionValue: 0,
    constructionPeriod: 0,
    constructionInterestRate: 0,
    buildingValue: 0,
    plantEquipmentValue: 0,
    stampDuty: 0,
    legalFees: 0,
    inspectionFees: 0,
    councilFees: 0,
    architectFees: 0,
    siteCosts: 0,
    rentalGrowthRate: 3.0,
    vacancyRate: 2.0,
    propertyManagement: 8.0,
    councilRates: 0,
    insurance: 0,
    repairs: 0,
    depreciationMethod: 'prime-cost',
    isNewProperty: true,
  });

  const handleInputChange = (field: keyof CreateModelForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyMethodChange = (method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner') => {
    setFormData(prev => ({
      ...prev,
      propertyMethod: method,
      isConstructionProject: method === 'house-land-construction'
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a model name');
      return;
    }

    setLoading(true);
    try {
      // Add the model to the context
      addModel(formData);
      
      // Navigate back to models page
      navigate('/models');
    } catch (error) {
      console.error('Error creating model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/models');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Property Model</h1>
            <p className="text-muted-foreground">
              Create a reusable property template for quick instance setup
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
                  Define the basic details of your property model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Model Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Sydney CBD Apartment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
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
                    placeholder="Describe this property model..."
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
                    <Label htmlFor="propertyMethod">Property Method</Label>
                    <Select value={formData.propertyMethod} onValueChange={handlePropertyMethodChange}>
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
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <CurrencyInput
                      id="purchasePrice"
                      value={formData.purchasePrice}
                      onValueChange={(value) => handleInputChange('purchasePrice', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyRent">Weekly Rent</Label>
                    <CurrencyInput
                      id="weeklyRent"
                      value={formData.weeklyRent}
                      onValueChange={(value) => handleInputChange('weeklyRent', value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="constructionYear">Construction Year</Label>
                    <NumberInput
                      id="constructionYear"
                      value={formData.constructionYear}
                      onValueChange={(value) => handleInputChange('constructionYear', value)}
                      placeholder="2024"
                    />
                  </div>
                  {formData.isConstructionProject && (
                    <div className="space-y-2">
                      <Label htmlFor="constructionPeriod">Construction Period (months)</Label>
                      <NumberInput
                        id="constructionPeriod"
                        value={formData.constructionPeriod}
                        onValueChange={(value) => handleInputChange('constructionPeriod', value)}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                {formData.isConstructionProject && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="landValue">Land Value</Label>
                      <CurrencyInput
                        id="landValue"
                        value={formData.landValue}
                        onValueChange={(value) => handleInputChange('landValue', value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="constructionValue">Construction Value</Label>
                      <CurrencyInput
                        id="constructionValue"
                        value={formData.constructionValue}
                        onValueChange={(value) => handleInputChange('constructionValue', value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Costs</CardTitle>
                <CardDescription>
                  Purchase-related costs and fees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stampDuty">Stamp Duty</Label>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setDutyCalcOpen(true)}
                      >
                        Calculate
                      </Button>
                    </div>
                    <CurrencyInput
                      id="stampDuty"
                      value={formData.stampDuty}
                      onValueChange={(value) => handleInputChange('stampDuty', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalFees">Legal Fees</Label>
                    <CurrencyInput
                      id="legalFees"
                      value={formData.legalFees}
                      onValueChange={(value) => handleInputChange('legalFees', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspectionFees">Inspection Fees</Label>
                    <CurrencyInput
                      id="inspectionFees"
                      value={formData.inspectionFees}
                      onValueChange={(value) => handleInputChange('inspectionFees', value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Stamp Duty Calculator */}
                <StampDutyCalculator 
                  open={dutyCalcOpen} 
                  onOpenChange={setDutyCalcOpen}
                  onApplyDuty={(duty: number) => {
                    handleInputChange('stampDuty', duty);
                    setDutyCalcOpen(false);
                  }}
                  dutiableValue={formData.isConstructionProject ? formData.landValue : formData.purchasePrice}
                  isConstructionProject={formData.isConstructionProject}
                />
              </CardContent>
            </Card>

            {/* Ongoing Income & Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Ongoing Income & Expenses</CardTitle>
                <CardDescription>
                  Rental income projections and ongoing costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rentalGrowthRate">Rental Growth Rate (%)</Label>
                    <NumberInput
                      id="rentalGrowthRate"
                      value={formData.rentalGrowthRate}
                      onValueChange={(value) => handleInputChange('rentalGrowthRate', value)}
                      placeholder="3.0"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
                    <NumberInput
                      id="vacancyRate"
                      value={formData.vacancyRate}
                      onValueChange={(value) => handleInputChange('vacancyRate', value)}
                      placeholder="2.0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyManagement">Property Management (%)</Label>
                    <NumberInput
                      id="propertyManagement"
                      value={formData.propertyManagement}
                      onValueChange={(value) => handleInputChange('propertyManagement', value)}
                      placeholder="8.0"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="councilRates">Council Rates (annual)</Label>
                    <CurrencyInput
                      id="councilRates"
                      value={formData.councilRates}
                      onValueChange={(value) => handleInputChange('councilRates', value)}
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
                      onValueChange={(value) => handleInputChange('insurance', value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repairs">Repairs & Maintenance (annual)</Label>
                    <CurrencyInput
                      id="repairs"
                      value={formData.repairs}
                      onValueChange={(value) => handleInputChange('repairs', value)}
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
              {/* Model Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="font-medium">{formData.propertyType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Purchase Price:</span>
                    <span className="font-medium">${formData.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Weekly Rent:</span>
                    <span className="font-medium">${formData.weeklyRent.toLocaleString()}</span>
                  </div>
                  {formData.purchasePrice > 0 && formData.weeklyRent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Yield:</span>
                      <span className="font-medium">
                        {((formData.weeklyRent * 52 / formData.purchasePrice) * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-medium">{PROPERTY_METHODS[formData.propertyMethod].name}</span>
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Model
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

export default CreateModel;
