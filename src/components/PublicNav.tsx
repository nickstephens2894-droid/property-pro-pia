import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PublicNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { label: "Home", path: "/" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "For Individuals", path: "/individual" },
    { label: "For Advisors", path: "/advisors" },
    { label: "For Businesses", path: "/enterprise" },
  ];

  const handleSignUp = () => {
    navigate("/signup");
    setIsOpen(false);
  };

  const handleLogin = () => {
    navigate("/auth");
    setIsOpen(false);
  };

  const handleDashboard = () => {
    navigate("/instances");
    setIsOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-foreground">
              Property Pro
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActiveRoute(item.path)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <Button onClick={handleDashboard} size="sm">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  Log In
                </Button>
                <Button size="sm" onClick={handleSignUp}>
                  Start Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-6 border-b">
                    <span className="text-lg font-bold">Property Pro</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col space-y-4 py-6">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`text-base font-medium transition-colors hover:text-primary ${
                          isActiveRoute(item.path)
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="mt-auto space-y-3">
                    {user ? (
                      <Button onClick={handleDashboard} className="w-full">
                        Go to Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleLogin}
                          className="w-full"
                        >
                          Log In
                        </Button>
                        <Button onClick={handleSignUp} className="w-full">
                          Start Free Analysis
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNav;