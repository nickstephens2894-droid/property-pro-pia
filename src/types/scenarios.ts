// Types for the comprehensive Scenarios feature
import { Database } from "@/integrations/supabase/types";

// Base types from Supabase
export type Scenario = Database["public"]["Tables"]["scenarios"]["Row"];
export type ScenarioInstance =
  Database["public"]["Tables"]["scenario_instances"]["Row"];
export type ScenarioApplication =
  Database["public"]["Tables"]["scenario_applications"]["Row"];

// Extended types for frontend use
export interface ScenarioWithInstances extends Scenario {
  scenario_instances: ScenarioInstanceWithData[];
}

export interface ScenarioInstanceWithData extends ScenarioInstance {
  // Computed properties
  is_modified: boolean;
  has_conflicts: boolean;
  last_modified_at: string;

  // Instance data parsed from JSONB
  instance_data_parsed: InstanceData;
}

export interface InstanceData {
  // All the fields from the instances table
  id: string;
  name: string;
  status: "draft" | "active" | "archived";
  property_method: string;
  funding_method: string;
  investors: any[];
  ownership_allocations: any[];
  is_construction_project: boolean;
  purchase_price: number;
  weekly_rent: number;
  rental_growth_rate: number;
  vacancy_rate: number;
  construction_year: number;
  building_value: number;
  plant_equipment_value: number;
  land_value: number;
  construction_value: number;
  construction_period: number;
  construction_interest_rate: number;
  construction_progress_payments: any[];
  deposit: number;
  loan_amount: number;
  interest_rate: number;
  loan_term: number;
  lvr: number;
  main_loan_type: "io" | "pi";
  io_term_years: number;
  use_equity_funding: boolean;
  primary_property_value: number;
  existing_debt: number;
  max_lvr: number;
  equity_loan_type: "io" | "pi";
  equity_loan_io_term_years: number;
  equity_loan_interest_rate: number;
  equity_loan_term: number;
  deposit_amount: number;
  minimum_deposit_required: number;
  holding_cost_funding: "cash" | "debt" | "hybrid";
  holding_cost_cash_percentage: number;
  capitalize_construction_costs: boolean;
  construction_equity_repayment_type: "io" | "pi";
  land_holding_interest: number;
  construction_holding_interest: number;
  total_holding_costs: number;
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
  depreciation_method: "prime-cost" | "diminishing-value";
  is_new_property: boolean;
  property_state: string;
  total_project_cost: number;
  equity_loan_amount: number;
  available_equity: number;
  minimum_cash_required: number;
  actual_cash_deposit: number;
  funding_shortfall: number;
  funding_surplus: number;
  projections: any[];
  assumptions: any;
  weekly_cashflow_year1: number;
  tax_savings_year1: number;
  tax_savings_total: number;
  net_equity_at_year_to: number;
  roi_at_year_to: number;
  analysis_year_to: number;
  created_at: string;
  updated_at: string;
}

// Request/Response types
export interface CreateScenarioRequest {
  name: string;
  description?: string;
  settings?: Record<string, any>;
  tags?: string[];
}

export interface UpdateScenarioRequest {
  name?: string;
  description?: string;
  status?: "draft" | "active" | "archived";
  settings?: Record<string, any>;
  tags?: string[];
}

export interface CreateScenarioInstanceRequest {
  scenario_id: string;
  original_instance_id?: string; // If copying from existing instance
  instance_data: InstanceData;
  scenario_name: string;
  overrides?: Record<string, any>;
}

export interface UpdateScenarioInstanceRequest {
  scenario_name?: string;
  instance_data?: Partial<InstanceData>;
  overrides?: Record<string, any>;
  status?: "draft" | "active" | "synced" | "conflict";
}

export interface ApplyScenarioInstanceRequest {
  scenario_instance_id: string;
  operation_type: "create" | "update";
  resolution_strategy?: "overwrite" | "merge" | "skip";
}

// Aggregated projections for scenario
export interface ScenarioProjections {
  total_rental_income: number;
  total_property_value: number;
  total_loan_balance: number;
  total_equity_loan_balance: number;
  total_interest: number;
  total_loan_payment: number;
  total_equity_loan_payment: number;
  total_other_expenses: number;
  total_depreciation: number;
  total_taxable_income: number;
  total_tax_benefit: number;
  total_after_tax_cash_flow: number;
  total_cumulative_cash_flow: number;
  total_property_equity: number;
  total_return: number;

  // Per-year breakdown
  yearly_projections: Array<{
    year: number;
    rental_income: number;
    property_value: number;
    loan_balance: number;
    equity_loan_balance: number;
    interest: number;
    loan_payment: number;
    equity_loan_payment: number;
    other_expenses: number;
    depreciation: number;
    taxable_income: number;
    tax_benefit: number;
    after_tax_cash_flow: number;
    cumulative_cash_flow: number;
    property_equity: number;
    total_return: number;
  }>;
}

