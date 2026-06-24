import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── tiny helpers ─── */
const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide">
    {children}
  </span>
);

const FeatureCard = ({ icon, title, desc, tag }) => (
  <div className="group bg-[#0d1117] border border-[#1e2535] hover:border-indigo-500/40 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 text-lg">
        {icon}
      </div>
      {tag && (
        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 rounded-full">
          {tag}
        </span>
      )}
    </div>
    <h3 className="text-white font-semibold text-[15px]">{title}</h3>
    <p className="text-slate-400 text-sm leading-6">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex gap-4 items-start">
    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0 mt-0.5">
      {num}
    </div>
    <div>
      <p className="text-white font-semibold text-[15px] mb-1">{title}</p>
      <p className="text-slate-400 text-sm leading-6">{desc}</p>
    </div>
  </div>
);

/* ─── Video Modal ─── */
function VideoModal({ videoSrc, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadein"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden border border-[#1e2535] shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#0d1117] border-b border-[#1e2535] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-slate-500 font-mono">DevCollab — Demo</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        <video
          src={videoSrc}
          controls
          autoPlay
          className="w-full aspect-video bg-black"
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
function LandingPage() {
  const navigate = useNavigate();
  const videoInputRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("/demo.mp4");
  const [showModal, setShowModal] = useState(false);
  const demoRef = useRef(null);

  /* load video from local file */
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setShowModal(true);
  };

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-200 overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-[#080b14]/80 backdrop-blur border-b border-[#1e2535]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <img src="/logo.png" alt="DevCollab" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <span className="font-semibold text-white text-[15px] tracking-tight">DevCollab</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* subtle grid bg */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] -z-10 blur-[120px] opacity-30"
          style={{ background: "radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)" }}
        />

        <div className="animate-fadein">
          <Pill>✦ Built for dev teams</Pill>
          <h1 className="mt-6 text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1]">
            Ship faster,<br />
            <span className="text-indigo-400">together.</span>
          </h1>
          <p className="mt-5 text-slate-400 text-lg max-w-xl mx-auto leading-7">
            DevCollab brings workspaces, tasks, wikis, and AI-powered code review
            into one place — so your team spends less time coordinating and more
            time building.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
            >
              Start for free →
            </button>
            <button
              onClick={scrollToDemo}
              className="px-6 py-3 bg-[#0d1117] border border-[#1e2535] hover:border-indigo-500/40 text-slate-300 hover:text-white font-medium rounded-xl transition-all text-sm"
            >
              ▶ Watch demo
            </button>
          </div>

          {/* stat strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
            {[
              { val: "5 features", label: "in one platform" },
              { val: "Gemini AI", label: "powered assistant" },
              { val: "12 langs", label: "for code review" },
            ].map(({ val, label }) => (
              <div key={val}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <Pill>Features</Pill>
          <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">
            Everything your team needs
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
            From project management to AI code review — all without switching tabs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon="⬡"
            title="Workspaces"
            desc="Organise every team, project, or client into its own workspace. Invite members and keep context separate."
          />
          <FeatureCard
            icon="✅"
            title="Task Management"
            desc="Create tasks, set statuses, and track progress inside each project. No external tool needed."
          />
          <FeatureCard
            icon="📖"
            title="Team Wiki"
            desc="Document decisions, onboarding guides, and architecture notes in a shared, searchable wiki."
          />
          <FeatureCard
            icon="✦"
            title="AI Assistant"
            tag="Gemini"
            desc="Get instant project summaries, detect blockers in in-progress tasks, and auto-generate subtasks from a feature description."
          />
          <FeatureCard
            icon="◈"
            title="AI Code Review"
            tag="12 languages"
            desc="Paste any code snippet and receive structured, markdown-formatted feedback on bugs, style, and improvements."
          />
          <FeatureCard
            icon="📊"
            title="Activity Feed"
            desc="A real-time log of every action inside a workspace so your whole team stays in sync."
          />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-[#0d1117] border border-[#1e2535] rounded-3xl p-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Pill>How it works</Pill>
            <h2 className="mt-4 text-3xl font-bold text-white tracking-tight leading-snug">
              From zero to<br />collaborating in minutes
            </h2>
            <p className="mt-3 text-slate-400 text-sm leading-6">
              No complicated setup. Create a workspace, invite your team, and
              start shipping.
            </p>
          </div>
          <div className="flex flex-col gap-7">
            <Step
              num="1"
              title="Create a workspace"
              desc="Give it a name and description. Think of it as a folder for an entire team or project."
            />
            <Step
              num="2"
              title="Add projects & tasks"
              desc="Break work into projects, then into tasks. Assign statuses and track progress in real time."
            />
            <Step
              num="3"
              title="Let AI do the heavy lifting"
              desc="Ask the AI Assistant to summarise progress, flag blockers, or generate subtasks. Review code inline."
            />
          </div>
        </div>
      </section>

      {/* ── Demo Video ── */}
      <section ref={demoRef} className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <Pill>▶ Demo</Pill>
          <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">
            See DevCollab in action
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            A walkthrough of every feature — from workspace creation to AI code review.
          </p>
        </div>

        {/* Video player */}
        <div className="relative bg-[#0d1117] border border-[#1e2535] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* fake browser chrome */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1e2535] bg-[#0b0f1a]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 bg-[#1a2035] rounded-lg px-3 py-1 text-xs text-slate-500 font-mono max-w-xs">
              devcollab.app
            </span>
          </div>

          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="w-full aspect-video bg-black"
            />
          ) : (
            /* placeholder CTA */
            <div className="aspect-video flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#0d1117] to-[#0b1220]">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 60% 40%, #6366f1 0%, transparent 60%)",
                }}
              />
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl relative z-10 cursor-pointer hover:bg-indigo-600/30 transition-all"
                onClick={() => videoInputRef.current?.click()}
              >
                ▶
              </div>
              <div className="relative z-10 text-center">
                <p className="text-white font-semibold text-sm mb-1">Load your demo video</p>
                <p className="text-slate-500 text-xs mb-4">Click the button below to pick the .mp4 file from your computer</p>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
                >
                  Choose video file
                </button>
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
            </div>
          )}
        </div>
        {videoSrc && (
          <p className="mt-3 text-center text-xs text-slate-600">
            Video loaded from your device · click anywhere to replay
          </p>
        )}
      </section>

      {/* ── Tech Stack ── */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-6 font-medium">
          Built with
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["React", "Node.js", "Express", "MongoDB", "Gemini AI", "JWT Auth", "Tailwind CSS"].map(
            (tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-[#0d1117] border border-[#1e2535] rounded-xl text-slate-400 text-sm"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div
          className="relative rounded-3xl overflow-hidden border border-indigo-500/20 p-12 text-center"
          style={{
            background: "linear-gradient(135deg, #0d1117 0%, #0f1629 50%, #0d1117 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, #6366f1 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Ready to ship faster?
            </h2>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-6">
              Join your team on DevCollab. Set up your first workspace in under two minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
              >
                Create your account →
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl transition-all text-sm"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e2535] max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <img src="/logo.png" alt="" className="w-4 h-4 object-contain" onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <span className="text-sm font-semibold text-white">DevCollab</span>
        </div>
        <p className="text-xs text-slate-600">
          Built for DevFusion 2.0 · Real-time collaboration for dev teams
        </p>
      </footer>

      {/* Video Modal (popup player) */}
      {showModal && videoSrc && (
        <VideoModal videoSrc={videoSrc} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default LandingPage;