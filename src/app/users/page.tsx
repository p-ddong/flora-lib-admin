"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { User2 } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, X } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { deleteUser, fetchUserList, updateUser } from "@/services/user.service";
import { setUserList, setUserLoading } from "@/store/userSlice";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const roleOptions = ["user", "admin", "super-admin"];

const UsersPage = () => {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const users = useSelector((state: RootState) => state.user.list);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [editedRoles, setEditedRoles] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return list;
  }, [users, search, sortAsc]);

  const handleRoleChange = (id: string, newRole: string) => {
    setEditedRoles((prev) => ({
      ...prev,
      [id]: newRole,
    }));
  };

  const handleCancel = (id: string) => {
    setEditedRoles((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleSave = async (id: string) => {
    const newRole = editedRoles[id];
    if (!newRole || !token) return;

    try {
      await updateUser(id, { roleName: newRole }, token);
      alert("Role updated successfully");

      dispatch(setUserLoading(true));
      const users = await fetchUserList(token);
      dispatch(setUserList(users));
      handleCancel(id);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update role");
      dispatch(setUserLoading(false));
    }
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("token");
    setToken(stored);
  }, []);

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="flex gap-4 flex-wrap items-center">
        <Input
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={() => setSortAsc((p) => !p)}>
          Sort by Date {sortAsc ? "↑" : "↓"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u: User2) => {
            const isEditing = editedRoles[u._id] !== undefined;
            const selectedRole = editedRoles[u._id] ?? u.role;
            const isSuperAdmin = currentUser?.role === "super-admin";

            return (
              <TableRow key={u._id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {isSuperAdmin ? (
                    <Select
                      value={selectedRole}
                      onValueChange={(val) => handleRoleChange(u._id, val)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{u.role}</span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(u.createdAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {isSuperAdmin && isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-600"
                        onClick={() => handleSave(u._id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400"
                        onClick={() => handleCancel(u._id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => setSelectedUserId(u._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to delete this user?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The user will be
                              permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                if (!selectedUserId || !token) return;
                                try {
                                  await deleteUser(selectedUserId, token);
                                  alert("User deleted successfully");

                                  dispatch(setUserLoading(true));
                                  const users = await fetchUserList(token);
                                  dispatch(setUserList(users));
                                  setSelectedUserId(null);
                                } catch (err) {
                                  console.error("Delete failed", err);
                                  alert("Failed to delete user");
                                }
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersPage;
