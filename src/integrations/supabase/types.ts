export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      instances: {
        Row: {
          actual_cash_deposit: number;
          analysis_year_to: number;
          architect_fees: number;
          assumptions: Json | null;
          available_equity: number;
          building_value: number;
          capital_growth_rate: number;
          capitalize_construction_costs: boolean;
          construction_equity_repayment_type: string;
          construction_holding_interest: number;
          construction_interest_rate: number;
          construction_period: number;
          construction_progress_payments: Json | null;
          construction_value: number;
          construction_year: number;
          council_fees: number;
          council_rates: number;
          created_at: string;
          deposit: number;
          deposit_amount: number;
          depreciation_method: string;
          description: string | null;
          equity_loan_amount: number;
          equity_loan_interest_rate: number;
          equity_loan_io_term_years: number;
          equity_loan_term: number;
          equity_loan_type: string;
          existing_debt: number;
          funding_method: string | null;
          funding_shortfall: number;
          funding_surplus: number;
          holding_cost_cash_percentage: number;
          holding_cost_funding: string;
          id: string;
          inspection_fees: number;
          insurance: number;
          interest_rate: number;
          investors: Json | null;
          io_term_years: number;
          is_construction_project: boolean;
          is_from_template: boolean;
          is_new_property: boolean;
          land_holding_interest: number;
          land_value: number;
          legal_fees: number;
          loan_amount: number;
          loan_term: number;
          location: string;
          lvr: number;
          main_loan_type: string;
          max_lvr: number;
          minimum_cash_required: number;
          minimum_deposit_required: number;
          name: string;
          net_equity_at_year_to: number;
          ownership_allocations: Json | null;
          plant_equipment_value: number;
          post_construction_rate_reduction: number;
          primary_property_value: number;
          projections: Json | null;
          property_management: number;
          property_method: string;
          property_state: string | null;
          property_type: string;
          purchase_price: number;
          rental_growth_rate: number;
          repairs: number;
          roi_at_year_to: number;
          site_costs: number;
          source_model_id: string | null;
          stamp_duty: number;
          status: string;
          tax_savings_total: number;
          tax_savings_year1: number;
          total_holding_costs: number;
          total_project_cost: number;
          updated_at: string;
          use_equity_funding: boolean;
          user_id: string;
          vacancy_rate: number;
          weekly_cashflow_year1: number;
          weekly_rent: number;
        };
        Insert: {
          actual_cash_deposit?: number;
          analysis_year_to?: number;
          architect_fees?: number;
          assumptions?: Json | null;
          available_equity?: number;
          building_value?: number;
          capital_growth_rate?: number;
          capitalize_construction_costs?: boolean;
          construction_equity_repayment_type?: string;
          construction_holding_interest?: number;
          construction_interest_rate?: number;
          construction_period?: number;
          construction_progress_payments?: Json | null;
          construction_value?: number;
          construction_year?: number;
          council_fees?: number;
          council_rates?: number;
          created_at?: string;
          deposit?: number;
          deposit_amount?: number;
          depreciation_method?: string;
          description?: string | null;
          equity_loan_amount?: number;
          equity_loan_interest_rate?: number;
          equity_loan_io_term_years?: number;
          equity_loan_term?: number;
          equity_loan_type?: string;
          existing_debt?: number;
          funding_method?: string | null;
          funding_shortfall?: number;
          funding_surplus?: number;
          holding_cost_cash_percentage?: number;
          holding_cost_funding?: string;
          id?: string;
          inspection_fees?: number;
          insurance?: number;
          interest_rate?: number;
          investors?: Json | null;
          io_term_years?: number;
          is_construction_project?: boolean;
          is_from_template?: boolean;
          is_new_property?: boolean;
          land_holding_interest?: number;
          land_value?: number;
          legal_fees?: number;
          loan_amount?: number;
          loan_term?: number;
          location?: string;
          lvr?: number;
          main_loan_type?: string;
          max_lvr?: number;
          minimum_cash_required?: number;
          minimum_deposit_required?: number;
          name: string;
          net_equity_at_year_to?: number;
          ownership_allocations?: Json | null;
          plant_equipment_value?: number;
          post_construction_rate_reduction?: number;
          primary_property_value?: number;
          projections?: Json | null;
          property_management?: number;
          property_method?: string;
          property_state?: string | null;
          property_type?: string;
          purchase_price?: number;
          rental_growth_rate?: number;
          repairs?: number;
          roi_at_year_to?: number;
          site_costs?: number;
          source_model_id?: string | null;
          stamp_duty?: number;
          status?: string;
          tax_savings_total?: number;
          tax_savings_year1?: number;
          total_holding_costs?: number;
          total_project_cost?: number;
          updated_at?: string;
          use_equity_funding?: boolean;
          user_id: string;
          vacancy_rate?: number;
          weekly_cashflow_year1?: number;
          weekly_rent?: number;
        };
        Update: {
          actual_cash_deposit?: number;
          analysis_year_to?: number;
          architect_fees?: number;
          assumptions?: Json | null;
          available_equity?: number;
          building_value?: number;
          capital_growth_rate?: number;
          capitalize_construction_costs?: boolean;
          construction_equity_repayment_type?: string;
          construction_holding_interest?: number;
          construction_interest_rate?: number;
          construction_period?: number;
          construction_progress_payments?: Json | null;
          construction_value?: number;
          construction_year?: number;
          council_fees?: number;
          council_rates?: number;
          created_at?: string;
          deposit?: number;
          deposit_amount?: number;
          depreciation_method?: string;
          description?: string | null;
          equity_loan_amount?: number;
          equity_loan_interest_rate?: number;
          equity_loan_io_term_years?: number;
          equity_loan_term?: number;
          equity_loan_type?: string;
          existing_debt?: number;
          funding_method?: string | null;
          funding_shortfall?: number;
          funding_surplus?: number;
          holding_cost_cash_percentage?: number;
          holding_cost_funding?: string;
          id?: string;
          inspection_fees?: number;
          insurance?: number;
          interest_rate?: number;
          investors?: Json | null;
          io_term_years?: number;
          is_construction_project?: boolean;
          is_from_template?: boolean;
          is_new_property?: boolean;
          land_holding_interest?: number;
          land_value?: number;
          legal_fees?: number;
          loan_amount?: number;
          loan_term?: number;
          location?: string;
          lvr?: number;
          main_loan_type?: string;
          max_lvr?: number;
          minimum_cash_required?: number;
          minimum_deposit_required?: number;
          name?: string;
          net_equity_at_year_to?: number;
          ownership_allocations?: Json | null;
          plant_equipment_value?: number;
          post_construction_rate_reduction?: number;
          primary_property_value?: number;
          projections?: Json | null;
          property_management?: number;
          property_method?: string;
          property_state?: string | null;
          property_type?: string;
          purchase_price?: number;
          rental_growth_rate?: number;
          repairs?: number;
          roi_at_year_to?: number;
          site_costs?: number;
          source_model_id?: string | null;
          stamp_duty?: number;
          status?: string;
          tax_savings_total?: number;
          tax_savings_year1?: number;
          total_holding_costs?: number;
          total_project_cost?: number;
          updated_at?: string;
          use_equity_funding?: boolean;
          user_id?: string;
          vacancy_rate?: number;
          weekly_cashflow_year1?: number;
          weekly_rent?: number;
        };
        Relationships: [
          {
            foreignKeyName: "instances_source_model_id_fkey";
            columns: ["source_model_id"];
            isOneToOne: false;
            referencedRelation: "property_models";
            referencedColumns: ["id"];
          }
        ];
      };
      investors: {
        Row: {
          annual_income: number;
          created_at: string;
          has_medicare_levy: boolean;
          id: string;
          name: string;
          non_taxable_income: number;
          other_income: number;
          owner_user_id: string;
          updated_at: string;
        };
        Insert: {
          annual_income?: number;
          created_at?: string;
          has_medicare_levy?: boolean;
          id?: string;
          name: string;
          non_taxable_income?: number;
          other_income?: number;
          owner_user_id: string;
          updated_at?: string;
        };
        Update: {
          annual_income?: number;
          created_at?: string;
          has_medicare_levy?: boolean;
          id?: string;
          name?: string;
          non_taxable_income?: number;
          other_income?: number;
          owner_user_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      loan_funds: {
        Row: {
          construction_interest_rate: number;
          construction_period: number;
          created_at: string;
          fund_amount: number;
          fund_return: number;
          funds_type: string;
          id: string;
          interest_rate: number;
          io_term: number;
          loan_balance: number;
          loan_purpose: string;
          loan_term: number;
          loan_type: string;
          name: string;
          owner_user_id: string;
          progress_payment_description: string;
          progress_payment_percentage: number;
          progress_payment_weeks: number;
          updated_at: string;
        };
        Insert: {
          construction_interest_rate?: number;
          construction_period?: number;
          created_at?: string;
          fund_amount?: number;
          fund_return?: number;
          funds_type?: string;
          id?: string;
          interest_rate?: number;
          io_term?: number;
          loan_balance?: number;
          loan_purpose?: string;
          loan_term?: number;
          loan_type?: string;
          name: string;
          owner_user_id: string;
          progress_payment_description?: string;
          progress_payment_percentage?: number;
          progress_payment_weeks?: number;
          updated_at?: string;
        };
        Update: {
          construction_interest_rate?: number;
          construction_period?: number;
          created_at?: string;
          fund_amount?: number;
          fund_return?: number;
          funds_type?: string;
          id?: string;
          interest_rate?: number;
          io_term?: number;
          loan_balance?: number;
          loan_purpose?: string;
          loan_term?: number;
          loan_type?: string;
          name?: string;
          owner_user_id?: string;
          progress_payment_description?: string;
          progress_payment_percentage?: number;
          progress_payment_weeks?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      cash_funds: {
        Row: {
          available_amount: number;
          created_at: string;
          fund_type: string;
          id: string;
          name: string;
          owner_user_id: string;
          return_rate: number;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          available_amount?: number;
          created_at?: string;
          fund_type?: string;
          id?: string;
          name: string;
          owner_user_id: string;
          return_rate?: number;
          total_amount?: number;
          updated_at?: string;
        };
        Update: {
          available_amount?: number;
          created_at?: string;
          fund_type?: string;
          id?: string;
          name?: string;
          owner_user_id?: string;
          return_rate?: number;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      instance_fundings: {
        Row: {
          allocation_date: string;
          amount_allocated: number;
          amount_used: number;
          created_at: string;
          fund_id: string;
          fund_type: string;
          id: string;
          instance_id: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          allocation_date?: string;
          amount_allocated?: number;
          amount_used?: number;
          created_at?: string;
          fund_id: string;
          fund_type: string;
          id?: string;
          instance_id: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          allocation_date?: string;
          amount_allocated?: number;
          amount_used?: number;
          created_at?: string;
          fund_id?: string;
          fund_type?: string;
          id?: string;
          instance_id?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "instance_fundings_instance_id_fkey";
            columns: ["instance_id"];
            isOneToOne: false;
            referencedRelation: "instances";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          building_value: number;
          capital_growth_rate: number;
          construction_value: number;
          construction_year: number;
          council_approval_fees: number;
          council_rates: number;
          created_at: string;
          current_property_value: number;
          depreciation_method: string;
          id: string;
          inspection_fees: number;
          insurance: number;
          investment_status: string;
          is_construction_project: boolean;
          is_from_template: boolean;
          is_new_property: boolean;
          land_value: number;
          legal_fees: number;
          location: string | null;
          maintenance_repairs: number;
          name: string;
          notes: string | null;
          owned_or_potential: string;
          owner_user_id: string;
          pest_treatment: number;
          plant_equipment_value: number;
          property_management_percentage: number;
          purchase_price: number;
          rental_growth_rate: number;
          site_costs: number;
          smoke_alarm_inspection: number;
          source_model_id: string | null;
          stamp_duty: number;
          status: string;
          type: string;
          updated_at: string;
          vacancy_rate: number;
          weekly_rent: number;
        };
        Insert: {
          building_value?: number;
          capital_growth_rate?: number;
          construction_value?: number;
          construction_year?: number;
          council_approval_fees?: number;
          council_rates?: number;
          created_at?: string;
          current_property_value?: number;
          depreciation_method?: string;
          id?: string;
          inspection_fees?: number;
          insurance?: number;
          investment_status?: string;
          is_construction_project?: boolean;
          is_from_template?: boolean;
          is_new_property?: boolean;
          land_value?: number;
          legal_fees?: number;
          location?: string | null;
          maintenance_repairs?: number;
          name: string;
          notes?: string | null;
          owned_or_potential?: string;
          owner_user_id: string;
          pest_treatment?: number;
          plant_equipment_value?: number;
          property_management_percentage?: number;
          purchase_price?: number;
          rental_growth_rate?: number;
          site_costs?: number;
          smoke_alarm_inspection?: number;
          source_model_id?: string | null;
          stamp_duty?: number;
          status?: string;
          type?: string;
          updated_at?: string;
          vacancy_rate?: number;
          weekly_rent?: number;
        };
        Update: {
          building_value?: number;
          capital_growth_rate?: number;
          construction_value?: number;
          construction_year?: number;
          council_approval_fees?: number;
          council_rates?: number;
          created_at?: string;
          current_property_value?: number;
          depreciation_method?: string;
          id?: string;
          inspection_fees?: number;
          insurance?: number;
          investment_status?: string;
          is_construction_project?: boolean;
          is_from_template?: boolean;
          is_new_property?: boolean;
          land_value?: number;
          legal_fees?: number;
          location?: string | null;
          maintenance_repairs?: number;
          name?: string;
          notes?: string | null;
          owned_or_potential?: string;
          owner_user_id?: string;
          pest_treatment?: number;
          plant_equipment_value?: number;
          property_management_percentage?: number;
          purchase_price?: number;
          rental_growth_rate?: number;
          site_costs?: number;
          smoke_alarm_inspection?: number;
          source_model_id?: string | null;
          stamp_duty?: number;
          status?: string;
          type?: string;
          updated_at?: string;
          vacancy_rate?: number;
          weekly_rent?: number;
        };
        Relationships: [
          {
            foreignKeyName: "properties_source_model_id_fkey";
            columns: ["source_model_id"];
            isOneToOne: false;
            referencedRelation: "property_models";
            referencedColumns: ["id"];
          }
        ];
      };
      property_investors: {
        Row: {
          cash_contribution: number | null;
          created_at: string;
          id: string;
          investor_id: string;
          loan_share_percentage: number | null;
          notes: string | null;
          ownership_percentage: number;
          property_id: string;
          updated_at: string;
        };
        Insert: {
          cash_contribution?: number | null;
          created_at?: string;
          id?: string;
          investor_id: string;
          loan_share_percentage?: number | null;
          notes?: string | null;
          ownership_percentage?: number;
          property_id: string;
          updated_at?: string;
        };
        Update: {
          cash_contribution?: number | null;
          created_at?: string;
          id?: string;
          investor_id?: string;
          loan_share_percentage?: number | null;
          notes?: string | null;
          ownership_percentage?: number;
          property_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_investors_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_investors_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      property_models: {
        Row: {
          architect_fees: number;
          building_value: number;
          construction_interest_rate: number;
          construction_period: number;
          construction_value: number;
          construction_year: number;
          council_fees: number;
          council_rates: number;
          created_at: string;
          depreciation_method: string;
          description: string | null;
          id: string;
          inspection_fees: number;
          insurance: number;
          is_construction_project: boolean;
          is_new_property: boolean;
          land_value: number;
          legal_fees: number;
          location: string;
          name: string;
          owner_user_id: string;
          plant_equipment_value: number;
          property_management: number;
          property_method: string;
          property_type: string;
          purchase_price: number;
          rental_growth_rate: number;
          repairs: number;
          site_costs: number;
          stamp_duty: number;
          updated_at: string;
          vacancy_rate: number;
          weekly_rent: number;
        };
        Insert: {
          architect_fees?: number;
          building_value?: number;
          construction_interest_rate?: number;
          construction_period?: number;
          construction_value?: number;
          construction_year?: number;
          council_fees?: number;
          council_rates?: number;
          created_at?: string;
          depreciation_method?: string;
          description?: string | null;
          id?: string;
          inspection_fees?: number;
          insurance?: number;
          is_construction_project?: boolean;
          is_new_property?: boolean;
          land_value?: number;
          legal_fees?: number;
          location?: string;
          name: string;
          owner_user_id: string;
          plant_equipment_value?: number;
          property_management?: number;
          property_method?: string;
          property_type?: string;
          purchase_price?: number;
          rental_growth_rate?: number;
          repairs?: number;
          site_costs?: number;
          stamp_duty?: number;
          updated_at?: string;
          vacancy_rate?: number;
          weekly_rent?: number;
        };
        Update: {
          architect_fees?: number;
          building_value?: number;
          construction_interest_rate?: number;
          construction_period?: number;
          construction_value?: number;
          construction_year?: number;
          council_fees?: number;
          council_rates?: number;
          created_at?: string;
          depreciation_method?: string;
          description?: string | null;
          id?: string;
          inspection_fees?: number;
          insurance?: number;
          is_construction_project?: boolean;
          is_new_property?: boolean;
          land_value?: number;
          legal_fees?: number;
          location?: string;
          name?: string;
          owner_user_id?: string;
          plant_equipment_value?: number;
          property_management?: number;
          property_method?: string;
          property_type?: string;
          purchase_price?: number;
          rental_growth_rate?: number;
          repairs?: number;
          site_costs?: number;
          stamp_duty?: number;
          updated_at?: string;
          vacancy_rate?: number;
          weekly_rent?: number;
        };
        Relationships: [];
      };
      scenarios: {
        Row: {
          created_at: string;
          id: string;
          is_core: boolean;
          name: string;
          owner_user_id: string;
          snapshot: Json | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_core?: boolean;
          name: string;
          owner_user_id: string;
          snapshot?: Json | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_core?: boolean;
          name?: string;
          owner_user_id?: string;
          snapshot?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
