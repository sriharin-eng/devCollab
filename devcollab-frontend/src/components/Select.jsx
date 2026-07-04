import { useEffect, useRef, useState } from "react";

/**
 * A styled dropdown that replaces the native <select>, which renders as an
 * unstyled OS popup no matter what CSS you throw at it. Same mental model
 * (value / onChange / options) but fully themeable and consistent across
 * every browser and OS.
 *
 * options: [{ value, label, hint? }]
 */
function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  size = "md",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3 py-2.5 text-sm",
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={rootRef}>
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-2 bg-[#1a2035] border rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${
            open
              ? "border-indigo-500/60 ring-2 ring-indigo-500/15"
              : "border-[#2a3550] hover:border-[#3a4560]"
          }`}
        >
          <span className={`truncate ${!selected ? "text-slate-500" : ""}`}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`flex-shrink-0 text-slate-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute z-[70] mt-1.5 w-full max-h-64 overflow-y-auto bg-[#111827] border border-[#2a3550] rounded-xl shadow-2xl shadow-black/40 p-1 animate-fadein">
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-500">No options</p>
            )}
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  o.value === value
                    ? "bg-indigo-600/15 text-indigo-300"
                    : "text-slate-300 hover:bg-[#1a2035] hover:text-white"
                }`}
              >
                <span className="truncate">
                  {o.label}
                  {o.hint && (
                    <span className="text-slate-500 font-normal">
                      {" "}
                      {o.hint}
                    </span>
                  )}
                </span>
                {o.value === value && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M2.5 7l3 3 6-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Select;
