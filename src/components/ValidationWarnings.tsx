import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { validatePropertyValues } from "@/utils/calculationUtils";
import { 
  validatePersonalProfile,
  validatePropertyBasics,
  validateFinancing,
  validatePurchaseCosts,
  validateAnnualExpenses,
  validateConstruction,
  validateTaxOptimization,
  type CompletionStatus
} from "@/utils/validationUtils";

const getStatusInfo = (status: CompletionStatus) => {
  switch (status) {
    case 'complete':
      return { icon: CheckCircle, variant: 'default', bgClass: 'border-success/20 bg-success/10', textClass: 'text-success' };
    case 'warning':
      return { icon: AlertTriangle, variant: 'default', bgClass: 'border-warning/20 bg-warning/10', textClass: 'text-warning' };
    case 'incomplete':
      return { icon: Info, variant: 'default', bgClass: 'border-info/20 bg-info/10', textClass: 'text-info' };
    case 'error':
      return { icon: AlertTriangle, variant: 'destructive', bgClass: '', textClass: '' };
    default:
      return { icon: Info, variant: 'default', bgClass: '', textClass: '' };
  }
};

export const ValidationWarnings = () => {
  const { propertyData } = usePropertyData();
  
  // Get property values validation (has errors array)
  const propertyValuesValidation = validatePropertyValues(propertyData);
  
  // Run status-based validations
  const statusValidations = [
    { name: 'Personal Profile', status: validatePersonalProfile(propertyData) },
    { name: 'Property Basics', status: validatePropertyBasics(propertyData) },
    { name: 'Financing', status: validateFinancing(propertyData) },
    { name: 'Purchase Costs', status: validatePurchaseCosts(propertyData) },
    { name: 'Annual Expenses', status: validateAnnualExpenses(propertyData) },
    { name: 'Construction Details', status: validateConstruction(propertyData) },
    { name: 'Tax Optimization', status: validateTaxOptimization(propertyData) },
  ];

  // Check for any errors or warnings
  const hasPropertyValueErrors = propertyValuesValidation.errors.length > 0;
  const hasStatusErrors = statusValidations.some(v => v.status === 'error');
  const hasWarnings = statusValidations.some(v => v.status === 'warning' || v.status === 'incomplete');

  // If everything is valid, show success message
  if (!hasPropertyValueErrors && !hasStatusErrors && !hasWarnings) {
    const { icon: Icon, bgClass, textClass } = getStatusInfo('complete');
    return (
      <Alert className={bgClass}>
        <Icon className="h-4 w-4" />
        <AlertDescription className={textClass}>
          All property data is complete and consistent across all sections.
        </AlertDescription>
      </Alert>
    );
  }

  const allAlerts = [];

  // Add property values validation errors
  if (propertyValuesValidation.errors.length > 0) {
    propertyValuesValidation.errors.forEach((error, index) => {
      allAlerts.push(
        <Alert key={`property-values-${index}`} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Property Values Consistency:</span> {error}
          </AlertDescription>
        </Alert>
      );
    });
  }

  // Add status-based validation alerts
  statusValidations.forEach((validation, index) => {
    if (validation.status !== 'complete') {
      const { icon: Icon, bgClass, textClass } = getStatusInfo(validation.status);
      const statusMessages = {
        error: 'contains critical errors that must be fixed',
        warning: 'has warnings or missing optional data',
        incomplete: 'is incomplete and needs attention',
      };

      allAlerts.push(
        <Alert 
          key={`status-${index}`} 
          variant={validation.status === 'error' ? 'destructive' : 'default'} 
          className={bgClass}
        >
          <Icon className="h-4 w-4" />
          <AlertDescription className={textClass}>
            <span className="font-medium">{validation.name}</span> {statusMessages[validation.status as keyof typeof statusMessages]}
          </AlertDescription>
        </Alert>
      );
    }
  });

  return (
    <div className="space-y-2">
      {allAlerts}
    </div>
  );
};