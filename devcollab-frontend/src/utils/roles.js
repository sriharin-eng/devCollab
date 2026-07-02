// Mirrors backend rbac.middleware.js ranking so the UI can hide controls
// a user isn't permitted to use (the server still enforces the real check).
export const ROLE_RANK = { Viewer: 0, Member: 1, Admin: 2, Owner: 3 };

export const rank = (role) => ROLE_RANK[role] ?? -1;

export const atLeast = (role, minRole) => rank(role) >= rank(minRole);

// Convenience helpers used throughout the dashboard.
export const canWrite = (role) => atLeast(role, "Member"); // create tasks, comment, edit wiki
export const canManage = (role) => atLeast(role, "Admin"); // delete project, manage members
export const isOwner = (role) => role === "Owner";

export const ROLE_BADGE_STYLES = {
  Owner: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Admin: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Member: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Viewer: "bg-slate-700/60 text-slate-400 border-slate-600/40",
};

// Mirrors the effective-role resolution in the backend's requireProjectRole
// middleware, so the UI can pre-compute a project role from data it already
// has (e.g. a project list response) without an extra round trip.
export const effectiveProjectRole = (project, workspaceRole, userId) => {
  if (workspaceRole === "Owner" || workspaceRole === "Admin") return "Admin";
  const membership = project.members?.find(
    (m) => (m.user?._id || m.user) === userId,
  );
  if (membership) return membership.role;
  if (workspaceRole === "Member") return "Member";
  return "Viewer";
};
