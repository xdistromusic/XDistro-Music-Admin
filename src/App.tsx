import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ScrollToTop from '@/components/ScrollToTop';
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { adminProtectedRoutes, getAdminPageTitle } from "@/config/adminRoutes";

const AdminDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = getAdminPageTitle(location.pathname);
  }, [location.pathname]);

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
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
              {adminProtectedRoutes.map(({ path, component: Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={(
                    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading page...</div>}>
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