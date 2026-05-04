import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/store/baseQuery";

export const ratingsApi = createApi({
  reducerPath: "ratingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Ratings"],
  endpoints: (builder) => ({
    getRatings: builder.query({
      query: () => "/api/admin/ratings",
      providesTags: ["Ratings"],
    }),
  }),
});

export const { useGetRatingsQuery } = ratingsApi;
