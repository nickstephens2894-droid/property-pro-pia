import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session?.user);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <p className="text-sm text-muted-foreground">Checking authentication…</p>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
