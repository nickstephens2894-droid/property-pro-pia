import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Investor {
  id: string;
  name: string;
  annualIncome: number;
  otherIncome: number;
  nonTaxableIncome?: number;
  hasMedicareLevy: boolean;
  ownershipPercentage: number;
  loanSharePercentage: number;
  cashContribution: number;
  client_id: string;
}

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadInvestors = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to frontend interface
      const mappedInvestors = (data || []).map(inv => ({
        id: inv.id,
        name: inv.name,
        annualIncome: Number(inv.annual_income) || 0,
        otherIncome: Number(inv.other_income) || 0,
        hasMedicareLevy: Boolean(inv.has_medicare_levy),
        ownershipPercentage: Number(inv.ownership_percentage) || 0,
        loanSharePercentage: Number(inv.loan_share_percentage) || 0,
        cashContribution: Number(inv.cash_contribution) || 0,
        client_id: inv.client_id,
        created_at: inv.created_at,
        updated_at: inv.updated_at
      }));
      
      setInvestors(mappedInvestors);
    } catch (error) {
      console.error('Error loading investors:', error);
      toast.error('Failed to load investors');
    }
  };

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          owner_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Client created successfully');
      await loadClients();
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Client updated successfully');
      await loadClients();
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return false;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      // Delete associated investors first
      await supabase
        .from('investors')
        .delete()
        .eq('client_id', id);

      // Delete client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Client deleted successfully');
      await loadClients();
      await loadInvestors();
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  };

  const createInvestor = async (investorData: Omit<Investor, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('investors')
        .insert({
          name: investorData.name,
          annual_income: investorData.annualIncome,
          other_income: investorData.otherIncome,
          non_taxable_income: investorData.nonTaxableIncome,
          has_medicare_levy: investorData.hasMedicareLevy,
          ownership_percentage: investorData.ownershipPercentage,
          loan_share_percentage: investorData.loanSharePercentage,
          cash_contribution: investorData.cashContribution,
          client_id: investorData.client_id
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
    try {
      // Map frontend fields to database fields
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.annualIncome !== undefined) dbUpdates.annual_income = updates.annualIncome;
      if (updates.otherIncome !== undefined) dbUpdates.other_income = updates.otherIncome;
      if (updates.nonTaxableIncome !== undefined) dbUpdates.non_taxable_income = updates.nonTaxableIncome;
      if (updates.hasMedicareLevy !== undefined) dbUpdates.has_medicare_levy = updates.hasMedicareLevy;
      if (updates.ownershipPercentage !== undefined) dbUpdates.ownership_percentage = updates.ownershipPercentage;
      if (updates.loanSharePercentage !== undefined) dbUpdates.loan_share_percentage = updates.loanSharePercentage;
      if (updates.cashContribution !== undefined) dbUpdates.cash_contribution = updates.cashContribution;
      if (updates.client_id !== undefined) dbUpdates.client_id = updates.client_id;
      
      // Add updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('investors')
        .update(dbUpdates)
        .eq('id', id);

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
    try {
      const { error } = await supabase
        .from('investors')
        .delete()
        .eq('id', id);

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

  const getInvestorsForClient = (clientId: string) => {
    return investors.filter(investor => investor.client_id === clientId);
  };

  useEffect(() => {
    if (user) {
      loadClients();
      loadInvestors();
    }
  }, [user]);

  return {
    clients,
    investors,
    loading,
    loadClients,
    loadInvestors,
    createClient,
    updateClient,
    deleteClient,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    getInvestorsForClient
  };
} 