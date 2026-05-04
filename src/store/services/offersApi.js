import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const offersApi = createApi({
  reducerPath: "offersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Offers", "Offer", "Redemptions"],
  endpoints: (builder) => ({
    getOffers: builder.query({
      query: (params = {}) => {
        const p = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
        return `/api/admin/offers?${p.toString()}`;
      },
      providesTags: ["Offers"],
    }),
    getOffer: builder.query({
      query: (id) => `/api/admin/offers/${id}`,
      providesTags: (r, e, id) => [{ type: "Offer", id }],
    }),
    getOfferDetails: builder.query({
      query: ({ id, include = "all" }) => `/api/admin/offers/${id}/details?include=${include}`,
      providesTags: (r, e, { id }) => [{ type: "Offer", id }],
    }),
    createOffer: builder.mutation({
      query: (body) => ({ url: "/api/admin/offers", method: "POST", body }),
      invalidatesTags: ["Offers"],
    }),
    updateOffer: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/offers/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => ["Offers", { type: "Offer", id }],
    }),
    deleteOffer: builder.mutation({
      query: (id) => ({ url: `/api/admin/offers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Offers"],
    }),
    updateOfferStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/offers/${id}/status`, method: "PATCH", body }),
      invalidatesTags: (r, e, { id }) => ["Offers", { type: "Offer", id }],
    }),
    bulkAction: builder.mutation({
      query: (body) => ({ url: "/api/admin/offers/bulk-actions", method: "POST", body }),
      invalidatesTags: ["Offers"],
    }),
    getAllRedemptions: builder.query({
      query: (params = {}) => {
        const p = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
        return `/api/admin/offers/redemptions/all?${p.toString()}`;
      },
      providesTags: ["Redemptions"],
    }),
    verifyRedemption: builder.mutation({
      query: (body) => ({ url: "/api/admin/offers/redemptions/verify", method: "POST", body }),
      invalidatesTags: ["Redemptions"],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useGetOfferQuery,
  useGetOfferDetailsQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useUpdateOfferStatusMutation,
  useBulkActionMutation,
  useGetAllRedemptionsQuery,
  useVerifyRedemptionMutation,
} = offersApi;
