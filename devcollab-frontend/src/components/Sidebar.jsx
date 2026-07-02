import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { label: "Workspaces", icon: "⬡", path: "/app" },
  { label: "AI Assistant", icon: "✦", path: "/app/ai" },
  { label: "Code Review", icon: "◈", path: "/app/code-review" },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="w-[220px] min-w-[220px] bg-[#0d1117] border-r border-[#1e2535] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1e2535]">
        <div className="flex items-center gap-3 pl-1">

          {/* Logo Box */}
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src="/logo.png"
              alt="DevCollab"
              className="w-5 h-5 object-contain"
            />
          </div>

          {/* Text */}
          <span className="font-semibold text-white text-[15px] tracking-tight">
            DevCollab
          </span>

        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                active
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2035]"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#1e2535]">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left border border-transparent hover:border-red-500/20"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
