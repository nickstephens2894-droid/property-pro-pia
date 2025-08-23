import { useEffect, useState } from "react";
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
    value === 0 ? "0" : (value || value === 0) ? formatNumber(value) : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  // Keep display value in sync with external prop updates when not actively editing
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? "0" : (value || value === 0) ? formatNumber(value) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Remove formatting while editing and select all for easy replacement
    const unformattedValue = unformat(displayValue);
    setDisplayValue(unformattedValue);
    setTimeout(() => {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.select();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const raw = displayValue.trim();
    
    // Clean the input to only allow numbers and decimal points
    const cleanedInput = raw.replace(/[^\d.]/g, '');
    
    // Handle multiple decimal points by keeping only the first one
    const parts = cleanedInput.split('.');
    const validInput = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanedInput;
    
    // Convert to number, defaulting to 0 if invalid
    const numericValue = validInput === "" || validInput === "." ? 0 : Number(validInput);
    
    // Update the parent component
    onChange(numericValue);
    
    // Re-apply formatting after editing (show "0" for zero value, empty only when truly cleared)
    setDisplayValue(raw === "" ? "" : formatNumber(numericValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow any input while typing - we'll validate and format on blur
    setDisplayValue(inputValue);
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