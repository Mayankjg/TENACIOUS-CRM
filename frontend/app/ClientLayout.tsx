// frontend/app/ClientLayout.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes (no sidebar/navbar)
  const openRoutes = ["/login", "/signup"];

  useEffect(() => {
    if (!loading) {
      // Not logged in & trying to access protected route
      if (!user && !openRoutes.includes(pathname)) {
        router.push("/login");
      }

      // Logged in user goes to login/signup → redirect to dashboard
      if (user && openRoutes.includes(pathname)) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (Hide for login/signup) */}
      {!openRoutes.includes(pathname) && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          !openRoutes.includes(pathname)
            ? isSidebarOpen
              ? "md:ml-64"
              : "md:ml-20"
            : ""
        }`}
      >
        {/* Navbar (Hide for login/signup) */}
        {!openRoutes.includes(pathname) && (
          <Navbar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        )}

        <main className="p-1 mt-15">{children}</main>
      </div>
    </div>
  );
}
