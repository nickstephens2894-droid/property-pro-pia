import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyDataProvider } from "./contexts/PropertyDataContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppNav from "./components/AppNav";
import Index from "./pages/Index";
import Projections from "./pages/Projections";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Properties from "./pages/Properties";
import Scenarios from "./pages/Scenarios";
import Auth from "./pages/Auth";
import SpecPage from "./pages/SpecPage";
import { RepoProvider } from "./services/repository";
import SeedDemo from "./components/SeedDemo";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <RepoProvider>
      <SeedDemo />
      <QueryClientProvider client={queryClient}>
        <PropertyDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen">
                <AppNav />
                <main className="pt-4">
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                    <Route path="/projections" element={<RequireAuth><Projections /></RequireAuth>} />
                    <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
                    <Route path="/properties" element={<RequireAuth><Properties /></RequireAuth>} />
                    <Route path="/scenarios" element={<RequireAuth><Scenarios /></RequireAuth>} />
                    <Route path="/spec" element={<SpecPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </PropertyDataProvider>
      </QueryClientProvider>
    </RepoProvider>
  </AuthProvider>
);

export default App;
