import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react";
import { ScenarioInstanceWithData } from "@/types/scenarios";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface ScenarioInstanceCardProps {
  scenarioInstance: ScenarioInstanceWithData;
  onEdit: () => void;
  onRemove: () => void;
  onApply: () => void;
  canApply: boolean;
}

export const ScenarioInstanceCard: React.FC<ScenarioInstanceCardProps> = ({
  scenarioInstance,
  onEdit,
  onRemove,
  onApply,
  canApply,
}) => {
  const getStatusIcon = () => {
    switch (scenarioInstance.status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "conflict":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "draft":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Layers className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (scenarioInstance.status) {
      case "synced":
        return "bg-green-100 text-green-800";
      case "conflict":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isModified = scenarioInstance.is_modified;
  const hasConflicts = scenarioInstance.has_conflicts;
  const canApplyInstance =
    canApply &&
    (scenarioInstance.status === "draft" ||
      scenarioInstance.status === "conflict");

  return (
    <Card
      className={`transition-all duration-200 ${
        isModified ? "border-orange-200 bg-orange-50/30" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <CardTitle className="text-base sm:text-lg truncate">
                {scenarioInstance.scenario_name}
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              {scenarioInstance.original_instance_id
                ? "Copied from existing instance"
                : "New instance"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${getStatusColor()} text-xs`}>
              {scenarioInstance.status}
            </Badge>
            {isModified && (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200 text-xs"
              >
                Modified
              </Badge>
            )}
            {hasConflicts && (
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-200 text-xs"
              >
                Conflicts
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instance Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Purchase Price
            </span>
            <span className="font-medium text-sm sm:text-base">
              {formatCurrency(
                scenarioInstance.instance_data_parsed.purchase_price
              )}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Weekly Rent
            </span>
            <span className="font-medium text-sm sm:text-base">
              {formatCurrency(
                scenarioInstance.instance_data_parsed.weekly_rent
              )}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Property Method
            </span>
            <span className="text-xs sm:text-sm">
              {scenarioInstance.instance_data_parsed.property_method || "N/A"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Funding Method
            </span>
            <span className="text-xs sm:text-sm">
              {scenarioInstance.instance_data_parsed.funding_method || "N/A"}
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-1 pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created</span>
            <span>{formatDate(scenarioInstance.created_at)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Modified</span>
            <span>{formatDate(scenarioInstance.last_modified_at)}</span>
          </div>
          {scenarioInstance.last_synced_at && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last Synced</span>
              <span>{formatDate(scenarioInstance.last_synced_at)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 order-1 sm:order-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {canApplyInstance && (
            <Button
              variant="default"
              size="sm"
              onClick={onApply}
              className="flex-1 order-2 sm:order-2"
            >
              <Play className="h-4 w-4 mr-2" />
              Apply
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive order-3 sm:order-3 sm:w-auto"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="sm:hidden">Remove</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
