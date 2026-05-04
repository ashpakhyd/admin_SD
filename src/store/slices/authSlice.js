import { createSlice } from "@reduxjs/toolkit";

function getInitial() {
  if (typeof window === "undefined") return { token: null, role: null, user: null };
  return {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    user: null,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState: getInitial(),
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.role = payload.role || null;
      state.user = payload.user || null;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", payload.token);
        if (payload.role) localStorage.setItem("role", payload.role);
        // Sync to cookie so Next.js middleware can read it
        document.cookie = `token=${payload.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
    },
    setUser: (state, { payload }) => {
      state.user = payload;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        document.cookie = "token=; path=/; max-age=0";
      }
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
