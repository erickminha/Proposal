import { Navigate, useLocation } from "react-router-dom";

export default function PublicApplication() {
  const location = useLocation();
  return <Navigate to={`/candidatura${location.search || ""}`} replace />;
}
