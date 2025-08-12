import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const CurrencyInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "",
  className = "",
  disabled = false,
  readOnly = false
}: CurrencyInputProps) => {
  // Helpers for formatting/unformatting with thousands separators
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 }).format(num);
  const unformat = (val: string) => val.replace(/,/g, "");

  // Separate state for input values to allow free editing - initialize once (formatted when not focused)
  const [displayValue, setDisplayValue] = useState<string>(
    value === 0 ? "" : formatNumber(value)
  );
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    // Remove formatting while editing and select all for easy replacement
    setDisplayValue((prev) => unformat(prev));
    setTimeout(() => {
      const input = document.getElementById(id) as HTMLInputElement;
      input?.select();
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const raw = displayValue.trim();
    const numericValue = raw === "" ? 0 : Number(unformat(raw));
    onChange(numericValue);
    // Re-apply formatting after editing (keep empty if user cleared)
    setDisplayValue(raw === "" ? "" : formatNumber(numericValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string, numbers, and decimal points
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setDisplayValue(inputValue);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
        $
      </span>
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={cn("pl-8", className)}
      />
    </div>
  );
};