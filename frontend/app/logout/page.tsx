"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 400);
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold">🚪 Logging out...</h1>
      <p className="text-gray-600 mt-2">
        You are being logged out and will be redirected.
      </p>
    </div>
  );
}