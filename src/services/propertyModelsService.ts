import { supabase } from '@/integrations/supabase/client';
import { 
  PropertyModel, 
  CreatePropertyModelRequest, 
  UpdatePropertyModelRequest,
  PropertyModelFilters 
} from '@/types/propertyModels';

export class PropertyModelsService {
  static async getAll(): Promise<PropertyModel[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any[]) || [];
  }

  static async getWithFilters(filters: PropertyModelFilters): Promise<PropertyModel[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('property_models')
      .select('*')
      .eq('owner_user_id', user.id);

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.property_method) {
      query = query.eq('property_method', filters.property_method);
    }
    if (filters.location) {
      query = query.eq('location', filters.location);
    }
    if (filters.min_price) {
      query = query.gte('purchase_price', filters.min_price);
    }
    if (filters.max_price) {
      query = query.lte('purchase_price', filters.max_price);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data as any[]) || [];
  }

  static async getById(id: string): Promise<PropertyModel | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('id', id)
      .eq('owner_user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as any;
  }

  static async create(model: CreatePropertyModelRequest): Promise<PropertyModel> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .insert({
        ...model,
        owner_user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  static async update(id: string, updates: UpdatePropertyModelRequest): Promise<PropertyModel> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .update(updates)
      .eq('id', id)
      .eq('owner_user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  static async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('property_models')
      .delete()
      .eq('id', id)
      .eq('owner_user_id', user.id);

    if (error) throw error;
  }

  static async duplicate(id: string): Promise<PropertyModel> {
    const original = await this.getById(id);
    if (!original) throw new Error('Property model not found');

    const { id: _, owner_user_id: __, created_at: ___, updated_at: ____, ...duplicateData } = original;
    const duplicatedModel: CreatePropertyModelRequest = {
      ...duplicateData,
      name: `${original.name} (Copy)`
    };

    return this.create(duplicatedModel);
  }

  static async getByLocation(location: string): Promise<PropertyModel[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('owner_user_id', user.id)
      .eq('location', location)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any[]) || [];
  }

  static async getByPropertyType(propertyType: string): Promise<PropertyModel[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('owner_user_id', user.id)
      .eq('property_type', propertyType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any[]) || [];
  }

  static async getByPropertyMethod(propertyMethod: string): Promise<PropertyModel[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('property_models')
      .select('*')
      .eq('owner_user_id', user.id)
      .eq('property_method', propertyMethod)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any[]) || [];
  }

  static async search(searchTerm: string): Promise<PropertyModel[]> {
    return this.getWithFilters({ search: searchTerm });
  }
}