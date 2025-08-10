import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface YearProjection {
  year: number;
  totalInterest: number;
  mainLoanPayment: number;
  equityLoanPayment: number;
  mainLoanIOStatus: 'IO' | 'P&I';
  equityLoanIOStatus: 'IO' | 'P&I';
  taxableIncome: number;
  taxBenefit: number;
  afterTaxCashFlow: number;
  cumulativeCashFlow: number;
}

interface ConstructionPeriodTableProps {
  projection: YearProjection;
  months: number;
  formatCurrency: (amount: number) => string;
}

const ConstructionPeriodTable: React.FC<ConstructionPeriodTableProps> = ({ projection, months, formatCurrency }) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Metric</TableHead>
            <TableHead className="text-right">Construction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell className="text-right">{months} months (IO)</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Main Loan Status</TableCell>
            <TableCell className="text-right">{projection.mainLoanIOStatus}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Equity Loan Status</TableCell>
            <TableCell className="text-right">{projection.equityLoanIOStatus}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Main Loan Payment (IO)</TableCell>
            <TableCell className="text-right">{formatCurrency(projection.mainLoanPayment)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Equity Loan Payment (IO)</TableCell>
            <TableCell className="text-right">{formatCurrency(projection.equityLoanPayment)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Total Interest (Holding Costs)</TableCell>
            <TableCell className="text-right">{formatCurrency(projection.totalInterest)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tax Benefit</TableCell>
            <TableCell className="text-right">{formatCurrency(projection.taxBenefit)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>After-Tax Cash Flow</TableCell>
            <TableCell className="text-right">{formatCurrency(projection.afterTaxCashFlow)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cumulative Cash Flow</TableCell>
            <TableCell className="text-right">{formatCurrency(projection.cumulativeCashFlow)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default ConstructionPeriodTable;
