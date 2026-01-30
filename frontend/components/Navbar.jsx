"use client";

import { useState } from "react";
import {
  Menu,
  User,
  Search,
  Settings,
  ChevronDown,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) console.log("Searching for:", searchQuery);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <div className="flex">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <nav
        className={`flex items-center justify-between bg-white border-b px-3 sm:px-4 md:px-6 py-3 shadow-sm fixed top-0 right-0 z-30 w-full md:w-auto transition-all duration-500 ease-in-out ${
          isSidebarOpen ? "md:left-64" : "md:left-20"
        }`}
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" />
          </button>

          <div className="relative hidden sm:flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-700 hidden md:block" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-gray-100 rounded-md px-3 py-2 text-sm sm:text-base outline-none w-40 sm:w-60 text-black"
            />
            <Search
              className="w-5 h-5 text-gray-600 cursor-pointer hover:text-black"
              onClick={handleSearch}
            />
          </div>

          <button
            className="block sm:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 hover:bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition"
              >
                <span className="text-gray-800 text-sm font-medium hidden sm:block">
                  {user.username || user.name}
                </span>
                <img
                  src={user.avatar || "/images/profile.png"}
                  alt="profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border"
                />
                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border rounded-md shadow-lg z-50 text-black">
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <UserCircle className="w-4 h-4" />
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
            >
              Login
            </button>
          )}

          <button
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-lg"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {showMobileSearch && (
        <div className="absolute top-20 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-3 flex items-center space-x-2 sm:hidden z-40">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-gray-100 rounded-md px-3 py-2 text-sm outline-none text-black"
          />
          <Search
            className="w-5 h-5 text-gray-600 cursor-pointer hover:text-black"
            onClick={handleSearch}
          />
        </div>
      )}
    </div>
  );
}
