import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleAuth } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const googleInitialized = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || googleInitialized.current) return;

    const handleGoogleCallback = async (response) => {
      try {
        const data = await googleAuth(response.credential);
        setToken(data.token);
        setUser(data.user);
        toast("Signed in with Google!", "success");
        navigate("/app");
      } catch (err) {
        toast(err.response?.data?.message || "Google sign-in failed", "error");
      }
    };

    const initGoogle = () => {
      if (googleInitialized.current) return;
      googleInitialized.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
        },
      );
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form);
      setToken(data.token);
      setUser(data.user);
      toast("Welcome back!", "success");
      navigate("/app");
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.requiresVerification) {
        toast("Please verify your email. A new OTP has been sent.", "error");
        navigate("/verify-email", {
          state: { userId: errData.userId, email: form.email },
        });
      } else {
        toast(errData?.message || "Login failed", "error");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fadein relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 mb-4">
            <img
              src="/logo.png"
              alt="DevCollab"
              className="w-7 h-7 object-contain translate-x-[1px]"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign in to DevCollab
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Your collaborative dev workspace
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2535] rounded-2xl p-6 flex flex-col gap-4">
          {GOOGLE_CLIENT_ID && (
            <>
              <div id="google-btn" className="flex justify-center" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#1e2535]" />
                <span className="text-xs text-slate-600 font-medium">or</span>
                <div className="flex-1 h-px bg-[#1e2535]" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-[#1a2035] border border-[#2a3550] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
