import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Users, Building2, FileText, PiggyBank, Layers } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "./UserProfile";

export default function AppNav({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const items = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/instances", label: "Instances", icon: Layers },
    { to: "/investors", label: "Investors", icon: Users },
    { to: "/models", label: "Models", icon: Building2 },
    { to: "/properties", label: "Properties", icon: Building2 },
    { to: "/funds", label: "Funds", icon: PiggyBank },
    { to: "/scenarios", label: "Scenarios", icon: FileText },
  ] as const;

  const link = (to: string, label: string) => (
    <Button
      key={to}
      variant={pathname === to ? "default" : "outline"}
      size="sm"
      onClick={() => navigate(to)}
      className={cn(
        "rounded-lg font-medium",
        pathname === to 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
      )}
    >
      {label}
    </Button>
  );

  return (
    <>
      {/* Desktop top navigation - Sticky */}
      <div className={cn("sticky top-0 z-50 bg-gray-50 border-b border-gray-200", className)}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Title and Subtitle */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-800">Property Pro</h1>
              <p className="text-sm text-gray-600">Smart analysis for Australian property</p>
            </div>
            
            {/* Center - Navigation Tabs */}
            <nav className="flex items-center gap-2" aria-label="Primary">
              {items.map(({ to, label }) => link(to, label))}
            </nav>
            
            {/* Right side - User profile */}
            {user && <UserProfile />}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {typeof document !== "undefined" &&
        createPortal(
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-[env(safe-area-inset-bottom)]"
            aria-label="Bottom navigation"
          >
            <ul className="grid grid-cols-6">
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
          </nav>,
          document.body
        )}

      {/* Reserve space for bottom tabs on mobile so content isn't hidden */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </>
  );
}
