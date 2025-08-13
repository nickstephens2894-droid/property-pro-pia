import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Property {
  id: string;
  name: string;
  type: 'House' | 'Apartment' | 'Townhouse' | 'Unit' | 'Land' | 'Other';
  purchasePrice: number;
  weeklyRent: number;
  location?: string;
  notes?: string;
  status: 'current' | 'new';
  client_id: string;
  investors: Array<{
    id: string;
    name: string;
    ownership_percentage: number;
  }>;
  created_at: string;
  updated_at: string;
}

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProperties = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First get all clients owned by this user
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('owner_user_id', user.id);

      if (clientsError) throw clientsError;
      
      if (!clients || clients.length === 0) {
        setProperties([]);
        return;
      }

      const clientIds = clients.map(c => c.id);
      
      // Get properties linked to these clients
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          type,
          purchase_price,
          weekly_rent,
          location,
          notes,
          status,
          client_id,
          created_at,
          updated_at
        `)
        .in('client_id', clientIds);

      if (propertiesError) throw propertiesError;

      // For each property, get the investors
      const propertiesWithInvestors = await Promise.all(
        (propertiesData || []).map(async (prop) => {
          const { data: investors, error: investorsError } = await supabase
            .from('investors')
            .select('id, name, ownership_percentage')
            .eq('client_id', prop.client_id);

          if (investorsError) {
            console.error('Error loading investors for property:', investorsError);
          }

          return {
            id: prop.id,
            name: prop.name,
            type: prop.type,
            purchasePrice: Number(prop.purchase_price) || 0,
            weeklyRent: Number(prop.weekly_rent) || 0,
            location: prop.location || '',
            notes: prop.notes || '',
            status: prop.status,
            client_id: prop.client_id,
            investors: investors || [],
            created_at: prop.created_at,
            updated_at: prop.updated_at
          } as Property;
        })
      );
      
      const sortedProperties = propertiesWithInvestors.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setProperties(sortedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'investors'> & { clientId: string }) => {
    try {
      if (!propertyData.clientId) {
        throw new Error('A client must be selected');
      }

      // Create the property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          name: propertyData.name,
          type: propertyData.type,
          purchase_price: propertyData.purchasePrice,
          weekly_rent: propertyData.weeklyRent,
          location: propertyData.location,
          notes: propertyData.notes,
          status: propertyData.status,
          client_id: propertyData.clientId
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      toast.success('Property created successfully');
      await loadProperties();
      return property;
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
      return null;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property> & { clientId?: string }) => {
    try {
      // Map frontend fields to database fields
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
      if (updates.weeklyRent !== undefined) dbUpdates.weekly_rent = updates.weeklyRent;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
      
      // Add updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();

      // Update property
      const { error: propertyError } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id);

      if (propertyError) throw propertyError;

      toast.success('Property updated successfully');
      await loadProperties();
      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
      return false;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      // Delete property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Property deleted successfully');
      await loadProperties();
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  return {
    properties,
    loading,
    loadProperties,
    createProperty,
    updateProperty,
    deleteProperty
  };
}