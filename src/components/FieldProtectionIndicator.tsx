import { Shield } from "lucide-react";
import { useInputProtection } from "@/hooks/useInputProtection";

interface FieldProtectionIndicatorProps {
  fieldId: string;
  className?: string;
}

export const FieldProtectionIndicator = ({ fieldId, className = "" }: FieldProtectionIndicatorProps) => {
  const { isFieldProtected } = useInputProtection();
  
  if (!isFieldProtected(fieldId)) {
    return null;
  }
  
  return (
    <div className={`inline-flex items-center gap-1 text-xs text-blue-600 ${className}`}>
      <Shield className="h-3 w-3" />
      <span>Protected</span>
    </div>
  );
};