import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Select from "./Select";
import RoleBadge from "./RoleBadge";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import {
  inviteWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../services/workspace.service";
import { canManage, isOwner } from "../utils/roles";

const INVITE_ROLES = ["Admin", "Member", "Viewer"];

function WorkspaceMembersModal({
  workspace,
  currentUserId,
  myRole,
  onClose,
  onChanged,
}) {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [submitting, setSubmitting] = useState(false);

  const canManageMembers = canManage(myRole);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await inviteWorkspaceMember(workspace._id, email.trim(), role);
      toast("Member added", "success");
      setEmail("");
      onChanged();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to add member", "error");
    }
    setSubmitting(false);
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateWorkspaceMemberRole(workspace._id, memberId, newRole);
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
      await removeWorkspaceMember(workspace._id, memberId);
      toast("Member removed", "success");
      onChanged();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to remove member", "error");
    }
  };

  return (
    <Modal title={`Members · ${workspace.name}`} onClose={onClose} size="lg">
      <div className="flex flex-col gap-5">
        {canManageMembers && (
          <form onSubmit={handleInvite} className="flex gap-2 items-end">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-3 py-2 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
            <Select
              className="w-36"
              value={role}
              onChange={setRole}
              options={INVITE_ROLES.map((r) => ({ value: r, label: r }))}
            />
            <Button type="submit" size="sm" loading={submitting}>
              Add
            </Button>
          </form>
        )}

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {workspace.members?.map((m) => {
            const memberId = m.user?._id || m.user;
            const isSelf = memberId === currentUserId;
            const memberIsOwner = isOwner(m.role);
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
                  {canManageMembers && !memberIsOwner ? (
                    <Select
                      size="sm"
                      className="w-28"
                      value={m.role}
                      onChange={(newRole) =>
                        handleRoleChange(memberId, newRole)
                      }
                      options={INVITE_ROLES.map((r) => ({
                        value: r,
                        label: r,
                      }))}
                    />
                  ) : (
                    <RoleBadge role={m.role} />
                  )}

                  {canManageMembers && !memberIsOwner && (
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
            Only workspace Admins and the Owner can invite or manage members.
          </p>
        )}
      </div>
    </Modal>
  );
}

export default WorkspaceMembersModal;
