import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Printer, ClipboardCopy, Check } from "lucide-react";

export default function SpecPage() {
  const [content, setContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // SEO: title, description, canonical
    const prevTitle = document.title;
    document.title = "Technical Spec - Property Analysis & Projections";

    const descId = "meta-description";
    let desc = document.querySelector(`meta[name="description"]`);
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute(
      "content",
      "Technical specification for the Property Investment Analysis & Projections app: data model, formulas, tax, and features."
    );

    const linkId = "canonical-link";
    let canonical = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    fetch("/TECHNICAL_SPEC.md")
      .then((res) => (res.ok ? res.text() : Promise.reject(res.statusText)))
      .then(setContent)
      .catch((e) => setError(typeof e === "string" ? e : "Failed to load spec"));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Copy failed. Please try downloading instead.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-8 py-6 md:py-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Technical Specification — Property Investment Analysis</h1>
        <p className="text-sm text-muted-foreground mt-2">View, download, copy, or print the full specification.</p>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        <a href="/TECHNICAL_SPEC.md" download>
          <Button variant="default">
            <Download className="mr-2 h-4 w-4" /> Download Markdown
          </Button>
        </a>
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />} {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>
      </div>

      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg">Specification Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <ScrollArea className="h-[70vh] pr-4">
              <article className="whitespace-pre-wrap break-words font-mono text-sm leading-6">
                {content || "Loading specification..."}
              </article>
            </ScrollArea>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Tip: For the best PDF output, use the Print / Save as PDF button above.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
