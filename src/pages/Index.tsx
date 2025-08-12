import { useEffect, useState } from "react";
import PropertyAnalysis from "@/components/PropertyAnalysis";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const [authed] = useState(true);

  useEffect(() => {
    // SEO
    document.title = authed ? "Dashboard | Property Pro" : "Property Pro – Smart property analysis";
    const desc = authed
      ? "Analyze properties, projections, clients, and scenarios in your dashboard."
      : "Analyze property investments, model cash flows, and compare scenarios. Create your free account to get started.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/`;
  }, [authed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      {user ? (
        <PropertyAnalysis />
      ) : (
        <section className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Property Pro</h1>
          <p className="text-muted-foreground">
            Smart analysis for Australian property
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link to="/auth">Create your free account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </section>
      )}
    </main>
  );
};

export default Index;
