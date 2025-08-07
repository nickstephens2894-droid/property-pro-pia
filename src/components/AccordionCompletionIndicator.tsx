import { CheckCircle, AlertCircle, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CompletionStatus = 'complete' | 'warning' | 'incomplete' | 'error';

interface AccordionCompletionIndicatorProps {
  status: CompletionStatus;
  className?: string;
}

export const AccordionCompletionIndicator = ({ 
  status, 
  className 
}: AccordionCompletionIndicatorProps) => {
  const getIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      {getIcon()}
    </div>
  );
};