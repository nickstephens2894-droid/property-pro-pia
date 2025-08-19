import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PropertyModel {
  id: string;
  name: string;
  description: string;
  propertyType: string;
  purchasePrice: number;
  weeklyRent: number;
  location: string;
  propertyMethod: 'house-land-construction' | 'built-first-owner' | 'built-second-owner';
  // Property Basics
  constructionYear: number;
  isConstructionProject: boolean;
  landValue: number;
  constructionValue: number;
  constructionPeriod: number;
  constructionInterestRate: number;
  buildingValue: number;
  plantEquipmentValue: number;
  // Transaction Costs
  stampDuty: number;
  legalFees: number;
  inspectionFees: number;
  councilFees: number;
  architectFees: number;
  siteCosts: number;
  // Ongoing Income & Expenses
  rentalGrowthRate: number;
  vacancyRate: number;
  propertyManagement: number;
  councilRates: number;
  insurance: number;
  repairs: number;
  // Depreciation
  depreciationMethod: string;
  isNewProperty: boolean;
  createdAt: string;
  lastModified: string;
}

interface ModelsContextType {
  models: PropertyModel[];
  addModel: (model: Omit<PropertyModel, 'id' | 'createdAt' | 'lastModified'>) => void;
  updateModel: (id: string, updates: Partial<PropertyModel>) => void;
  deleteModel: (id: string) => void;
  getModelById: (id: string) => PropertyModel | undefined;
  duplicateModel: (id: string) => void;
}

const ModelsContext = createContext<ModelsContextType | undefined>(undefined);

export const useModels = () => {
  const context = useContext(ModelsContext);
  if (!context) {
    throw new Error('useModels must be used within a ModelsProvider');
  }
  return context;
};

interface ModelsProviderProps {
  children: React.ReactNode;
}

export const ModelsProvider: React.FC<ModelsProviderProps> = ({ children }) => {
  const [models, setModels] = useState<PropertyModel[]>([]);

  // Load models from localStorage on mount
  useEffect(() => {
    const savedModels = localStorage.getItem('propertyModels');
    if (savedModels) {
      try {
        setModels(JSON.parse(savedModels));
      } catch (error) {
        console.error('Error loading models from localStorage:', error);
      }
    } else {
      // Set some default models for demonstration
      setModels([
        {
          id: '1',
          name: 'Sydney CBD Apartment',
          description: 'High-yield CBD apartment for investment',
          propertyType: 'Apartment',
          purchasePrice: 850000,
          weeklyRent: 850,
          location: 'NSW',
          propertyMethod: 'built-first-owner',
          constructionYear: 2024,
          isConstructionProject: false,
          landValue: 0,
          constructionValue: 0,
          constructionPeriod: 0,
          constructionInterestRate: 0,
          buildingValue: 765000,
          plantEquipmentValue: 85000,
          stampDuty: 42000,
          legalFees: 2000,
          inspectionFees: 600,
          councilFees: 0,
          architectFees: 0,
          siteCosts: 0,
          rentalGrowthRate: 3.0,
          vacancyRate: 2.0,
          propertyManagement: 8.0,
          councilRates: 2800,
          insurance: 1800,
          repairs: 2000,
          depreciationMethod: 'prime-cost',
          isNewProperty: true,
          createdAt: '2025-01-15',
          lastModified: '2025-01-20'
        },
        {
          id: '2',
          name: 'Melbourne House & Land',
          description: 'New construction project in growth area',
          propertyType: 'House',
          purchasePrice: 1200000,
          weeklyRent: 1200,
          location: 'VIC',
          propertyMethod: 'house-land-construction',
          constructionYear: 2024,
          isConstructionProject: true,
          landValue: 300000,
          constructionValue: 900000,
          constructionPeriod: 8,
          constructionInterestRate: 7.5,
          buildingValue: 810000,
          plantEquipmentValue: 90000,
          stampDuty: 8500,
          legalFees: 2000,
          inspectionFees: 800,
          councilFees: 12000,
          architectFees: 18000,
          siteCosts: 8000,
          rentalGrowthRate: 4.0,
          vacancyRate: 1.5,
          propertyManagement: 7.5,
          councilRates: 3200,
          insurance: 2200,
          repairs: 2500,
          depreciationMethod: 'prime-cost',
          isNewProperty: true,
          createdAt: '2025-01-10',
          lastModified: '2025-01-18'
        },
        {
          id: '3',
          name: 'Brisbane Established House',
          description: 'Established property with good rental history',
          propertyType: 'House',
          purchasePrice: 750000,
          weeklyRent: 750,
          location: 'QLD',
          propertyMethod: 'built-second-owner',
          constructionYear: 2018,
          isConstructionProject: false,
          landValue: 0,
          constructionValue: 0,
          constructionPeriod: 0,
          constructionInterestRate: 0,
          buildingValue: 600000,
          plantEquipmentValue: 60000,
          stampDuty: 24000,
          legalFees: 1800,
          inspectionFees: 500,
          councilFees: 0,
          architectFees: 0,
          siteCosts: 0,
          rentalGrowthRate: 3.5,
          vacancyRate: 2.5,
          propertyManagement: 8.5,
          councilRates: 2600,
          insurance: 1600,
          repairs: 3000,
          depreciationMethod: 'prime-cost',
          isNewProperty: false,
          createdAt: '2025-01-05',
          lastModified: '2025-01-12'
        }
      ]);
    }
  }, []);

  // Save models to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('propertyModels', JSON.stringify(models));
  }, [models]);

  const addModel = (modelData: Omit<PropertyModel, 'id' | 'createdAt' | 'lastModified'>) => {
    const newModel: PropertyModel = {
      ...modelData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setModels(prev => [...prev, newModel]);
  };

  const updateModel = (id: string, updates: Partial<PropertyModel>) => {
    setModels(prev => prev.map(model => 
      model.id === id 
        ? { ...model, ...updates, lastModified: new Date().toISOString() }
        : model
    ));
  };

  const deleteModel = (id: string) => {
    setModels(prev => prev.filter(model => model.id !== id));
  };

  const getModelById = (id: string) => {
    return models.find(model => model.id === id);
  };

  const duplicateModel = (id: string) => {
    const modelToDuplicate = models.find(model => model.id === id);
    if (modelToDuplicate) {
      const duplicatedModel: PropertyModel = {
        ...modelToDuplicate,
        id: Date.now().toString(),
        name: `${modelToDuplicate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      setModels(prev => [...prev, duplicatedModel]);
    }
  };

  const value: ModelsContextType = {
    models,
    addModel,
    updateModel,
    deleteModel,
    getModelById,
    duplicateModel
  };

  return (
    <ModelsContext.Provider value={value}>
      {children}
    </ModelsContext.Provider>
  );
};
