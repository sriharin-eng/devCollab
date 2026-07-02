import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TaskPage from "./TaskPage";
import WikiPage from "./WikiPage";
import RoleBadge from "../components/RoleBadge";
import { getProject } from "../services/project.service";
import { useToast } from "../context/ToastContext";

const TABS = ["Tasks", "Wiki"];

function ProjectDetailPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("Tasks");
  const [role, setRole] = useState("Viewer");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProject(projectId)
      .then((data) => {
        if (cancelled) return;
        setRole(data.role);
      })
      .catch(() => {
        if (cancelled) return;
        toast("Failed to load project permissions", "error");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div>
      {/* Sub-nav */}
      <div className="border-b border-[#1e2535] px-8 pt-6 pb-0 flex items-center gap-6">
        <button
          onClick={() => navigate(`/app/workspace/${workspaceId}`)}
          className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors pb-4"
        >
          ← Back
        </button>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                tab === t
                  ? "border-indigo-500 text-indigo-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {loaded && (
          <div className="ml-auto pb-3">
            <RoleBadge role={role} />
          </div>
        )}
      </div>

      {/* Content */}
      {loaded && tab === "Tasks" && <TaskPage role={role} />}
      {loaded && tab === "Wiki" && <WikiPage role={role} />}
    </div>
  );
}

export default ProjectDetailPage;
