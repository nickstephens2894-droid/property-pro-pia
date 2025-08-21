import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Property {
  id: string;
  name: string;
  type: 'House' | 'Apartment' | 'Townhouse' | 'Unit' | 'Land' | 'Other';
  status: 'current' | 'new';
  
  // Property Meta
  ownedOrPotential: string;
  isConstructionProject: boolean;
  constructionYear: number;
  
  // Property Values
  buildingValue: number;
  landValue: number;
  constructionValue: number;
  purchasePrice: number;
  plantEquipmentValue: number;
  currentPropertyValue: number;
  weeklyRent: number;
  
  // Investment Details
  investmentStatus: string;
  rentalGrowthRate: number;
  capitalGrowthRate: number;
  vacancyRate: number;
  
  // Purchase Costs
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  
  // Construction Costs
  councilApprovalFees: number;
  siteCosts: number;
  
  // Annual Expenses
  propertyManagementPercentage: number;
  councilRates: number;
  insurance: number;
  maintenanceRepairs: number;
  smokeAlarmInspection: number;
  pestTreatment: number;
  
  // Depreciation & Tax
  depreciationMethod: string;
  isNewProperty: boolean;
  
  // Location & Notes
  location?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PropertyInvestor {
  id: string;
  investorId: string;
  investorName: string;
  ownershipPercentage: number;
  cashContribution: number;
  notes?: string;
}

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProperties = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          type,
          status,
          owned_or_potential,
          is_construction_project,
          construction_year,
          building_value,
          land_value,
          construction_value,
          purchase_price,
          plant_equipment_value,
          current_property_value,
          weekly_rent,
          investment_status,
          rental_growth_rate,
          capital_growth_rate,
          vacancy_rate,
          stamp_duty,
          legal_fees,
          inspection_fees,
          council_approval_fees,
          site_costs,
          property_management_percentage,
          council_rates,
          insurance,
          maintenance_repairs,
          smoke_alarm_inspection,
          pest_treatment,
          depreciation_method,
          is_new_property,
          location,
          notes,
          created_at,
          updated_at
        `)
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      const mappedProperties: Property[] = (propertiesData || []).map(prop => ({
        id: prop.id,
        name: prop.name,
        type: (prop.type as Property["type"]) || "Other",
        status: (prop.status as Property["status"]) || "current",
        ownedOrPotential: prop.owned_or_potential || 'Owned',
        isConstructionProject: Boolean(prop.is_construction_project),
        constructionYear: Number(prop.construction_year) || new Date().getFullYear(),
        buildingValue: Number(prop.building_value) || 0,
        landValue: Number(prop.land_value) || 0,
        constructionValue: Number(prop.construction_value) || 0,
        purchasePrice: Number(prop.purchase_price) || 0,
        plantEquipmentValue: Number(prop.plant_equipment_value) || 0,
        currentPropertyValue: Number(prop.current_property_value) || 0,
        weeklyRent: Number(prop.weekly_rent) || 0,
        investmentStatus: prop.investment_status || 'Investment',
        rentalGrowthRate: Number(prop.rental_growth_rate) || 5,
        capitalGrowthRate: Number(prop.capital_growth_rate) || 7,
        vacancyRate: Number(prop.vacancy_rate) || 2,
        stampDuty: Number(prop.stamp_duty) || 0,
        legalFees: Number(prop.legal_fees) || 0,
        inspectionFees: Number(prop.inspection_fees) || 0,
        councilApprovalFees: Number(prop.council_approval_fees) || 0,
        siteCosts: Number(prop.site_costs) || 0,
        propertyManagementPercentage: Number(prop.property_management_percentage) || 7,
        councilRates: Number(prop.council_rates) || 0,
        insurance: Number(prop.insurance) || 0,
        maintenanceRepairs: Number(prop.maintenance_repairs) || 0,
        smokeAlarmInspection: Number(prop.smoke_alarm_inspection) || 0,
        pestTreatment: Number(prop.pest_treatment) || 0,
        depreciationMethod: prop.depreciation_method || 'Prime Cost',
        isNewProperty: Boolean(prop.is_new_property),
        location: prop.location || '',
        notes: prop.notes || '',
        created_at: prop.created_at,
        updated_at: prop.updated_at
      }));
      
      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          name: propertyData.name,
          type: propertyData.type,
          status: propertyData.status,
          owned_or_potential: propertyData.ownedOrPotential,
          is_construction_project: propertyData.isConstructionProject,
          construction_year: propertyData.constructionYear,
          building_value: propertyData.buildingValue,
          land_value: propertyData.landValue,
          construction_value: propertyData.constructionValue,
          purchase_price: propertyData.purchasePrice,
          plant_equipment_value: propertyData.plantEquipmentValue,
          current_property_value: propertyData.currentPropertyValue,
          weekly_rent: propertyData.weeklyRent,
          investment_status: propertyData.investmentStatus,
          rental_growth_rate: propertyData.rentalGrowthRate,
          capital_growth_rate: propertyData.capitalGrowthRate,
          vacancy_rate: propertyData.vacancyRate,
          stamp_duty: propertyData.stampDuty,
          legal_fees: propertyData.legalFees,
          inspection_fees: propertyData.inspectionFees,
          council_approval_fees: propertyData.councilApprovalFees,
          site_costs: propertyData.siteCosts,
          property_management_percentage: propertyData.propertyManagementPercentage,
          council_rates: propertyData.councilRates,
          insurance: propertyData.insurance,
          maintenance_repairs: propertyData.maintenanceRepairs,
          smoke_alarm_inspection: propertyData.smokeAlarmInspection,
          pest_treatment: propertyData.pestTreatment,
          depreciation_method: propertyData.depreciationMethod,
          is_new_property: propertyData.isNewProperty,
          location: propertyData.location,
          notes: propertyData.notes,
          owner_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Property created successfully');
      await loadProperties();
      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
      return null;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    if (!user) return false;
    
    try {
      const dbUpdates: any = {};
      
      // Map frontend field names to database column names
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.ownedOrPotential !== undefined) dbUpdates.owned_or_potential = updates.ownedOrPotential;
      if (updates.isConstructionProject !== undefined) dbUpdates.is_construction_project = updates.isConstructionProject;
      if (updates.constructionYear !== undefined) dbUpdates.construction_year = updates.constructionYear;
      if (updates.buildingValue !== undefined) dbUpdates.building_value = updates.buildingValue;
      if (updates.landValue !== undefined) dbUpdates.land_value = updates.landValue;
      if (updates.constructionValue !== undefined) dbUpdates.construction_value = updates.constructionValue;
      if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
      if (updates.plantEquipmentValue !== undefined) dbUpdates.plant_equipment_value = updates.plantEquipmentValue;
      if (updates.currentPropertyValue !== undefined) dbUpdates.current_property_value = updates.currentPropertyValue;
      if (updates.weeklyRent !== undefined) dbUpdates.weekly_rent = updates.weeklyRent;
      if (updates.investmentStatus !== undefined) dbUpdates.investment_status = updates.investmentStatus;
      if (updates.rentalGrowthRate !== undefined) dbUpdates.rental_growth_rate = updates.rentalGrowthRate;
      if (updates.capitalGrowthRate !== undefined) dbUpdates.capital_growth_rate = updates.capitalGrowthRate;
      if (updates.vacancyRate !== undefined) dbUpdates.vacancy_rate = updates.vacancyRate;
      if (updates.stampDuty !== undefined) dbUpdates.stamp_duty = updates.stampDuty;
      if (updates.legalFees !== undefined) dbUpdates.legal_fees = updates.legalFees;
      if (updates.inspectionFees !== undefined) dbUpdates.inspection_fees = updates.inspectionFees;
      if (updates.councilApprovalFees !== undefined) dbUpdates.council_approval_fees = updates.councilApprovalFees;
      if (updates.siteCosts !== undefined) dbUpdates.site_costs = updates.siteCosts;
      if (updates.propertyManagementPercentage !== undefined) dbUpdates.property_management_percentage = updates.propertyManagementPercentage;
      if (updates.councilRates !== undefined) dbUpdates.council_rates = updates.councilRates;
      if (updates.insurance !== undefined) dbUpdates.insurance = updates.insurance;
      if (updates.maintenanceRepairs !== undefined) dbUpdates.maintenance_repairs = updates.maintenanceRepairs;
      if (updates.smokeAlarmInspection !== undefined) dbUpdates.smoke_alarm_inspection = updates.smokeAlarmInspection;
      if (updates.pestTreatment !== undefined) dbUpdates.pest_treatment = updates.pestTreatment;
      if (updates.depreciationMethod !== undefined) dbUpdates.depreciation_method = updates.depreciationMethod;
      if (updates.isNewProperty !== undefined) dbUpdates.is_new_property = updates.isNewProperty;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      
      const { error } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      toast.success('Property updated successfully');
      await loadProperties();
      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
      return false;
    }
  };

  const deleteProperty = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      toast.success('Property deleted successfully');
      await loadProperties();
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
      return false;
    }
  };

  // Property-Investor relationship management
  const savePropertyInvestors = async (propertyId: string, investorAssignments: Array<{
    investorId: string;
    ownershipPercentage: number;
    cashContribution: number;
    notes?: string;
  }>) => {
    if (!user) return false;
    
    try {
      // First, delete existing assignments for this property
      const { error: deleteError } = await supabase
        .from('property_investors')
        .delete()
        .eq('property_id', propertyId);

      if (deleteError) throw deleteError;

      // If no new assignments, we're done
      if (investorAssignments.length === 0) {
        return true;
      }

      // Insert new assignments
      const assignmentsToInsert = investorAssignments.map(assignment => ({
        property_id: propertyId,
        investor_id: assignment.investorId,
        ownership_percentage: assignment.ownershipPercentage,
        cash_contribution: assignment.cashContribution,
        notes: assignment.notes || null
      }));

      const { error: insertError } = await supabase
        .from('property_investors')
        .insert(assignmentsToInsert);

      if (insertError) throw insertError;

      return true;
    } catch (error) {
      console.error('Error saving property investors:', error);
      toast.error('Failed to save investor assignments');
      return false;
    }
  };

  const getPropertyInvestors = async (propertyId: string) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('property_investors')
        .select(`
          id,
          investor_id,
          ownership_percentage,
          cash_contribution,
          notes,
          investors!inner(name)
        `)
        .eq('property_id', propertyId);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        investorId: item.investor_id,
        investorName: item.investors?.name || 'Unknown',
        ownershipPercentage: Number(item.ownership_percentage) || 0,
        cashContribution: Number(item.cash_contribution) || 0,
        notes: item.notes || ''
      }));
    } catch (error) {
      console.error('Error loading property investors:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  return {
    properties,
    loading,
    loadProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    savePropertyInvestors,
    getPropertyInvestors
  };
}