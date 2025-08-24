import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PropertyDataProvider } from "./contexts/PropertyDataContext";
import { InstancesProvider } from "./contexts/InstancesContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppNav from "./components/AppNav";
import Index from "./pages/Index";
// import Projections from "./pages/Projections"; // Commented out - functionality integrated into instances
import NotFound from "./pages/NotFound";
import Investors from "./pages/Investors";
import Properties from "./pages/Properties";
import Funds from "./pages/Funds";
import Scenarios from "./pages/Scenarios";
import Instances from "./pages/Instances";
import AddInstance from "./pages/AddInstance";
import InstanceDetail from "./pages/InstanceDetail";
import CreateProperty from "./pages/CreateProperty";
import EditProperty from "./pages/EditProperty";
import Auth from "./pages/Auth";
import SpecPage from "./pages/SpecPage";
import HowTo from "./pages/HowTo";
import { RepositoryProvider } from "./services/repository";
import { PropertiesProvider } from "./contexts/PropertiesContext";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/auth");

  return (
    <div className="min-h-screen">
      {!hideNav && <AppNav />}
      <main className={hideNav ? "" : "pt-4"}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
          {/* <Route path="/projections" element={<RequireAuth><Projections /></RequireAuth>} /> */}
          <Route path="/investors" element={<RequireAuth><Investors /></RequireAuth>} />
          <Route path="/properties" element={<RequireAuth><Properties /></RequireAuth>} />
          <Route path="/funds" element={<RequireAuth><Funds /></RequireAuth>} />
          <Route path="/scenarios" element={<RequireAuth><Scenarios /></RequireAuth>} />
          <Route path="/instances" element={<RequireAuth><Instances /></RequireAuth>} />
          <Route path="/instances/add" element={<RequireAuth><AddInstance /></RequireAuth>} />
          <Route path="/instances/:id" element={<RequireAuth><InstanceDetail /></RequireAuth>} />
          <Route path="/properties/create" element={<RequireAuth><CreateProperty /></RequireAuth>} />
          <Route path="/properties/:propertyId/edit" element={<RequireAuth><EditProperty /></RequireAuth>} />
          <Route path="/how-to" element={<RequireAuth><HowTo /></RequireAuth>} />
          <Route path="/spec" element={<SpecPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <AuthProvider>
    <RepositoryProvider>
      <PropertiesProvider>
        {/* <SeedDemo /> */}
        <QueryClientProvider client={queryClient}>
          <PropertyDataProvider>
            <InstancesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppLayout />
                </BrowserRouter>
              </TooltipProvider>
            </InstancesProvider>
          </PropertyDataProvider>
        </QueryClientProvider>
      </PropertiesProvider>
    </RepositoryProvider>
  </AuthProvider>
);

export default App;
