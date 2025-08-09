import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        return;
      }
      if (session?.user) {
        navigate("/", { replace: true });
      }
    });

    // Also fetch existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/", { replace: true });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
      redirectTo: `${window.location.origin}/auth`,
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
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(error.message || "Unable to update password");
    else {
      toast.success("Password updated");
      navigate("/", { replace: true });
    }
  };

  const resendConfirmation = async () => {
    if (!email) return toast.error("Enter your email to resend confirmation");
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Set a new password"}</CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Welcome back. Enter your credentials."
              : mode === "signup"
              ? "Sign up with email and password."
              : mode === "forgot"
              ? "Enter your email to receive a reset link."
              : "Enter your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === "signin" || mode === "signup" || mode === "forgot") && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            )}

            {(mode === "signin" || mode === "signup") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-sm underline underline-offset-4"
                      onClick={() => setMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {mode === "reset" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-2">
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                  ? "Sign up"
                  : mode === "forgot"
                  ? "Send reset link"
                  : "Update password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setMode(
                    mode === "signin"
                      ? "signup"
                      : mode === "signup"
                      ? "signin"
                      : "signin"
                  )
                }
              >
                {mode === "signin"
                  ? "Create account"
                  : mode === "signup"
                  ? "Have an account? Sign in"
                  : "Back to sign in"}
              </Button>
            </div>

            {mode === "signin" && (
              <div className="pt-1">
                <Button type="button" variant="ghost" onClick={resendConfirmation}>
                  Resend confirmation email
                </Button>
              </div>
            )}

            <div className="pt-2">
              <Button type="button" variant="ghost" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
