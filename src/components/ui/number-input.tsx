import { useState, useEffect } from "react";
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
  formatThousands?: boolean;
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
  max,
  formatThousands = true
}: NumberInputProps) => {
  // Helpers for formatting/unformatting with thousands separators
  const formatNumber = (num: number) =>
    formatThousands
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 }).format(num)
      : num.toString();
  const unformat = (val: string) => val.replace(/,/g, "");

  // Separate state for input values to allow free editing - initialize once (formatted when not focused)
  const [displayValue, setDisplayValue] = useState<string>(
    value === 0 ? "" : formatNumber(value)
  );
  const [isFocused, setIsFocused] = useState(false);

  // Keep display value in sync with external prop updates when not actively editing
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? "" : formatNumber(value));
    }
  }, [value, isFocused, formatNumber]);

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
    
    // Clean the input to only allow valid characters
    let cleanedInput = raw;
    if (formatThousands) {
      cleanedInput = raw.replace(/[^\d.-]/g, '');
    } else {
      cleanedInput = raw.replace(/[^\d.-]/g, '');
    }
    
    // Handle multiple decimal points by keeping only the first one
    const parts = cleanedInput.split('.');
    const validInput = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanedInput;
    
    // Convert to number, defaulting to 0 if invalid
    let numericValue = validInput === "" || validInput === "." || validInput === "-" ? 0 : Number(validInput);
    
    // Apply min/max constraints
    if (min !== undefined) numericValue = Math.max(min, numericValue);
    if (max !== undefined) numericValue = Math.min(max, numericValue);
    
    onChange(numericValue);
    // Re-apply formatting after editing (keep empty if user cleared)
    setDisplayValue(raw === "" ? "" : formatNumber(numericValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow any input while typing - we'll validate and format on blur
    setDisplayValue(inputValue);
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