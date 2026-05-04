import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Stats", "TicketStatus", "TechPerformance", "TechRatings"],
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => "/api/admin/dashboard/stats",
      providesTags: ["Stats"],
    }),
    getTicketStatus: builder.query({
      query: () => "/api/admin/dashboard/ticket-status",
      providesTags: ["TicketStatus"],
    }),
    getTechnicianPerformance: builder.query({
      query: () => "/api/admin/dashboard/technician-performance",
      providesTags: ["TechPerformance"],
    }),
    getTechnicianRatings: builder.query({
      query: () => "/api/admin/dashboard/technician-ratings",
      providesTags: ["TechRatings"],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetTicketStatusQuery,
  useGetTechnicianPerformanceQuery,
  useGetTechnicianRatingsQuery,
} = dashboardApi;
