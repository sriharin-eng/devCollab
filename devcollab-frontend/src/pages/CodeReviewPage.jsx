import { useState } from "react";
import { reviewCode } from "../services/codeReview.service";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import Select from "../components/Select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "cpp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "csharp",
];

function CodeReviewPage() {
  const toast = useToast();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast("Paste some code first", "error");
    setLoading(true);
    setResult(null);
    try {
      const data = await reviewCode(language, code);
      setResult(
        data.review ||
          data.feedback ||
          data.result ||
          JSON.stringify(data, null, 2),
      );
    } catch (err) {
      toast(err.response?.data?.message || "Code review failed", "error");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
          ◈ AI Code Review
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Code Review
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Get instant AI feedback on your code
        </p>
      </div>

      <form onSubmit={handleReview} className="flex flex-col gap-5">
        {/* Language selector */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Language
            </label>
            <Select
              className="w-44"
              value={language}
              onChange={setLanguage}
              options={LANGUAGES.map((l) => ({ value: l, label: l }))}
            />
          </div>
          <div className="flex-1" />
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !code.trim()}
            className="self-end"
          >
            ◈ Review Code
          </Button>
        </div>

        {/* Code textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Code
          </label>
          <div className="relative">
            <div className="absolute top-3 left-4 text-xs text-slate-600 font-mono pointer-events-none">
              {language}
            </div>
            <textarea
              rows={18}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Paste your ${language} code here…`}
              spellCheck="false"
              className="w-full px-4 pt-8 pb-4 bg-[#0d1117] border border-[#1e2535] rounded-2xl text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/30 transition-all resize-none font-mono leading-relaxed"
            />
          </div>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center gap-3 text-slate-400 text-sm">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 dot-1" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 dot-2" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 dot-3" />
          </div>
          Reviewing your code…
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 bg-gradient-to-br from-[#0d1117] to-[#111827] border border-[#1e2535] rounded-2xl overflow-hidden animate-fadein shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="px-5 py-3 border-b border-[#1e2535] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Review — {language}
              </span>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setCode("");
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Markdown Content */}
          <div className="p-6">
            <div className="max-w-none space-y-4 text-sm leading-7">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mb-5 border-b border-[#1e2535] pb-3">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-indigo-300 mt-6 mb-3">
                      {children}
                    </h3>
                  ),

                  p: ({ children }) => (
                    <p className="text-slate-300 leading-7 mb-4">{children}</p>
                  ),

                  li: ({ children }) => (
                    <li className="ml-5 list-disc mb-2 text-slate-300">
                      {children}
                    </li>
                  ),

                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),

                  code: ({ children }) => (
                    <code className="bg-[#111827] border border-[#1e2535] px-1.5 py-1 rounded-md text-indigo-300 text-[13px]">
                      {children}
                    </code>
                  ),

                  pre: ({ children }) => (
                    <pre className="bg-[#0b1220] border border-[#1e2535] rounded-xl p-4 overflow-x-auto text-sm my-4">
                      {children}
                    </pre>
                  ),

                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-400 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {String(result).replace(/\\n/g, "\n")}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeReviewPage;
