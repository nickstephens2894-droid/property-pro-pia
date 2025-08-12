import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Scenario {
  id: string;
  name: string;
  client_id: string;
  is_core: boolean;
  snapshot: any;
  created_at: string;
  updated_at: string;
}

export function useScenarios() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);

  const loadScenarios = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get all clients owned by this user
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_user_id', user.id);

      if (clientsError) throw clientsError;
      
      if (!clients || clients.length === 0) {
        setScenarios([]);
        return;
      }

      const clientIds = clients.map(c => c.id);
      
      // Then get all scenarios for these clients
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .in('client_id', clientIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast.error('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const createScenario = async (scenarioData: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert(scenarioData)
        .select()
        .single();

      if (error) throw error;
      toast.success('Scenario created successfully');
      await loadScenarios();
      return data;
    } catch (error) {
      console.error('Error creating scenario:', error);
      toast.error('Failed to create scenario');
      return null;
    }
  };

  const updateScenario = async (id: string, updates: Partial<Scenario>) => {
    try {
      const { error } = await supabase
        .from('scenarios')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Scenario updated successfully');
      await loadScenarios();
      return true;
    } catch (error) {
      console.error('Error updating scenario:', error);
      toast.error('Failed to update scenario');
      return false;
    }
  };

  const deleteScenario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Scenario deleted successfully');
      await loadScenarios();
      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast.error('Failed to delete scenario');
      return false;
    }
  };

  const duplicateScenario = async (scenario: Scenario) => {
    try {
      const { error } = await supabase
        .from('scenarios')
        .insert({
          name: `${scenario.name} (Copy)`,
          client_id: scenario.client_id,
          is_core: false,
          snapshot: scenario.snapshot
        });

      if (error) throw error;
      toast.success('Scenario duplicated successfully');
      await loadScenarios();
      return true;
    } catch (error) {
      console.error('Error duplicating scenario:', error);
      toast.error('Failed to duplicate scenario');
      return false;
    }
  };

  const setPrimaryScenario = async (scenarioId: string) => {
    try {
      // First, get the scenario to find its client_id
      const { data: scenario, error: fetchError } = await supabase
        .from('scenarios')
        .select('client_id')
        .eq('id', scenarioId)
        .single();

      if (fetchError) throw fetchError;
      if (!scenario) throw new Error('Scenario not found');

      // First, unset all primary scenarios for this client
      await supabase
        .from('scenarios')
        .update({ is_core: false })
        .eq('client_id', scenario.client_id);

      // Then set the selected scenario as primary
      const { error } = await supabase
        .from('scenarios')
        .update({ is_core: true })
        .eq('id', scenarioId);

      if (error) throw error;
      toast.success('Primary scenario updated');
      await loadScenarios();
      return true;
    } catch (error) {
      console.error('Error setting primary scenario:', error);
      toast.error('Failed to update primary scenario');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user]);

  return {
    scenarios,
    loading,
    loadScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    setPrimaryScenario
  };
} 