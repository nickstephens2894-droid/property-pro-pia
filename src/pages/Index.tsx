import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ComingSoonHero from "@/components/ComingSoonHero";
import EarlyAccessBenefits from "@/components/EarlyAccessBenefits";
import LaunchTimeline from "@/components/LaunchTimeline";
import WaitlistCTA from "@/components/WaitlistCTA";
import LandingFooter from "@/components/LandingFooter";

const Index = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // SEO for landing page
    document.title = user 
      ? "Home | Property Pro" 
      : "Property Pro - Coming Soon | Australian Property Investment Analysis";
    
    const desc = user
      ? "Welcome to Property Pro - Your property investment analysis dashboard with projections, investors, and scenarios."
      : "Join the waitlist for Australia's most advanced property investment platform. Early access starts Q1 2025 with exclusive founding member benefits and 30% launch discount.";
    
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/`;

    // Add structured data for SEO
    let structuredData = document.querySelector('#structured-data') as HTMLScriptElement | null;
    if (!structuredData && !user) {
      structuredData = document.createElement('script') as HTMLScriptElement;
      structuredData.id = 'structured-data';
      structuredData.type = 'application/ld+json';
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Property Pro",
        "description": "Professional Australian property investment analysis platform",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "AUD",
          "description": "Free tier available"
        },
        "featureList": [
          "Australian Tax Calculations",
          "40-Year Property Projections", 
          "Multi-Investor Modeling",
          "Professional Reporting"
        ]
      });
      document.head.appendChild(structuredData);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading Property Pro...</p>
        </div>
      </div>
    );
  }

  // Home page for all users (authenticated and unauthenticated)
  return (
    <main className="min-h-screen">
      <ComingSoonHero />
      <EarlyAccessBenefits />
      <LaunchTimeline />
      <WaitlistCTA />
      <LandingFooter />
    </main>
  );
};

export default Index;
