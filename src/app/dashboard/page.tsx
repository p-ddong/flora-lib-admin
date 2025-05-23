"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPlantList, setPlantLoading } from "@/store/plantSlice";
import {
  setContributeList,
  setContributeLoading,
} from "@/store/contributeSlice";
import { setUserList, setUserLoading } from "@/store/userSlice";
import { fetchPlantList } from "@/services/plant.service";
import { fetchContributeList } from "@/services/contribute.service";
import { fetchUserList } from "@/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";
import { PlantFamilyChart } from "@/components/ScpeciesOnFamily/PlantFamilyChart";
import ContributeDashboard from "@/components/ContributeDashboard/ContributeDashboard";



const Dashboard = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const plants = useSelector((state: RootState) => state.plant.list);
  const plantLoading = useSelector((state: RootState) => state.plant.loading);

  const contributes = useSelector((state: RootState) => state.contribute.list);
  const contributeLoading = useSelector(
    (state: RootState) => state.contribute.loading
  );

  const users = useSelector((state: RootState) => state.user.list);
  const userLoading = useSelector((state: RootState) => state.user.loading);

  useEffect(() => {
    if (!token) return;

    if (plants.length === 0) {
      dispatch(setPlantLoading(true));
      fetchPlantList(token)
        .then((res) => dispatch(setPlantList(res)))
        .catch(() => dispatch(setPlantLoading(false)));
    }

    if (contributes.length === 0) {
      dispatch(setContributeLoading(true));
      fetchContributeList(token)
        .then((res) => dispatch(setContributeList(res)))
        .catch(() => dispatch(setContributeLoading(false)));
    }

    if (users.length === 0) {
      dispatch(setUserLoading(true));
      fetchUserList(token)
        .then((res) => dispatch(setUserList(res)))
        .catch(() => dispatch(setUserLoading(false)));
    }
  }, [token, plants.length, contributes.length, users.length, dispatch]);

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div>
        <PlantFamilyChart/> 
      </div>
      <div><ContributeDashboard/></div>
      <div className="space-y-3 text-sm">
        <div>
          <span>🌱 Plants: </span>
          {plantLoading ? (
            <Skeleton className="h-4 w-20 inline-block align-middle" />
          ) : (
            <span>{plants.length}</span>
          )}
        </div>

        <div>
          <span>📦 Contributes: </span>
          {contributeLoading ? (
            <Skeleton className="h-4 w-24 inline-block align-middle" />
          ) : (
            <span>{contributes.length}</span>
          )}
        </div>

        <div>
          <span>👤 Users: </span>
          {userLoading ? (
            <Skeleton className="h-4 w-16 inline-block align-middle" />
          ) : (
            <span>{users.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
