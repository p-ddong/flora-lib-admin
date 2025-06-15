"use client";

import React, { useEffect, useState } from "react";
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
import ContributeDashboard from "@/components/ContributeDashboard/ContributeDashboard";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import { setUser } from "@/store/authSlice";
import { Separator } from "@/components/ui/separator";

const isThisWeek = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return date >= monday && date <= now;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const [localToken, setLocalToken] = useState<string | null>(null);

  const plants = useSelector((state: RootState) => state.plant.list);
  const plantLoading = useSelector((state: RootState) => state.plant.loading);

  const contributes = useSelector((state: RootState) => state.contribute.list);
  const contributeLoading = useSelector(
    (state: RootState) => state.contribute.loading
  );

  const users = useSelector((state: RootState) => state.user.list);
  const userLoading = useSelector((state: RootState) => state.user.loading);
  const newPlantsThisWeek = plants.filter((p) =>
    isThisWeek(p.createdAt)
  ).length;
  const newContributesThisWeek = contributes.filter((c) =>
    isThisWeek(c.createdAt)
  ).length;
  const newUsersThisWeek = users.filter((u) => isThisWeek(u.createdAt)).length;

  useEffect(() => {
    const stored = window.localStorage.getItem("token");
    setLocalToken(stored);
  }, []);

  useEffect(() => {
    if (!localToken) return;

    const decodedUser = jwtDecode<User>(localToken);
    dispatch(setUser(decodedUser));
    if (plants.length === 0) {
      dispatch(setPlantLoading(true));
      fetchPlantList(localToken)
        .then((res) => dispatch(setPlantList(res)))
        .catch(() => dispatch(setPlantLoading(false)));
    }

    if (contributes.length === 0) {
      dispatch(setContributeLoading(true));
      fetchContributeList(localToken)
        .then((res) => dispatch(setContributeList(res)))
        .catch(() => dispatch(setContributeLoading(false)));
    }

    if (users.length === 0) {
      dispatch(setUserLoading(true));
      fetchUserList(localToken)
        .then((res) => dispatch(setUserList(res)))
        .catch(() => dispatch(setUserLoading(false)));
    }
  }, [localToken, plants.length, contributes.length, users.length, dispatch]);

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex w-full justify-around">
        <div className="flex gap-5">
          {plantLoading ? (
            <Skeleton className="h-[74px] w-24 inline-block align-middle bg-gray-400" />
          ) : (
            <div className="flex flex-col justify-center items-center cursor-pointer">
              <h1>Total Plant</h1>
              <h1 className="font-bold text-2xl">{plants.length}</h1>
              <div className="text-xs text-muted-foreground flex gap-1">
                <p className="text-green-400">{newPlantsThisWeek}</p>
                <p>new this week</p>
              </div>
            </div>
          )}

          <Separator orientation="vertical" />

          {contributeLoading ? (
            <Skeleton className="h-[74px] w-24 inline-block align-middle bg-gray-400" />
          ) : (
            <div className="flex flex-col justify-center items-center cursor-pointer">
              <h1>Total Contribute</h1>
              <h1 className="font-bold text-2xl">{contributes.length}</h1>
              <div className="text-xs text-muted-foreground flex gap-1 mb-0.5">
                <p className="text-green-400">{newContributesThisWeek}</p>
                <p>new this week</p>
              </div>
            </div>
          )}

          <Separator orientation="vertical" />

          {userLoading ? (
            <Skeleton className="h-[74px] w-24 inline-block align-middle bg-gray-400" />
          ) : (
            <div className="flex flex-col justify-center items-center cursor-pointer">
              <h1>Total User</h1>
              <h1 className="font-bold text-2xl">{users.length}</h1>
              <div className="text-xs text-muted-foreground flex gap-1">
                <p className="text-green-400">{newUsersThisWeek}</p>
                <p>new this week</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <ContributeDashboard />
      </div>
      
    </div>
  );
};

export default Dashboard;
