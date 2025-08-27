export interface PropertyModel {
  id: string;
  owner_user_id: string;
  
  // Basic Information
  name: string;
  description: string | null;
  property_type: 'Apartment' | 'House' | 'Townhouse' | 'Unit' | 'Land' | 'Commercial';
  property_method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner';
  
  // Property Basics
  purchase_price: number;
  weekly_rent: number;
  rental_growth_rate: number;
  vacancy_rate: number;
  location: string;
  
  // Construction Details
  construction_year: number;
  is_construction_project: boolean;
  land_value: number;
  construction_value: number;
  construction_period: number;
  construction_interest_rate: number;
  building_value: number;
  plant_equipment_value: number;
  
  // Construction Progress Payments
  construction_progress_payments: Array<{
    id: string;
    percentage: number;
    month: number;
    description: string;
  }>;
  
  // Transaction Costs
  stamp_duty: number;
  legal_fees: number;
  inspection_fees: number;
  council_fees: number;
  architect_fees: number;
  site_costs: number;
  
  // Ongoing Expenses
  property_management: number;
  council_rates: number;
  insurance: number;
  repairs: number;
  
  // Depreciation & Tax
  depreciation_method: 'prime-cost' | 'diminishing-value';
  is_new_property: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyModelRequest {
  name: string;
  description?: string;
  property_type: PropertyModel['property_type'];
  property_method: PropertyModel['property_method'];
  purchase_price: number;
  weekly_rent: number;
  rental_growth_rate: number;
  vacancy_rate: number;
  location: string;
  construction_year: number;
  is_construction_project: boolean;
  land_value: number;
  construction_value: number;
  construction_period: number;
  construction_interest_rate: number;
  building_value: number;
  plant_equipment_value: number;
  construction_progress_payments: Array<{
    id: string;
    percentage: number;
    month: number;
    description: string;
  }>;
  stamp_duty: number;
  legal_fees: number;
  inspection_fees: number;
  council_fees: number;
  architect_fees: number;
  site_costs: number;
  property_management: number;
  council_rates: number;
  insurance: number;
  repairs: number;
  depreciation_method: PropertyModel['depreciation_method'];
  is_new_property: boolean;
}

export interface UpdatePropertyModelRequest extends Partial<CreatePropertyModelRequest> {
  id: string;
}

export interface PropertyModelFilters {
  search?: string;
  property_type?: PropertyModel['property_type'];
  property_method?: PropertyModel['property_method'];
  location?: string;
  min_price?: number;
  max_price?: number;
  min_yield?: number;
  max_yield?: number;
}
