// Updated PlantDashboard.tsx
"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "@/store";
import { jwtDecode } from "jwt-decode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flower2, Users, GitBranch, Eye, Plus } from "lucide-react";
import { setUser } from "@/store/authSlice";
import { setPlantList, setPlantLoading } from "@/store/plantSlice";
import { fetchPlantList } from "@/services/plant.service";
import {
  setContributeList,
  setContributeLoading,
} from "@/store/contributeSlice";
import { fetchContributeList } from "@/services/contribute.service";
import { setUserList, setUserLoading } from "@/store/userSlice";
import { fetchUserList } from "@/services/user.service";
import { fetchHistoryList } from "@/services/history.service";
import { RawHistoryItem, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

const isThisWeek = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return date >= monday && date <= now;
};

export default function PlantDashboard() {
  const dispatch = useDispatch();
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [history, setHistory] = useState<RawHistoryItem[]>([]);

  const plants = useSelector((state: RootState) => state.plant.list);
  const contributes = useSelector((state: RootState) => state.contribute.list);
  const users = useSelector((state: RootState) => state.user.list);

  const newPlantsThisWeek = plants.filter((p) =>
    isThisWeek(p.createdAt)
  ).length;
  const newUsersThisWeek = users.filter((u) => isThisWeek(u.createdAt)).length;

  useEffect(() => {
    const stored = localStorage.getItem("token");
    setLocalToken(stored);
  }, []);

  useEffect(() => {
    if (!localToken) return;

    const decodedUser = jwtDecode<User>(localToken);
    dispatch(setUser(decodedUser));

    if (!plants.length) {
      dispatch(setPlantLoading(true));
      fetchPlantList(localToken).then((res) => dispatch(setPlantList(res)));
    }

    if (!contributes.length) {
      dispatch(setContributeLoading(true));
      fetchContributeList(localToken).then((res) =>
        dispatch(setContributeList(res))
      );
    }

    if (!users.length) {
      dispatch(setUserLoading(true));
      fetchUserList(localToken).then((res) => dispatch(setUserList(res)));
    }
  }, [localToken, dispatch, plants.length, contributes.length, users.length]);

  useEffect(() => {
    if (!localToken) return;
    fetchHistoryList(localToken, 1, 3).then((res) => setHistory(res.data));
  }, [localToken]);

  const recentPlants = [...plants]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  const recentHistory = history.map((h) => {
    const plantName = h.before?.scientific_name || "Unnamed";
    const username =
      users.find((u) => u._id === h.updatedBy)?.username || h.updatedBy;
    const action = h.action.charAt(0).toUpperCase() + h.action.slice(1);
    const timeAgo = formatDistanceToNow(new Date(h.updatedAt || h.createdAt), {
      addSuffix: true,
    });
    return { id: h._id, action, plantName, username, timeAgo };
  });

  const familyStats: Record<string, number> = {};
  plants.forEach((p) => {
    const name = p.family;
    familyStats[name] = (familyStats[name] || 0) + 1;
  });
  const topFamilies = Object.entries(familyStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const userContribCount: Record<string, number> = {};
  contributes.forEach((c) => {
    const id = c.c_user._id;
    userContribCount[id] = (userContribCount[id] || 0) + 1;
  });
  const topContributors = Object.entries(userContribCount)
    .map(([id, count]) => ({
      id,
      name: users.find((u) => u._id === id)?.username || id,
      contributions: count,
    }))
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Plant Management Dashboard</h1>
          <p className="text-muted-foreground">Overview of your plant system</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Plant
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
            <Flower2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plants.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{newPlantsThisWeek}</span> from
              last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contributes.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">
                {contributes.filter((c) => c.status == "pending").length}
              </span>{" "}
              pending contribute
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{newUsersThisWeek}</span> new
              users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plants">Recently Added Plants</TabsTrigger>
          <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 3 system changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentHistory.map((h) => (
                <div key={h.id} className="text-sm">
                  <span className="font-medium">{h.username}</span>{" "}
                  {h.action.toLowerCase()}{" "}
                  <span className="font-medium">{h.plantName}</span> –{" "}
                  {h.timeAgo}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Family Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topFamilies.map(([name, count]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-muted-foreground text-sm">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plants">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Plants</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plant Name</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPlants.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>{p.scientific_name}</TableCell>
                      <TableCell>{p.family}</TableCell>
                      <TableCell>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributors">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.map((user, i) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Badge variant="secondary">{user.contributions}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
