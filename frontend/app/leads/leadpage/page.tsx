// frontend/app/leads/page.tsx - COMPLETE MULTI-TENANT FIX

"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateLead from "./CreateLead";
import TodaysLeadsTable from "./TodaysLeadsTable";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiDelete, validateSession, getTenantInfo } from "@/utils/api";

/* --------------------------- TYPES --------------------------- */
interface Lead {
  _id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  city?: string;
  leadStatus?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  [key: string]: any;
}

interface User {
  id: string;
  role: string;
  tenantId: string;
  tenantName?: string;
  username?: string;
}

type FilterType = "" | "all" | "today" | "unscheduled" | "Pending" | "Miss" | "Closed" | "Deals" | "Void" | "Customer";

interface FilterButton {
  label: React.ReactNode;
  onClick: () => void;
  color: string;
  active: boolean;
}

/* --------------------------- COMPONENT --------------------------- */
export default function LeadsPage() {
  const { user, token, tokenReady } = useAuth();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<FilterType>("");
  const [loading, setLoading] = useState(true);

  /* -------------------- CHECK URL PARAMETER -------------------- */
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "addLead") {
      setIsAddingLead(true);
      setEditingLead(null);
    }
  }, [searchParams]);

  /* -------------------- VALIDATE SESSION ON MOUNT -------------------- */
  useEffect(() => {
    if (!tokenReady) return;

    if (!validateSession()) {
      console.error("❌ Invalid session - redirecting to login");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const tenantInfo = getTenantInfo();
    console.log("✅ LeadsPage - Tenant Context:", tenantInfo);
  }, [tokenReady]);

  /* -------------------- FETCH LEADS WITH TENANT ISOLATION -------------------- */
  useEffect(() => {
    if (!tokenReady) return;
    if (!token) return;
    if (!user?.tenantId) {
      console.error("❌ Cannot fetch leads - missing tenantId");
      return;
    }

    fetchLeads();
  }, [tokenReady, token, user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      console.log("🔄 Fetching leads for tenant:", user?.tenantId);

      // Backend automatically filters by tenant based on JWT token
      const result = await apiGet("/api/leads/get-leads");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch leads");
      }

      const items: Lead[] = Array.isArray(result.data) ? result.data : [];
      
      console.log("✅ Fetched leads:", {
        count: items.length,
        tenantId: user?.tenantId,
      });

      setLeads(items);
    } catch (err: any) {
      console.error("❌ Fetch Leads Error:", err);
      toast.error(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- DELETE LEAD -------------------- */
  const handleDelete = async (ids: string[]) => {
    if (!confirm("Are you sure you want to delete selected lead(s)?")) return;

    try {
      console.log("🗑️ Deleting leads:", ids);

      // ✅ Backend validates tenant ownership before deleting
      const deletePromises = ids.map((id) => 
        apiDelete(`/api/leads/delete-lead/${id}`)
      );

      const results = await Promise.all(deletePromises);

      const failedDeletes = results.filter(r => !r.success);
      if (failedDeletes.length > 0) {
        console.error("❌ Some deletes failed:", failedDeletes);
        toast.error(`Failed to delete ${failedDeletes.length} lead(s)`);
      }

      // Remove deleted leads from state
      setLeads((prev) => prev.filter((lead) => !ids.includes(lead._id)));

      toast.success(`🗑️ ${ids.length - failedDeletes.length} lead(s) deleted successfully!`);
    } catch (err: any) {
      console.error("❌ Delete Error:", err);
      toast.error("Failed to delete lead(s)");
    }
  };

  /* -------------------- SAVE HANDLER -------------------- */
  const handleSave = (data: any) => {
    console.log("💾 Save handler triggered:", { isEdit: !!editingLead });

    // ALWAYS REFETCH LEADS AFTER CREATE/UPDATE
    fetchLeads();

    // Show appropriate success message
    if (editingLead) {
      toast.success("✅ Lead Updated Successfully!");
    } else {
      toast.success("✅ Lead Created Successfully!");
    }

    // Reset states
    setIsAddingLead(false);
    setEditingLead(null);
  };

  const handleCancel = () => {
    setIsAddingLead(false);
    setEditingLead(null);
  };

  const handleEdit = (lead: Lead) => {
    console.log("✏️ Editing lead:", lead._id);
    setEditingLead(lead);
    setIsAddingLead(true);
  };

  /* -------------------- CHECK IF DATE IS TODAY -------------------- */
  const isToday = (dateString?: string): boolean => {
    if (!dateString) return false;

    const today = new Date();
    const checkDate = new Date(dateString);

    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  /* -------------------- GET TODAY'S LEADS COUNT -------------------- */
  const getTodayLeadsCount = (): number => {
    return leads.filter((lead) => isToday(lead.createdAt)).length;
  };

  /* -------------------- GET UNSCHEDULED COUNT -------------------- */
  const getUnscheduledCount = (): number => {
    return leads.filter((l) =>
      l.leadStatus === "Unscheduled" ||
      l.category === "Unscheduled"
    ).length;
  };

  /* -------------------- FILTER LOGIC -------------------- */
  const filteredLeads: Lead[] = leads.filter((lead) => {
    if (!filter || filter === "all") return true;

    if (filter === "today") {
      return isToday(lead.createdAt);
    }

    if (filter === "unscheduled") {
      return lead.leadStatus === "Unscheduled" || lead.category === "Unscheduled";
    }

    return lead.leadStatus === filter;
  });

  /* -------------------- GET STATUS COUNT -------------------- */
  const getCount = (status: string): number =>
    leads.filter((l) => l.leadStatus === status).length;

  /* -------------------- HANDLE FILTER BUTTON CLICK -------------------- */
  const handleFilterClick = (filterValue: FilterType) => {
    console.log("🔍 Filter clicked:", filterValue);

    setIsAddingLead(false);
    setEditingLead(null);
    setFilter(filterValue);
  };

  /* -------------------- LOADING STATE -------------------- */
  if (loading && leads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  /* -------------------- FILTER BUTTONS DATA -------------------- */
  const filterButtons: FilterButton[] = [
    {
      label: (
        <span className="flex items-center text-[14px] font-semibold">
          <FaPlus className="pr-1 text-[14px]" /> Add New Lead
        </span>
      ),
      onClick: () => {
        setEditingLead(null);
        setIsAddingLead((prev) => !prev);
      },
      color: "bg-slate-800",
      active: false,
    },
    {
      label: <>Todays [{getTodayLeadsCount()}]</>,
      onClick: () => handleFilterClick("today"),
      color: "bg-blue-600",
      active: filter === "today",
    },
    {
      label: <>All [{leads.length}]</>,
      onClick: () => handleFilterClick("all"),
      color: "bg-cyan-600",
      active: filter === "all" || filter === "",
    },
    {
      label: <>Pending [{getCount("Pending")}]</>,
      onClick: () => handleFilterClick("Pending"),
      color: "bg-orange-500",
      active: filter === "Pending",
    },
    {
      label: <>Miss [{getCount("Miss")}]</>,
      onClick: () => handleFilterClick("Miss"),
      color: "bg-sky-500",
      active: filter === "Miss",
    },
    {
      label: <>Unscheduled [{getUnscheduledCount()}]</>,
      onClick: () => handleFilterClick("unscheduled"),
      color: "bg-gray-500",
      active: filter === "unscheduled",
    },
    {
      label: <>Closed [{getCount("Closed")}]</>,
      onClick: () => handleFilterClick("Closed"),
      color: "bg-indigo-700",
      active: filter === "Closed",
    },
    {
      label: <>Deals [{getCount("Deals")}]</>,
      onClick: () => handleFilterClick("Deals"),
      color: "bg-green-600",
      active: filter === "Deals",
    },
    {
      label: <>Void [{getCount("Void")}]</>,
      onClick: () => handleFilterClick("Void"),
      color: "bg-red-600",
      active: filter === "Void",
    },
    {
      label: <>Customer [{getCount("Customer")}]</>,
      onClick: () => handleFilterClick("Customer"),
      color: "bg-purple-600",
      active: filter === "Customer",
    },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-50 custom-padding p-2">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Responsive CSS */}
      <style jsx>{`
        @media (min-width: 320px) and (max-width: 479px) {
          .custom-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 768px) and (max-width: 900px) {
          .custom-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      {/* TENANT INFO (DEBUG - Remove in production) */}
      {process.env.NODE_ENV === "development" && user && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-xs">
          <strong>Tenant Context:</strong> {user.tenantName} (ID: {user.tenantId}) | 
          Role: {user.role} | 
          Leads: {leads.length}
        </div>
      )}

      {/* FILTER BUTTONS - ALWAYS VISIBLE */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 mb-6 mt-5 ml-0 justify-items-center custom-grid">
        {filterButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className={`${btn.color} text-white cursor-pointer text-[14px] font-medium rounded-sm shadow-md flex items-center justify-center w-[140px] h-[40px] transition-all hover:opacity-90 ${
              btn.active ? "ring-4 ring-opacity-50" : ""
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* FORM / TABLE */}
      {isAddingLead ? (
        <div className="mb-10">
          <CreateLead
            onSave={handleSave}
            onCancel={handleCancel}
            existingData={editingLead}
          />
        </div>
      ) : (
        <TodaysLeadsTable
          leads={filteredLeads}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}