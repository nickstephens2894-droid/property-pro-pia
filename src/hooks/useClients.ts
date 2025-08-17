import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Investor {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  nonTaxableIncome: number;
  hasMedicareLevy: boolean;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const { user } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInvestors = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to frontend interface
      const mappedInvestors = (data || []).map(inv => ({
        id: inv.id,
        name: inv.name,
        annualIncome: Number(inv.annual_income) || 0,
        otherIncome: Number(inv.other_income) || 0,
        nonTaxableIncome: Number(inv.non_taxable_income) || 0,
        hasMedicareLevy: Boolean(inv.has_medicare_levy),
        created_at: inv.created_at,
        updated_at: inv.updated_at
      }));
      
      setInvestors(mappedInvestors);
    } catch (error) {
      console.error('Error loading investors:', error);
      toast.error('Failed to load investors');
    }
  };

  const createInvestor = async (investorData: Omit<Investor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('investors')
        .insert({
          name: investorData.name,
          annual_income: investorData.annualIncome,
          other_income: investorData.otherIncome,
          non_taxable_income: investorData.nonTaxableIncome,
          has_medicare_levy: investorData.hasMedicareLevy,
          owner_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Investor created successfully');
      await loadInvestors();
      return data;
    } catch (error) {
      console.error('Error creating investor:', error);
      toast.error('Failed to create investor');
      return null;
    }
  };

  const updateInvestor = async (id: string, updates: Partial<Investor>) => {
    if (!user) return false;
    
    try {
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.annualIncome !== undefined) dbUpdates.annual_income = updates.annualIncome;
      if (updates.otherIncome !== undefined) dbUpdates.other_income = updates.otherIncome;
      if (updates.nonTaxableIncome !== undefined) dbUpdates.non_taxable_income = updates.nonTaxableIncome;
      if (updates.hasMedicareLevy !== undefined) dbUpdates.has_medicare_levy = updates.hasMedicareLevy;
      
      const { error } = await supabase
        .from('investors')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      toast.success('Investor updated successfully');
      await loadInvestors();
      return true;
    } catch (error) {
      console.error('Error updating investor:', error);
      toast.error('Failed to update investor');
      return false;
    }
  };

  const deleteInvestor = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('investors')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id);

      if (error) throw error;
      toast.success('Investor deleted successfully');
      await loadInvestors();
      return true;
    } catch (error) {
      console.error('Error deleting investor:', error);
      toast.error('Failed to delete investor');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadInvestors();
    }
  }, [user]);

  return {
    investors,
    loading,
    loadInvestors,
    createInvestor,
    updateInvestor,
    deleteInvestor
  };
} 