// Conflict resolution types
export interface ConflictData {
  field: string;
  scenario_value: any;
  instance_value: any;
  conflict_type: "value_mismatch" | "structure_change" | "deletion";
  resolution: "overwrite" | "merge" | "skip" | "manual";
}

export interface ApplyResult {
  success: boolean;
  scenario_instance_id: string;
  target_instance_id?: string;
  operation_type: "create" | "update";
  conflicts?: ConflictData[];
  error?: string;
}

export interface ConflictCheckResult {
  has_conflicts: boolean;
  conflicts: ConflictData[];
  last_instance_update?: string;
  last_scenario_update?: string;
}

// Scenario funding types
export interface ScenarioInstanceFunding {
  id: string;
  scenario_instance_id: string;
  fund_id: string;
  fund_type: "loan" | "cash";
  amount_allocated: number;
  amount_used: number;
  allocation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  fund_name?: string;
  fund_total_amount?: number;
  fund_available_amount?: number;
}

export interface ScenarioFundingApplication {
  id: string;
  scenario_instance_id: string;
  scenario_funding_id: string;
  target_instance_id: string;
  target_funding_id?: string;
  operation_type: "create" | "update" | "delete";
  status: "pending" | "applying" | "success" | "failed" | "conflict";
  applied_at?: string;
  error_message?: string;
  created_at: string;
}

export interface CreateScenarioFundingRequest {
  scenario_instance_id: string;
  fund_id: string;
  fund_type: "loan" | "cash";
  amount_allocated: number;
  notes?: string;
}

export interface UpdateScenarioFundingRequest {
  amount_allocated?: number;
  amount_used?: number;
  notes?: string;
}

export interface ApplyScenarioFundingRequest {
  scenario_instance_id: string;
  target_instance_id: string;
  resolution_strategy?: "overwrite" | "merge" | "skip";
}

export interface ScenarioFundingConflict {
  scenario_funding: ScenarioInstanceFunding;
  real_funding?: any; // InstanceFunding type
  conflict_type: "amount_mismatch" | "fund_change" | "new_allocation";
  resolution_strategy: "overwrite" | "merge" | "skip";
}

// Feature flag types
export interface FeatureFlag {
  flag_name: string;
  enabled: boolean;
  description?: string;
}

// Context types
export interface ScenariosContextType {
  // Data
  scenarios: ScenarioWithInstances[];
  currentScenario: ScenarioWithInstances | null;
  loading: boolean;
  error: string | null;

  // Feature flags
  isScenariosEnabled: boolean;
  isApplyEnabled: boolean;
  isConflictResolutionEnabled: boolean;

  // CRUD operations
  createScenario: (data: CreateScenarioRequest) => Promise<Scenario>;
  updateScenario: (
    id: string,
    data: UpdateScenarioRequest
  ) => Promise<Scenario>;
  deleteScenario: (id: string) => Promise<void>;
  setPrimaryScenario: (id: string) => Promise<void>;

  // Scenario instance operations
  addInstanceToScenario: (
    scenarioId: string,
    instanceId: string,
    scenarioName?: string
  ) => Promise<ScenarioInstance>;
  createNewInstanceInScenario: (
    scenarioId: string,
    instanceData: InstanceData,
    scenarioName: string
  ) => Promise<ScenarioInstance>;
  updateScenarioInstance: (
    scenarioInstanceId: string,
    data: UpdateScenarioInstanceRequest
  ) => Promise<ScenarioInstance>;
  removeInstanceFromScenario: (scenarioInstanceId: string) => Promise<void>;

  // Apply operations
  applyScenarioInstance: (
    scenarioInstanceId: string,
    options?: ApplyScenarioInstanceRequest
  ) => Promise<ApplyResult>;
  applyAllScenarioInstances: (scenarioId: string) => Promise<ApplyResult[]>;
  checkScenarioInstanceConflicts: (
    scenarioInstanceId: string
  ) => Promise<ConflictCheckResult>;

  // Funding operations
  applyScenarioFunding: (
    request: ApplyScenarioFundingRequest
  ) => Promise<boolean>;
  rollbackScenarioFunding: (scenarioInstanceId: string) => Promise<boolean>;
  checkFundingConflicts: (
    scenarioInstanceId: string
  ) => Promise<ScenarioFundingConflict[]>;

  // Projections
  calculateScenarioProjections: (
    scenarioId: string
  ) => Promise<ScenarioProjections>;
  refreshScenarioProjections: (scenarioId: string) => Promise<void>;

  // Navigation
  setCurrentScenario: (scenario: ScenarioWithInstances | null) => void;

  // State management
  refreshScenarios: () => Promise<void>;
  clearError: () => void;
}
