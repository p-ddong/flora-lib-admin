import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/provider/ReduxProvider";
import MainLayout from "@/components/MainLayout/MainLayout";

export const metadata: Metadata = {
  title: "Flora Lib Admin",
  description: "Admin dashboard for managing flora species, families, attributes, and contributions.",
  authors: [{ name: "Flora Lib Team", url: "https://github.com/p-ddong" }],
  keywords: ["plants", "admin", "flora", "dashboard", "species management"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Flora Lib Admin",
    description: "A powerful dashboard for managing the flora species library.",
    type: "website",
    siteName: "Flora Lib Admin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex overflow-hidden">
        <ReduxProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
