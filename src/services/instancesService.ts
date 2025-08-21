import { supabase } from '@/integrations/supabase/client';
import { Instance, CreateInstanceRequest, UpdateInstanceRequest } from '@/integrations/supabase/types';

export class InstancesService {
  // Get all instances for the current user
  static async getUserInstances(): Promise<Instance[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching instances for user:', user.id);
      
      const { data, error } = await supabase
        .from('instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Instances fetched:', data);
      return data || [];
    } catch (err) {
      console.error('Error in getUserInstances:', err);
      throw err;
    }
  }

  // Get a single instance by ID
  static async getInstance(id: string): Promise<Instance> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Instance not found');
    return data;
  }

  // Create a new instance
  static async createInstance(instanceData: CreateInstanceRequest): Promise<Instance> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Ensure user_id is set to current user
    const dataToInsert = {
      ...instanceData,
      user_id: user.id,
      status: instanceData.status || 'draft'
    };

    const { data, error } = await supabase
      .from('instances')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update an existing instance
  static async updateInstance(id: string, updates: UpdateInstanceRequest): Promise<Instance> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Instance not found');
    return data;
  }

  // Delete an instance
  static async deleteInstance(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('instances')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Update instance status
  static async updateInstanceStatus(id: string, status: 'draft' | 'active' | 'archived'): Promise<Instance> {
    return this.updateInstance(id, { status });
  }

  // Get instances by status
  static async getInstancesByStatus(status: 'draft' | 'active' | 'archived'): Promise<Instance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Search instances by name
  static async searchInstances(searchTerm: string): Promise<Instance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get instance count by status
  static async getInstanceCounts(): Promise<{ draft: number; active: number; archived: number; total: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('instances')
      .select('status')
      .eq('user_id', user.id);

    if (error) throw error;

    const counts = {
      draft: 0,
      active: 0,
      archived: 0,
      total: 0
    };

    data?.forEach(instance => {
      counts[instance.status]++;
      counts.total++;
    });

    return counts;
  }
}
