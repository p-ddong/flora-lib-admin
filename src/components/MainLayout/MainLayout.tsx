"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../SideBar/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const hideSidebarRoutes = ["/login"];
  const shouldHideSidebar = hideSidebarRoutes.includes(pathname);

  // Kiểm tra token hết hạn quá 1 ngày
  useEffect(() => {
    if (shouldHideSidebar) return;

    const token = localStorage.getItem("token");
    const loginTime = localStorage.getItem("loginTime");

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!token || !loginTime || now - new Date(loginTime).getTime() > oneDay) {
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
      router.replace("/login");
    }
  }, [router, shouldHideSidebar]);

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
