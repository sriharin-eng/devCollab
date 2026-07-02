import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmailOtp, resendOtp } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setUser } = useAuth();
  const toast = useToast();
  const { userId, email } = location.state || {};

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate("/register");
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
    setLoading(true);
    try {
      const data = await verifyEmailOtp({ userId, otp });
      setToken(data.token);
      setUser(data.user);
      toast("Email verified! Welcome to DevCollab 🎉", "success");
      navigate("/");
    } catch (err) {
      toast(err.response?.data?.message || "Verification failed", "error");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendOtp({ userId, purpose: "verify_email" });
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Check your email
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            We sent a 6-digit code to
            <br />
            <span className="text-indigo-400 font-medium">{email}</span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1117] border border-[#1e2535] rounded-2xl p-6 flex flex-col gap-6"
        >
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading && <span className="spinner" />}
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-sm text-slate-500 disabled:cursor-not-allowed"
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
                {resending ? "Sending…" : "Resend OTP"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
