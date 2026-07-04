import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import Button from "../components/Button";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  // confirm(message, { title, confirmLabel, cancelLabel, variant }) → Promise<boolean>
  const confirm = useCallback((message, options = {}) => {
    setDialog({
      title: options.title ?? "Are you sure?",
      message,
      confirmLabel: options.confirmLabel ?? "Confirm",
      cancelLabel: options.cancelLabel ?? "Cancel",
      variant: options.variant ?? "danger",
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) settle(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") settle(false);
          }}
        >
          <div className="w-full max-w-sm bg-[#0d1117] border border-[#1e2535] rounded-2xl shadow-2xl animate-fadein overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  dialog.variant === "danger"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-indigo-500/10 text-indigo-400"
                }`}
              >
                <span className="text-lg leading-none">!</span>
              </div>
              <h2 className="font-semibold text-white text-[15px] mb-1.5">
                {dialog.title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {dialog.message}
              </p>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 mt-2">
              <Button variant="ghost" size="sm" onClick={() => settle(false)}>
                {dialog.cancelLabel}
              </Button>
              <Button
                variant={dialog.variant === "danger" ? "danger" : "primary"}
                size="sm"
                onClick={() => settle(true)}
              >
                {dialog.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
