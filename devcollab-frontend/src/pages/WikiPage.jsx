import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getWikiPages,
  createWikiPage,
  updateWikiPage,
} from "../services/wiki.service";
import { useToast } from "../context/ToastContext";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { canWrite } from "../utils/roles";

function WikiPage({ role = "Viewer" }) {
  const { projectId } = useParams();
  const toast = useToast();
  const canEdit = canWrite(role);

  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const fetchPages = async () => {
    try {
      const data = await getWikiPages(projectId);
      const p = data.pages || [];
      setPages(p);
      if (p.length && !selected) setSelected(p[0]);
    } catch {
      toast("Failed to load wiki pages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const data = await createWikiPage({ ...form, projectId });
      const newPage = data.wiki;
      setPages((p) => [...p, newPage]);
      setSelected(newPage);
      setModal(false);
      setForm({ title: "", content: "" });
      toast("Page created!", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed", "error");
    }
    setSubmitting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateWikiPage(selected._id, editContent);
      const updated = data.wiki;
      setPages((p) => p.map((pg) => (pg._id === updated._id ? updated : pg)));
      setSelected(updated);
      setEditing(false);
      toast("Saved!", "success");
    } catch {
      toast("Failed to save", "error");
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wiki</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && <Button onClick={() => setModal(true)}>+ New Page</Button>}
      </div>

      {loading ? (
        <div className="h-64 bg-[#0d1117] border border-[#1e2535] rounded-2xl animate-pulse" />
      ) : (
        <div className="flex gap-6">
          {/* Page list sidebar */}
          <div className="w-52 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              Pages
            </p>
            {pages.length === 0 ? (
              <p className="text-sm text-slate-600 px-1">No pages yet</p>
            ) : (
              <div className="flex flex-col gap-1">
                {pages.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelected(p);
                      setEditing(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      selected?._id === p._id
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#1a2035]"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0 bg-[#0d1117] border border-[#1e2535] rounded-2xl p-6">
            {!selected ? (
              <EmptyState
                icon="◈"
                title="Select a page"
                subtitle="or create a new one"
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {selected.title}
                  </h2>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" loading={saving} onClick={handleSave}>
                          Save
                        </Button>
                      </>
                    ) : canEdit ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          setEditing(true);
                          setEditContent(selected.content || "");
                        }}
                      >
                        Edit
                      </Button>
                    ) : null}
                  </div>
                </div>

                {editing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={18}
                    className="w-full px-4 py-3 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all resize-none font-mono leading-relaxed"
                    placeholder="Write your wiki content here…"
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {selected.content ? (
                      <pre className="text-slate-300 text-sm leading-7 whitespace-pre-wrap font-sans">
                        {selected.content}
                      </pre>
                    ) : (
                      <p className="text-slate-600 italic">
                        No content yet. Click Edit to add content.
                      </p>
                    )}
                  </div>
                )}

                {/* Version count */}
                {selected.versions?.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#1e2535]">
                    <p className="text-xs text-slate-600">
                      {selected.versions.length} version
                      {selected.versions.length !== 1 ? "s" : ""} saved
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {modal && (
        <Modal title="New Wiki Page" onClose={() => setModal(false)} size="lg">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Title
              </label>
              <input
                autoFocus
                placeholder="Page title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
                className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Content
              </label>
              <textarea
                rows={8}
                placeholder="Page content…"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all resize-none font-mono"
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
                Create Page
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default WikiPage;
