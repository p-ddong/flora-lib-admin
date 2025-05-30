// src/components/ContributeDashboard.tsx
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import React from "react";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ContributeDashboard: React.FC = () => {
  /* -------- lấy danh sách pending -------- */
  const pending = useSelector((state: RootState) =>
    state.contribute.list.filter((c) => c.status === "pending")
  );

  /* không có gì thì ẩn thẻ */
  if (!pending.length) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contributions</CardTitle>
        <CardDescription>
          You have <strong>{pending.length}</strong> pending&nbsp;
          {pending.length === 1 ? "contribution" : "contributions"}.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 overflow-y-auto max-h-64">
        {/* <ScrollArea className="h-72 w-48 rounded-md border"> */}
          {pending.map((c) => (
            <Card
              key={c._id}
              className="flex items-start justify-between px-4 py-3"
            >
              <div className="space-y-1">
                {/* Scientific name */}
                <CardTitle className="text-base">
                  {c.data.plant.scientific_name}
                </CardTitle>

                {/* username + createdAt */}
                <CardDescription className="text-sm">
                  by <span className="font-medium">{c.c_user.username}</span>{" "}
                  &middot;&nbsp;
                  {formatDistanceToNow(new Date(c.createdAt), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </div>
            </Card>
          ))}
        {/* </ScrollArea> */}
      </CardContent>

      {/** nếu muốn footer link xem tất cả **/}
      <CardFooter className="justify-end">
        <Button variant="outline" size="sm">
          <Link href={"/contributes"}>View all</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContributeDashboard;
