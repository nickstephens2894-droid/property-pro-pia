import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { TrendingUp, DollarSign, Home, Calculator } from "lucide-react";

interface YearProjection {
  year: number;
  rentalIncome: number;
  propertyValue: number;
  mainLoanBalance: number;
  equityLoanBalance: number;
  totalInterest: number;
  mainLoanPayment: number;
  equityLoanPayment: number;
  mainInterestYear: number;
  equityInterestYear: number;
  mainLoanIOStatus: "IO" | "P&I";
  equityLoanIOStatus: "IO" | "P&I";
  otherExpenses: number;
  depreciation: number;
  buildingDepreciation: number;
  fixturesDepreciation: number;
  taxableIncome: number;
  taxBenefit: number;
  afterTaxCashFlow: number;
  cumulativeCashFlow: number;
  propertyEquity: number;
  totalReturn: number;
}

interface ScenarioProjectionChartsProps {
  projections: YearProjection[];
  yearRange: [number, number];
}

export const ScenarioProjectionCharts: React.FC<
  ScenarioProjectionChartsProps
> = ({ projections, yearRange }) => {
  // Filter projections to the selected year range
  const filteredProjections = projections.filter(
    (p) => p.year >= yearRange[0] && p.year <= yearRange[1]
  );

  // Calculate key metrics for the selected period
  const totalRentalIncome = filteredProjections.reduce(
    (sum, p) => sum + p.rentalIncome,
    0
  );
  const totalPropertyValue =
    filteredProjections[filteredProjections.length - 1]?.propertyValue || 0;
  const totalTaxBenefit = filteredProjections.reduce(
    (sum, p) => sum + p.taxBenefit,
    0
  );
  const totalCashFlow = filteredProjections.reduce(
    (sum, p) => sum + p.afterTaxCashFlow,
    0
  );
  const finalEquity =
    filteredProjections[filteredProjections.length - 1]?.propertyEquity || 0;

  // Calculate growth rates
  const firstYear = filteredProjections[0];
  const lastYear = filteredProjections[filteredProjections.length - 1];
  const propertyValueGrowth =
    firstYear && lastYear
      ? ((lastYear.propertyValue - firstYear.propertyValue) /
          firstYear.propertyValue) *
        100
      : 0;
  const rentalIncomeGrowth =
    firstYear && lastYear
      ? ((lastYear.rentalIncome - firstYear.rentalIncome) /
          firstYear.rentalIncome) *
        100
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">
                Total Rental Income
              </span>
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(totalRentalIncome)}
            </div>
            <div className="text-xs text-muted-foreground">
              Over {yearRange[1] - yearRange[0] + 1} years
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">
                Property Value
              </span>
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(totalPropertyValue)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatPercentage(propertyValueGrowth)} growth
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">
                Tax Benefits
              </span>
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(Math.abs(totalTaxBenefit))}
            </div>
            <div className="text-xs text-muted-foreground">Total savings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">
                Final Equity
              </span>
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(finalEquity)}
            </div>
            <div className="text-xs text-muted-foreground">
              At year {yearRange[1]}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Cash Flow Analysis
          </CardTitle>
          <CardDescription>
            Annual after-tax cash flow over the projection period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 sm:h-64 flex items-end gap-1 overflow-x-auto">
              {filteredProjections.map((projection) => {
                const maxCashFlow = Math.max(
                  ...filteredProjections.map((p) =>
                    Math.abs(p.afterTaxCashFlow)
                  )
                );
                const height =
                  maxCashFlow > 0
                    ? (Math.abs(projection.afterTaxCashFlow) / maxCashFlow) *
                      180
                    : 0;

                return (
                  <div
                    key={projection.year}
                    className="flex-1 min-w-[20px] sm:min-w-[30px] flex flex-col items-center"
                  >
                    <div
                      className={`w-full rounded-t ${
                        projection.afterTaxCashFlow >= 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{ height: `${height}px` }}
                      title={`Year ${projection.year}: ${formatCurrency(
                        projection.afterTaxCashFlow
                      )}`}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {projection.year}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Year {yearRange[0]}</span>
              <span>Year {yearRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Value Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Property Value Growth
          </CardTitle>
          <CardDescription>
            Property value appreciation over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 sm:h-64 flex items-end gap-1 overflow-x-auto">
              {filteredProjections.map((projection) => {
                const maxValue = Math.max(
                  ...filteredProjections.map((p) => p.propertyValue)
                );
                const height =
                  maxValue > 0
                    ? (projection.propertyValue / maxValue) * 180
                    : 0;

                return (
                  <div
                    key={projection.year}
                    className="flex-1 min-w-[20px] sm:min-w-[30px] flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}px` }}
                      title={`Year ${projection.year}: ${formatCurrency(
                        projection.propertyValue
                      )}`}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {projection.year}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Year {yearRange[0]}</span>
              <span>Year {yearRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Income vs Expenses
          </CardTitle>
          <CardDescription>
            Rental income compared to total expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 sm:h-64 flex items-end gap-1 overflow-x-auto">
              {filteredProjections.map((projection) => {
                const maxValue = Math.max(
                  ...filteredProjections.map((p) =>
                    Math.max(p.rentalIncome, p.otherExpenses + p.totalInterest)
                  )
                );
                const incomeHeight =
                  maxValue > 0 ? (projection.rentalIncome / maxValue) * 180 : 0;
                const expenseHeight =
                  maxValue > 0
                    ? ((projection.otherExpenses + projection.totalInterest) /
                        maxValue) *
                      180
                    : 0;

                return (
                  <div
                    key={projection.year}
                    className="flex-1 min-w-[20px] sm:min-w-[30px] flex flex-col items-center"
                  >
                    <div className="flex flex-col w-full">
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${incomeHeight}px` }}
                        title={`Income: ${formatCurrency(
                          projection.rentalIncome
                        )}`}
                      />
                      <div
                        className="w-full bg-red-500"
                        style={{ height: `${expenseHeight}px` }}
                        title={`Expenses: ${formatCurrency(
                          projection.otherExpenses + projection.totalInterest
                        )}`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {projection.year}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Year {yearRange[0]}</span>
              <span>Year {yearRange[1]}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs sm:text-sm">Rental Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs sm:text-sm">Expenses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
