// Centralized constants for the application
// All hardcoded values should be defined here for consistency and maintainability

// =========================
// ECONOMIC INDICATORS
// =========================
export const ECONOMIC_CONSTANTS = {
  // Consumer Price Index (CPI) - Australian average
  DEFAULT_CPI_RATE: 2.5, // 2.5% annual inflation rate
  CPI_MULTIPLIER: 0.025, // Decimal equivalent for calculations
  
  // Medicare levy
  MEDICARE_LEVY_RATE: 0.02, // 2% rate
  MEDICARE_LEVY_THRESHOLD: 26000, // Minimum income threshold
  
  // Capital gains discount
  CGT_DISCOUNT_RATE: 0.5, // 50% discount for assets held > 12 months
  CGT_DISCOUNT_HOLDING_PERIOD: 12, // months
} as const;

// =========================
// LOAN AND FINANCE
// =========================
export const FINANCE_CONSTANTS = {
  // Payment frequencies
  WEEKLY_PERIODS_PER_YEAR: 52,
  MONTHLY_PERIODS_PER_YEAR: 12,
  
  // Default loan terms and rates
  DEFAULT_LOAN_TERM_YEARS: 30,
  DEFAULT_INTEREST_RATE: 6.0, // 6% default rate
  DEFAULT_EQUITY_RATE: 7.2, // 7.2% default equity loan rate
  
  // Maximum LVR thresholds
  MAX_LVR_THRESHOLD: 80, // 80% maximum loan-to-value ratio
  
  // Funding validation thresholds
  FUNDING_SHORTFALL_WARNING_THRESHOLD: 0.1, // 10% of total cost
} as const;

// =========================
// PROPERTY AND CONSTRUCTION
// =========================
export const PROPERTY_CONSTANTS = {
  // Depreciation rates
  BUILDING_DEPRECIATION_RATE: 0.025, // 2.5% per annum for capital works
  PLANT_EQUIPMENT_RATE: 0.15, // 15% diminishing value method (average)
  
  // Construction defaults
  DEFAULT_CONSTRUCTION_PERIOD: 12, // months
  DEFAULT_BUILDING_PERCENTAGE: 0.9, // 90% of construction value
  DEFAULT_PLANT_EQUIPMENT_PERCENTAGE: 0.1, // 10% of construction value
  
  // Validation tolerances
  PERCENTAGE_TOLERANCE: 0.1, // 0.1% tolerance for ownership totals
  VALUE_TOLERANCE: 100, // $100 tolerance for construction value validations
} as const;

// =========================
// PROPERTY MANAGEMENT
// =========================
export const MANAGEMENT_CONSTANTS = {
  // Default property management fees
  DEFAULT_PROPERTY_MANAGEMENT_RATE: 7.0, // 7% of rental income
  
  // Selling costs
  DEFAULT_COMMISSION_RATE: 2.2, // 2.2% agent commission
  DEFAULT_MARKETING_COST: 2500, // $2,500 marketing budget
  
  // Rent calculations
  WEEKS_PER_YEAR: 52,
} as const;

// =========================
// TAX BRACKETS (2024-25)
// =========================
export const TAX_CONSTANTS = {
  // Australian tax brackets for 2024-25 financial year
  TAX_FREE_THRESHOLD: 18200,
  BRACKET_1_MAX: 45000,
  BRACKET_2_MAX: 120000,
  BRACKET_3_MAX: 180000,
  
  // Corresponding tax rates
  RATE_0: 0,
  RATE_1: 0.19,    // 19%
  RATE_2: 0.325,   // 32.5%
  RATE_3: 0.37,    // 37%
  RATE_4: 0.45,    // 45%
} as const;

// =========================
// VALIDATION CONSTANTS
// =========================
export const VALIDATION_CONSTANTS = {
  // Minimum required values
  MIN_ANNUAL_INCOME: 1,
  MIN_PURCHASE_PRICE: 1,
  MIN_WEEKLY_RENT: 1,
  MIN_LOAN_AMOUNT: 1,
  MIN_INTEREST_RATE: 0.01, // 0.01%
  MIN_LOAN_TERM: 1, // 1 year
  MIN_STAMP_DUTY: 1,
  
  // Maximum reasonable values (for validation)
  MAX_INTEREST_RATE: 20, // 20%
  MAX_LOAN_TERM: 50, // 50 years
  MAX_PROPERTY_VALUE: 50000000, // $50M
  
  // Validation thresholds
  OWNERSHIP_TOTAL_TARGET: 100, // 100% ownership
  MISSING_OPTIONAL_FIELDS_WARNING: 2, // Warn if > 2 optional fields missing
} as const;

// =========================
// FORMATTING CONSTANTS
// =========================
export const FORMAT_CONSTANTS = {
  // Currency formatting
  CURRENCY_LOCALE: 'en-AU',
  CURRENCY_CODE: 'AUD',
  CURRENCY_MIN_DECIMALS: 0,
  CURRENCY_MAX_DECIMALS: 0,
  
  // Percentage formatting
  PERCENTAGE_DEFAULT_DECIMALS: 1,
  
  // Number formatting
  NUMBER_LOCALE: 'en-AU',
} as const;

// =========================
// DERIVED CONSTANTS
// =========================
export const DERIVED_CONSTANTS = {
  // Weekly to annual conversions
  ANNUAL_RENT_MULTIPLIER: MANAGEMENT_CONSTANTS.WEEKS_PER_YEAR,
  
  // Monthly to annual conversions
  ANNUAL_PAYMENT_MULTIPLIER: FINANCE_CONSTANTS.MONTHLY_PERIODS_PER_YEAR,
  
  // CPI growth calculation
  CPI_GROWTH_FACTOR: 1 + ECONOMIC_CONSTANTS.CPI_MULTIPLIER,
} as const;

// Type exports for better TypeScript support
export type EconomicConstantsType = typeof ECONOMIC_CONSTANTS;
export type FinanceConstantsType = typeof FINANCE_CONSTANTS;
export type PropertyConstantsType = typeof PROPERTY_CONSTANTS;
export type ManagementConstantsType = typeof MANAGEMENT_CONSTANTS;
export type TaxConstantsType = typeof TAX_CONSTANTS;
export type ValidationConstantsType = typeof VALIDATION_CONSTANTS;
export type FormatConstantsType = typeof FORMAT_CONSTANTS;
export type DerivedConstantsType = typeof DERIVED_CONSTANTS;