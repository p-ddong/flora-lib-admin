"use client";

import axiosInstance from './axiosInstance';
import { Contribution } from '@/types';

export const fetchContributeList = async (token: string): Promise<Contribution[]> => {
  const res = await axiosInstance.get('/contributes/list', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const moderateContribute = async (
  id: string,
  payload: { action: "approved" | "rejected"; message: string },
  token: string
) => {
  const res = await axiosInstance.patch(`/contributes/moderate/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const fetchContributeDetail = async (id: string, token: string) => {
  const res = await axiosInstance.get(`/contributes/detail/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
