
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      instances: {
        Row: {
          id: string
          user_id: string
          property_model_id: string | null
          name: string
          status: 'draft' | 'active' | 'archived'
          created_at: string
          updated_at: string
          property_method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner' | null
          funding_method: 'loan-cash' | 'loan-equity' | 'full-equity' | null
          investors: Json
          ownership_allocations: Json
          is_construction_project: boolean
          purchase_price: number
          weekly_rent: number
          rental_growth_rate: number
          vacancy_rate: number
          construction_year: number
          building_value: number
          plant_equipment_value: number
          land_value: number
          construction_value: number
          construction_period: number
          construction_interest_rate: number
          construction_progress_payments: Json
          deposit: number
          loan_amount: number
          interest_rate: number
          loan_term: number
          lvr: number
          main_loan_type: 'io' | 'pi'
          io_term_years: number
          use_equity_funding: boolean
          primary_property_value: number
          existing_debt: number
          max_lvr: number
          equity_loan_type: 'io' | 'pi'
          equity_loan_io_term_years: number
          equity_loan_interest_rate: number
          equity_loan_term: number
          deposit_amount: number
          minimum_deposit_required: number
          holding_cost_funding: 'cash' | 'debt' | 'hybrid'
          holding_cost_cash_percentage: number
          capitalize_construction_costs: boolean
          construction_equity_repayment_type: 'io' | 'pi'
          land_holding_interest: number
          construction_holding_interest: number
          total_holding_costs: number
          stamp_duty: number
          legal_fees: number
          inspection_fees: number
          council_fees: number
          architect_fees: number
          site_costs: number
          property_management: number
          council_rates: number
          insurance: number
          repairs: number
          depreciation_method: 'prime-cost' | 'diminishing-value'
          is_new_property: boolean
          property_state: 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' | null
          total_project_cost: number
          equity_loan_amount: number
          available_equity: number
        }
        Insert: {
          id?: string
          user_id: string
          property_model_id?: string | null
          name: string
          status?: 'draft' | 'active' | 'archived'
          created_at?: string
          updated_at?: string
          property_method?: 'house-land-construction' | 'built-first-owner' | 'built-second-owner' | null
          funding_method?: 'loan-cash' | 'loan-equity' | 'full-equity' | null
          investors?: Json
          ownership_allocations?: Json
          is_construction_project?: boolean
          purchase_price?: number
          weekly_rent?: number
          rental_growth_rate?: number
          vacancy_rate?: number
          construction_year?: number
          building_value?: number
          plant_equipment_value?: number
          land_value?: number
          construction_value?: number
          construction_period?: number
          construction_interest_rate?: number
          construction_progress_payments?: Json
          deposit?: number
          loan_amount?: number
          interest_rate?: number
          loan_term?: number
          lvr?: number
          main_loan_type?: 'io' | 'pi'
          io_term_years?: number
          use_equity_funding?: boolean
          primary_property_value?: number
          existing_debt?: number
          max_lvr?: number
          equity_loan_type?: 'io' | 'pi'
          equity_loan_io_term_years?: number
          equity_loan_interest_rate?: number
          equity_loan_term?: number
          deposit_amount?: number
          minimum_deposit_required?: number
          holding_cost_funding?: 'cash' | 'debt' | 'hybrid'
          holding_cost_cash_percentage?: number
          capitalize_construction_costs?: boolean
          construction_equity_repayment_type?: 'io' | 'pi'
          land_holding_interest?: number
          construction_holding_interest?: number
          total_holding_costs?: number
          stamp_duty?: number
          legal_fees?: number
          inspection_fees?: number
          council_fees?: number
          architect_fees?: number
          site_costs?: number
          property_management?: number
          council_rates?: number
          insurance?: number
          repairs?: number
          depreciation_method?: 'prime-cost' | 'diminishing-value'
          is_new_property?: boolean
          property_state?: 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' | null
          total_project_cost?: number
          equity_loan_amount?: number
          available_equity?: number
        }
        Update: {
          id?: string
          user_id?: string
          property_model_id?: string | null
          name?: string
          status?: 'draft' | 'active' | 'archived'
          created_at?: string
          updated_at?: string
          property_method?: 'house-land-construction' | 'built-first-owner' | 'built-second-owner' | null
          funding_method?: 'loan-cash' | 'loan-equity' | 'full-equity' | null
          investors?: Json
          ownership_allocations?: Json
          is_construction_project?: boolean
          purchase_price?: number
          weekly_rent?: number
          rental_growth_rate?: number
          vacancy_rate?: number
          construction_year?: number
          building_value?: number
          plant_equipment_value?: number
          land_value?: number
          construction_value?: number
          construction_period?: number
          construction_interest_rate?: number
          construction_progress_payments?: Json
          deposit?: number
          loan_amount?: number
          interest_rate?: number
          loan_term?: number
          lvr?: number
          main_loan_type?: 'io' | 'pi'
          io_term_years?: number
          use_equity_funding?: boolean
          primary_property_value?: number
          existing_debt?: number
          max_lvr?: number
          equity_loan_type?: 'io' | 'pi'
          equity_loan_io_term_years?: number
          equity_loan_interest_rate?: number
          equity_loan_term?: number
          deposit_amount?: number
          minimum_deposit_required?: number
          holding_cost_funding?: 'cash' | 'debt' | 'hybrid'
          holding_cost_cash_percentage?: number
          capitalize_construction_costs?: boolean
          construction_equity_repayment_type?: 'io' | 'pi'
          land_holding_interest?: number
          construction_holding_interest?: number
          total_holding_costs?: number
          stamp_duty?: number
          legal_fees?: number
          inspection_fees?: number
          council_fees?: number
          architect_fees?: number
          site_costs?: number
          property_management?: number
          council_rates?: number
          insurance?: number
          repairs?: number
          depreciation_method?: 'prime-cost' | 'diminishing-value'
          is_new_property?: boolean
          property_state?: 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA' | null
          total_project_cost?: number
          equity_loan_amount?: number
          available_equity?: number
        }
        Relationships: [
          {
            foreignKeyName: "instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instances_property_model_id_fkey"
            columns: ["property_model_id"]
            isOneToOne: false
            referencedRelation: "property_models"
            referencedColumns: ["id"]
          }
        ]
      }
      property_models: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          description: string | null
          property_type: 'Apartment' | 'House' | 'Townhouse' | 'Unit' | 'Land' | 'Commercial'
          property_method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner'
          purchase_price: number
          weekly_rent: number
          rental_growth_rate: number
          vacancy_rate: number
          location: string
          construction_year: number
          is_construction_project: boolean
          land_value: number
          construction_value: number
          construction_period: number
          construction_interest_rate: number
          building_value: number
          plant_equipment_value: number
          stamp_duty: number
          legal_fees: number
          inspection_fees: number
          council_fees: number
          architect_fees: number
          site_costs: number
          property_management: number
          council_rates: number
          insurance: number
          repairs: number
          depreciation_method: 'prime-cost' | 'diminishing-value'
          is_new_property: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          description?: string | null
          property_type: 'Apartment' | 'House' | 'Townhouse' | 'Unit' | 'Land' | 'Commercial'
          property_method: 'house-land-construction' | 'built-first-owner' | 'built-second-owner'
          purchase_price: number
          weekly_rent: number
          rental_growth_rate: number
          vacancy_rate: number
          location: string
          construction_year: number
          is_construction_project: boolean
          land_value: number
          construction_value: number
          construction_period: number
          construction_interest_rate: number
          building_value: number
          plant_equipment_value: number
          stamp_duty: number
          legal_fees: number
          inspection_fees: number
          council_fees: number
          architect_fees: number
          site_costs: number
          property_management: number
          council_rates: number
          insurance: number
          repairs: number
          depreciation_method: 'prime-cost' | 'diminishing-value'
          is_new_property: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          description?: string | null
          property_type?: 'Apartment' | 'House' | 'Townhouse' | 'Unit' | 'Land' | 'Commercial'
          property_method?: 'house-land-construction' | 'built-first-owner' | 'built-second-owner'
          purchase_price?: number
          weekly_rent?: number
          rental_growth_rate?: number
          vacancy_rate?: number
          location?: string
          construction_year?: number
          is_construction_project?: boolean
          land_value?: number
          construction_value?: number
          construction_period?: number
          construction_interest_rate?: number
          building_value?: number
          plant_equipment_value?: number
          stamp_duty?: number
          legal_fees?: number
          inspection_fees?: number
          council_fees?: number
          architect_fees?: number
          site_costs?: number
          property_management?: number
          council_rates?: number
          insurance?: number
          repairs?: number
          depreciation_method?: 'prime-cost' | 'diminishing-value'
          is_new_property?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_models_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      investors: {
        Row: {
          annual_income: number
          created_at: string
          has_medicare_levy: boolean
          id: string
          name: string
          non_taxable_income: number
          other_income: number
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          annual_income?: number
          created_at?: string
          has_medicare_levy?: boolean
          id?: string
          name: string
          non_taxable_income?: number
          other_income?: number
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          annual_income?: number
          created_at?: string
          has_medicare_levy?: boolean
          id?: string
          name?: string
          non_taxable_income?: number
          other_income?: number
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      loan_funds: {
        Row: {
          construction_interest_rate: number
          construction_period: number
          created_at: string
          fund_amount: number
          fund_return: number
          funds_type: string
          id: string
          interest_rate: number
          io_term: number
          loan_balance: number
          loan_purpose: string
          loan_term: number
          loan_type: string
          name: string
          owner_user_id: string
          progress_payment_description: string
          progress_payment_percentage: number
          progress_payment_weeks: number
          updated_at: string
        }
        Insert: {
          construction_interest_rate?: number
          construction_period?: number
          created_at?: string
          fund_amount?: number
          fund_return?: number
          funds_type?: string
          id?: string
          interest_rate?: number
          io_term?: number
          loan_balance?: number
          loan_purpose?: string
          loan_term?: number
          loan_type?: string
          name: string
          owner_user_id: string
          progress_payment_description?: string
          progress_payment_percentage?: number
          progress_payment_weeks?: number
          updated_at?: string
        }
        Update: {
          construction_interest_rate?: number
          construction_period?: number
          created_at?: string
          fund_amount?: number
          fund_return?: number
          funds_type?: string
          id?: string
          interest_rate?: number
          io_term?: number
          loan_balance?: number
          loan_purpose?: string
          loan_term?: number
          loan_type?: string
          name?: string
          owner_user_id?: string
          progress_payment_description?: string
          progress_payment_percentage?: number
          progress_payment_weeks?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          building_value: number
          capital_growth_rate: number
          construction_value: number
          construction_year: number
          council_approval_fees: number
          council_rates: number
          created_at: string
          current_property_value: number
          depreciation_method: string
          id: string
          inspection_fees: number
          insurance: number
          investment_status: string
          is_construction_project: boolean
          is_new_property: boolean
          land_value: number
          legal_fees: number
          location: string | null
          maintenance_repairs: number
          name: string
          notes: string | null
          owned_or_potential: string
          owner_user_id: string
          pest_treatment: number
          plant_equipment_value: number
          property_management_percentage: number
          purchase_price: number
          rental_growth_rate: number
          site_costs: number
          smoke_alarm_inspection: number
          stamp_duty: number
          status: string
          type: string
          updated_at: string
          vacancy_rate: number
          weekly_rent: number
        }
        Insert: {
          building_value?: number
          capital_growth_rate?: number
          construction_value?: number
          construction_year?: number
          council_approval_fees?: number
          council_rates?: number
          created_at?: string
          current_property_value?: number
          depreciation_method?: string
          id?: string
          inspection_fees?: number
          insurance?: number
          investment_status?: string
          is_construction_project?: boolean
          is_new_property?: boolean
          land_value?: number
          legal_fees?: number
          location?: string | null
          maintenance_repairs?: number
          name: string
          notes?: string | null
          owned_or_potential?: string
          owner_user_id: string
          pest_treatment?: number
          plant_equipment_value?: number
          property_management_percentage?: number
          purchase_price?: number
          rental_growth_rate?: number
          site_costs?: number
          smoke_alarm_inspection?: number
          stamp_duty?: number
          status?: string
          type?: string
          updated_at?: string
          vacancy_rate?: number
          weekly_rent?: number
        }
        Update: {
          building_value?: number
          capital_growth_rate?: number
          construction_value?: number
          construction_year?: number
          council_approval_fees?: number
          council_rates?: number
          created_at?: string
          current_property_value?: number
          depreciation_method?: string
          id?: string
          inspection_fees?: number
          insurance?: number
          investment_status?: string
          is_construction_project?: boolean
          is_new_property?: boolean
          land_value?: number
          legal_fees?: number
          location?: string | null
          maintenance_repairs?: number
          name?: string
          notes?: string | null
          owned_or_potential?: string
          owner_user_id?: string
          pest_treatment?: number
          plant_equipment_value?: number
          property_management_percentage?: number
          purchase_price?: number
          rental_growth_rate?: number
          site_costs?: number
          smoke_alarm_inspection?: number
          stamp_duty?: number
          status?: string
          type?: string
          updated_at?: string
          vacancy_rate?: number
          weekly_rent?: number
        }
        Relationships: []
      }
      property_investors: {
        Row: {
          cash_contribution: number
          created_at: string
          id: string
          investor_id: string
          notes: string | null
          ownership_percentage: number
          property_id: string
          updated_at: string
        }
        Insert: {
          cash_contribution?: number
          created_at?: string
          id?: string
          investor_id: string
          notes?: string | null
          ownership_percentage?: number
          property_id: string
          updated_at?: string
        }
        Update: {
          cash_contribution?: number
          created_at?: string
          id?: string
          investor_id?: string
          notes?: string | null
          ownership_percentage?: number
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_investors_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_investors_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          created_at: string
          id: string
          is_core: boolean
          name: string
          owner_user_id: string
          snapshot: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_core?: boolean
          name: string
          owner_user_id: string
          snapshot?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_core?: boolean
          name?: string
          owner_user_id?: string
          snapshot?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Export the Instance type for use in components
export type Instance = Database['public']['Tables']['instances']['Row']
export type CreateInstanceRequest = Database['public']['Tables']['instances']['Insert']
export type UpdateInstanceRequest = Database['public']['Tables']['instances']['Update']
