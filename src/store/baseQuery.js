import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "@/store/slices/authSlice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(logout());
    if (typeof window !== "undefined") window.location.href = "/login";
  }
  return result;
};
