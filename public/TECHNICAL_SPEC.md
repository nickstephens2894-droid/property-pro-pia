# Technical Specification — Property Investment Analysis & Projections

Last updated: 2025-08-09
Spec format: Markdown (downloadable at /TECHNICAL_SPEC.md)

## 1) Overview
A single-page React (Vite + Tailwind + TypeScript) web application that helps users analyze a property investment and project cash flows/tax outcomes over time. Current navigation focuses on:
- Analysis (Index page)
- Projections (year-by-year engine)

Out-of-scope for now (hidden from nav): Clients list, Scenarios, Properties page.

## 2) Tech Stack
- React 18, Vite, TypeScript
- Tailwind CSS (with semantic tokens)
- shadcn/ui (Radix primitives) for consistent UI components
- React Router v6 for SPA routing
- TanStack React Query for async state (data fetching/caching)
- Optional: Supabase integration skeleton is present (auth/client), but not required for core calcs

## 3) App Architecture
- src/App.tsx: App shell, providers, routes
- Context: PropertyDataContext provides the core state (property assumptions, funding, clients)
- Pages:
  - Index.tsx: Analysis entry (summary, inputs)
  - Projections.tsx: Detailed projections table/summary
- Reusable components: inputs, tables, summaries, UI atoms under src/components and src/components/ui
- Utilities: calculationUtils.ts for formulas, validationUtils.ts for rules

## 4) Key Routes
- / — Analysis dashboard
- /projections — Projections engine & tables
- /spec — Technical spec viewer (this document) with Download/Print/Copy controls
- /TECHNICAL_SPEC.md — Direct markdown download

## 5) Data Model (high-level)
Note: Exact code types live in src/contexts/PropertyDataContext.tsx, src/types, and referenced components.

- PropertyData
  - purchasePrice: number
  - stampDuty, legalFees, otherAcquisitionCosts: number
  - developmentCosts?: number (for construction)
  - isConstruction: boolean
  - constructionMonths?: number (if isConstruction)
  - rentPerWeek: number
  - vacancyRate: number (0-1)
  - expenseAnnual: number (base operating expenses)
  - buildingValue?: number (Div 43 capex base if eligible)
  - plantEquipmentValue?: number (Div 40 base if eligible)
  - depreciationEligible: boolean (Div 40 eligibility for new assets)
  - capitalGrowthRate: number (annual %)
  - rentalGrowthRate: number (annual %)
  - expenseInflationRate: number (annual %)

- Loan/Funding
  - purchaseLVR: number (0-1)
  - interestRate: number (annual %)
  - ioYears: number (interest-only period)
  - termYears: number (total P&I term)
  - upfrontFees: number
  - equityReleaseAmount?: number (if using available equity)
  - equityInterestRate?: number (if separate equity loan)

- Ownership & Clients
  - clients: [{ id, name, annualTaxableIncome, medicareLevyApplies: boolean }]
  - ownership: [{ clientId, percent }] — must sum to 100%

- Projection Control
  - startYear: number
  - endYear: number (up to 40 years supported)

## 6) Validation Rules (representative)
- Ownership allocation sums to 100%
- If isConstruction is true: developmentCosts and constructionMonths should be > 0
- LVR between 0% and 100%, interest rates >= 0
- Projections endYear - startYear within reasonable limit (<= 40)
- Equity/funding must cover total project cost (or show shortfall warning)

## 7) Core Calculations
This section outlines formulas used across Analysis and Projections. Implementation details reside in src/utils/calculationUtils.ts and within Projections.tsx (memoized computations).

7.1 Total Acquisition & Project Cost
- acquisitionCosts = stampDuty + legalFees + otherAcquisitionCosts
- baseCost = purchasePrice + acquisitionCosts
- totalProjectCost = baseCost + developmentCosts (if any) + capitalizedHoldingCosts (during construction, if chosen)

7.2 Rent & Income
- grossRentAnnual(year) = weeklyRent(year) * 52
- weeklyRent(year0) = input rentPerWeek
- weeklyRent(yearN) = weeklyRent(yearN-1) * (1 + rentalGrowthRate)
- effectiveGrossIncome = grossRentAnnual * (1 - vacancyRate)

7.3 Operating Expenses
- baseExpenseAnnual(year0) = expenseAnnual
- expenseAnnual(yearN) = expenseAnnual(yearN-1) * (1 + expenseInflationRate)

7.4 Loan Mechanics
- loanPrincipal = purchasePrice * LVR (plus optionally capitalized costs if modeling that way)
- Interest-Only period (years 1..ioYears): payment = interestOnly = rate * outstandingPrincipal
- P&I period: amortizing payment
  - monthlyRate = interestRate / 12
  - n = remainingTermMonths
  - paymentMonthly = P * r / (1 - (1 + r)^(-n))
  - interestPortion = outstanding * monthlyRate
  - principalPortion = paymentMonthly - interestPortion
  - outstanding reduces by principalPortion monthly

7.5 Equity Loan (optional)
- equityLoanPrincipal = equityReleaseAmount
- equityLoanCostAnnual = equityLoanPrincipal * equityInterestRate (if IO)

7.6 Depreciation
- Division 43 (Capital Works): straight-line 2.5% per year of eligible buildingValue over 40 years (if eligible)
- Division 40 (Plant & Equipment): if new assets/depreciationEligible; simplified as prime cost approximation in current implementation. Established properties may be restricted. Depreciation reduces taxable income.

