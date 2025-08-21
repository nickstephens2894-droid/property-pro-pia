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
   * Temporarily disabled service - all methods return mock data
   * This is to resolve TypeScript issues while we focus on loan calculations
   */

  static async getAll(): Promise<PropertyModel[]> {
    return [];
  }

  static async getWithFilters(filters: PropertyModelFilters): Promise<PropertyModel[]> {
    return [];
  }

  static async getById(id: string): Promise<PropertyModel | null> {
    return null;
  }

  static async create(model: CreatePropertyModelRequest): Promise<PropertyModel> {
    throw new Error('Service temporarily disabled');
  }

  static async update(id: string, updates: UpdatePropertyModelRequest): Promise<PropertyModel> {
    throw new Error('Service temporarily disabled');
  }

  static async delete(id: string): Promise<void> {
    throw new Error('Service temporarily disabled');
  }

  static async duplicate(id: string): Promise<PropertyModel> {
    throw new Error('Service temporarily disabled');
  }

  static async getByLocation(location: string): Promise<PropertyModel[]> {
    return [];
  }

  static async getByPropertyType(propertyType: string): Promise<PropertyModel[]> {
    return [];
  }

  static async getByPropertyMethod(propertyMethod: string): Promise<PropertyModel[]> {
    return [];
  }

  static async search(searchTerm: string): Promise<PropertyModel[]> {
    return [];
  }
}