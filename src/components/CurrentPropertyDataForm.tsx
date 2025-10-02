import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Info } from "lucide-react";
import { format } from "date-fns";
import { PropertyData } from "@/contexts/PropertyDataContext";

interface CurrentPropertyDataFormProps {
  propertyData: PropertyData;
  updateField: (field: keyof PropertyData, value: any) => void;
  className?: string;
}

export const CurrentPropertyDataForm: React.FC<
  CurrentPropertyDataFormProps
> = ({ propertyData, updateField, className = "" }) => {
  // Only show for current properties
  if (propertyData.propertyType !== "current") {
    return null;
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      updateField("originalPurchaseDate", date.toISOString().split("T")[0]);
    }
  };

  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Property Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Property Details</CardTitle>
          <CardDescription>
            Enter the current market value and rental details of your property.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPropertyValue">
                Current Property Value *
              </Label>
              <Input
                id="currentPropertyValue"
                type="number"
                value={propertyData.currentPropertyValue || ""}
                onChange={(e) =>
                  updateField(
                    "currentPropertyValue",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 860000"
              />
              <p className="text-xs text-muted-foreground">
                Current market value of your property
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyRent">Weekly Rent *</Label>
              <Input
                id="weeklyRent"
                type="number"
                value={propertyData.weeklyRent || ""}
                onChange={(e) =>
                  updateField("weeklyRent", parseFloat(e.target.value) || 0)
                }
                placeholder="e.g., 680"
              />
              <p className="text-xs text-muted-foreground">
                Current weekly rental income
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Purchase Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historical Purchase Data</CardTitle>
          <CardDescription>
            Enter the original purchase details. This data is used for tax
            calculations when selling the property.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPurchasePrice">
                Original Purchase Price
              </Label>
              <Input
                id="originalPurchasePrice"
                type="number"
                value={propertyData.originalPurchasePrice || ""}
                onChange={(e) =>
                  updateField(
                    "originalPurchasePrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 450000"
              />
              <p className="text-xs text-muted-foreground">
                Price you paid when you bought the property
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPurchaseDate">
                Original Purchase Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {propertyData.originalPurchaseDate
                      ? format(
                          parseDate(propertyData.originalPurchaseDate) ||
                            new Date(),
                          "PPP"
                        )
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseDate(propertyData.originalPurchaseDate)}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Date you purchased the property
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalStampDuty">Original Stamp Duty</Label>
              <Input
                id="originalStampDuty"
                type="number"
                value={propertyData.originalStampDuty || ""}
                onChange={(e) =>
                  updateField(
                    "originalStampDuty",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 15000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalLegalFees">Original Legal Fees</Label>
              <Input
                id="originalLegalFees"
                type="number"
                value={propertyData.originalLegalFees || ""}
                onChange={(e) =>
                  updateField(
                    "originalLegalFees",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalInspectionFees">
                Original Inspection Fees
              </Label>
              <Input
                id="originalInspectionFees"
                type="number"
                value={propertyData.originalInspectionFees || ""}
                onChange={(e) =>
                  updateField(
                    "originalInspectionFees",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Loan Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Loan Balances</CardTitle>
          <CardDescription>
            Enter your current outstanding loan balances. No validation is
            performed on these amounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentLoanBalance">
                Current Main Loan Balance
              </Label>
              <Input
                id="currentLoanBalance"
                type="number"
                value={propertyData.currentLoanBalance || ""}
                onChange={(e) =>
                  updateField(
                    "currentLoanBalance",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 50000"
              />
              <p className="text-xs text-muted-foreground">
                Outstanding balance on your main property loan
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentEquityLoanBalance">
                Current Equity Loan Balance
              </Label>
              <Input
                id="currentEquityLoanBalance"
                type="number"
                value={propertyData.currentEquityLoanBalance || ""}
                onChange={(e) =>
                  updateField(
                    "currentEquityLoanBalance",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 0"
              />
              <p className="text-xs text-muted-foreground">
                Outstanding balance on any equity loan (if applicable)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              Current Property Workflow
            </p>
            <p className="text-blue-700">
              For current properties, you input your actual loan balances and
              historical purchase data. The system focuses on projecting future
              cash flow and tax benefits rather than validating funding
              strategies. Original purchase data is used for capital gains tax
              calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};



