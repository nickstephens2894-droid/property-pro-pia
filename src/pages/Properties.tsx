import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, MapPin, DollarSign, Home, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useProperties, type Property } from "@/hooks/useProperties";
import { useClients, type Investor } from "@/hooks/useClients";
import { SearchAndFilters } from "@/components/ui/search-and-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/utils/formatters";
import { Checkbox } from "@/components/ui/checkbox";

export default function Properties() {
  const {
    properties,
    loading,
    createProperty,
    updateProperty,
    deleteProperty,
    savePropertyInvestors
  } = useProperties();

  const { investors } = useClients();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "current" | "new">("all");
  const [filterPropertyType, setFilterPropertyType] = useState<Property['type'] | "all">("all");
  
  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // Property form
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    type: 'House' as Property['type'],
    status: 'current' as Property['status'],
    
    // Property Meta
    ownedOrPotential: 'Owned' as 'Owned' | 'Potential',
    isConstructionProject: false,
    constructionYear: new Date().getFullYear(),
    
    // Property Basics
    buildingValue: 0,
    landValue: 0,
    constructionValue: 0,
    purchasePrice: 0,
    plantEquipmentValue: 0,
    currentPropertyValue: 0,
    weeklyRent: 0,
    
    // Investment Details
    investmentStatus: 'Investment' as 'Investment' | 'Home' | 'Holiday',
    rentalGrowthRate: 5,
    capitalGrowthRate: 7,
    vacancyRate: 2,
    
    // Purchase Costs
    stampDuty: 0,
    legalFees: 0,
    inspectionFees: 0,
    
    // Construction Costs
    councilApprovalFees: 0,
    siteCosts: 0,
    
    // Annual Expenses
    propertyManagementPercentage: 7,
    councilRates: 0,
    insurance: 0,
    maintenanceRepairs: 0,
    smokeAlarmInspection: 0,
    pestTreatment: 0,
    
    // Depreciation & Tax
    depreciationMethod: 'Prime Cost' as 'Prime Cost' | 'Diminishing Value',
    isNewProperty: false,
    
    // Location & Notes
    location: "",
    notes: "",
  });

  // Investor assignment form
  const [investorAssignments, setInvestorAssignments] = useState<Array<{
    investorId: string;
    ownershipPercentage: number;
    cashContribution: number;
    notes: string;
  }>>([]);

  const resetPropertyForm = () => {
    setPropertyForm({
      name: "",
      type: 'House',
      status: 'current',
      ownedOrPotential: 'Owned',
      isConstructionProject: false,
      constructionYear: new Date().getFullYear(),
      buildingValue: 0,
      landValue: 0,
      constructionValue: 0,
      purchasePrice: 0,
      plantEquipmentValue: 0,
      currentPropertyValue: 0,
      weeklyRent: 0,
      investmentStatus: 'Investment',
      rentalGrowthRate: 5,
      capitalGrowthRate: 7,
      vacancyRate: 2,
      stampDuty: 0,
      legalFees: 0,
      inspectionFees: 0,
      councilApprovalFees: 0,
      siteCosts: 0,
      propertyManagementPercentage: 7,
      councilRates: 0,
      insurance: 0,
      maintenanceRepairs: 0,
      smokeAlarmInspection: 0,
      pestTreatment: 0,
      depreciationMethod: 'Prime Cost',
      isNewProperty: false,
      location: "",
      notes: "",
    });
    setInvestorAssignments([]);
    setEditingProperty(null);
  };

  const openAddDialog = () => {
    setEditingProperty(null);
    resetPropertyForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm({
      name: property.name,
      type: property.type,
      status: property.status,
      ownedOrPotential: 'Owned', // TODO: Map from property data
      isConstructionProject: false, // TODO: Map from property data
      constructionYear: new Date().getFullYear(), // TODO: Map from property data
      buildingValue: 0, // TODO: Map from property data
      landValue: 0, // TODO: Map from property data
      constructionValue: 0, // TODO: Map from property data
      purchasePrice: property.purchasePrice,
      plantEquipmentValue: 0, // TODO: Map from property data
      currentPropertyValue: property.purchasePrice, // TODO: Map from property data
      weeklyRent: property.weeklyRent,
      investmentStatus: 'Investment', // TODO: Map from property data
      rentalGrowthRate: 5, // TODO: Map from property data
      capitalGrowthRate: 7, // TODO: Map from property data
      vacancyRate: 2, // TODO: Map from property data
      stampDuty: 0, // TODO: Map from property data
      legalFees: 0, // TODO: Map from property data
      inspectionFees: 0, // TODO: Map from property data
      councilApprovalFees: 0, // TODO: Map from property data
      siteCosts: 0, // TODO: Map from property data
      propertyManagementPercentage: 7, // TODO: Map from property data
      councilRates: 0, // TODO: Map from property data
      insurance: 0, // TODO: Map from property data
      maintenanceRepairs: 0, // TODO: Map from property data
      smokeAlarmInspection: 0, // TODO: Map from property data
      pestTreatment: 0, // TODO: Map from property data
      depreciationMethod: 'Prime Cost', // TODO: Map from property data
      isNewProperty: false, // TODO: Map from property data
      location: property.location || "",
      notes: property.notes || "",
    });
    // TODO: Load existing investor assignments
    setInvestorAssignments([]);
    setIsDialogOpen(true);
  };

  const addInvestorAssignment = () => {
    if (investorAssignments.length >= 4) return;
    
    setInvestorAssignments(prev => [...prev, {
      investorId: "",
      ownershipPercentage: 0,
      cashContribution: 0,
      notes: ""
    }]);
  };

  const removeInvestorAssignment = (index: number) => {
    setInvestorAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const updateInvestorAssignment = (index: number, field: string, value: string | number) => {
    setInvestorAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ));
  };

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyForm.name.trim()) {
      return;
    }

    try {
      let propertyId: string;
      
      // Create the property data object with proper typing
      const propertyData = {
        name: propertyForm.name.trim(),
        type: propertyForm.type,
        status: propertyForm.status,
        ownedOrPotential: propertyForm.ownedOrPotential,
        isConstructionProject: propertyForm.isConstructionProject,
        constructionYear: propertyForm.constructionYear,
        buildingValue: propertyForm.buildingValue,
        landValue: propertyForm.landValue,
        constructionValue: propertyForm.constructionValue,
        purchasePrice: propertyForm.purchasePrice,
        plantEquipmentValue: propertyForm.plantEquipmentValue,
        currentPropertyValue: propertyForm.currentPropertyValue,
        weeklyRent: propertyForm.weeklyRent,
        investmentStatus: propertyForm.investmentStatus,
        rentalGrowthRate: propertyForm.rentalGrowthRate,
        capitalGrowthRate: propertyForm.capitalGrowthRate,
        vacancyRate: propertyForm.vacancyRate,
        stampDuty: propertyForm.stampDuty,
        legalFees: propertyForm.legalFees,
        inspectionFees: propertyForm.inspectionFees,
        councilApprovalFees: propertyForm.councilApprovalFees,
        siteCosts: propertyForm.siteCosts,
        propertyManagementPercentage: propertyForm.propertyManagementPercentage,
        councilRates: propertyForm.councilRates,
        insurance: propertyForm.insurance,
        maintenanceRepairs: propertyForm.maintenanceRepairs,
        smokeAlarmInspection: propertyForm.smokeAlarmInspection,
        pestTreatment: propertyForm.pestTreatment,
        depreciationMethod: propertyForm.depreciationMethod,
        isNewProperty: propertyForm.isNewProperty,
        location: propertyForm.location.trim(),
        notes: propertyForm.notes.trim() || null
      };
      
      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyData);
        propertyId = editingProperty.id;
      } else {
        const newProperty = await createProperty(propertyData);
        propertyId = newProperty?.id;
      }

      // Save investor assignments if we have a property ID
      if (propertyId && investorAssignments.length > 0) {
        await savePropertyInvestors(propertyId, investorAssignments);
      }

      setIsDialogOpen(false);
      resetPropertyForm();
      setInvestorAssignments([]);
    } catch (error) {
      console.error('Error submitting property:', error);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await deleteProperty(propertyId);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || property.status === filterType;
    const matchesPropertyType = filterPropertyType === "all" || property.type === filterPropertyType;
    
    return matchesSearch && matchesType && matchesPropertyType;
  });

  const filters = [
    {
      key: "status",
      label: "Status",
      value: filterType,
      options: [
        { value: "all", label: "All Properties" },
        { value: "current", label: "Current" },
        { value: "new", label: "New" }
      ],
      onChange: (value: string) => setFilterType(value as "all" | "current" | "new")
    },
    {
      key: "propertyType",
      label: "Property Type",
      value: filterPropertyType,
      options: [
        { value: "all", label: "All Types" },
        { value: "House", label: "House" },
        { value: "Apartment", label: "Apartment" },
        { value: "Townhouse", label: "Townhouse" },
        { value: "Unit", label: "Unit" },
        { value: "Land", label: "Land" },
        { value: "Other", label: "Other" }
      ],
      onChange: (value: string) => setFilterPropertyType(value as Property['type'] | "all")
    }
  ];

  const getInvestorName = (investorId: string) => {
    const investor = investors.find(i => i.id === investorId);
    return investor ? investor.name : "Unknown Investor";
  };

  const getPropertyTypeIcon = (type: Property['type']) => {
    switch (type) {
      case 'House': return <Home className="h-4 w-4" />;
      case 'Apartment': return <Building2 className="h-4 w-4" />;
      case 'Townhouse': return <Building2 className="h-4 w-4" />;
      case 'Unit': return <Building2 className="h-4 w-4" />;
      case 'Land': return <MapPin className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading properties..." />;
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
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Enter the property details and assign investors below
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
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <form onSubmit={handlePropertySubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="property-name" className="text-sm font-medium">
                  Property Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="property-name"
                  type="text"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Street Apartment"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-type" className="text-sm font-medium">
                    Property Type
                  </Label>
                  <Select
                    value={propertyForm.type}
                    onValueChange={(value) => setPropertyForm(prev => ({ ...prev, type: value as Property['type'] }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select property type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="House">🏠 House</SelectItem>
                      <SelectItem value="Apartment">🏢 Apartment</SelectItem>
                      <SelectItem value="Townhouse">🏘️ Townhouse</SelectItem>
                      <SelectItem value="Unit">🏢 Unit</SelectItem>
                      <SelectItem value="Land">📍 Land</SelectItem>
                      <SelectItem value="Other">🏗️ Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={propertyForm.status}
                    onValueChange={(value) => setPropertyForm(prev => ({ ...prev, status: value as Property['status'] }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-owned-or-potential" className="text-sm font-medium">
                    Owned or Potential
                  </Label>
                  <Select
                    value={propertyForm.ownedOrPotential}
                    onValueChange={(value) => setPropertyForm(prev => ({ ...prev, ownedOrPotential: value as 'Owned' | 'Potential' }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owned">Owned / Current</SelectItem>
                      <SelectItem value="Potential">Potential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-investment-status" className="text-sm font-medium">
                    Investment Status
                  </Label>
                  <Select
                    value={propertyForm.investmentStatus}
                    onValueChange={(value) => setPropertyForm(prev => ({ ...prev, investmentStatus: value as 'Investment' | 'Home' | 'Holiday' }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Holiday">Holiday / 2nd Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-construction-year" className="text-sm font-medium">
                    Construction Year
                  </Label>
                  <Input
                    id="property-construction-year"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear() + 5}
                    value={propertyForm.constructionYear}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, constructionYear: Number(e.target.value) }))}
                    placeholder="2022"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-is-construction" className="text-sm font-medium">
                    Is Construction Project
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="property-is-construction"
                      checked={propertyForm.isConstructionProject}
                      onCheckedChange={(checked) => setPropertyForm(prev => ({ ...prev, isConstructionProject: checked as boolean }))}
                    />
                    <Label htmlFor="property-is-construction" className="text-sm">Yes, this is a construction project</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Values Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Property Values</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-land-value" className="text-sm font-medium">
                    Land Value
                  </Label>
                  <Input
                    id="property-land-value"
                    type="number"
                    min="0"
                    step="1000"
                    value={propertyForm.landValue}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, landValue: Number(e.target.value) }))}
                    placeholder="300000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-building-value" className="text-sm font-medium">
                    Building Value
                  </Label>
                  <Input
                    id="property-building-value"
                    type="number"
                    min="0"
                    step="1000"
                    value={propertyForm.buildingValue}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, buildingValue: Number(e.target.value) }))}
                    placeholder="450000"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-construction-value" className="text-sm font-medium">
                    Construction Value
                  </Label>
                  <Input
                    id="property-construction-value"
                    type="number"
                    min="0"
                    step="1000"
                    value={propertyForm.constructionValue}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, constructionValue: Number(e.target.value) }))}
                    placeholder="500000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-plant-equipment" className="text-sm font-medium">
                    Plant & Equipment Value
                  </Label>
                  <Input
                    id="property-plant-equipment"
                    type="number"
                    min="0"
                    step="1000"
                    value={propertyForm.plantEquipmentValue}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, plantEquipmentValue: Number(e.target.value) }))}
                    placeholder="50000"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-purchase-price" className="text-sm font-medium">
                    Purchase Price
                  </Label>
                  <Input
                    id="property-purchase-price"
                    type="number"
                    min="0"
                    step="1000"
                    value={propertyForm.purchasePrice}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                    placeholder="800000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-current-value" className="text-sm font-medium">
                    Current Property Value
                  </Label>
                  <Input
                    id="property-current-value"
                    type="number"
                    min="0"
                    step="1000"
                    value={propertyForm.currentPropertyValue}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, currentPropertyValue: Number(e.target.value) }))}
                    placeholder="850000"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Purchase & Construction Costs Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Purchase & Construction Costs</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-stamp-duty" className="text-sm font-medium">
                    Stamp Duty
                  </Label>
                  <Input
                    id="property-stamp-duty"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.stampDuty}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, stampDuty: Number(e.target.value) }))}
                    placeholder="24000"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-legal-fees" className="text-sm font-medium">
                    Legal Fees
                  </Label>
                  <Input
                    id="property-legal-fees"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.legalFees}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, legalFees: Number(e.target.value) }))}
                    placeholder="1500"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-inspection-fees" className="text-sm font-medium">
                    Inspection Fees
                  </Label>
                  <Input
                    id="property-inspection-fees"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.inspectionFees}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, inspectionFees: Number(e.target.value) }))}
                    placeholder="600"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-council-approval" className="text-sm font-medium">
                    Council Approval Fees
                  </Label>
                  <Input
                    id="property-council-approval"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.councilApprovalFees}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, councilApprovalFees: Number(e.target.value) }))}
                    placeholder="20000"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-site-costs" className="text-sm font-medium">
                  Site Costs
                </Label>
                <Input
                  id="property-site-costs"
                  type="number"
                  min="0"
                  step="100"
                  value={propertyForm.siteCosts}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, siteCosts: Number(e.target.value) }))}
                  placeholder="5000"
                  className="h-9"
                />
              </div>
            </div>

            {/* Annual Expenses Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Annual Expenses</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-management-percentage" className="text-sm font-medium">
                    Property Management (%)
                  </Label>
                  <Input
                    id="property-management-percentage"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={propertyForm.propertyManagementPercentage}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, propertyManagementPercentage: Number(e.target.value) }))}
                    placeholder="7"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-council-rates" className="text-sm font-medium">
                    Council Rates
                  </Label>
                  <Input
                    id="property-council-rates"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.councilRates}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, councilRates: Number(e.target.value) }))}
                    placeholder="2500"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-insurance" className="text-sm font-medium">
                    Insurance
                  </Label>
                  <Input
                    id="property-insurance"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.insurance}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, insurance: Number(e.target.value) }))}
                    placeholder="1300"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-maintenance" className="text-sm font-medium">
                    Maintenance & Repairs
                  </Label>
                  <Input
                    id="property-maintenance"
                    type="number"
                    min="0"
                    step="100"
                    value={propertyForm.maintenanceRepairs}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, maintenanceRepairs: Number(e.target.value) }))}
                    placeholder="2000"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-smoke-alarm" className="text-sm font-medium">
                    Smoke Alarm Inspection
                  </Label>
                  <Input
                    id="property-smoke-alarm"
                    type="number"
                    min="0"
                    step="50"
                    value={propertyForm.smokeAlarmInspection}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, smokeAlarmInspection: Number(e.target.value) }))}
                    placeholder="150"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-pest-treatment" className="text-sm font-medium">
                    Pest Treatment
                  </Label>
                  <Input
                    id="property-pest-treatment"
                    type="number"
                    min="0"
                    step="50"
                    value={propertyForm.pestTreatment}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, pestTreatment: Number(e.target.value) }))}
                    placeholder="150"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Investment Performance Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Investment Performance</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-weekly-rent" className="text-sm font-medium">
                    Weekly Rent
                  </Label>
                  <Input
                    id="property-weekly-rent"
                    type="number"
                    min="0"
                    step="50"
                    value={propertyForm.weeklyRent}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, weeklyRent: Number(e.target.value) }))}
                    placeholder="650"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-rental-growth" className="text-sm font-medium">
                    Rental Growth Rate (%)
                  </Label>
                  <Input
                    id="property-rental-growth"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={propertyForm.rentalGrowthRate}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, rentalGrowthRate: Number(e.target.value) }))}
                    placeholder="5"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-capital-growth" className="text-sm font-medium">
                    Capital Growth Rate (%)
                  </Label>
                  <Input
                    id="property-capital-growth"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={propertyForm.capitalGrowthRate}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, capitalGrowthRate: Number(e.target.value) }))}
                    placeholder="7"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-vacancy-rate" className="text-sm font-medium">
                    Vacancy Rate (%)
                  </Label>
                  <Input
                    id="property-vacancy-rate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={propertyForm.vacancyRate}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, vacancyRate: Number(e.target.value) }))}
                    placeholder="2"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Depreciation & Tax Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Depreciation & Tax</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property-depreciation-method" className="text-sm font-medium">
                    Depreciation Method
                  </Label>
                  <Select
                    value={propertyForm.depreciationMethod}
                    onValueChange={(value) => setPropertyForm(prev => ({ ...prev, depreciationMethod: value as 'Prime Cost' | 'Diminishing Value' }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prime Cost">Prime Cost</SelectItem>
                      <SelectItem value="Diminishing Value">Diminishing Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-is-new" className="text-sm font-medium">
                    Is New Property
                  </Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="property-is-new"
                      checked={propertyForm.isNewProperty}
                      onCheckedChange={(checked) => setPropertyForm(prev => ({ ...prev, isNewProperty: checked as boolean }))}
                    />
                    <Label htmlFor="property-is-new" className="text-sm">Yes, this is a new property</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location & Notes</h3>
              
              <div className="space-y-2">
                <Label htmlFor="property-location" className="text-sm font-medium">Location</Label>
                <Input
                  id="property-location"
                  type="text"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Sydney, NSW"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="property-notes"
                  value={propertyForm.notes}
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the property..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Investor Assignment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Investor Assignment</h3>
              
              {investors.length === 0 ? (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No investors found. Please add investors first from the Investors page.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Investor Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addInvestorAssignment}
                      disabled={investorAssignments.length >= 4}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Investor
                    </Button>
                  </div>

                  {investorAssignments.length === 0 ? (
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No investors assigned yet. Click "Add Investor" to assign investors to this property.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {investorAssignments.map((assignment, index) => (
                        <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Investor {index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeInvestorAssignment(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`investor-${index}-name`} className="text-sm font-medium">
                                Investor
                              </Label>
                              <Select
                                value={assignment.investorId}
                                onValueChange={(value) => updateInvestorAssignment(index, 'investorId', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select an investor..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {investors.map((investor) => (
                                    <SelectItem key={investor.id} value={investor.id}>
                                      {investor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`investor-${index}-ownership`} className="text-sm font-medium">
                                Ownership %
                              </Label>
                              <Input
                                id={`investor-${index}-ownership`}
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={assignment.ownershipPercentage}
                                onChange={(e) => updateInvestorAssignment(index, 'ownershipPercentage', Number(e.target.value))}
                                placeholder="100"
                                className="h-9"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`investor-${index}-contribution`} className="text-sm font-medium">
                                Cash Contribution
                              </Label>
                              <Input
                                id={`investor-${index}-contribution`}
                                type="number"
                                min="0"
                                step="1000"
                                value={assignment.cashContribution}
                                onChange={(e) => updateInvestorAssignment(index, 'cashContribution', Number(e.target.value))}
                                placeholder="0"
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`investor-${index}-notes`} className="text-sm font-medium">
                                Notes
                              </Label>
                              <Input
                                id={`investor-${index}-notes`}
                                value={assignment.notes}
                                onChange={(e) => updateInvestorAssignment(index, 'notes', e.target.value)}
                                placeholder="Additional notes..."
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {investorAssignments.length >= 4 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            Maximum of 4 investors reached for this property.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
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
                disabled={!propertyForm.name.trim()}
                className="transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
              >
                {editingProperty ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (properties.length === 0) {
    return (
      <>
        {modalContent}
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Properties</h1>
              <p className="text-muted-foreground">Manage your property portfolio</p>
            </div>
            <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">Start building your property portfolio by adding your first property.</p>
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
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-muted-foreground">Manage your property portfolio</p>
          </div>
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search properties by name or location..."
          filters={filters}
        />

        {/* Properties Grid */}
        <div className="grid gap-4">
          {filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No properties match your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getPropertyTypeIcon(property.type)}
                        {property.name}
                        <Badge variant={property.status === 'current' ? 'default' : 'secondary'}>
                          {property.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        {property.location && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {property.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(property.purchasePrice)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="h-3 w-3" />
                          <span>Investor assignments managed separately</span>
                        </div>
                      </CardDescription>
                      {property.weeklyRent > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Weekly Rent: {formatCurrency(property.weeklyRent)}
                        </div>
                      )}
                      {property.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {property.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(property)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProperty(property.id)}
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
