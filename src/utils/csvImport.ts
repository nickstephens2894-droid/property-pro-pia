import { PropertyModel, CreatePropertyModelRequest } from '@/types/propertyModels';
import { PropertyModelsService } from '@/services/propertyModelsService';

export interface CsvValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CsvImportResult {
  success: boolean;
  successCount: number;
  totalRows: number;
  errors: CsvValidationError[];
  createdProperties: PropertyModel[];
}

export interface ParsedCsvRow {
  row: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: CsvValidationError[];
}

const REQUIRED_COLUMNS = ['name', 'purchase_price', 'weekly_rent', 'location'];

const PROPERTY_TYPES = ['Apartment', 'House', 'Townhouse', 'Unit', 'Land', 'Commercial'];
const PROPERTY_METHODS = ['house-land-construction', 'built-first-owner', 'built-second-owner'];
const LOCATIONS = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
const DEPRECIATION_METHODS = ['prime-cost', 'diminishing-value'];

export class CsvImportService {
  static async parseCsvFile(file: File): Promise<ParsedCsvRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvText = event.target?.result as string;
          const rows = this.parseCSVText(csvText);
          const parsedRows = this.validateRows(rows);
          resolve(parsedRows);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  private static parseCSVText(csvText: string): Record<string, string>[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    return rows;
  }

  private static validateRows(rows: Record<string, string>[]): ParsedCsvRow[] {
    return rows.map((row, index) => {
      const errors: CsvValidationError[] = [];
      const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed

      // Check required fields
      REQUIRED_COLUMNS.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push({
            row: rowNumber,
            field,
            message: `${field} is required`
          });
        }
      });

      // Validate data types and values
      if (row.purchase_price && isNaN(Number(row.purchase_price))) {
        errors.push({
          row: rowNumber,
          field: 'purchase_price',
          message: 'Must be a valid number'
        });
      }

      if (row.weekly_rent && isNaN(Number(row.weekly_rent))) {
        errors.push({
          row: rowNumber,
          field: 'weekly_rent',
          message: 'Must be a valid number'
        });
      }

      if (row.property_type && !PROPERTY_TYPES.includes(row.property_type)) {
        errors.push({
          row: rowNumber,
          field: 'property_type',
          message: `Must be one of: ${PROPERTY_TYPES.join(', ')}`
        });
      }

      if (row.property_method && !PROPERTY_METHODS.includes(row.property_method)) {
        errors.push({
          row: rowNumber,
          field: 'property_method',
          message: `Must be one of: ${PROPERTY_METHODS.join(', ')}`
        });
      }

      if (row.location && !LOCATIONS.includes(row.location)) {
        errors.push({
          row: rowNumber,
          field: 'location',
          message: `Must be one of: ${LOCATIONS.join(', ')}`
        });
      }

      if (row.depreciation_method && !DEPRECIATION_METHODS.includes(row.depreciation_method)) {
        errors.push({
          row: rowNumber,
          field: 'depreciation_method',
          message: `Must be one of: ${DEPRECIATION_METHODS.join(', ')}`
        });
      }

