import { PropertyData } from "@/contexts/PropertyDataContext";

function csvEscape(value: string) {
  if (value == null) return "";
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function fmt(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  return String(value);
}

export function generateInputsCsv(propertyData: PropertyData): string {
  const rows: Array<[string, string, string]> = [];

  const add = (section: string, field: string, value: unknown) => {
    rows.push([section, field, fmt(value)]);
  };

  // Personal Profile
  propertyData.clients.forEach((c, idx) => {
    const s = `Personal Profile`;
    add(s, `Client ${idx + 1} Name`, c.name);
    add(s, `Client ${idx + 1} Annual Income`, c.annualIncome);
    add(s, `Client ${idx + 1} Other Income`, c.otherIncome);
    add(s, `Client ${idx + 1} Medicare Levy`, c.hasMedicareLevy);
  });

  // Ownership (Tax Optimization)
  const clientNameById = new Map(propertyData.clients.map(c => [c.id, c.name] as const));
  propertyData.ownershipAllocations.forEach((o) => {
    const name = clientNameById.get(o.clientId) || o.clientId;
    add("Tax Optimization", `Ownership – ${name}`, o.ownershipPercentage);
  });

  // Property Basics
  add("Property Basics", "Is Construction Project", propertyData.isConstructionProject);
  add("Property Basics", "Purchase Price", propertyData.purchasePrice);
  add("Property Basics", "Weekly Rent", propertyData.weeklyRent);
  add("Property Basics", "Rental Growth Rate (%)", propertyData.rentalGrowthRate);
  add("Property Basics", "Vacancy Rate (%)", propertyData.vacancyRate);
  add("Property Basics", "Construction Year", propertyData.constructionYear);
  add("Property Basics", "Building Value", propertyData.buildingValue);
  add("Property Basics", "Plant & Equipment Value", propertyData.plantEquipmentValue);

  // Construction Details
  add("Construction Details", "Land Value", propertyData.landValue);
  add("Construction Details", "Construction Value", propertyData.constructionValue);
  add("Construction Details", "Construction Period (months)", propertyData.constructionPeriod);
  add("Construction Details", "Construction Interest Rate (%)", propertyData.constructionInterestRate);
  propertyData.constructionProgressPayments?.forEach((p, i) => {
    add(
      "Construction Details",
      `Progress Payment ${i + 1}`,
      `${p.percentage}% at month ${p.month}${p.description ? ` - ${p.description}` : ""}`
    );
  });

  // Financing – Main Loan
  add("Financing", "Deposit (Upfront Cash)", propertyData.deposit);
  add("Financing", "Loan Amount", propertyData.loanAmount);
  add("Financing", "Interest Rate (%)", propertyData.interestRate);
  add("Financing", "Loan Term (years)", propertyData.loanTerm);
  add("Financing", "LVR (%)", propertyData.lvr);
  add("Financing", "Main Loan Type (io/pi)", propertyData.mainLoanType);
  add("Financing", "IO Term (years)", propertyData.ioTermYears);

  // Equity Funding
  add("Equity Funding", "Use Equity Funding", propertyData.useEquityFunding);
  add("Equity Funding", "Primary Property Value", propertyData.primaryPropertyValue);
  add("Equity Funding", "Existing Debt", propertyData.existingDebt);
  add("Equity Funding", "Max LVR (%)", propertyData.maxLVR);
  add("Equity Funding", "Equity Loan Type (io/pi)", propertyData.equityLoanType);
  add("Equity Funding", "Equity IO Term (years)", propertyData.equityLoanIoTermYears);
  add("Equity Funding", "Equity Loan Interest Rate (%)", propertyData.equityLoanInterestRate);
  add("Equity Funding", "Equity Loan Term (years)", propertyData.equityLoanTerm);

  // Deposit Management (inputs only)
  add("Deposit Management", "Deposit Amount (cash used)", propertyData.depositAmount);

  // Holding Costs Preferences
  add("Holding Costs", "Funding Method (cash/debt/hybrid)", propertyData.holdingCostFunding);
  add("Holding Costs", "Cash Portion for Hybrid (%)", propertyData.holdingCostCashPercentage);

  // Purchase Costs
  add("Purchase Costs", "Stamp Duty", propertyData.stampDuty);
  add("Purchase Costs", "Legal Fees", propertyData.legalFees);
  add("Purchase Costs", "Inspection Fees", propertyData.inspectionFees);

  // Construction Costs
  add("Construction Costs", "Council Fees", propertyData.councilFees);
  add("Construction Costs", "Architect Fees", propertyData.architectFees);
  add("Construction Costs", "Site Costs", propertyData.siteCosts);

  // Annual Expenses
  add("Annual Expenses", "Property Management (%)", propertyData.propertyManagement);
  add("Annual Expenses", "Council Rates", propertyData.councilRates);
  add("Annual Expenses", "Insurance", propertyData.insurance);
  add("Annual Expenses", "Repairs", propertyData.repairs);

  // Depreciation / Tax
  add("Depreciation & Tax", "Depreciation Method", propertyData.depreciationMethod);
  add("Depreciation & Tax", "Is New Property", propertyData.isNewProperty);

  // Build CSV text
  const header = ["Section", "Field", "Value"];
  const lines = [header, ...rows].map(cols => cols.map(csvEscape).join(","));
  return lines.join("\n");
}

export function downloadInputsCsv(propertyData: PropertyData, filename = "property-inputs.csv") {
  const csv = generateInputsCsv(propertyData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
