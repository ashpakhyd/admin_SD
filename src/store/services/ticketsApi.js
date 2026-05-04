import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tickets", "Ticket"],
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: () => "/api/tickets",
      providesTags: ["Tickets"],
    }),
    getTicket: builder.query({
      query: (id) => `/api/tickets/${id}`,
      providesTags: (r, e, id) => [{ type: "Ticket", id }],
    }),
    createTicket: builder.mutation({
      query: (body) => ({ url: "/api/tickets", method: "POST", body }),
      invalidatesTags: ["Tickets"],
    }),
    assignTechnician: builder.mutation({
      query: ({ id, technicianId }) => ({
        url: `/api/tickets/${id}/assign`,
        method: "PATCH",
        body: { technicianId },
      }),
      invalidatesTags: (r, e, { id }) => ["Tickets", { type: "Ticket", id }],
    }),
    deleteTicket: builder.mutation({
      query: (id) => ({ url: `/api/tickets/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tickets"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useAssignTechnicianMutation,
  useDeleteTicketMutation,
} = ticketsApi;
