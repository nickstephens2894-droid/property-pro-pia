import { useEffect, useState } from "react";
import PropertyAnalysis from "@/components/PropertyAnalysis";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // SEO
    document.title = authed ? "Dashboard | Property Pro" : "Property Pro – Property Investment Analysis";
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

  return (
    <main className="space-y-8">
      <header className="flex justify-end">
        {authed ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/projections">Open dashboard</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">Login / Sign up</Link>
          </Button>
        )}
      </header>

      {authed ? (
        <PropertyAnalysis />
      ) : (
        <section className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Property Investment Analysis</h1>
          <p className="text-muted-foreground">
            Model cash flows, compare scenarios, and manage clients — all in one place.
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
