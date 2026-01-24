"use client";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-5 text-black">
      <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>

      <div className="mt-4 p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold">Hello, {user?.username}</h2>
        <p className="text-gray-700 mt-2">
          You are logged in as <b>{user?.role}</b>
        </p>
      </div>
    </div>
  );
}




