import { useState } from "react";
import { useToast } from "../context/ToastContext";
import {
  getProjectSummary,
  detectBlockers,
  generateSubtasks,
} from "../services/ai.service";
import Button from "../components/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TABS = [
  { id: "summary",  label: "✦ Summary",  desc: "Get a progress overview of your project" },
  { id: "blockers", label: "⚠ Blockers", desc: "Detect risks in in-progress tasks" },
  { id: "subtasks", label: "⊞ Subtasks", desc: "Break a feature into actionable subtasks" },
];

const RUN_LABEL = {
  summary: "Generate Summary",
  blockers: "Detect Blockers",
  subtasks: "Generate Subtasks",
};

// Shared markdown renderer — same styling as the Code Review page, so AI
// output reads as formatted text instead of raw "**bold**" / "# heading" chars.
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mb-4 border-b border-[#1e2535] pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-white mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-indigo-300 mt-5 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-300 leading-7 mb-3">{children}</p>
  ),
  ul: ({ children }) => <ul className="mb-3 space-y-1">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-3 space-y-1 list-decimal ml-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="ml-5 list-disc mb-1 text-slate-300">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="bg-[#111827] border border-[#1e2535] px-1.5 py-0.5 rounded-md text-indigo-300 text-[13px]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-[#0b1220] border border-[#1e2535] rounded-xl p-4 overflow-x-auto text-sm my-3">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-400 my-3">
      {children}
    </blockquote>
  ),
};

function Markdown({ text }) {
  return (
    <div className="max-w-none space-y-1 text-sm leading-7">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {String(text || "").replace(/\\n/g, "\n")}
      </ReactMarkdown>
    </div>
  );
}

function AILoadingDots() {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-indigo-500 dot-1" />
        <span className="w-2 h-2 rounded-full bg-indigo-500 dot-2" />
        <span className="w-2 h-2 rounded-full bg-indigo-500 dot-3" />
      </div>
      AI is thinking…
    </div>
  );
}

// One Q&A turn in a tab's history — the "query" line shows what was asked,
// the response renders as markdown, like a chat transcript.
function HistoryEntry({ entry }) {
  return (
    <div className="bg-[#0d1117] border border-indigo-500/20 border-l-2 border-l-indigo-500 rounded-xl p-5 animate-fadein">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          AI Response
        </p>
        <span className="text-xs text-slate-600">
          {new Date(entry.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-xs text-slate-500 font-mono mb-4 break-all">
        {entry.query}
      </p>
      <Markdown text={entry.response} />
    </div>
  );
}

function AIPage() {
  const toast = useToast();
  const [tab, setTab] = useState("summary");

  // Per-tab input state, so switching tabs never clears what you typed.
  const [projectIds, setProjectIds] = useState({ summary: "", blockers: "" });
  const [feature, setFeature] = useState("");

  // Per-tab chat history, so switching tabs never clears previous results.
  const [histories, setHistories] = useState({
    summary: [],
    blockers: [],
    subtasks: [],
  });
  const [loadingTab, setLoadingTab] = useState(null);

  const currentTab = TABS.find((t) => t.id === tab);
  const history = histories[tab];
  const loading = loadingTab === tab;

  const pushEntry = (targetTab, entry) => {
    setHistories((h) => ({ ...h, [targetTab]: [entry, ...h[targetTab]] }));
  };

  const clearHistory = () => {
    setHistories((h) => ({ ...h, [tab]: [] }));
  };

  const handleRun = async () => {
    const projectId = projectIds[tab]?.trim();

    if ((tab === "summary" || tab === "blockers") && !projectId) {
      return toast("Enter a Project ID", "error");
    }
    if (tab === "subtasks" && !feature.trim()) {
      return toast("Describe your feature", "error");
    }

    const runningTab = tab;
    setLoadingTab(runningTab);
    try {
      let data;
      let query;
      if (runningTab === "summary") {
        data = await getProjectSummary(projectId);
        query = `Project ID: ${projectId}`;
      } else if (runningTab === "blockers") {
        data = await detectBlockers(projectId);
        query = `Project ID: ${projectId}`;
      } else {
        data = await generateSubtasks(feature);
        query = feature.trim();
      }

      const response =
        data.summary || data.blockers || data.subtasks || JSON.stringify(data, null, 2);

      pushEntry(runningTab, {
        id: Date.now(),
        query,
        response,
        timestamp: Date.now(),
      });

      if (runningTab === "subtasks") setFeature("");
    } catch (err) {
      toast(err.response?.data?.message || "AI request failed", "error");
    }
    setLoadingTab(null);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
          ✦ AI Features
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Assistant</h1>
        <p className="text-slate-400 text-sm mt-1">Powered by Gemini AI</p>
      </div>

      {/* Tab selector — switching tabs no longer discards input or results */}
      <div className="flex gap-1 bg-[#0d1117] border border-[#1e2535] rounded-xl p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="bg-[#0d1117] border border-[#1e2535] rounded-2xl p-6">
        <p className="text-sm text-slate-400 mb-5">{currentTab.desc}</p>

        {/* Inputs */}
        {(tab === "summary" || tab === "blockers") && (
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Project ID</label>
            <input
              placeholder="Paste a project _id from MongoDB"
              value={projectIds[tab]}
              onChange={(e) =>
                setProjectIds((p) => ({ ...p, [tab]: e.target.value }))
              }
              className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all font-mono"
            />
            <p className="text-xs text-slate-600">Find this in the URL when you open a project</p>
          </div>
        )}

        {tab === "subtasks" && (
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Feature Description</label>
            <textarea
              rows={4}
              placeholder="Describe a feature, e.g. 'Add OAuth login with Google and GitHub providers'"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all resize-none"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleRun} loading={loading} disabled={loading}>
            {RUN_LABEL[tab]}
          </Button>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear history
            </button>
          )}
        </div>

        {loading && <div className="mt-5"><AILoadingDots /></div>}

        {/* Chat-style history for this tab only */}
        {history.length > 0 && (
          <div className="mt-5 flex flex-col gap-4">
            {history.map((entry) => (
              <HistoryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIPage;