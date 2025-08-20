import { supabase } from '@/integrations/supabase/client';
import { 
  PropertyModel, 
  CreatePropertyModelRequest, 
  UpdatePropertyModelRequest,
  PropertyModelFilters 
} from '@/types/propertyModels';

export class PropertyModelsService {
  private static TABLE_NAME = 'property_models';

  /**
   * Get all property models for the current user
   */
  static async getAll(): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models:', error);
      throw new Error(`Failed to fetch property models: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get property models with filters
   */
  static async getWithFilters(filters: PropertyModelFilters): Promise<PropertyModel[]> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select('*');

    // Apply search filter
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,property_type.ilike.%${filters.search}%`);
    }

    // Apply property type filter
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }

    // Apply property method filter
    if (filters.property_method) {
      query = query.eq('property_method', filters.property_method);
    }

    // Apply location filter
    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    // Apply price range filters
    if (filters.min_price !== undefined) {
      query = query.gte('purchase_price', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte('purchase_price', filters.max_price);
    }

    // Apply yield range filters
    if (filters.min_yield !== undefined || filters.max_yield !== undefined) {
      // Note: Yield calculation would need to be done in the database or post-processing
      // For now, we'll filter by weekly rent which affects yield
      if (filters.min_yield !== undefined) {
        query = query.gte('weekly_rent', (filters.min_yield / 100) * 52); // Approximate
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models with filters:', error);
      throw new Error(`Failed to fetch property models: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single property model by ID
   */
  static async getById(id: string): Promise<PropertyModel | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      console.error('Error fetching property model:', error);
      throw new Error(`Failed to fetch property model: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new property model
   */
  static async create(model: CreatePropertyModelRequest): Promise<PropertyModel> {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Add the owner_user_id to the model data
    const modelWithOwner = {
      ...model,
      owner_user_id: user.id
    };

    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([modelWithOwner])
      .select()
      .single();

    if (error) {
      console.error('Error creating property model:', error);
      throw new Error(`Failed to create property model: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing property model
   */
  static async update(id: string, updates: UpdatePropertyModelRequest): Promise<PropertyModel> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property model:', error);
      throw new Error(`Failed to update property model: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a property model
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property model:', error);
      throw new Error(`Failed to delete property model: ${error.message}`);
    }
  }

  /**
   * Duplicate a property model
   */
  static async duplicate(id: string): Promise<PropertyModel> {
    // First get the original model
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Property model not found');
    }

    // Create a copy with modified name
    const copy: CreatePropertyModelRequest = {
      ...original,
      name: `${original.name} (Copy)`,
      description: original.description ? `${original.description} (Copy)` : null,
    };

    // Remove the id, owner_user_id, and timestamps (these will be set automatically)
    delete (copy as any).id;
    delete (copy as any).owner_user_id;
    delete (copy as any).created_at;
    delete (copy as any).updated_at;

    return await this.create(copy);
  }

  /**
   * Get property models by location
   */
  static async getByLocation(location: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by location:', error);
      throw new Error(`Failed to fetch property models by location: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get property models by property type
   */
  static async getByPropertyType(propertyType: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('property_type', propertyType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by type:', error);
      throw new Error(`Failed to fetch property models by type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get property models by property method
   */
  static async getByPropertyMethod(propertyMethod: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('property_method', propertyMethod)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by method:', error);
      throw new Error(`Failed to fetch property models by method: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Search property models by text
   */
  static async search(searchTerm: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching property models:', error);
      throw new Error(`Failed to search property models: ${error.message}`);
    }

    return data || [];
  }
}
