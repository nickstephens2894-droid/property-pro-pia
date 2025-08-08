import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  step?: string;
  min?: number;
  max?: number;
}

export const NumberInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "",
  className = "",
  disabled = false,
  readOnly = false,
  step = "1",
  min,
  max
}: NumberInputProps) => {
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
    let raw = displayValue.trim();
    let numericValue = raw === "" ? 0 : Number(unformat(raw));
    
    // Apply min/max constraints
    if (min !== undefined) numericValue = Math.max(min, numericValue);
    if (max !== undefined) numericValue = Math.min(max, numericValue);
    
    onChange(numericValue);
    // Re-apply formatting after editing (keep empty if user cleared)
    setDisplayValue(raw === "" ? "" : formatNumber(numericValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string, numbers, and decimal points (and negative if no min or min < 0)
    const allowNegative = min === undefined || min < 0;
    const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    
    if (inputValue === "" || pattern.test(inputValue)) {
      setDisplayValue(inputValue);
    }
  };

  return (
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
      className={cn(className)}
    />
  );
};