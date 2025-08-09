import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Users, Building2, Layers3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AppNav({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { to: "/", label: "Analysis", icon: Home },
    { to: "/projections", label: "Projections", icon: BarChart3 },
    { to: "/clients", label: "Clients", icon: Users },
    { to: "/properties", label: "Properties", icon: Building2 },
    { to: "/scenarios", label: "Scenarios", icon: Layers3 },
  ] as const;

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
    <>
      {/* Desktop top navigation */}
      <nav
        className={cn("hidden md:flex flex-wrap gap-2", className)}
        aria-label="Primary"
      >
        {items.map(({ to, label }) => link(to, label))}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        aria-label="Bottom navigation"
      >
        <ul className="grid grid-cols-5">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to} className="">
                <button
                  onClick={() => navigate(to)}
                  className={cn(
                    "w-full py-2.5 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="leading-none">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Reserve space for bottom tabs on mobile so content isn't hidden */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </>
  );
}
