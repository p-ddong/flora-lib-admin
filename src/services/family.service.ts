import axiosInstance from "./axiosInstance";

export const createFamily = async (name: string, token: string) => {
  return axiosInstance.post("/plants/families/create", { name }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteFamilyById = async (id: string, token: string) => {
  return axiosInstance.delete(`/plants/families/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deletePlantById = async (id: string, token: string) => {
  return axiosInstance.delete(`/plants/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchFamilyMap = async (token: string): Promise<Record<string, string>> => {
  const res = await axiosInstance.get("/plants/families/list", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const list = res.data as { _id: string; name: string }[];
  const map: Record<string, string> = {};
  list.forEach((f) => {
    map[f.name] = f._id;
  });
  return map;
};