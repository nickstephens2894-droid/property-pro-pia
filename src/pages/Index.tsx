import PropertyAnalysis from "@/components/PropertyAnalysis";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <main className="space-y-4">
      <header className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link to="/auth">Login / Sign up</Link>
        </Button>
      </header>
      <PropertyAnalysis />
    </main>
  );
};

export default Index;
