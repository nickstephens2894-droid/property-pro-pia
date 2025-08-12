import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Building2, 
  TrendingUp, 
  Calculator, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles
} from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // SEO tags
    document.title = mode === "signin" ? "Sign in | Property Pro" : mode === "signup" ? "Create account | Property Pro" : mode === "forgot" ? "Reset password | Property Pro" : "Update password | Property Pro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Secure authentication for Property Pro: sign in, create account, and reset password.");
    } else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Secure authentication for Property Pro: sign in, create account, and reset password.";
      document.head.appendChild(m);
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/auth`;
  }, [mode]);

  useEffect(() => {
    // Listen for auth changes and redirect when logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const isRecoveryUrl = isRecovery || hashParams.get("type") === "recovery";
      if (event === "PASSWORD_RECOVERY" || isRecoveryUrl) {
        setMode("reset");
        return; // Don't redirect while in recovery
      }
      if (session?.user && !isRecoveryUrl && mode !== "reset") {
        navigate("/", { replace: true });
      }
    });

    // Also fetch existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const isRecoveryUrl = isRecovery || hashParams.get("type") === "recovery";
      if (session?.user && !isRecoveryUrl && mode !== "reset") navigate("/", { replace: true });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, mode, isRecovery]);

  // Handle URL/hash auth flows and surface errors
  useEffect(() => {
    const url = new URL(window.location.href);
    const searchType = url.searchParams.get("type");
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashType = hashParams.get("type");
    const recovery = (searchType || hashType) === "recovery";
    if (recovery) {
      setMode("reset");
      setIsRecovery(true);
    }
    const error = url.searchParams.get("error") || hashParams.get("error") || url.searchParams.get("error_code") || hashParams.get("error_code");
    const description = url.searchParams.get("error_description") || hashParams.get("error_description");
    if (error || description) {
      toast.error(description || "Authentication error");
    }
  }, []);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Unable to sign in");
    } else {
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    }
  };

  const signUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Unable to sign up");
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  const sendPasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    setLoading(false);
    if (error) toast.error(error.message || "Unable to send reset email");
    else {
      toast.success("Password reset email sent");
      setMode("signin");
    }
  };

  const updatePassword = async () => {
    if (!newPassword) return toast.error("Enter a new password");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || "Unable to update password");
        return;
      }
      toast.success("Password updated");
      setIsRecovery(false);
      setMode("signin");
      navigate("/", { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Unable to update password");
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email) return toast.error("Enter your email to resend confirmation");
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) toast.error(error.message || "Unable to resend confirmation");
    else toast.success("Confirmation email sent");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") await signIn();
    else if (mode === "signup") await signUp();
    else if (mode === "forgot") await sendPasswordReset();
    else if (mode === "reset") await updatePassword();
  };

  const getModeConfig = () => {
    switch (mode) {
      case "signin":
        return {
          title: "Welcome back",
          subtitle: "Sign in to your Property Pro account",
          icon: <User className="h-5 w-5 sm:h-6 sm:w-6" />,
          primaryAction: "Sign in",
          secondaryAction: "Create account",
          switchMode: () => setMode("signup")
        };
      case "signup":
        return {
          title: "Create your account",
          subtitle: "Start analyzing property investments today",
          icon: <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />,
          primaryAction: "Create account",
          secondaryAction: "Have an account? Sign in",
          switchMode: () => setMode("signin")
        };
      case "forgot":
        return {
          title: "Reset your password",
          subtitle: "Enter your email to receive a reset link",
          icon: <Lock className="h-5 w-5 sm:h-6 sm:w-6" />,
          primaryAction: "Send reset link",
          secondaryAction: "Back to sign in",
          switchMode: () => setMode("signin")
        };
      case "reset":
        return {
          title: "Set new password",
          subtitle: "Enter your new password below",
          icon: <Lock className="h-5 w-5 sm:h-6 sm:w-6" />,
          primaryAction: "Update password",
          secondaryAction: "Back to sign in",
          switchMode: () => setMode("signin")
        };
    }
  };

  const config = getModeConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 items-center">
        
        {/* Left Side - Hero Section */}
        <div className="hidden xl:block space-y-6 lg:space-y-8">
          <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Property Pro</h1>
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Professional Property Investment Analysis
            </h2>
            
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
              Model cash flows, compare scenarios, and make informed investment decisions with our comprehensive analysis tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calculator className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm lg:text-base">Advanced Calculations</span>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm lg:text-base">Growth Projections</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm lg:text-base">Scenario Analysis</span>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm lg:text-base">Tax Optimization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hero Section */}
        <div className="xl:hidden text-center space-y-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Property Pro</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Professional Property Investment Analysis
          </h2>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex justify-center w-full">
          <Card className="w-full max-w-sm sm:max-w-md border-0 shadow-xl lg:shadow-2xl bg-white/90 lg:bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-4 sm:pb-6">
              <div className="mx-auto p-2 sm:p-3 bg-primary/10 rounded-full w-fit">
                {config?.icon}
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                {config?.title}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 px-2">
                {config?.subtitle}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {(mode === "signin" || mode === "signup" || mode === "forgot") && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-primary focus:ring-primary text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}

                {(mode === "signin" || mode === "signup") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium"
                          onClick={() => setMode("forgot")}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-primary focus:ring-primary text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}

                {mode === "reset" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                        New password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <PasswordInput
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm new password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <PasswordInput
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-primary focus:ring-primary text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-3 sm:space-y-4 pt-2">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Please wait...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>{config?.primaryAction}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={config?.switchMode}
                    className="w-full h-11 sm:h-12 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    {config?.secondaryAction}
                  </Button>
                </div>

                {mode === "signin" && (
                  <div className="text-center pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={resendConfirmation}
                      className="text-xs sm:text-sm text-gray-600 hover:text-primary hover:bg-transparent"
                    >
                      Resend confirmation email
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
