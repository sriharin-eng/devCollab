import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Select from "./Select";
import RoleBadge from "./RoleBadge";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import {
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "../services/project.service";
import { canManage } from "../utils/roles";

const PROJECT_ROLES = ["Admin", "Member", "Viewer"];

function ProjectMembersModal({
  project,
  workspaceMembers,
  currentUserId,
  myRole,
  onClose,
  onChanged,
}) {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("Member");
  const [submitting, setSubmitting] = useState(false);

  const canManageMembers = canManage(myRole);

  const projectMemberIds = new Set(
    (project.members || []).map((m) => m.user?._id || m.user),
  );

  // Only workspace members who aren't already on this project can be added.
  const candidates = (workspaceMembers || []).filter(
    (m) => !projectMemberIds.has(m.user?._id || m.user),
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      await addProjectMember(project._id, userId, role);
      toast("Member added to project", "success");
      setUserId("");
      onChanged();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to add member", "error");
    }
    setSubmitting(false);
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateProjectMemberRole(project._id, memberId, newRole);
      toast("Role updated", "success");
      onChanged();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update role", "error");
    }
  };

  const handleRemove = async (memberId) => {
    const ok = await confirmDialog(
      "This member will lose access immediately.",
      { title: "Remove this member?", confirmLabel: "Remove" },
    );
    if (!ok) return;
    try {
      await removeProjectMember(project._id, memberId);
      toast("Member removed", "success");
      onChanged();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to remove member", "error");
    }
  };

  return (
    <Modal title={`Members · ${project.name}`} onClose={onClose} size="lg">
      <div className="flex flex-col gap-5">
        {canManageMembers && (
          <form onSubmit={handleAdd} className="flex gap-2 items-end">
            <Select
              className="flex-1"
              value={userId}
              onChange={setUserId}
              placeholder="Select a workspace member…"
              options={candidates.map((m) => {
                const id = m.user?._id || m.user;
                return {
                  value: id,
                  label: m.user?.name,
                  hint: `(${m.user?.email})`,
                };
              })}
            />
            <Select
              className="w-36"
              value={role}
              onChange={setRole}
              options={PROJECT_ROLES.map((r) => ({ value: r, label: r }))}
            />
            <Button
              type="submit"
              size="sm"
              loading={submitting}
              disabled={!userId}
            >
              Add
            </Button>
          </form>
        )}

        {canManageMembers && candidates.length === 0 && (
          <p className="text-xs text-slate-500 -mt-3">
            Everyone in the workspace is already on this project. Invite more
            people to the workspace first.
          </p>
        )}

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {project.members?.map((m) => {
            const memberId = m.user?._id || m.user;
            const isSelf = memberId === currentUserId;
            return (
              <div
                key={memberId}
                className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#0d1117] border border-[#1e2535] rounded-xl"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {m.user?.name || "Unknown"}{" "}
                    {isSelf && <span className="text-slate-500">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {m.user?.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {canManageMembers ? (
                    <Select
                      size="sm"
                      className="w-28"
                      value={m.role}
                      onChange={(newRole) =>
                        handleRoleChange(memberId, newRole)
                      }
                      options={PROJECT_ROLES.map((r) => ({
                        value: r,
                        label: r,
                      }))}
                    />
                  ) : (
                    <RoleBadge role={m.role} />
                  )}

                  {canManageMembers && (
                    <button
                      onClick={() => handleRemove(memberId)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!canManageMembers && (
          <p className="text-xs text-slate-500">
            Only project Admins (and workspace Admins/Owner) can add or manage
            members here.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default ProjectMembersModal;
