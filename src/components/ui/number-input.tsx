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
  // Separate state for input values to allow free editing - initialize once
  const [displayValue, setDisplayValue] = useState<string>(value === 0 ? "" : value.toString());
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    // Select all text on focus for easy replacement
    setTimeout(() => {
      const input = document.getElementById(id) as HTMLInputElement;
      input?.select();
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let numericValue = displayValue === "" ? 0 : Number(displayValue);
    
    // Apply min/max constraints
    if (min !== undefined) numericValue = Math.max(min, numericValue);
    if (max !== undefined) numericValue = Math.min(max, numericValue);
    
    onChange(numericValue);
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