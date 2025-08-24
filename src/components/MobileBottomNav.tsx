import * as React from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Layers, Users, Building2, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecentItemsPopover } from "./RecentItemsPopover";
import { NavigationSidebar } from "./NavigationSidebar";

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = React.useState(false);

  // Determine the primary icon and type based on current route (including sub-routes)
  const getPrimaryConfig = () => {
    if (pathname.startsWith("/instances")) {
      return { icon: Layers, type: "instances" as const, label: "Instances" };
    }
    if (pathname.startsWith("/investors")) {
      return { icon: Users, type: "investors" as const, label: "Investors" };
    }
    if (pathname.startsWith("/properties")) {
      return { icon: Building2, type: "properties" as const, label: "Properties" };
    }
    return { icon: Home, type: null, label: "Dashboard" };
  };

  const primaryConfig = getPrimaryConfig();

  const handlePrimaryClick = () => {
    if (primaryConfig.type) {
      // If we're on a data page, do nothing - the popover will handle it
      return;
    }
    // If we're on dashboard or other page, navigate to dashboard
    navigate("/");
  };

  return (
    <>
      {/* Mobile bottom navigation */}
      {typeof document !== "undefined" &&
        createPortal(
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-[env(safe-area-inset-bottom)]"
            aria-label="Bottom navigation"
          >
            <div className="flex h-14">
              {/* Primary Icon (Left) */}
              <div className="flex-1 flex items-center justify-center">
                {primaryConfig.type ? (
                  <RecentItemsPopover type={primaryConfig.type}>
                    <button
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors p-2",
                        "text-primary"
                      )}
                      aria-label={`${primaryConfig.label} menu`}
                    >
                      <primaryConfig.icon className="h-5 w-5" aria-hidden="true" />
                      <span className="leading-none">{primaryConfig.label}</span>
                    </button>
                  </RecentItemsPopover>
                ) : (
                  <button
                    onClick={handlePrimaryClick}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors p-2",
                      pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={primaryConfig.label}
                  >
                    <primaryConfig.icon className="h-5 w-5" aria-hidden="true" />
                    <span className="leading-none">{primaryConfig.label}</span>
                  </button>
                )}
              </div>

              {/* Menu Icon (Right) */}
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={() => setShowSidebar(true)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors p-2",
                    "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                  <span className="leading-none">Menu</span>
                </button>
              </div>
            </div>
          </nav>,
          document.body
        )}

      {/* Navigation Sidebar */}
      <NavigationSidebar open={showSidebar} onOpenChange={setShowSidebar} />

      {/* Reserve space for bottom nav so content isn't hidden */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </>
  );
}