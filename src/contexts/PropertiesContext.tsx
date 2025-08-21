import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropertyModelsService } from '@/services/propertyModelsService';
import { PropertyModel, CreatePropertyModelRequest, UpdatePropertyModelRequest } from '@/types/propertyModels';

interface PropertiesContextType {
  properties: PropertyModel[];
  loading: boolean;
  error: string | null;
  addProperty: (property: CreatePropertyModelRequest) => Promise<void>;
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
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

interface PropertiesProviderProps {
  children: React.ReactNode;
}

// Re-export PropertyModel for external use
export type { PropertyModel } from '@/types/propertyModels';

export const PropertiesProvider: React.FC<PropertiesProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<PropertyModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load properties from Supabase on mount
  useEffect(() => {
    refreshProperties();
  }, []);

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

  const addProperty = async (propertyData: CreatePropertyModelRequest) => {
    try {
      setError(null);
      const newProperty = await PropertyModelsService.create(propertyData);
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
