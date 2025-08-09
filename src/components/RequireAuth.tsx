export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  // Auth disabled for development: always render children
  return <>{children}</>;
};

export default RequireAuth;
