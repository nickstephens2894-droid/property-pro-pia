// Funding-related type definitions
// This file contains all TypeScript interfaces for the funding system

export interface InstanceFunding {
  id: string;
  instance_id: string;
  fund_id: string;
  fund_type: "loan" | "cash";
  amount_allocated: number;
  amount_used: number;
  allocation_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields from fund tables
  fund_name?: string;
  fund_available_amount?: number;
  fund_total_amount?: number;
  instance_name?: string;
}

export interface CreateInstanceFundingRequest {
  instance_id: string;
  fund_id: string;
  fund_type: "loan" | "cash";
  amount_allocated: number;
  notes?: string;
}

export interface UpdateInstanceFundingRequest {
  amount_allocated?: number;
  amount_used?: number;
  notes?: string;
}

export interface CashFund {
  id: string;
  name: string;
  fund_category: "Cash" | "Debt";
  fund_type: string; // Subtype for Cash funds (Savings, Term Deposit, etc.)
  total_amount: number;
  available_amount: number;
  return_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCashFundRequest {
  name: string;
  fund_category: "Cash" | "Debt";
  fund_type: string;
  total_amount: number;
  return_rate: number;
}

export interface UpdateCashFundRequest {
  name?: string;
  fund_category?: "Cash" | "Debt";
  fund_type?: string;
  total_amount?: number;
  return_rate?: number;
}

export interface LoanFundWithUsage {
  id: string;
  name: string;
  fund_category: "Cash" | "Debt";
  loanBalance: number;
  interestRate: number;
  loanTerm: number;
  loanType: string;
  ioTerm: number;
  loanPurpose: string;
  fundsType: string;
  fundAmount: number;
  fundReturn: number;
  created_at: string;
  updated_at: string;
  // Usage tracking fields
  available_amount: number;
  used_amount: number;
  usage_percentage: number;
}

export interface FundUsageSummary {
  total_allocated: number;
  total_used: number;
  available_amount: number;
  usage_percentage: number;
}

export interface FundingSummary {
  totalRequired: number;
  totalAllocated: number;
  totalUsed: number;
  shortfall: number;
  surplus: number;
  fundings: InstanceFunding[];
}

export interface FundAvailabilityCheck {
  isAvailable: boolean;
  availableAmount: number;
  requestedAmount: number;
  message?: string;
}
