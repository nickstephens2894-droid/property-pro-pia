import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyDataProvider } from "./contexts/PropertyDataContext";
import Index from "./pages/Index";
import Projections from "./pages/Projections";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Properties from "./pages/Properties";
import Scenarios from "./pages/Scenarios";
import Auth from "./pages/Auth";
import { RepoProvider } from "./services/repository";
import SeedDemo from "./components/SeedDemo";
import RequireAuth from "./components/RequireAuth";
const queryClient = new QueryClient();

const App = () => (
  <RepoProvider>
    <SeedDemo />
    <QueryClientProvider client={queryClient}>
      <PropertyDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/projections" element={<RequireAuth><Projections /></RequireAuth>} />
              <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
              <Route path="/properties" element={<RequireAuth><Properties /></RequireAuth>} />
              <Route path="/scenarios" element={<RequireAuth><Scenarios /></RequireAuth>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PropertyDataProvider>
    </QueryClientProvider>
  </RepoProvider>
);

export default App;
