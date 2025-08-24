import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart3, FileText, PiggyBank, HelpCircle, X, Layers, Users, Building2, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "./UserProfile";

interface NavigationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavigationSidebar({ open, onOpenChange }: NavigationSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/instances", label: "Instances", icon: Layers },
    { to: "/projection-dashboard", label: "Projection Dashboard", icon: TrendingUp },
    { to: "/investors", label: "Investors", icon: Users },
    { to: "/properties", label: "Properties", icon: Building2 },
    { to: "/projections", label: "Projections", icon: BarChart3 },
    { to: "/funds", label: "Funds", icon: PiggyBank },
    { to: "/scenarios", label: "Scenarios", icon: FileText },
    { to: "/how-to", label: "How To", icon: HelpCircle },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    onOpenChange(false); // Close sidebar after navigation
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle>Menu</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col">
            {/* User Profile Section */}
            {user && (
              <div className="px-6 py-4 border-b border-border">
                <UserProfile />
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-4">
              <div className="space-y-1">
                {navigationItems.map(({ to, label, icon: Icon }) => {
                  const isActive = pathname === to;
                  return (
                    <Button
                      key={to}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => handleNavClick(to)}
                      className={cn(
                        "w-full justify-start gap-3 h-10 px-3",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Button>
                  );
                })}
              </div>
            </nav>

            {/* Footer Info */}
            <div className="px-6 py-4 border-t border-border">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-foreground">Property Pro</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Smart analysis for Australian property
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}