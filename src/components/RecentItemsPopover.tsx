import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, User, Building } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstances } from "@/contexts/InstancesContext";
import { useProperties } from "@/contexts/PropertiesContext";
import { useClients } from "@/hooks/useClients";

interface RecentItemsPopoverProps {
  children: React.ReactNode;
  type: "instances" | "investors" | "properties";
}

export function RecentItemsPopover({ children, type }: RecentItemsPopoverProps) {
  const navigate = useNavigate();
  const { instances, loading: instancesLoading } = useInstances();
  const { properties, loading: propertiesLoading } = useProperties();
  const { investors, loading: investorsLoading } = useClients();

  const getRecentItems = () => {
    switch (type) {
      case "instances":
        return {
          items: instances.slice(0, 3).map(item => ({
            id: item.id,
            name: item.name,
            subtitle: `Status: ${item.status}`,
            path: `/instances/${item.id}`
          })),
          loading: instancesLoading,
          viewAllPath: "/instances",
          viewAllLabel: "View All Instances",
          icon: FileText,
          emptyMessage: "No instances yet"
        };
      case "investors":
        return {
          items: investors.slice(0, 3).map(item => ({
            id: item.id,
            name: item.name,
            subtitle: `Income: $${item.annualIncome.toLocaleString()}`,
            path: `/investors/${item.id}`
          })),
          loading: investorsLoading,
          viewAllPath: "/investors",
          viewAllLabel: "View All Investors",
          icon: User,
          emptyMessage: "No investors yet"
        };
      case "properties":
        return {
          items: properties.slice(0, 3).map(item => ({
            id: item.id,
            name: item.name,
            subtitle: item.location || "No location",
            path: `/properties/${item.id}`
          })),
          loading: propertiesLoading,
          viewAllPath: "/properties",
          viewAllLabel: "View All Properties",
          icon: Building,
          emptyMessage: "No properties yet"
        };
    }
  };

  const { items, loading, viewAllPath, viewAllLabel, icon: Icon, emptyMessage } = getRecentItems();

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  const handleViewAllClick = () => {
    navigate(viewAllPath);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-3" 
        side="top" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Recent {type}</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.path)}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAllClick}
              className="w-full justify-between text-sm"
            >
              {viewAllLabel}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}