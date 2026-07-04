import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-200 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center overflow-hidden mx-auto mb-6">
          <img
            src="/logo.png"
            alt="DevCollab"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <p className="text-6xl font-bold text-white tracking-tight mb-2">404</p>
        <h1 className="text-lg font-semibold text-white mb-2">
          This page doesn't exist
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you're looking for may have been moved, renamed, or never
          existed in the first place.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate(user ? "/app" : "/")}>
            {user ? "Back to workspaces" : "Back to home"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
