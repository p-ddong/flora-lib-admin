"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Undo2,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  FileText,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchHistoryList, rollbackHistory } from "@/services/history.service";
import { RawHistoryItem } from "@/types";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { fetchUserList } from "@/services/user.service";
import { setUserList, setUserLoading } from "@/store/userSlice";

interface HistoryAction {
  id: string;
  type: "create" | "edit" | "delete" | "update" | "rollback";
  description: string;
  timestamp: Date;
  user: string;
  details?: string;
  canUndo: boolean;
  undone?: boolean;
  plant?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [undoMessage, setUndoMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useDispatch();
  const userList = useSelector((state: RootState) => state.user.list);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    // Load users if not already loaded
    if (userList.length === 0) {
      dispatch(setUserLoading(true));
      fetchUserList(token)
        .then((users) => dispatch(setUserList(users)))
        .catch(() => dispatch(setUserLoading(false)));
    }

    const loadHistory = async () => {
      try {
        const res = await fetchHistoryList(token, page, 10);
        const transformed = res.data.map(toHistoryAction);
        setHistory(transformed);
        setTotalPages(res.totalPages);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    loadHistory();
  }, [page, dispatch, userList.length]);

  const toHistoryAction = useCallback(
    (item: RawHistoryItem): HistoryAction => {
      const name = item.before?.scientific_name || "Unnamed";
      const baseTime = item.updatedAt
        ? new Date(item.updatedAt)
        : new Date(item.createdAt);

      const user =
        userList.find((u) => u._id === item.updatedBy)?.username ||
        item.updatedBy;

      let description = "";
      switch (item.action) {
        case "create":
          description = `Created plant "${name}"`;
          break;
        case "edit":
        case "update":
          description = `Updated plant "${name}"`;
          break;
        case "delete":
          description = `Deleted plant "${name}"`;
          break;
        case "rollback":
          description = `Rolled back plant "${name}"`;
          break;
        default:
          description = `Performed ${item.action} on "${name}"`;
      }

      return {
        id: item._id,
        type: item.action,
        description,
        timestamp: baseTime,
        user,
        details: JSON.stringify(item.before, null, 2),
        canUndo: item.action !== "rollback",
        undone: item.action === "rollback",
        plant: item.plant,
      };
    },
    [userList]
  );
  const handleUndo = async (actionId: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      await rollbackHistory(actionId, token);

      setHistory((prev) =>
        prev.map((action) =>
          action.id === actionId
            ? { ...action, undone: true, canUndo: false }
            : action
        )
      );

      const action = history.find((a) => a.id === actionId);
      if (action) {
        setUndoMessage(`Undone: ${action.description}`);
        setTimeout(() => setUndoMessage(""), 3000);
      }
    } catch (err) {
      console.error("Rollback failed:", err);
      setUndoMessage("Rollback failed. Please try again.");
      setTimeout(() => setUndoMessage(""), 3000);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "create":
        return <Plus className="h-4 w-4" />;
      case "edit":
        return <Edit className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      case "update":
        return <Settings className="h-4 w-4" />;
      case "rollback":
        return <Undo2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "edit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "update":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "rollback":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const activeActions = history.filter((action) => !action.undone);
  const undoneActions = history.filter((action) => action.undone);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Action History</h1>
        <p className="text-muted-foreground">
          View and manage all system activity logs
        </p>
      </div>

      {undoMessage && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{undoMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                {activeActions.length} active actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {activeActions.map((action, index) => (
                    <div key={action.id}>
                      <div className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`p-2 rounded-full ${getActionColor(
                              action.type
                            )}`}
                          >
                            {getActionIcon(action.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={getActionColor(action.type)}
                              >
                                {action.type.charAt(0).toUpperCase() +
                                  action.type.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTime(action.timestamp)}
                              </span>
                            </div>
                            <p className="font-medium mb-1">
                              {action.description}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              {action.user}
                            </div>
                          </div>
                        </div>
                        {action.canUndo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUndo(action.id)}
                            className="ml-4"
                          >
                            <Undo2 className="h-4 w-4 mr-1" />
                            Undo
                          </Button>
                        )}
                      </div>
                      {index < activeActions.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-end items-center gap-2 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Actions</span>
                <Badge variant="secondary">{history.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active</span>
                <Badge variant="default">{activeActions.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Undone</span>
                <Badge variant="outline">{undoneActions.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {undoneActions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Undone Actions</CardTitle>
                <CardDescription>
                  {undoneActions.length} actions undone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {undoneActions.map((action) => (
                      <div
                        key={action.id}
                        className="p-3 rounded-lg bg-muted/50 opacity-60"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`p-1 rounded-full ${getActionColor(
                              action.type
                            )}`}
                          >
                            {getActionIcon(action.type)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Undone
                          </Badge>
                        </div>
                        <p className="text-sm font-medium line-through">
                          {action.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(action.timestamp)} • {action.user}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
