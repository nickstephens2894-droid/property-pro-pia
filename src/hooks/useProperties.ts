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
  clients: Array<{
    client_id: string;
    ownership_percentage: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PropertyClient {
  id: string;
  property_id: string;
  client_id: string;
  ownership_percentage: number;
  created_at: string;
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
      
      // Get properties linked to these clients through property_clients junction table
      const { data: propertyClients, error: pcError } = await supabase
        .from('property_clients')
        .select(`
          property_id,
          client_id,
          ownership_percentage,
          properties (
            id,
            name,
            type,
            purchase_price,
            weekly_rent,
            location,
            notes,
            status,
            created_at,
            updated_at
          )
        `)
        .in('client_id', clientIds);

      if (pcError) throw pcError;
      
      // Group properties by property_id and map to Property interface
      const propertyMap = new Map<string, Property>();
      
      propertyClients?.forEach(pc => {
        const prop = pc.properties;
        if (prop && !propertyMap.has(prop.id)) {
          propertyMap.set(prop.id, {
            id: prop.id,
            name: prop.name,
            type: prop.type,
            purchasePrice: Number(prop.purchase_price) || 0,
            weeklyRent: Number(prop.weekly_rent) || 0,
            location: prop.location || '',
            notes: prop.notes || '',
            status: prop.status,
            clients: [],
            created_at: prop.created_at,
            updated_at: prop.updated_at
          });
        }
        
        if (prop && propertyMap.has(prop.id)) {
          const property = propertyMap.get(prop.id)!;
          property.clients.push({
            client_id: pc.client_id,
            ownership_percentage: Number(pc.ownership_percentage) || 100
          });
        }
      });
      
      const mappedProperties = Array.from(propertyMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'clients'> & { clientIds: string[] }) => {
    try {
      if (!propertyData.clientIds || propertyData.clientIds.length === 0) {
        throw new Error('At least one client must be selected');
      }

      if (propertyData.clientIds.length > 4) {
        throw new Error('Maximum 4 clients allowed per property');
      }

      // Start a transaction
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          name: propertyData.name,
          type: propertyData.type,
          purchase_price: propertyData.purchasePrice,
          weekly_rent: propertyData.weeklyRent,
          location: propertyData.location,
          notes: propertyData.notes,
          status: propertyData.status
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create property-client relationships
      const ownershipPercentage = 100 / propertyData.clientIds.length;
      const propertyClients = propertyData.clientIds.map(clientId => ({
        property_id: property.id,
        client_id: clientId,
        ownership_percentage: ownershipPercentage
      }));

      const { error: pcError } = await supabase
        .from('property_clients')
        .insert(propertyClients);

      if (pcError) throw pcError;

      toast.success('Property created successfully');
      await loadProperties();
      return property;
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
      return null;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property> & { clientIds?: string[] }) => {
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
      
      // Add updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();

      // Update property
      const { error: propertyError } = await supabase
        .from('properties')
        .update(dbUpdates)
        .eq('id', id);

      if (propertyError) throw propertyError;

      // Update client relationships if provided
      if (updates.clientIds) {
        if (updates.clientIds.length > 4) {
          throw new Error('Maximum 4 clients allowed per property');
        }

        // Delete existing relationships
        await supabase
          .from('property_clients')
          .delete()
          .eq('property_id', id);

        // Create new relationships
        if (updates.clientIds.length > 0) {
          const ownershipPercentage = 100 / updates.clientIds.length;
          const propertyClients = updates.clientIds.map(clientId => ({
            property_id: id,
            client_id: clientId,
            ownership_percentage: ownershipPercentage
          }));

          const { error: pcError } = await supabase
            .from('property_clients')
            .insert(propertyClients);

          if (pcError) throw pcError;
        }
      }

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
      // Delete property (property_clients will be deleted via CASCADE)
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