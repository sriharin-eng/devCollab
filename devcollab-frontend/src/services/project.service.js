import api from "../api/axios";

export const getProjects = async (workspaceId) => {
  const res = await api.get(`/projects/${workspaceId}`);
  return res.data;
};

export const getProject = async (projectId) => {
  const res = await api.get(`/projects/detail/${projectId}`);
  return res.data;
};

export const createProject = async (data) => {
  const res = await api.post("/projects", data);
  return res.data;
};

export const deleteProject = async (projectId) => {
  const res = await api.delete(`/projects/${projectId}`);
  return res.data;
};

export const addProjectMember = async (projectId, userId, role) => {
  const res = await api.post(`/projects/${projectId}/members`, {
    userId,
    role,
  });
  return res.data;
};

export const updateProjectMemberRole = async (projectId, memberId, role) => {
  const res = await api.patch(`/projects/${projectId}/members/${memberId}`, {
    role,
  });
  return res.data;
};

export const removeProjectMember = async (projectId, memberId) => {
  const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
  return res.data;
};
