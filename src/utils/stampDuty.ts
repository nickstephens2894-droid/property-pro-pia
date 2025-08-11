// Australian Stamp Duty calculator (base rates, v1)
// Note: This is a simplified implementation using base scales only.
// Concessions/exemptions, surcharges, off-the-plan, and FHB variations are not included.

export type Jurisdiction = 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';

type Bracket = {
  min: number; // inclusive lower bound
  max: number; // inclusive upper bound (use Infinity for last)
  base: number; // base duty at 'min'
  rate: number; // marginal rate applied to (value - min)
  fixed?: number; // if present, duty is a fixed amount within this bracket
};

const NSW: Bracket[] = [
  { min: 0, max: 14000, base: 0, rate: 0.0125 },
  { min: 14000, max: 31000, base: 175, rate: 0.015 },
  { min: 31000, max: 83000, base: 430, rate: 0.0175 },
  { min: 83000, max: 310000, base: 1340, rate: 0.035 },
  { min: 310000, max: 1033000, base: 9390, rate: 0.045 },
  { min: 1033000, max: Infinity, base: 42540, rate: 0.055 },
];

const VIC: Bracket[] = [
  { min: 0, max: 25000, base: 0, rate: 0.014 },
  { min: 25000, max: 130000, base: 350, rate: 0.024 },
  { min: 130000, max: 960000, base: 2870, rate: 0.06 },
  { min: 960000, max: 2000000, base: 57970, rate: 0.055 },
  { min: 2000000, max: Infinity, base: 110000, rate: 0.065 },
];

const QLD: Bracket[] = [
  { min: 0, max: 5000, base: 0, rate: 0 },
  { min: 5000, max: 75000, base: 0, rate: 0.015 },
  { min: 75000, max: 540000, base: 1050, rate: 0.035 },
  { min: 540000, max: 1000000, base: 17325, rate: 0.045 },
  { min: 1000000, max: Infinity, base: 38025, rate: 0.0575 },
];

const WA: Bracket[] = [
  { min: 0, max: 120000, base: 0, rate: 0.019 },
  { min: 120000, max: 150000, base: 2280, rate: 0.0285 },
  { min: 150000, max: 360000, base: 3135, rate: 0.038 },
  { min: 360000, max: 725000, base: 11115, rate: 0.0475 },
  { min: 725000, max: Infinity, base: 28453, rate: 0.0515 },
];

const SA: Bracket[] = [
  { min: 0, max: 12000, base: 0, rate: 0.01 },
  { min: 12000, max: 30000, base: 120, rate: 0.02 },
  { min: 30000, max: 50000, base: 480, rate: 0.03 },
  { min: 50000, max: 100000, base: 1080, rate: 0.035 },
  { min: 100000, max: 200000, base: 2830, rate: 0.04 },
  { min: 200000, max: 250000, base: 6830, rate: 0.0425 },
  { min: 250000, max: 300000, base: 8955, rate: 0.0475 },
  { min: 300000, max: 500000, base: 11330, rate: 0.05 },
  { min: 500000, max: Infinity, base: 21330, rate: 0.055 },
];

const TAS: Bracket[] = [
  { min: 0, max: 3000, base: 0, rate: 0, fixed: 50 },
  { min: 3000, max: 25000, base: 50, rate: 0.0175 },
  { min: 25000, max: 75000, base: 400, rate: 0.0225 },
  { min: 75000, max: 200000, base: 1525, rate: 0.035 },
  { min: 200000, max: 375000, base: 5900, rate: 0.04 },
  { min: 375000, max: Infinity, base: 12900, rate: 0.0425 },
];

// Approximate base rates for ACT/NT (estimates for v1)
const ACT: Bracket[] = [
  { min: 0, max: Infinity, base: 0, rate: 0.05 },
];
const NT: Bracket[] = [
  { min: 0, max: Infinity, base: 0, rate: 0.0495 },
];

const DUTY_SCALES: Record<Jurisdiction, Bracket[]> = {
  NSW,
  VIC,
  QLD,
  WA,
  SA,
  TAS,
  ACT,
  NT,
};

export function calculateStampDuty(dutiableValue: number, jurisdiction: Jurisdiction): number {
  if (!isFinite(dutiableValue) || dutiableValue <= 0) return 0;
  const brackets = DUTY_SCALES[jurisdiction];
  for (const b of brackets) {
    if (dutiableValue <= b.max) {
      if (typeof b.fixed === 'number') return Math.round(b.fixed);
      const duty = b.base + (dutiableValue - b.min) * b.rate;
      return Math.round(duty);
    }
  }
  // Fallback (shouldn't hit because last max is Infinity)
  const last = brackets[brackets.length - 1];
  const duty = last.base + (dutiableValue - last.min) * last.rate;
  return Math.round(duty);
}

export function formatCurrencyAUD(value: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value || 0);
}
