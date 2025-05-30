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

export const updateUser = async (
  id: string,
  payload: { roleName: string },
  token: string
) => {
  const res = await axiosInstance.patch(`/users/update/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(payload)
  return res.data;
};

export const deleteUser = async (id: string, token: string) => {
  const res = await axiosInstance.delete(`/users/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};