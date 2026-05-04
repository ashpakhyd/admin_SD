import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: ({ search = "", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", page);
        params.set("limit", limit);
        return `/api/admin/customers?${params.toString()}`;
      },
      providesTags: ["Customers"],
    }),
    verifyCustomer: builder.mutation({
      query: (id) => ({ url: `/api/admin/customers/${id}/verify`, method: "PATCH" }),
      invalidatesTags: ["Customers"],
    }),
    deactivateCustomer: builder.mutation({
      query: (id) => ({ url: `/api/admin/customers/${id}/deactivate`, method: "PATCH" }),
      invalidatesTags: ["Customers"],
    }),
    activateCustomer: builder.mutation({
      query: (id) => ({ url: `/api/admin/customers/${id}/activate`, method: "PATCH" }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useVerifyCustomerMutation,
  useDeactivateCustomerMutation,
  useActivateCustomerMutation,
} = customersApi;
