import api from "../api/axios";

export const getWikiPages = async (projectId) => {
  const res = await api.get(`/wiki/${projectId}`);
  return res.data;
};

export const createWikiPage = async (data) => {
  const res = await api.post("/wiki", data);
  return res.data;
};

export const updateWikiPage = async (wikiId, content) => {
  const res = await api.patch(`/wiki/${wikiId}`, { content });
  return res.data;
};

export const deleteWikiPage = async (wikiId) => {
  const res = await api.delete(`/wiki/${wikiId}`);
  return res.data;
};
