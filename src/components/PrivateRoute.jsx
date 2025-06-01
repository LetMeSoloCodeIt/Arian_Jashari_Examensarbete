import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export function PrivateRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();

  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }


  return <Outlet />;
} 