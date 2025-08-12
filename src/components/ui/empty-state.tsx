import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="text-center py-8">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h4 className="text-lg font-medium mb-2">{title}</h4>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button onClick={onAction}>
          <Icon className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
} 