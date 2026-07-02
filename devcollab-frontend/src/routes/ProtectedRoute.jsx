import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
        <span className="spinner" />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" />;
  return children;
}

export default ProtectedRoute;
