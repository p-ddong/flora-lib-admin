import { User2 } from "@/types";
import axiosInstance from "./axiosInstance";

export const fetchUserList = async (token: string): Promise<User2[]> => {
  const res = await axiosInstance.get("/users/list", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
