import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "./AdminAuth";

const PUBLIC_ROUTES = ["/login"];

export default function AdminRouteGate() {
  const router = useRouter();
  const auth = useAdminAuth();

  useEffect(() => {
    if (!auth.isReady) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);
    if (!isPublicRoute && !auth.isAuthenticated) {
      router.replace("/login");
    }

    if (isPublicRoute && auth.isAuthenticated) {
      router.replace("/");
    }
  }, [auth.isAuthenticated, auth.isReady, router]);

  if (!auth.isReady) {
    return null;
  }

  return null;
}
