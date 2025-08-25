import { Check, Clock, AlertCircle } from "lucide-react";

interface SaveIndicatorProps {
  hasUnsavedChanges: boolean;
  saving: boolean;
  isEditMode: boolean;
  className?: string;
}

export const SaveIndicator = ({ 
  hasUnsavedChanges, 
  saving, 
  isEditMode, 
  className = "" 
}: SaveIndicatorProps) => {
  if (!isEditMode) {
    return null;
  }

  if (saving) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-amber-600 ${className}`}>
        <Clock className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-orange-600 ${className}`}>
        <AlertCircle className="h-3 w-3" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-green-600 ${className}`}>
      <Check className="h-3 w-3" />
      <span>All changes saved</span>
    </div>
  );
};