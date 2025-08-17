import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface LoanFund {
  id: string;
  name: string;
  
  // Construction Details
  constructionPeriod: number;
  constructionInterestRate: number;
  progressPayment: {
    weeks: number;
    percentage: number;
    description: string;
  };
  
  // Financing
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
}

export interface CreateLoanFundData {
  name: string;
  constructionPeriod: number;
  constructionInterestRate: number;
  progressPayment: {
    weeks: number;
    percentage: number;
    description: string;
  };
  loanBalance: number;
  interestRate: number;
  loanTerm: number;
  loanType: string;
  ioTerm: number;
  loanPurpose: string;
  fundsType: string;
  fundAmount: number;
  fundReturn: number;
}

export function useLoanFunds() {
  const { user } = useAuth();
  const [loanFunds, setLoanFunds] = useState<LoanFund[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLoanFunds = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_funds')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to frontend interface
      const mappedLoanFunds = (data || []).map(fund => ({
        id: fund.id,
        name: fund.name,
        constructionPeriod: Number(fund.construction_period) || 9,
        constructionInterestRate: Number(fund.construction_interest_rate) || 7.5,
        progressPayment: {
          weeks: Number(fund.progress_payment_weeks) || 4,
          percentage: Number(fund.progress_payment_percentage) || 5,
          description: fund.progress_payment_description || '4 Weeks - 5% of construction price'
        },
        loanBalance: Number(fund.loan_balance) || 0,
        interestRate: Number(fund.interest_rate) || 0,
        loanTerm: Number(fund.loan_term) || 30,
        loanType: fund.loan_type || 'IO,P&I',
        ioTerm: Number(fund.io_term) || 5,
        loanPurpose: fund.loan_purpose || 'Investment Mortgage',
        fundsType: fund.funds_type || 'Savings',
        fundAmount: Number(fund.fund_amount) || 0,
        fundReturn: Number(fund.fund_return) || 0,
        created_at: fund.created_at,
        updated_at: fund.updated_at
      }));
      
      setLoanFunds(mappedLoanFunds);
    } catch (error) {
      console.error('Error loading loan funds:', error);
      toast.error('Failed to load loan funds');
    } finally {
      setLoading(false);
    }
  };

  const createLoanFund = async (fundData: CreateLoanFundData) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('loan_funds')
        .insert({
          name: fundData.name,
          construction_period: fundData.constructionPeriod,
          construction_interest_rate: fundData.constructionInterestRate,
          progress_payment_weeks: fundData.progressPayment.weeks,
          progress_payment_percentage: fundData.progressPayment.percentage,
          progress_payment_description: fundData.progressPayment.description,
          loan_balance: fundData.loanBalance,
          interest_rate: fundData.interestRate,
          loan_term: fundData.loanTerm,
          loan_type: fundData.loanType,
          io_term: fundData.ioTerm,
          loan_purpose: fundData.loanPurpose,
          funds_type: fundData.fundsType,
          fund_amount: fundData.fundAmount,
          fund_return: fundData.fundReturn,
          owner_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Loan fund created successfully');
      await loadLoanFunds();
      return data;
    } catch (error) {
      console.error('Error creating loan fund:', error);
      toast.error('Failed to create loan fund');
      return null;
    }
  };

  const updateLoanFund = async (id: string, updates: Partial<CreateLoanFundData>) => {
    if (!user) return false;
    
    try {
      const dbUpdates: any = {};
      
      // Map frontend field names to database column names
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.constructionPeriod !== undefined) dbUpdates.construction_period = updates.constructionPeriod;
      if (updates.constructionInterestRate !== undefined) dbUpdates.construction_interest_rate = updates.constructionInterestRate;
      if (updates.progressPayment !== undefined) {
        dbUpdates.progress_payment_weeks = updates.progressPayment.weeks;
        dbUpdates.progress_payment_percentage = updates.progressPayment.percentage;
        dbUpdates.progress_payment_description = updates.progressPayment.description;
      }
      if (updates.loanBalance !== undefined) dbUpdates.loan_balance = updates.loanBalance;
      if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
      if (updates.loanTerm !== undefined) dbUpdates.loan_term = updates.loanTerm;
      if (updates.loanType !== undefined) dbUpdates.loan_type = updates.loanType;
      if (updates.ioTerm !== undefined) dbUpdates.io_term = updates.ioTerm;
      if (updates.loanPurpose !== undefined) dbUpdates.loan_purpose = updates.loanPurpose;
      if (updates.fundsType !== undefined) dbUpdates.funds_type = updates.fundsType;
      if (updates.fundAmount !== undefined) dbUpdates.fund_amount = updates.fundAmount;
      if (updates.fundReturn !== undefined) dbUpdates.fund_return = updates.fundReturn;
      
      const { error } = await supabase
        .from('loan_funds')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      toast.success('Loan fund updated successfully');
      await loadLoanFunds();
      return true;
    } catch (error) {
      console.error('Error updating loan fund:', error);
      toast.error('Failed to update loan fund');
      return false;
    }
  };

  const deleteLoanFund = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('loan_funds')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      toast.success('Loan fund deleted successfully');
      await loadLoanFunds();
      return true;
    } catch (error) {
      console.error('Error deleting loan fund:', error);
      toast.error('Failed to delete loan fund');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadLoanFunds();
    }
  }, [user]);

  return {
    loanFunds,
    loading,
    loadLoanFunds,
    createLoanFund,
    updateLoanFund,
    deleteLoanFund
  };
}
