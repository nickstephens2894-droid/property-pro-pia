import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

export default function AppNav({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Button
      key={to}
      variant={pathname === to ? "default" : "outline"}
      size="sm"
      onClick={() => navigate(to)}
    >
      {label}
    </Button>
  );
  return (
    <nav className={cn("flex flex-wrap gap-2", className)} aria-label="Primary">
      {link("/", "Analysis")}
      {link("/projections", "Projections")}
      {link("/clients", "Clients")}
      {link("/properties", "Properties")}
      {link("/scenarios", "Scenarios")}
    </nav>
  );
}
