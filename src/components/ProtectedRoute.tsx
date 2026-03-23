import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const attemptedPath = `${location.pathname}${location.search}${location.hash}`;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-onerpm-dark-blue to-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-onerpm-orange mx-auto mb-4" />
          <p className="text-white/70">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: attemptedPath }} />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;