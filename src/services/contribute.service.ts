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
