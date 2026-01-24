// frontend/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { AuthProvider } from "@/context/AuthContext";

// ✅ Server-only metadata
export const metadata: Metadata = {
  title: "Tenacious Sales",
  description: "Created by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#f6f8fa]">
        {/* Entire App wrapped inside AuthProvider */}
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
