import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ScrollToTop from '@/components/ScrollToTop';
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import AdminShellFallback from "@/components/admin/AdminShellFallback";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AcceptAdminInvite from "./pages/AcceptAdminInvite";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { adminProtectedRoutes, getAdminPageTitle, prefetchAdminRoutes } from "@/config/adminRoutes";
import { useAuth } from "@/hooks/useAuth";

const AdminDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = getAdminPageTitle(location.pathname);
  }, [location.pathname]);

  return null;
};

const AdminRouteChunkPrefetcher = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    prefetchAdminRoutes();
  }, [user]);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminDocumentTitle />
          <AdminRouteChunkPrefetcher />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/accept-invite" element={<AcceptAdminInvite />} />
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
              {adminProtectedRoutes.map(({ path, component: Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={(
                    <Suspense fallback={<AdminShellFallback />}>
                      <Component />
                    </Suspense>
                  )}
                />
              ))}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
};

export default App;