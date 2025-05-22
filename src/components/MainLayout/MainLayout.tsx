"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../SideBar/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebarRoutes = ["/login"];
  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <div className="h-screen">
      {!shouldHideSidebar && (
        <div className="w-[240px] flex-shrink-0">
          <Sidebar />
        </div>
      )}
      <main className={`${!shouldHideSidebar && "pl-[240px]"} flex-1 overflow-y-auto h-screen w-dvw`}>{children}</main>
    </div>
  );
}
