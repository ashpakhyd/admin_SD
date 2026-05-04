import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
    }),
    getMe: builder.query({
      query: () => "/api/auth/me",
      providesTags: ["Me"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/api/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/api/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
