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
              <Route path="/projections" element={<Projections />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/auth" element={<Auth />} />
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
