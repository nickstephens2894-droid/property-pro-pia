export interface PropertyModel {
  id: string;
  owner_user_id: string;

  // Basic Information
  name: string;
  description: string | null;
  property_type:
    | "Apartment"
    | "House"
    | "Townhouse"
    | "Unit"
    | "Land"
    | "Commercial";
  property_method:
    | "house-land-construction"
    | "built-first-owner"
    | "built-second-owner";

  // Property Workflow Type Distinction
  property_workflow_type: "new" | "current";

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
  depreciation_method: "prime-cost" | "diminishing-value";
  is_new_property: boolean;

  // Historical Purchase Data (for current properties)
  original_purchase_price: number;
  original_purchase_date: string | null;
  original_stamp_duty: number;
  original_legal_fees: number;
  original_inspection_fees: number;

  // Current Property Data (for current properties)
  current_property_value: number;
  current_loan_balance: number;
  current_equity_loan_balance: number;

  // Funding Strategy (for new properties)
  selected_funding_strategy: string | null;
  deposit_amount: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyFormData {
  name: string;
  description?: string;
  property_type: PropertyModel["property_type"];
  property_method: PropertyModel["property_method"];
  property_workflow_type: PropertyModel["property_workflow_type"];
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
  depreciation_method: PropertyModel["depreciation_method"];
  is_new_property: boolean;

  // Historical Purchase Data (for current properties)
  original_purchase_price: number;
  original_purchase_date: string | null;
  original_stamp_duty: number;
  original_legal_fees: number;
  original_inspection_fees: number;

  // Current Property Data (for current properties)
  current_property_value: number;
  current_loan_balance: number;
  current_equity_loan_balance: number;

  // Funding Strategy (for new properties)
  selected_funding_strategy: string | null;
  deposit_amount: number;
}

export interface CreatePropertyModelRequest extends CreatePropertyFormData {
  owner_user_id: string;
}

export interface UpdatePropertyModelRequest
  extends Partial<CreatePropertyModelRequest> {
  id: string;
}

export interface PropertyModelFilters {
  search?: string;
  property_type?: PropertyModel["property_type"];
  property_method?: PropertyModel["property_method"];
  location?: string;
  min_price?: number;
  max_price?: number;
  min_yield?: number;
  max_yield?: number;
}
