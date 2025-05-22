"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "@/store/authSlice";
import { RootState } from "@/store";
import { cn } from "@/lib/utils";
import {
  Home,
  Leaf,
  Users,
  Boxes,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const contributes = useSelector((state: RootState) => state.contribute.list);
  const pendingCount = contributes.filter((c) => c.status === "pending").length;

  const isPlantPath = pathname.startsWith("/plants");

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(clearAuth());
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-muted border-r z-50 flex flex-col">
      {/* SidebarHeader - Sticky Top */}
      <div className="sticky top-0 bg-muted px-4 py-6 border-b z-10">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* SidebarContent - Scrollable Middle */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="flex flex-col gap-1">
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* Users */}
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/users" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </Link>

          {/* Contributes with Badge */}
          <Link
            href="/contributes"
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/contributes" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Boxes className="h-5 w-5" />
              <span>Contributes</span>
            </div>
            {pendingCount > 0 && (
              <span className="ml-auto inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                {pendingCount}
              </span>
            )}
          </Link>

          {/* Collapsible Plants Group */}
          <Collapsible defaultOpen={isPlantPath}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full hover:bg-accent hover:text-accent-foreground",
                  isPlantPath ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5" />
                  <span>Plants</span>
                </div>
                {isPlantPath ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-8 flex flex-col gap-1 mt-1">
              <Link
                href="/plants/species"
                className={cn(
                  "text-sm rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === "/plants/species"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                Species
              </Link>
              <Link
                href="/plants/families"
                className={cn(
                  "text-sm rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === "/plants/families"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                Families
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>

      {/* SidebarFooter - Sticky Bottom */}
      <div className="sticky bottom-0 px-4 py-4 bg-muted border-t z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">
                  {user?.username ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
