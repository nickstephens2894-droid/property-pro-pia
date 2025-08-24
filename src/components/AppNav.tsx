import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Users, Building2, FileText, PiggyBank, Layers, HelpCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "./UserProfile";
import { MobileBottomNav } from "./MobileBottomNav";

export default function AppNav({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const items = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/instances", label: "Instances", icon: Layers },
    { to: "/investors", label: "Investors", icon: Users },
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
      {/* Desktop top navigation - Sticky - Hidden on mobile */}
      <div className={cn("sticky top-0 z-50 bg-gray-50 border-b border-gray-200 hidden md:block", className)}>
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
              {link("/how-to", "How To")}
            </nav>
            
            {/* Right side - User profile */}
            {user && <UserProfile />}
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </>
  );
}
