import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authApi";
import { dashboardApi } from "./services/dashboardApi";
import { ticketsApi } from "./services/ticketsApi";
import { techniciansApi } from "./services/techniciansApi";
import { customersApi } from "./services/customersApi";
import { ratingsApi } from "./services/ratingsApi";
import { offersApi } from "./services/offersApi";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [ticketsApi.reducerPath]: ticketsApi.reducer,
    [techniciansApi.reducerPath]: techniciansApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [ratingsApi.reducerPath]: ratingsApi.reducer,
    [offersApi.reducerPath]: offersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      dashboardApi.middleware,
      ticketsApi.middleware,
      techniciansApi.middleware,
      customersApi.middleware,
      ratingsApi.middleware,
      offersApi.middleware,
    ),
});
