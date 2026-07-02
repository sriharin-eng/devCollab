import api from "../api/axios";

export const registerUser   = async (data) => (await api.post("/auth/register", data)).data;
export const verifyEmailOtp = async (data) => (await api.post("/auth/verify-email", data)).data;
export const resendOtp      = async (data) => (await api.post("/auth/resend-otp", data)).data;
export const loginUser      = async (data) => (await api.post("/auth/login", data)).data;
export const forgotPassword = async (data) => (await api.post("/auth/forgot-password", data)).data;
export const resetPassword  = async (data) => (await api.post("/auth/reset-password", data)).data;
export const googleAuth     = async (credential) => (await api.post("/auth/google", { credential })).data;
export const getMe          = async ()     => (await api.get("/auth/me")).data;