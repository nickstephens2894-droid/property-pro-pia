
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
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
