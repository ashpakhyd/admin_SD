import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const techniciansApi = createApi({
  reducerPath: "techniciansApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Technicians", "Technician"],
  endpoints: (builder) => ({
    getTechnicians: builder.query({
      query: () => "/api/admin/technicians",
      providesTags: ["Technicians"],
    }),
    verifyTechnician: builder.mutation({
      query: (id) => ({ url: `/api/admin/technicians/${id}/verify`, method: "PATCH" }),
      invalidatesTags: ["Technicians"],
    }),
    deactivateTechnician: builder.mutation({
      query: (id) => ({ url: `/api/admin/technicians/${id}/deActivate`, method: "PATCH" }),
      invalidatesTags: ["Technicians"],
    }),
    activateTechnician: builder.mutation({
      query: (id) => ({ url: `/api/admin/technicians/${id}/activate`, method: "PATCH" }),
      invalidatesTags: ["Technicians"],
    }),
  }),
});

export const {
  useGetTechniciansQuery,
  useVerifyTechnicianMutation,
  useDeactivateTechnicianMutation,
  useActivateTechnicianMutation,
} = techniciansApi;
