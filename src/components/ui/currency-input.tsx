import { useState, useEffect } from "react";
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
  const [displayValue, setDisplayValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when value prop changes (unless user is typing)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value === 0 ? "" : value.toString());
    }
  }, [value, isFocused]);

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
    const numericValue = displayValue === "" ? 0 : Number(displayValue);
    
    // Only call onChange if the value actually changed
    if (numericValue !== value) {
      onChange(numericValue);
    }
    
    // Update display to show empty for zero values when not focused
    setDisplayValue(numericValue === 0 ? "" : numericValue.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string, numbers, and decimal points
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setDisplayValue(inputValue);
      
      // For real-time updates while typing (optional - could be removed if too aggressive)
      const numericValue = inputValue === "" ? 0 : Number(inputValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
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