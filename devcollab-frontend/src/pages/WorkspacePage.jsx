import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from "../services/workspace.service";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import RoleBadge from "../components/RoleBadge";
import WorkspaceMembersModal from "../components/WorkspaceMembersModal";
import { isOwner } from "../utils/roles";

function WorkspacePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [membersModalFor, setMembersModalFor] = useState(null);

  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data.workspaces || []);
    } catch {
      toast("Failed to load workspaces", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const myRoleIn = (ws) =>
    ws.members?.find((m) => (m.user?._id || m.user) === user?.id)?.role ||
    "Viewer";

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await createWorkspace(form);
      toast("Workspace created!", "success");
      setModal(false);
      setForm({ name: "", description: "" });
      fetchWorkspaces();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to create", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const ok = await confirmDialog(
      "This will permanently delete the workspace, its projects, tasks, and wiki pages.",
      { title: "Delete this workspace?", confirmLabel: "Delete" },
    );
    if (!ok) return;
    try {
      await deleteWorkspace(id);
      toast("Workspace deleted", "success");
      fetchWorkspaces();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const activeWorkspace = workspaces.find((w) => w._id === membersModalFor);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Workspaces
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setModal(true)}>+ New Workspace</Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-[#0d1117] border border-[#1e2535] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          icon="⬡"
          title="No workspaces yet"
          subtitle="Create one to start collaborating"
          action={
            <Button onClick={() => setModal(true)}>Create Workspace</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const myRole = myRoleIn(ws);
            return (
              <div
                key={ws._id}
                onClick={() => navigate(`/app/workspace/${ws._id}`)}
                className="group bg-[#0d1117] border border-[#1e2535] hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 animate-fadein"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMembersModalFor(ws._id);
                      }}
                      className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:bg-[#1a2035] hover:text-slate-200 border border-transparent hover:border-[#2a3550] transition-all"
                    >
                      Members
                    </button>
                    {isOwner(myRole) && (
                      <button
                        onClick={(e) => handleDelete(e, ws._id)}
                        className="px-2 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="font-semibold text-white text-[15px] mb-1 truncate">
                  {ws.name}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                  {ws.description || "No description"}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>
                    {ws.members?.length || 1} member
                    {ws.members?.length !== 1 ? "s" : ""}
                  </span>
                  <span>·</span>
                  <RoleBadge role={myRole} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {modal && (
        <Modal title="New Workspace" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Name
              </label>
              <input
                autoFocus
                placeholder="My Workspace"
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
                placeholder="What's this workspace for?"
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

      {/* Members Modal */}
      {activeWorkspace && (
        <WorkspaceMembersModal
          workspace={activeWorkspace}
          currentUserId={user?.id}
          myRole={myRoleIn(activeWorkspace)}
          onClose={() => setMembersModalFor(null)}
          onChanged={fetchWorkspaces}
        />
      )}
    </div>
  );
}

export default WorkspacePage;
