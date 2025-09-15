import { supabase } from '@/integrations/supabase/client';
import { 
  PropertyModel, 
  CreatePropertyModelRequest, 
  UpdatePropertyModelRequest,
  PropertyModelFilters 
} from '@/types/propertyModels';

export class PropertyModelsService {
  static async getAll(): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models:', error);
      throw new Error('Failed to fetch property models');
    }

    return (data || []) as PropertyModel[];
  }

  static async getWithFilters(filters: PropertyModelFilters): Promise<PropertyModel[]> {
    let query = supabase.from('property_models').select('*');

    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }

    if (filters.property_method) {
      query = query.eq('property_method', filters.property_method);
    }

    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models with filters:', error);
      throw new Error('Failed to fetch property models');
    }

    return (data || []) as PropertyModel[];
  }

  static async getById(id: string): Promise<PropertyModel | null> {
    const { data, error } = await supabase
      .from('property_models')
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

    return data as PropertyModel;
  }

  static async create(model: CreatePropertyModelRequest): Promise<PropertyModel> {
    const { data, error } = await supabase
      .from('property_models')
      .insert(model)
      .select()
      .single();

    if (error) {
      console.error('Error creating property model:', error);
      throw new Error('Failed to create property model');
    }

    return data as PropertyModel;
  }

  static async update(id: string, updates: UpdatePropertyModelRequest): Promise<PropertyModel> {
    const { data, error } = await supabase
      .from('property_models')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property model:', error);
      throw new Error('Failed to update property model');
    }

    return data as PropertyModel;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('property_models')
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
      .from('property_models')
      .select('*')
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by location:', error);
      throw new Error('Failed to fetch property models');
    }

    return (data || []) as PropertyModel[];
  }

  static async getByPropertyType(propertyType: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('property_type', propertyType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by type:', error);
      throw new Error('Failed to fetch property models');
    }

    return (data || []) as PropertyModel[];
  }

  static async getByPropertyMethod(propertyMethod: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('property_method', propertyMethod)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property models by method:', error);
      throw new Error('Failed to fetch property models');
    }

    return (data || []) as PropertyModel[];
  }

  static async search(searchTerm: string): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching property models:', error);
      throw new Error('Failed to search property models');
    }

    return (data || []) as PropertyModel[];
  }

  static async createBatch(models: CreatePropertyModelRequest[]): Promise<PropertyModel[]> {
    const { data, error } = await supabase
      .from('property_models')
      .insert(models)
      .select();

    if (error) {
      console.error('Error creating property models batch:', error);
      throw new Error('Failed to create property models');
    }

    return (data || []) as PropertyModel[];
  }
}