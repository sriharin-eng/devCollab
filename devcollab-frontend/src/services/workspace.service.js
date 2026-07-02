import api from "../api/axios";

export const getWorkspaces = async () => {
  const res = await api.get("/workspaces");
  return res.data;
};

export const getWorkspace = async (workspaceId) => {
  const res = await api.get(`/workspaces/${workspaceId}`);
  return res.data;
};

export const createWorkspace = async (data) => {
  const res = await api.post("/workspaces", data);
  return res.data;
};

export const deleteWorkspace = async (workspaceId) => {
  const res = await api.delete(`/workspaces/${workspaceId}`);
  return res.data;
};

export const inviteWorkspaceMember = async (workspaceId, email, role) => {
  const res = await api.post(`/workspaces/${workspaceId}/members`, {
    email,
    role,
  });
  return res.data;
};

export const updateWorkspaceMemberRole = async (
  workspaceId,
  memberId,
  role,
) => {
  const res = await api.patch(
    `/workspaces/${workspaceId}/members/${memberId}`,
    { role },
  );
  return res.data;
};

export const removeWorkspaceMember = async (workspaceId, memberId) => {
  const res = await api.delete(
    `/workspaces/${workspaceId}/members/${memberId}`,
  );
  return res.data;
};
