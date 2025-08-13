import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, Wallet, PiggyBank, ChevronDown } from "lucide-react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { totalTaxAU } from "@/utils/tax";

// Minimal shape of projection entries we rely on
interface SimpleProjection {
	year: number;
	propertyValue: number;
	mainLoanBalance: number;
	equityLoanBalance: number;
	afterTaxCashFlow: number;
	taxBenefit: number;
	propertyEquity: number;
}

interface InvestmentResultsDetailedProps {
	projections: SimpleProjection[];
	yearTo: number;
	initialPropertyValue: number;
	totalProjectCost: number;
	cpiRate: number;
	formatCurrency: (n: number) => string;
	formatPercentage: (n: number) => string;
}

export const InvestmentResultsDetailed: React.FC<InvestmentResultsDetailedProps> = ({
	projections,
	yearTo,
	initialPropertyValue,
	totalProjectCost,
	cpiRate,
	formatCurrency,
	formatPercentage,
}) => {
	const { propertyData } = usePropertyData();
	const [isOpen, setIsOpen] = useState(true);

	// Sale assumptions
	const [commissionRate, setCommissionRate] = useState<number>(2.2);
	const [marketingCost, setMarketingCost] = useState<number>(2500);
	const [otherSellingCost, setOtherSellingCost] = useState<number>(0);

	const filtered = useMemo(() => projections.filter(p => p.year >= 1 && p.year <= yearTo), [projections, yearTo]);
	const yearToData = useMemo(() => projections.find(p => p.year === yearTo), [projections, yearTo]);

	const salePrice = yearToData?.propertyValue ?? 0;
	const balancesAtSale = (yearToData?.mainLoanBalance ?? 0) + (yearToData?.equityLoanBalance ?? 0);
	const sellingCosts = salePrice * (commissionRate / 100) + (marketingCost || 0) + (otherSellingCost || 0);
	const equityThroughGrowth = Math.max(0, salePrice - (initialPropertyValue || 0));

	// CGT calculation (simplified)
	const { cgt, taxableGain, capitalGainRaw, discountApplied } = useMemo(() => {
		const rawGain = salePrice - totalProjectCost - sellingCosts;
		const discountEligible = yearTo >= 2;
		const discounted = Math.max(0, rawGain) * (discountEligible ? 0.5 : 1);

		// CPI index incomes to sale year
		const cpiMultiplier = yearTo >= 1 ? Math.pow(1 + (cpiRate || 0) / 100, yearTo - 1) : 1;

		let cgtSum = 0;
		propertyData.clients.forEach(client => {
			const allocation = propertyData.ownershipAllocations.find(o => o.clientId === client.id);
			const pct = (allocation?.ownershipPercentage ?? 0) / 100;
			if (pct <= 0) return;
			const baseIncome = (client.annualIncome + client.otherIncome) * cpiMultiplier;
			const share = discounted * pct;
			const before = totalTaxAU(baseIncome, client.hasMedicareLevy);
			const after = totalTaxAU(baseIncome + share, client.hasMedicareLevy);
			cgtSum += Math.max(0, after - before);
		});

		return { cgt: cgtSum, taxableGain: discounted, capitalGainRaw: rawGain, discountApplied: discountEligible };
	}, [salePrice, totalProjectCost, sellingCosts, propertyData, cpiRate, yearTo]);

	const netProceedsAfterSale = Math.max(0, salePrice - sellingCosts - balancesAtSale - cgt);

	// Cashflow aggregates
	const cumulativeOutOfPocket = useMemo(() => {
		return Math.abs(filtered.reduce((sum, p) => sum + Math.min(0, p.afterTaxCashFlow), 0));
	}, [filtered]);
	const totalNetCashflow = useMemo(() => filtered.reduce((sum, p) => sum + p.afterTaxCashFlow, 0), [filtered]);

	// Tax aggregates
	const totalBenefitPositiveOnly = useMemo(() => filtered.reduce((s, p) => s + Math.max(0, p.taxBenefit), 0), [filtered]);
	const totalTaxImpact = useMemo(() => filtered.reduce((s, p) => s + p.taxBenefit, 0), [filtered]);
	const first5YearsBenefits = useMemo(() => filtered.filter(p => p.year <= 5).reduce((s, p) => s + Math.max(0, p.taxBenefit), 0), [filtered]);

	const totalEquityAtYearTo = Math.max(0, yearToData?.propertyEquity ?? 0);
	const simpleROI = cumulativeOutOfPocket > 0 ? (totalEquityAtYearTo / cumulativeOutOfPocket) * 100 : 0;

	return (
		<Card className="mt-6">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger asChild>
					<CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg font-semibold text-foreground">Investment Results (Detailed)</CardTitle>
							<ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
						</div>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="pt-0 space-y-6">
						{/* Key Investment Results Summary */}
						<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
							<div className="rounded-lg border p-4 bg-muted/20">
								<div className="text-xs text-muted-foreground">Total Equity (Year {yearTo})</div>
								<div className="text-2xl font-bold text-primary">{formatCurrency(totalEquityAtYearTo)}</div>
							</div>
							<div className="rounded-lg border p-4 bg-muted/20">
								<div className="text-xs text-muted-foreground">Net Proceeds After Sale</div>
								<div className="text-2xl font-bold text-primary">{formatCurrency(netProceedsAfterSale)}</div>
							</div>
							<div className="rounded-lg border p-4 bg-muted/20">
								<div className="text-xs text-muted-foreground">Simple ROI</div>
								<div className={`text-2xl font-bold ${simpleROI >= 0 ? 'text-success' : 'text-destructive'}`}>{formatPercentage(simpleROI)}</div>
							</div>
						</div>

						{/* Net Growth */}
						<Card className="bg-muted/10 border">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Net Growth</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="pt-0 space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Equity through growth</div>
										<div className="text-xl font-bold">{formatCurrency(equityThroughGrowth)}</div>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Total equity (Year {yearTo})</div>
										<div className="text-xl font-bold">{formatCurrency(totalEquityAtYearTo)}</div>
									</div>
								</div>

								{/* Sale assumptions */}
								<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Sale price (Year {yearTo})</div>
										<div className="font-semibold">{formatCurrency(salePrice)}</div>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Commission (%)</div>
										<input
											type="number"
											value={commissionRate}
											onChange={e => setCommissionRate(parseFloat(e.target.value) || 0)}
											className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
										/>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Marketing/other ($)</div>
										<input
											type="number"
											value={marketingCost}
											onChange={e => setMarketingCost(parseFloat(e.target.value) || 0)}
											className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
										/>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Misc. sale costs ($)</div>
										<input
											type="number"
											value={otherSellingCost}
											onChange={e => setOtherSellingCost(parseFloat(e.target.value) || 0)}
											className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Selling costs</div>
										<div className="font-semibold">{formatCurrency(sellingCosts)}</div>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Outstanding balances at sale</div>
										<div className="font-semibold">{formatCurrency(balancesAtSale)}</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Capital gain (raw)</div>
										<div className={`font-semibold ${capitalGainRaw >= 0 ? 'text-foreground' : 'text-destructive'}`}>{formatCurrency(capitalGainRaw)}</div>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Discount applied</div>
										<div className="font-semibold">{discountApplied ? '50% (held > 12 months)' : 'No'}</div>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Taxable gain</div>
										<div className="font-semibold">{formatCurrency(taxableGain)}</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Estimated CGT (household)</div>
										<div className="text-xl font-bold text-destructive">{formatCurrency(cgt)}</div>
									</div>
									<div className="rounded-lg border p-3">
										<div className="text-xs text-muted-foreground">Net proceeds after sale</div>
										<div className="text-xl font-bold text-primary">{formatCurrency(netProceedsAfterSale)}</div>
									</div>
								</div>

								<div className="text-xs text-muted-foreground">Note: CGT is a simplified projection using household marginal tax rates and the 50% discount where eligible.</div>
							</CardContent>
						</Card>

						{/* Cashflow */}
						<Card className="bg-muted/10 border">
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-semibold flex items-center gap-2"><Wallet className="h-4 w-4" /> Cashflow</CardTitle>
							</CardHeader>
							<CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="rounded-lg border p-3">
									<div className="text-xs text-muted-foreground">Cumulative out-of-pocket (Year 1-{yearTo})</div>
									<div className="text-xl font-bold text-destructive">{formatCurrency(cumulativeOutOfPocket)}</div>
								</div>
								<div className="rounded-lg border p-3">
									<div className="text-xs text-muted-foreground">Total net cashflow (Year 1-{yearTo})</div>
									<div className={`text-xl font-bold ${totalNetCashflow >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(totalNetCashflow)}</div>
								</div>
							</CardContent>
						</Card>

						{/* Tax benefits */}
						<Card className="bg-muted/10 border">
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-semibold flex items-center gap-2"><PiggyBank className="h-4 w-4" /> Tax Benefits</CardTitle>
							</CardHeader>
							<CardContent className="pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="rounded-lg border p-3">
									<div className="text-xs text-muted-foreground">Total benefit (positive only)</div>
									<div className="text-xl font-bold text-success">{formatCurrency(totalBenefitPositiveOnly)}</div>
									<div className="text-xs text-muted-foreground">Year 1-{yearTo}</div>
								</div>
								<div className="rounded-lg border p-3">
									<div className="text-xs text-muted-foreground">Total tax impact</div>
									<div className={`text-xl font-bold ${totalTaxImpact >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(totalTaxImpact)}</div>
									<div className="text-xs text-muted-foreground">Year 1-{yearTo}</div>
								</div>
								<div className="rounded-lg border p-3">
									<div className="text-xs text-muted-foreground">First 5 years benefits</div>
									<div className="text-xl font-bold text-success">{formatCurrency(first5YearsBenefits)}</div>
								</div>
								<div className="rounded-lg border p-3 md:col-span-3">
									<div className="text-xs text-muted-foreground">CGT Projection (at sale year)</div>
									<div className="font-semibold">{formatCurrency(cgt)} estimated CGT using discounted taxable gain of {formatCurrency(taxableGain)}</div>
								</div>
							</CardContent>
						</Card>
					</CardContent>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
};

export default InvestmentResultsDetailed; 