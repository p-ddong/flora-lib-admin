import axiosInstance from "./axiosInstance";
import { HistoryResponse } from "@/types";

export const fetchHistoryList = async (
  token: string,
  page = 1,
  limit = 10
): Promise<HistoryResponse> => {
  const res = await axiosInstance.get("/history/list", {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit },
  });
  return res.data;
};

export const rollbackHistory = async (
  id: string,
  token: string
): Promise<{ success: boolean }> => {
  const res = await axiosInstance.patch(
    `/history/rollback/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
