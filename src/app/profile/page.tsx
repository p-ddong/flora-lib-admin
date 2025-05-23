"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UserProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return (
      <div className="p-6 text-red-500">
        User not found. Please log in.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{user.username}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>User ID:</strong> {user.sub}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>Permissions:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.permissions.length > 0 ? (
                user.permissions.map((perm) => (
                  <Badge key={perm} variant="outline">
                    {perm}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