7.7 Property-Level Taxable Income
- taxableIncomeProperty = effectiveGrossIncome - deductibleOperatingExpenses - interestExpense(all loans) - depreciation

7.8 Individual Tax Allocation
- Allocate taxableIncomeProperty by ownership percentage to each client
- Each client’s tax payable is computed by progressive brackets (Australian rates) + medicare levy if applicable
- Property tax impact for a client = tax(with property share included) - tax(without property share)
- Aggregate across clients to get total tax delta

7.9 Cash Flow Metrics
- preTaxCashFlow = (effectiveGrossIncome - operatingExpenses - interest - principalRepayments(if modeling cash)) + taxRefunds/credits (if offsetting negative taxable income) - non-cash add-backs as applicable
- afterTaxCashFlow = preTaxCashFlow - additionalTaxDue (or + tax savings)
- Weekly after-tax cash flow = afterTaxCashFlow / 52
- Yields: grossYield = grossRentAnnual / purchasePrice; netYield = (grossRentAnnual - expenses) / purchasePrice

7.10 Capital Growth & Equity
- propertyValue(year0) = purchasePrice
- propertyValue(yearN) = propertyValue(yearN-1) * (1 + capitalGrowthRate)
- equity(year) = propertyValue(year) - totalOutstandingDebt(year)

7.11 Construction/Holding Costs (if isConstruction)
- developmentCosts spread over constructionMonths
- holdingCostsDuringConstruction = interest on drawn funds + council/rates/insurance/etc. May be capitalized or expensed per chosen modeling. Current logic includes construction-aware cash burn and then transitions to rent when completed.

## 8) Projections Engine (Year-by-Year)
The projections array covers each year in the selected range with fields like:
- yearIndex, calendarYear
- rent: gross, vacancy, effective income
- expenses: operating, insurance, rates, management (rolled into expenseAnnual unless itemized)
- loans: interest (primary, equity loan), principal (post-IO), outstanding balances (end of year)
- depreciation: div43, div40, total
- taxable income at property level
- allocated taxable income per client and client-level tax impact
- cash flows: pre-tax, after-tax; weekly after-tax cash flow
- property value and equity

Algorithm outline (computed via useMemo in Projections.tsx):
1) Initialize from inputs and current year
2) For year = 1..N:
   - Update rent by rentalGrowthRate
   - Update expenses by expenseInflationRate
   - Compute loan interest/principal based on IO vs P&I schedule
   - Apply construction period handling if flagged (no rent during build, staged draw interest)
   - Compute depreciation (div43 + div40 if eligible)
   - Compute property-level taxable income
   - Allocate to clients by ownership%, compute individual taxes (with/without share) and sum tax deltas
   - Compute pre-tax and after-tax cash flows (include tax deltas)
   - Update property value via capitalGrowthRate and compute equity
3) Expose derived summaries: totals, averages, ROI, marginal tax rates, etc.

## 9) Tax Model (AU Progressive Brackets — summary)
- Uses a standard bracket table (resident, current-year-ish). Each bracket has:
  - threshold, base tax, marginal rate
- Medicare levy: typically 2% for eligible clients (with income-based thresholds not fully modeled; current implementation applies a simplified levy toggle per client)
- For each client: tax(income) is computed using the table; property share included/excluded to get delta

Note: Brackets/levy can be swapped for precise FY rates if required.

## 10) UI/UX Highlights
- Responsive layout; desktop has horizontal nav; mobile has fixed bottom nav
- Forms with immediate feedback and validation warnings
- Tooltips and helpful labels
- Projections table supports year-by-year and full-table views
- Summary panels: weekly after-tax cash flow, total tax savings, ROI, marginal tax rates
- Toasts for important events

## 11) Performance
- Heavy calculations are memoized (useMemo) based on input dependencies
- Virtualization not currently used; table sizes remain reasonable (<= 40 rows)

## 12) Known Limitations / Assumptions
- Depreciation (Div 40) simplified; exact schedules can be integrated later
- Construction modeling uses simplified staged draws/holding costs
- Equity loan modeled as IO; can extend to amortizing if needed
- Tax brackets/levy simplified; no offsets/HECS/etc.
- No GST considerations

## 13) Extensibility & Next Steps
- Replace tax brackets with config per FY
- Add detailed expense categories vs single expenseAnnual
- Add offset/redraw and cash buffers
- Add scenario management (hidden now) and client library (hidden)
- Integrate Supabase for persistence/auth

## 14) Testing Scenarios (suggested)
- Ownership sums ≠ 100% → validation error
- IO rollover to P&I: verify payment and balances
- High vacancy vs low vacancy impacts
- Construction toggled on/off
- Depreciation eligible vs not eligible
- Single vs dual income clients with split ownership
- Extreme interest rate and growth rate values

## 15) Glossary
- LVR: Loan-to-Value Ratio
- IO: Interest-Only
- P&I: Principal & Interest
- Div 43: Capital works deduction (2.5% p.a.)
- Div 40: Plant & equipment depreciation

---
This document summarizes the business rules and computations implemented in the current app. For precise formulas and code, see src/utils/calculationUtils.ts and src/pages/Projections.tsx.