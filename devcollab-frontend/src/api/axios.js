import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Without this, a hung backend request (e.g. a slow/blocked outbound
  // SMTP call during register/login/forgot-password) leaves the UI
  // stuck spinning indefinitely with no way to recover.
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Give every existing `err.response?.data?.message` fallback across
    // the app a meaningful message for timeouts/dropped connections,
    // where `error.response` is otherwise undefined.
    if (!error.response) {
      error.response = {
        data: {
          message:
            error.code === "ECONNABORTED"
              ? "The request timed out. Please check your connection and try again."
              : "Network error. Please check your connection and try again.",
        },
      };
    }
    return Promise.reject(error);
  },
);

export default api;
