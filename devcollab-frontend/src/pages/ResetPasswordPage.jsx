import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword, resendOtp } from "../services/auth.service";
import { useToast } from "../context/ToastContext";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { userId, email } = location.state || {};

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate("/forgot-password");
  }, [userId]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigitChange = (i, val) => {
    const v = val.replace(/\D/, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) return toast("Enter the 6-digit OTP", "error");
    if (newPassword.length < 6)
      return toast("Password must be at least 6 characters", "error");
    if (newPassword !== confirmPassword)
      return toast("Passwords don't match", "error");
    setLoading(true);
    try {
      const data = await resetPassword({ userId, otp, newPassword });
      toast(data.message, "success");
      navigate("/login");
    } catch (err) {
      toast(err.response?.data?.message || "Reset failed", "error");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendOtp({ userId, purpose: "reset_password" });
      toast("New OTP sent!", "success");
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to resend", "error");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fadein relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Reset your password
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Code sent to{" "}
            <span className="text-indigo-400 font-medium">{email}</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1117] border border-[#1e2535] rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              OTP Code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  style={{ height: "52px" }}
                  className="w-11 text-center text-xl font-bold bg-[#1a2035] border border-[#2a3550] rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-1"
          >
            {loading && <span className="spinner" />}
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-sm text-slate-500"
          >
            {countdown > 0 ? (
              <span>
                Resend in{" "}
                <span className="text-indigo-400 font-medium">
                  {countdown}s
                </span>
              </span>
            ) : (
              <span className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">
                {resending ? "Sending…" : "Resend code"}
              </span>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-3">
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
