"use client";

import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
import { Eye, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";

const UsersPage = () => {
  const users = useSelector((state: RootState) => state.user.list);

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

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
          {filtered.map((u: User2) => (
            <TableRow key={u._id}>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                {format(new Date(u.createdAt), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  onClick={() => {}}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersPage;
