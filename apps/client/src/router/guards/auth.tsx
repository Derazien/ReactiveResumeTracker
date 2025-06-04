import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

import { useUser } from "@/client/services/user";
import { useAuthStore } from "@/client/stores/auth";

const DEV_USER_NAME = "DevUser";

export const AuthGuard = () => {
  const location = useLocation();
  const redirectTo = location.pathname + location.search;
  const setUser = useAuthStore((state) => state.setUser);

  const { user, loading } = useUser();

  // In development mode, if no user is found but we're not loading, try to auto-authenticate
  useEffect(() => {
    if (import.meta.env.DEV && !user && !loading) {
      // Create a minimal dev user if none exists
      const devUser = {
        id: "dev-user-id",
        name: DEV_USER_NAME, 
        email: "dev@localhost",
        username: "devuser",
        locale: "en-US",
        emailVerified: true,
        twoFactorEnabled: false,
        provider: "email" as const,
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(devUser);
    }
  }, [user, loading, setUser]);

  if (loading) return null;

  // In development mode, always allow access
  if (import.meta.env.DEV) {
    return <Outlet />;
  }

  if (user) {
    return <Outlet />;
  }

  return <Navigate replace to={`/auth/login?redirect=${redirectTo}`} />;
};