      return {
        row: rowNumber,
        data: row,
        isValid: errors.length === 0,
        errors
      };
    });
  }

  static transformCsvToPropertyModel(csvData: Record<string, string>, ownerUserId: string): CreatePropertyModelRequest {
    return {
      owner_user_id: ownerUserId,
      name: csvData.name,
      description: csvData.description || null,
      property_type: (csvData.property_type || 'Apartment') as PropertyModel['property_type'],
      property_method: (csvData.property_method || 'built-first-owner') as PropertyModel['property_method'],
      purchase_price: Number(csvData.purchase_price) || 0,
      weekly_rent: Number(csvData.weekly_rent) || 0,
      rental_growth_rate: Number(csvData.rental_growth_rate) || 5.0,
      vacancy_rate: Number(csvData.vacancy_rate) || 2.0,
      location: csvData.location || 'NSW',
      construction_year: Number(csvData.construction_year) || new Date().getFullYear(),
      is_construction_project: csvData.is_construction_project?.toLowerCase() === 'true' || false,
      land_value: Number(csvData.land_value) || 0,
      construction_value: Number(csvData.construction_value) || 0,
      construction_period: Number(csvData.construction_period) || 0,
      construction_interest_rate: Number(csvData.construction_interest_rate) || 7.0,
      building_value: Number(csvData.building_value) || 0,
      plant_equipment_value: Number(csvData.plant_equipment_value) || 0,
      stamp_duty: Number(csvData.stamp_duty) || 0,
      legal_fees: Number(csvData.legal_fees) || 0,
      inspection_fees: Number(csvData.inspection_fees) || 0,
      council_fees: Number(csvData.council_fees) || 0,
      architect_fees: Number(csvData.architect_fees) || 0,
      site_costs: Number(csvData.site_costs) || 0,
      property_management: Number(csvData.property_management) || 8.0,
      council_rates: Number(csvData.council_rates) || 0,
      insurance: Number(csvData.insurance) || 0,
      repairs: Number(csvData.repairs) || 0,
      depreciation_method: (csvData.depreciation_method || 'prime-cost') as PropertyModel['depreciation_method'],
      is_new_property: csvData.is_new_property?.toLowerCase() === 'true' || true,
    };
  }

  static generateCsvTemplate(): string {
    const headers = [
      'name',
      'description',
      'property_type',
      'property_method',
      'purchase_price',
      'weekly_rent',
      'location',
      'construction_year',
      'is_construction_project',
      'land_value',
      'construction_value',
      'construction_period',
      'construction_interest_rate',
      'building_value',
      'plant_equipment_value',
      'stamp_duty',
      'legal_fees',
      'inspection_fees',
      'council_fees',
      'architect_fees',
      'site_costs',
      'rental_growth_rate',
      'vacancy_rate',
      'property_management',
      'council_rates',
      'insurance',
      'repairs',
      'depreciation_method',
      'is_new_property'
    ];

    const sampleData = [
      'Sample Property',
      'A sample property description',
      'Apartment',
      'built-first-owner',
      '600000',
      '520',
      'NSW',
      '2024',
      'false',
      '0',
      '0',
      '0',
      '7.0',
      '550000',
      '50000',
      '24000',
      '1200',
      '500',
      '1500',
      '0',
      '0',
      '5.0',
      '2.0',
      '8.0',
      '2500',
      '1200',
      '2000',
      'prime-cost',
      'true'
    ];

    return [headers.join(','), sampleData.join(',')].join('\n');
  }

  static downloadCsvTemplate(): void {
    const csvContent = this.generateCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'property_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static async bulkCreateProperties(
    parsedRows: ParsedCsvRow[],
    ownerUserId: string,
    onProgress?: (progress: number) => void
  ): Promise<CsvImportResult> {
    const validRows = parsedRows.filter(row => row.isValid);
    const errors: CsvValidationError[] = parsedRows.flatMap(row => row.errors);
    const createdProperties: PropertyModel[] = [];
    
    let successCount = 0;
    
    for (let i = 0; i < validRows.length; i++) {
      try {
        const propertyData = this.transformCsvToPropertyModel(validRows[i].data, ownerUserId);
        const createdProperty = await PropertyModelsService.create(propertyData);
        createdProperties.push(createdProperty);
        successCount++;
        
        if (onProgress) {
          onProgress(Math.round(((i + 1) / validRows.length) * 100));
        }
      } catch (error) {
        errors.push({
          row: validRows[i].row,
          field: 'general',
          message: error instanceof Error ? error.message : 'Failed to create property'
        });
      }
    }

    return {
      success: successCount > 0,
      successCount,
      totalRows: parsedRows.length,
      errors,
      createdProperties
    };
  }
}