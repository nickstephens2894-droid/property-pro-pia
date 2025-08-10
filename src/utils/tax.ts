// Centralized Australian income tax functions (2024-25)
// Progressive brackets and Medicare levy helper

export type TaxBracket = { min: number; max: number; rate: number };

export const AU_BRACKETS_2024_25: TaxBracket[] = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18201, max: 45000, rate: 0.19 },
  { min: 45001, max: 120000, rate: 0.325 },
  { min: 120001, max: 180000, rate: 0.37 },
  { min: 180001, max: Infinity, rate: 0.45 },
];

export const incomeTaxAU = (income: number): number => {
  if (!isFinite(income) || income <= 0) return 0;
  let tax = 0;
  for (const b of AU_BRACKETS_2024_25) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    if (taxable > 0) tax += taxable * b.rate;
  }
  return tax;
};

export const marginalRateAU = (income: number): number => {
  if (income <= 18200) return 0;
  if (income <= 45000) return 0.19;
  if (income <= 120000) return 0.325;
  if (income <= 180000) return 0.37;
  return 0.45;
};

// Very simplified Medicare levy: 2% above low threshold
export const medicareLevyAU = (income: number, apply: boolean): number => {
  if (!apply) return 0;
  return income > 26000 ? income * 0.02 : 0;
};

export const totalTaxAU = (income: number, hasMedicareLevy: boolean): number => {
  return incomeTaxAU(income) + medicareLevyAU(income, hasMedicareLevy);
};
