"use client";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store/store";
import { useGetMeQuery } from "@/store/services/authApi";
import { setUser } from "@/store/slices/authSlice";

function AuthHydrator() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { data } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  return null;
}

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
