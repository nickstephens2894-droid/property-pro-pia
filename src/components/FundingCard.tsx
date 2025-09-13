import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { InstanceFunding } from "@/types/funding";

interface FundingCardProps {
  funding: InstanceFunding;
  onEdit: (funding: InstanceFunding) => void;
  onRemove: (fundingId: string) => void;
  onUpdateAmount: (fundingId: string, amount: number) => void;
}

export function FundingCard({
  funding,
  onEdit,
  onRemove,
  onUpdateAmount,
}: FundingCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(funding.id);
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
    }
  };

  const usagePercentage = funding.fund_total_amount
    ? (funding.amount_allocated / funding.fund_total_amount) * 100
    : 0;

  const fundIcon = funding.fund_type === "loan" ? Building2 : DollarSign;
  const FundIcon = fundIcon;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FundIcon className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">
                  {funding.fund_name || "Unknown Fund"}
                </h3>
                <Badge
                  variant={
                    funding.fund_type === "loan" ? "default" : "secondary"
                  }
                >
                  {funding.fund_type === "loan" ? "Loan Fund" : "Cash Fund"}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(funding)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Amount Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Allocated</p>
              <p className="text-lg font-semibold">
                {formatCurrency(funding.amount_allocated)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Used</p>
              <p className="text-lg font-semibold">
                {formatCurrency(funding.amount_used)}
              </p>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage Progress</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {/* Fund Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Fund Total</p>
              <p className="font-medium">
                {formatCurrency(funding.fund_total_amount || 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Available</p>
              <p className="font-medium">
                {formatCurrency(funding.fund_available_amount || 0)}
              </p>
            </div>
          </div>

          {/* Allocation Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Allocated on{" "}
              {new Date(funding.allocation_date).toLocaleDateString()}
            </span>
          </div>

          {/* Notes */}
          {funding.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Notes:</p>
                <p className="text-foreground">{funding.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Funding</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this funding allocation? This
              action cannot be undone. The allocated amount will be returned to
              the fund's available balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
