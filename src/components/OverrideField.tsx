import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Triplet } from "@/utils/overrides";

interface OverrideFieldProps {
  label: string;
  triplet: Triplet<number>;
  onChange: (t: Triplet<number>) => void;
  unit?: "%" | "$";
  placeholder?: string;
}

export const OverrideField: React.FC<OverrideFieldProps> = ({
  label,
  triplet,
  onChange,
  unit,
  placeholder,
}) => {
  const isManual = triplet.mode === "manual";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        <Badge variant={isManual ? "default" : "secondary"}>Active: {isManual ? "Manual" : "Auto"}</Badge>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex w-full sm:w-auto rounded-md border border-input overflow-hidden">
          <Button
            type="button"
            size="sm"
            variant={isManual ? "ghost" : "default"}
            className="rounded-none"
            onClick={() => onChange({ ...triplet, mode: "auto" })}
          >
            Auto
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isManual ? "default" : "ghost"}
            className="rounded-none border-l"
            onClick={() => onChange({ ...triplet, mode: "manual" })}
          >
            Manual
          </Button>
        </div>
        <div className="flex-1 w-full grid grid-cols-1 gap-2">
          <div className="relative">
            <Input
              value={isManual ? (triplet.manual ?? "") : (triplet.auto ?? "")}
              onChange={(e) =>
                onChange({
                  ...triplet,
                  manual: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              inputMode="decimal"
              pattern="^-?\d*\.?\d*$"
              readOnly={!isManual}
              disabled={!isManual}
              aria-label={`${label} value`}
              className="h-9 pr-8"
              placeholder={placeholder}
            />
            {unit && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
