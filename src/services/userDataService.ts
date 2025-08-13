import { supabase } from '@/integrations/supabase/client';
import { PropertyData } from '@/contexts/PropertyDataContext';

export interface UserScenario {
  id: string;
  name: string;
  isPrimary: boolean;
  propertyData: PropertyData;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  role: 'individual' | 'advisor';
  createdAt: string;
  updatedAt: string;
}

class UserDataService {
  // Get or create user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // First try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return {
          id: existingProfile.id,
          displayName: existingProfile.display_name,
          email: existingProfile.email,
          role: existingProfile.role,
          createdAt: existingProfile.created_at,
          updatedAt: existingProfile.updated_at
        };
      }

      // If no profile exists, create one
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: null,
          email: null,
          role: 'individual'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      return {
        id: newProfile.id,
        displayName: newProfile.display_name,
        email: newProfile.email,
        role: newProfile.role,
        createdAt: newProfile.created_at,
        updatedAt: newProfile.updated_at
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  // Save a scenario for the user
  async saveScenario(userId: string, scenario: Omit<UserScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          client_id: userId,
          name: scenario.name,
          is_core: scenario.isPrimary,
          snapshot: scenario.propertyData as any
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving scenario:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in saveScenario:', error);
      return null;
    }
  }

  // Get all scenarios for a user
  async getUserScenarios(userId: string): Promise<UserScenario[]> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('client_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching scenarios:', error);
        return [];
      }

      return data.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        isPrimary: scenario.is_core,
        propertyData: scenario.snapshot as any as PropertyData,
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at
      }));
    } catch (error) {
      console.error('Error in getUserScenarios:', error);
      return [];
    }
  }

  // Update an existing scenario
  async updateScenario(scenarioId: string, updates: Partial<UserScenario>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scenarios')
        .update({
          name: updates.name,
          is_core: updates.isPrimary,
          snapshot: updates.propertyData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', scenarioId);

      if (error) {
        console.error('Error updating scenario:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateScenario:', error);
      return false;
    }
  }

  // Delete a scenario
  async deleteScenario(scenarioId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', scenarioId);

      if (error) {
        console.error('Error deleting scenario:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteScenario:', error);
      return false;
    }
  }

  // Get a specific scenario by ID
  async getScenario(scenarioId: string): Promise<UserScenario | null> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single();

      if (error) {
        console.error('Error fetching scenario:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        isPrimary: data.is_core,
        propertyData: data.snapshot as any as PropertyData,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in getScenario:', error);
      return null;
    }
  }

  // Set a scenario as primary (and unset others)
  async setPrimaryScenario(userId: string, scenarioId: string): Promise<boolean> {
    try {
      // First, unset all primary scenarios for this user
      await supabase
        .from('scenarios')
        .update({ is_core: false })
        .eq('client_id', userId);

      // Then set the specified scenario as primary
      const { error } = await supabase
        .from('scenarios')
        .update({ is_core: true })
        .eq('id', scenarioId);

      if (error) {
        console.error('Error setting primary scenario:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setPrimaryScenario:', error);
      return false;
    }
  }
}

export const userDataService = new UserDataService();