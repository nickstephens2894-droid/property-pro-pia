import { supabase } from '@/integrations/supabase/client';
import { 
  PropertyModel, 
  CreatePropertyModelRequest, 
  UpdatePropertyModelRequest,
  PropertyModelFilters 
} from '@/types/propertyModels';

export class PropertyModelsService {
  private static TABLE_NAME = 'property_models';

  static async getAll(): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models:', error);
      throw new Error('Failed to fetch property models');
    }

    return data || [];
  }

  static async getWithFilters(filters: PropertyModelFilters): Promise<PropertyModel[]> {
    let query = supabase.from(this.TABLE_NAME).select('*');

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }

    if (filters.propertyMethod) {
      query = query.eq('property_method', filters.propertyMethod);
    }

    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models with filters:', error);
      throw new Error('Failed to fetch property models');
    }

    return data || [];
  }

  static async getById(id: string): Promise<PropertyModel | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching property model:', error);
      throw new Error('Failed to fetch property model');
    }

    return data;
  }

  static async create(model: CreatePropertyModelRequest): Promise<PropertyModel> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([model])
      .select()
      .single();

    if (error) {
      console.error('Error creating property model:', error);
      throw new Error('Failed to create property model');
    }

    return data;
  }

  static async update(id: string, updates: UpdatePropertyModelRequest): Promise<PropertyModel> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property model:', error);
      throw new Error('Failed to update property model');
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting property model:', error);
      throw new Error('Failed to delete property model');
    }
  }

  static async duplicate(id: string): Promise<PropertyModel> {
    // First get the original property
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Property model not found');
    }

    // Create a copy with a new name
    const duplicateData = {
      ...original,
      id: undefined, // Remove id to create new record
      name: `${original.name} (Copy)`,
      created_at: undefined, // Let the database set this
      updated_at: undefined, // Let the database set this
    };

    return await this.create(duplicateData);
  }

  static async getByLocation(location: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by location:', error);
      throw new Error('Failed to fetch property models');
    }

    return data || [];
  }

  static async getByPropertyType(propertyType: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('property_type', propertyType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by type:', error);
      throw new Error('Failed to fetch property models');
    }

    return data || [];
  }

  static async getByPropertyMethod(propertyMethod: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('property_method', propertyMethod)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by method:', error);
      throw new Error('Failed to fetch property models');
    }

    return data || [];
  }

  static async search(searchTerm: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching property models:', error);
      throw new Error('Failed to search property models');
    }

    return data || [];
  }
}