import { CheckCircle, AlertCircle, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { usePropertyData } from "@/contexts/PropertyDataContext";
import { getSectionGuidance, type SectionKey } from "@/utils/sectionGuidance";

// Keep local type to avoid tight coupling
export type CompletionStatus = "complete" | "warning" | "incomplete" | "error";

interface AccordionCompletionIndicatorProps {
  status: CompletionStatus;
  className?: string;
  sectionKey?: SectionKey;
}

export const AccordionCompletionIndicator = ({
  status,
  className,
  sectionKey,
}: AccordionCompletionIndicatorProps) => {
  const { propertyData } = usePropertyData();
  const guidance = sectionKey ? getSectionGuidance(propertyData, sectionKey) : null;

  const getIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusColor =
    status === "complete"
      ? "text-success"
      : status === "warning"
      ? "text-warning"
      : status === "error"
      ? "text-destructive"
      : "text-muted-foreground";

  const Trigger = (
    <div className={cn("flex items-center", className)} aria-label="Section status">
      {getIcon()}
    </div>
  );

  if (!guidance) return Trigger;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{Trigger}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <div className={cn("font-medium", statusColor)}>{guidance.title}</div>
          {guidance.items && guidance.items.length > 0 ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {guidance.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">This section looks good.</p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
