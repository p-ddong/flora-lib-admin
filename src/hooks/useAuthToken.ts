import { setUser } from "@/store/authSlice";
import { User } from "@/types";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export const useAuthToken = () => {
  const dispatch = useDispatch();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      dispatch(setUser(jwtDecode<User>(stored)));
    }
  }, [dispatch]);

  return token;
};