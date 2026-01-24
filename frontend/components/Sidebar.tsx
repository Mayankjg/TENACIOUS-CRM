"use client";

import { useState, useEffect, Dispatch, SetStateAction, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ChevronDown,
  ChevronRight,
  Key,
  Send,
  FileText,
  Settings,
  LogOut,
  MessageCircle,
  UserCog,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Type definitions
interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

interface MenuItem {
  name: string;
  path: string;
}

interface MenuItemProps {
  icon: ReactNode;
  title: string;
  path: string;
  go: (path: string) => void;
  isActive: (path: string) => boolean;
  isSidebarOpen: boolean;
}

interface DropdownProps {
  icon: ReactNode;
  title: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isSidebarOpen: boolean;
  items: MenuItem[];
  go: (path: string) => void;
  isActive: (path: string) => boolean;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const [leadOpen, setLeadOpen] = useState<boolean>(false);
  const [newsletterOpen, setNewsletterOpen] = useState<boolean>(false);
  const [manageOpen, setManageOpen] = useState<boolean>(false);
  const [salesOpen, setSalesOpen] = useState<boolean>(false);
  const [leadCaptureOpen, setLeadCaptureOpen] = useState<boolean>(false);
  const [reportsOpen, setReportsOpen] = useState<boolean>(false);
  const [year, setYear] = useState<number | string>("");

  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const go = (path: string): void => router.push(path);
  const isActive = (path: string): boolean => pathname === path;

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen bg-[#1a1f25] text-gray-200 font-semibold z-40 flex flex-col transition-all duration-500 ease-in-out shadow-lg
          ${
            isSidebarOpen
              ? "w-64 translate-x-0"
              : "w-20 -translate-x-full md:translate-x-0 md:w-20"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          {isSidebarOpen && (
            <h1 className="text-lg font-extrabold tracking-wide truncate">
              Tenacious Sales
            </h1>
          )}
          <div
            className="cursor-pointer bg-gray-800 p-1 rounded hover:bg-orange-400 hover:text-white transition-colors"
            onClick={() => go("/")}
          >
            <Home size={20} className="text-gray-300" />
          </div>
        </div>

        {isSidebarOpen && (
          <div className="flex flex-col items-center py-6 border-b border-gray-700">
            <img
              src={user?.avatar || "/images/profile.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-gray-600 object-cover"
            />
            <p className="mt-3 text-gray-400 text-sm">Welcome</p>
            <h2 className="text-lg font-bold mt-1 truncate">
              {user?.username || "Test"}
            </h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-1 py-5 space-y-3 scrollbar-hidden">
          <MenuItemComponent
            icon={<LayoutDashboard size={18} />}
            title="Dashboard"
            path="/dashboard"
            go={go}
            isActive={isActive}
            isSidebarOpen={isSidebarOpen}
          />

          <Dropdown
            icon={<ListChecks size={18} />}
            title="Leads"
            isOpen={leadOpen}
            setIsOpen={setLeadOpen}
            isSidebarOpen={isSidebarOpen}
            items={[
              { name: "Leads", path: "/leads/leadpage" },
              { name: "Calendar", path: "/leads/calendar" },
              { name: "Leads On Map", path: "/leads/leads-map" },
              // { name: "Export Leads", path: "/leads/export-leads" },
              // { name: "Import Leads", path: "/leads/import-leads" },
            ]}
            go={go}
            isActive={isActive}
          />

          {/** ⭐⭐⭐ ADMIN → Can See | SALESPERSON → HIDDEN ⭐⭐⭐ */}
          {user?.role === "admin" && (
            <Dropdown
              icon={<UserCog size={18} />}
              title="Manage Salespersons"
              isOpen={salesOpen}
              setIsOpen={setSalesOpen}
              isSidebarOpen={isSidebarOpen}
              items={[
                {
                  name: "Salesperson List",
                  path: "/manage-salespersons/salesperson-list",
                },
                // {
                //   name: "Request For Inactive (0)",
                //   path: "/manage-salespersons/request-inactive",
                // },
                // {
                //   name: "Push Notification",
                //   path: "/manage-salespersons/push-notification",
                // },
                // {
                //   name: "Track Your SalesPerson",
                //   path: "/manage-salespersons/track-salesperson",
                // },
                // {
                //   name: "Account Expiry Report",
                //   path: "/manage-salespersons/account-expiry-report",
                // },
              ]}
              go={go}
              isActive={isActive}
            />
          )}

          <Dropdown
            icon={<Settings size={18} />}
            title="Manage Items"
            isOpen={manageOpen}
            setIsOpen={setManageOpen}
            isSidebarOpen={isSidebarOpen}
            items={[
              { name: "Categories", path: "/manage-items/categories" },
              { name: "Products", path: "/manage-items/products" },
              { name: "Lead Status", path: "/manage-items/lead-status" },
              { name: "Lead Source", path: "/manage-items/lead-source" },
              { name: "Manage Tag", path: "/manage-items/manage-tag" },
            ]}
            go={go}
            isActive={isActive}
          />

          <Dropdown
            icon={<Send size={18} />}
            title="Newsletter"
            isOpen={newsletterOpen}
            setIsOpen={setNewsletterOpen}
            isSidebarOpen={isSidebarOpen}
            items={[
              { name: "Templates", path: "/newsletter/templates" },
              { name: "Import Contacts", path: "/newsletter/import-contacts" },
              { name: "Contact List", path: "/newsletter/contact-list" },
              {
                name: "Unsubscribe Users List",
                path: "/newsletter/unsubscribed",
              },
              {
                name: "Invalid Email List",
                path: "/newsletter/invalid-emails",
              },
              {
                name: "From Email List",
                path: "/newsletter/from-email-list",
              },
              { name: "Send Mail", path: "/newsletter/send-mail" },
            ]}
            go={go}
            isActive={isActive}
          />

          <Dropdown
            icon={<ListChecks size={18} />}
            title="Lead Capture Form"
            isOpen={leadCaptureOpen}
            setIsOpen={setLeadCaptureOpen}
            isSidebarOpen={isSidebarOpen}
            items={[
              // {
              //   name: "Lead Capture Form",
              //   path: "/lead-capture-form/lead-capture",
              // },
              // {
              //   name: "Inquiry List (2)",
              //   path: "/lead-capture-form/inquiry-list",
              // },
            ]}
            go={go}
            isActive={isActive}
          />

          <Dropdown
            icon={<FileText size={18} />}
            title="Reports"
            isOpen={reportsOpen}
            setIsOpen={setReportsOpen}
            isSidebarOpen={isSidebarOpen}
            items={[
              {
                name: "Monthly Leads",
                path: "/reports/monthly-leads",
              },
              {
                name: "Leads by Products List",
                path: "/reports/products-list",
              },
              {
                name: "Leads by Products Graph",
                path: "/reports/products-graph",
              },
              { name: "Leads by Status List", path: "/reports/status-list" },
              { name: "Leads by Status Graph", path: "/reports/status-graph" },
              { name: "Leads by Source List", path: "/reports/source-list" },
              { name: "Leads by Deals List", path: "/reports/deals-list" },
              {
                name: "Deals by Source List",
                path: "/reports/deals-by-source-list",
              },
              {
                name: "Comments by Sales Person",
                path: "/reports/sales-person",
              },
            ]}
            go={go}
            isActive={isActive}
          />

          <div className="pt-3 border-t border-gray-700 space-y-1">
            {[
              {
                name: "Change Password",
                icon: <Key size={18} />,
                path: "/change-password",
              },
              {
                name: "Tell a Friend",
                icon: <Send size={18} />,
                path: "/tell-friend",
              },
              {
                name: "Give Feedback",
                icon: <MessageCircle size={18} />,
                path: "/feedback",
              },
            ].map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer truncate transition-all hover:bg-gray-700 hover:text-orange-300 ${
                  isActive(item.path)
                    ? "bg-gray-700 text-orange-400 font-bold"
                    : ""
                }`}
                onClick={() => go(item.path)}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.name}</span>}
              </div>
            ))}

            <div
              onClick={() => {
                logout();
                go("/login");
              }}
              className="flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer hover:bg-gray-700 hover:text-orange-300"
            >
              <LogOut size={18} />
              {isSidebarOpen && <span>Log Out</span>}
            </div>
          </div>
        </div>

        {isSidebarOpen && (
          <div className="border-t border-gray-700 py-4 px-4 text-center text-xs text-gray-500">
            © {year} Tenacious Sales
          </div>
        )}
      </div>
    </>
  );
}

function MenuItemComponent({ icon, title, path, go, isActive, isSidebarOpen }: MenuItemProps) {
  return (
    <div
      onClick={() => go(path)}
      className={`flex items-center gap-3 py-2 px-2 rounded-md cursor-pointer hover:bg-gray-700 hover:text-orange-400 transition-colors ${
        isActive(path) ? "bg-gray-700 text-orange-400 font-bold" : ""
      }`}
    >
      {icon}
      {isSidebarOpen && <span>{title}</span>}
    </div>
  );
}

function Dropdown({
  icon,
  title,
  isOpen,
  setIsOpen,
  isSidebarOpen,
  items,
  go,
  isActive,
}: DropdownProps) {
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex justify-between items-center w-full py-2 px-2 rounded-md transition-all ${
          isActive(items[0]?.path)
            ? "bg-gray-700 text-orange-400"
            : "hover:bg-gray-700"
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          {isSidebarOpen && <span>{title}</span>}
        </div>
        {isSidebarOpen &&
          (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </button>

      {isSidebarOpen && isOpen && (
        <ul className="ml-6 mt-1 text-sm space-y-1">
          {items.map((item) => (
            <li
              key={item.name}
              className={`cursor-pointer py-[2px] px-2 rounded-md transition-colors ${
                isActive(item.path)
                  ? "text-orange-400 font-bold"
                  : "hover:text-orange-400"
              }`}
              onClick={() => go(item.path)}
            >
              » {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}