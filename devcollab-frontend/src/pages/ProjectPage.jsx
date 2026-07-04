import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../services/project.service";
import { getWorkspace } from "../services/workspace.service";
import { getWorkspaceActivity } from "../services/activity.service";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import RoleBadge from "../components/RoleBadge";
import ProjectMembersModal from "../components/ProjectMembersModal";
import { canWrite, canManage, effectiveProjectRole } from "../utils/roles";

function ProjectPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [myWorkspaceRole, setMyWorkspaceRole] = useState("Viewer");
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [membersModalFor, setMembersModalFor] = useState(null);

  const fetchWorkspace = async () => {
    try {
      const data = await getWorkspace(workspaceId);
      setWorkspace(data.workspace);
      setMyWorkspaceRole(data.role);
    } catch {
      toast("Failed to load workspace", "error");
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getProjects(workspaceId);
      setProjects(data.projects || []);
    } catch {
      toast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const data = await getWorkspaceActivity(workspaceId);
      setActivities(data.activities || []);
    } catch {
      toast("Failed to load activity", "error");
    }
  };

  useEffect(() => {
    fetchWorkspace();
    fetchProjects();
    fetchActivity();
  }, [workspaceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await createProject({ ...form, workspaceId });
      toast("Project created!", "success");
      setModal(false);
      setForm({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      toast(err.response?.data?.message || "Failed", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();

    const confirmed = await confirmDialog(
      "This will permanently delete the project and all its tasks and wiki pages.",
      { title: "Delete this project?", confirmLabel: "Delete" },
    );
    if (!confirmed) return;

    try {
      await deleteProject(projectId);

      toast("Project deleted", "success");

      fetchProjects();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete project", "error");
    }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const activeProject = projects.find((p) => p._id === membersModalFor);
  const canCreateProject = canWrite(myWorkspaceRole);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back + Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/app")}
          className="text-slate-500 hover:text-slate-300 text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          ← Back to Workspaces
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {workspace?.name || "Workspace"}
            </h1>
            <RoleBadge role={myWorkspaceRole} />
          </div>
          {canCreateProject && (
            <Button onClick={() => setModal(true)}>+ New Project</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* ── Projects ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Projects
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-[#0d1117] border border-[#1e2535] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon="◈"
              title="No projects yet"
              subtitle={
                canCreateProject
                  ? "Create your first project in this workspace"
                  : "No projects have been created here yet"
              }
              action={
                canCreateProject && (
                  <Button onClick={() => setModal(true)}>Create Project</Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {projects.map((p) => {
                const myProjectRole = effectiveProjectRole(
                  p,
                  myWorkspaceRole,
                  user?.id,
                );
                return (
                  <div
                    key={p._id}
                    onClick={() =>
                      navigate(`/app/workspace/${workspaceId}/project/${p._id}`)
                    }
                    className="group bg-gradient-to-br from-[#0d1117] to-[#111827] border border-[#1e2535] hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 duration-300 animate-fadein"
                  >
                    {/* Top */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-xs">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMembersModalFor(p._id);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:bg-[#1a2035] hover:text-slate-200 transition-all"
                        >
                          Members
                        </button>
                        {canManage(myProjectRole) && (
                          <button
                            onClick={(e) => handleDelete(e, p._id)}
                            className="px-2.5 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <h2 className="font-semibold text-white text-[15px] mb-2 truncate">
                      {p.name}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                      {p.description || "No description"}
                    </p>

                    {/* Project ID */}
                    <div className="bg-[#111827] border border-[#1e2535] rounded-xl px-3 py-2 flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] text-slate-500 truncate">
                        ID: {p._id}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(p._id);

                          toast("Project ID copied", "success");
                        }}
                        className="text-xs text-indigo-300 hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-[#1e2535] flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        View tasks & wiki →
                      </span>
                      <RoleBadge role={myProjectRole} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Activity rail ── */}
        <div className="lg:sticky lg:top-8 bg-[#0d1117] border border-[#1e2535] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e2535] flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <h2 className="text-sm font-semibold text-white">Activity</h2>
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
            {activities.length === 0 ? (
              <div className="py-10">
                <EmptyState
                  icon="◎"
                  title="No activity yet"
                  subtitle="Actions will appear here"
                />
              </div>
            ) : (
              activities.map((a, i) => (
                <div
                  key={i}
                  className="flex gap-3 px-3 py-3 rounded-xl hover:bg-[#111827] transition-all animate-fadein"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-[10px] font-bold flex-shrink-0">
                    {(a.user?.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-300 leading-snug">
                      <span className="font-medium text-white">
                        {a.user?.name || "Someone"}
                      </span>{" "}
                      {a.action}
                      {a.project?.name && (
                        <span className="text-indigo-400">
                          {" "}
                          in {a.project.name}
                        </span>
                      )}
                    </p>
                    {a.metadata?.taskTitle && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        "{a.metadata.taskTitle}"
                      </p>
                    )}
                    <p className="text-[11px] text-slate-600 mt-1">
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {modal && (
        <Modal title="New Project" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Project Name
              </label>
              <input
                autoFocus
                placeholder="My Project"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="What are you building?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Project Members Modal */}
      {activeProject && (
        <ProjectMembersModal
          project={activeProject}
          workspaceMembers={workspace?.members || []}
          currentUserId={user?.id}
          myRole={effectiveProjectRole(
            activeProject,
            myWorkspaceRole,
            user?.id,
          )}
          onClose={() => setMembersModalFor(null)}
          onChanged={fetchProjects}
        />
      )}
    </div>
  );
}

export default ProjectPage;
