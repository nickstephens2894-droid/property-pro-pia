import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Database } from '@/integrations/supabase/types';

type Instance = Database['public']['Tables']['instances']['Row'];
type UpdateInstanceRequest = Database['public']['Tables']['instances']['Update'];
import { InstancesService, CreateInstanceRequestFrontend } from '@/services/instancesService';
import { useAuth } from './AuthContext';

interface InstancesContextType {
  instances: Instance[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createInstance: (data: CreateInstanceRequestFrontend) => Promise<Instance>;
  updateInstance: (id: string, updates: UpdateInstanceRequest) => Promise<Instance>;
  deleteInstance: (id: string) => Promise<void>;
  updateInstanceStatus: (id: string, status: 'draft' | 'active' | 'archived') => Promise<Instance>;
  
  // Data operations
  refreshInstances: () => Promise<void>;
  getInstance: (id: string) => Instance | undefined;
  getInstancesByStatus: (status: 'draft' | 'active' | 'archived') => Instance[];
  getInstanceCounts: () => Promise<{ draft: number; active: number; archived: number; total: number }>;
  searchInstances: (searchTerm: string) => Promise<Instance[]>;
  
  // State management
  setError: (error: string | null) => void;
  clearError: () => void;
}

const InstancesContext = createContext<InstancesContextType | undefined>(undefined);

export const useInstances = () => {
  const context = useContext(InstancesContext);
  if (context === undefined) {
    throw new Error('useInstances must be used within an InstancesProvider');
  }
  return context;
};

interface InstancesProviderProps {
  children: ReactNode;
}

export const InstancesProvider = ({ children }: InstancesProviderProps) => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load instances when user changes
  useEffect(() => {
    if (user) {
      refreshInstances();
    } else {
      setInstances([]);
    }
  }, [user]);

  const refreshInstances = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading instances for user:', user.id);
      const data = await InstancesService.getUserInstances();
      console.log('Instances loaded successfully:', data);
      setInstances(data);
    } catch (err) {
      console.error('Error loading instances:', err);
      // Don't set error for now, just log it and show empty state
      setError(null);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async (data: CreateInstanceRequestFrontend): Promise<Instance> => {
    try {
      setError(null);
      const newInstance = await InstancesService.createInstance(data);
      setInstances(prev => [newInstance, ...prev]);
      return newInstance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create instance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateInstance = async (id: string, updates: UpdateInstanceRequest): Promise<Instance> => {
    try {
      setError(null);
      const updatedInstance = await InstancesService.updateInstance(id, updates);
      setInstances(prev => prev.map(instance => 
        instance.id === id ? updatedInstance : instance
      ));
      return updatedInstance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update instance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteInstance = async (id: string): Promise<void> => {
    try {
      setError(null);
      await InstancesService.deleteInstance(id);
      setInstances(prev => prev.filter(instance => instance.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete instance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateInstanceStatus = async (id: string, status: 'draft' | 'active' | 'archived'): Promise<Instance> => {
    try {
      setError(null);
      const updatedInstance = await InstancesService.updateInstanceStatus(id, status);
      setInstances(prev => prev.map(instance => 
        instance.id === id ? updatedInstance : instance
      ));
      return updatedInstance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update instance status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getInstance = (id: string): Instance | undefined => {
    return instances.find(instance => instance.id === id);
  };

  const getInstancesByStatus = (status: 'draft' | 'active' | 'archived'): Instance[] => {
    return instances.filter(instance => instance.status === status);
  };

  const getInstanceCounts = async (): Promise<{ draft: number; active: number; archived: number; total: number }> => {
    try {
      return await InstancesService.getInstanceCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get instance counts');
      return { draft: 0, active: 0, archived: 0, total: 0 };
    }
  };

  const searchInstances = async (searchTerm: string): Promise<Instance[]> => {
    try {
      setError(null);
      return await InstancesService.searchInstances(searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search instances';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  const value: InstancesContextType = {
    instances,
    loading,
    error,
    createInstance,
    updateInstance,
    deleteInstance,
    updateInstanceStatus,
    refreshInstances,
    getInstance,
    getInstancesByStatus,
    getInstanceCounts,
    searchInstances,
    setError,
    clearError
  };

  return (
    <InstancesContext.Provider value={value}>
      {children}
    </InstancesContext.Provider>
  );
};
