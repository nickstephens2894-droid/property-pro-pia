import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PropertyModelsService } from '@/services/propertyModelsService';
import { 
  PropertyModel, 
  CreatePropertyFormData,
  CreatePropertyModelRequest, 
  UpdatePropertyModelRequest 
} from '@/types/propertyModels';
import { useAuth } from './AuthContext';

// Export PropertyModel for use in other components
export type { PropertyModel };

interface PropertiesContextType {
  properties: PropertyModel[];
  loading: boolean;
  error: string | null;
  addProperty: (propertyData: CreatePropertyFormData) => Promise<void>;
  updateProperty: (id: string, updates: UpdatePropertyModelRequest) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => PropertyModel | undefined;
  refreshPropertyById: (id: string) => Promise<PropertyModel | null>;
  duplicateProperty: (id: string) => Promise<void>;
  refreshProperties: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

interface PropertiesProviderProps {
  children: ReactNode;
}

export const PropertiesProvider: React.FC<PropertiesProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<PropertyModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Auto-load properties when user is authenticated
  useEffect(() => {
    if (user) {
      refreshProperties();
    }
  }, [user]);

  const refreshProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PropertyModelsService.getAll();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (propertyData: CreatePropertyFormData) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('User must be authenticated to create a property');
      }

      // Add the owner_user_id to the property data
      const propertyWithOwner: CreatePropertyModelRequest = {
        ...propertyData,
        owner_user_id: user.id
      };

      const newProperty = await PropertyModelsService.create(propertyWithOwner);
      setProperties(prev => [newProperty, ...prev]);
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to create property');
      throw err;
    }
  };

  const updateProperty = async (id: string, updates: UpdatePropertyModelRequest) => {
    try {
      setError(null);
      const updatedProperty = await PropertyModelsService.update(id, updates);
      setProperties(prev => prev.map(property =>
        property.id === id ? updatedProperty : property
      ));
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      setError(null);
      await PropertyModelsService.delete(id);
      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete property');
      throw err;
    }
  };

  const getPropertyById = (id: string) => {
    return properties.find(property => property.id === id);
  };

  const refreshPropertyById = async (id: string) => {
    try {
      const property = await PropertyModelsService.getById(id);
      if (property) {
        setProperties(prev => prev.map(p => p.id === id ? property : p));
      }
      return property;
    } catch (err) {
      console.error('Error refreshing property:', err);
      throw err;
    }
  };

  const duplicateProperty = async (id: string) => {
    try {
      setError(null);
      const duplicatedProperty = await PropertyModelsService.duplicate(id);
      setProperties(prev => [duplicatedProperty, ...prev]);
    } catch (err) {
      console.error('Error duplicating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate property');
      throw err;
    }
  };

  const value: PropertiesContextType = {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
    refreshPropertyById,
    duplicateProperty,
    refreshProperties
  };

  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  );
};
