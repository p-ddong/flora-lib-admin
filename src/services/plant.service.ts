"use client"

import axiosInstance from "./axiosInstance"
import { PlantDetail, PlantList } from "@/types"
import { BASE_API, ENDPOINT_PLANT } from "@/constant/API"

// ✅ Get detail by ID (server-side compatible)
export const getPlantDetailById = async (id: string, token: string): Promise<PlantDetail | null> => {
  try {
    const res = await fetch(`${BASE_API}${ENDPOINT_PLANT.detail}/${id}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ✅ Update plant by ID
export const updatePlantById = async (id: string, data: PlantDetail, token: string) => {
  await fetch(`${BASE_API}${ENDPOINT_PLANT.update}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

// ✅ Fetch list of plants (client-side)
export const fetchPlantList = async (token: string): Promise<PlantList[]> => {
  const res = await axiosInstance.get("/plants/list", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

// ✅ Delete plant by ID
export const deletePlantById = async (id: string, token: string) => {
  const res = await axiosInstance.delete(`/plants/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

