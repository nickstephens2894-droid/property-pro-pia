import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { validatePropertyValues } from "@/utils/calculationUtils";

export const ValidationWarnings = () => {
  const { propertyData } = usePropertyData();
  const validation = validatePropertyValues(propertyData);

  if (validation.isValid) {
    return (
      <Alert className="border-success/20 bg-success/10">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          All property data appears consistent and valid.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {validation.errors.map((error, index) => (
        <Alert key={index} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};