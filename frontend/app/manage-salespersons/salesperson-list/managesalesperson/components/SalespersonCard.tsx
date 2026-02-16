// frontend/app/manage-salespersons/salesperson-list/managesalesperson/components/SalespersonCard.tsx
// MULTI-TENANT — works with both old AddSalesperson AND new OnboardingWizard
"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { Mail, Phone, Briefcase, Trash2, Key } from "lucide-react";
import NewPasswordModal from "./NewPasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";
import { apiGet, apiDelete, apiPut, validateSession, isAdmin, getTenantInfo } from "@/utils/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://one4-02-2026.onrender.com";

interface Salesperson {
  id: string | number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  designation?: string;
  contact?: string;
  profileImage?: string;
}

export default function SalespersonCard() {
  const router = useRouter();
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | number | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!validateSession()) { router.push("/login"); return; }
    if (!isAdmin()) { router.push("/dashboard"); return; }
    const tenantInfo = getTenantInfo();
    console.log("✅ SalespersonCard — Tenant:", tenantInfo);
    fetchList();
  }, [router]);

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (!validateSession()) return;
    try {
      setLoading(true);
      const result = await apiGet("/api/salespersons/get-salespersons");
      if (!result.success) throw new Error(result.error || "Failed to fetch salespersons");
      setSalespersons(result.data || []);
    } catch (error: any) {
      console.error("❌ fetchList error:", error);
      alert(error.message || "Failed to load salespersons");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteSP = async (id: string | number) => {
    if (!confirm("Delete this salesperson?")) return;
    if (!validateSession()) return;
    try {
      const result = await apiDelete(`/api/salespersons/delete-salesperson/${id}`);
      if (!result.success) throw new Error(result.error || "Failed to delete");
      setSalespersons((prev) => prev.filter((sp) => sp.id !== id));
      alert("Salesperson deleted successfully!");
    } catch (error: any) {
      console.error("❌ deleteSP error:", error);
      alert(error.message || "Failed to delete salesperson");
    }
  };

  // ── Password change ─────────────────────────────────────────────────────────
  const handlePasswordChange = async (id: string | number, newPassword: string) => {
    if (!validateSession()) return;
    try {
      const result = await apiPut(`/api/salespersons/update-salesperson-password/${id}`, { newPassword });
      if (!result.success) throw new Error(result.error || "Failed to update password");
      alert("Password Updated!");
    } catch (error: any) {
      console.error("❌ handlePasswordChange error:", error);
      alert(error.message || "Failed to update password");
    }
  };

  // ── Email change ────────────────────────────────────────────────────────────
  const handleEmailChange = async (id: string | number, email: string) => {
    if (!validateSession()) return;
    try {
      const result = await apiPut(`/api/salespersons/update-salesperson-email/${id}`, { email });
      if (!result.success) throw new Error(result.error || "Failed to update email");
      setSalespersons((prev) =>
        prev.map((sp) => (sp.id === id ? { ...sp, email: result.data?.email || email } : sp))
      );
      alert("Email updated successfully!");
    } catch (error: any) {
      console.error("❌ handleEmailChange error:", error);
      alert(error.message || "Failed to update email");
    }
  };

  // ── Image resolver ──────────────────────────────────────────────────────────
  const resolveImageSrc = (profileImage?: string): string => {
    if (!profileImage) return "/uploads/default-avatar.png";
    if (/^https?:\/\//i.test(profileImage)) return profileImage;
    if (profileImage.startsWith("/uploads")) return `${API_BASE}${profileImage}`;
    return profileImage;
  };

  const filtered = searchQuery
    ? salespersons.filter(
      (sp) =>
        (sp.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sp.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sp.firstname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sp.lastname || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    : salespersons;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading salespersons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] p-5 min-h-[80vh] flex justify-center">
      {/* Password Modal */}
      {isModalOpen && selectedId && (
        <NewPasswordModal
          salespersonId={selectedId}
          onClose={() => setIsModalOpen(false)}
          onPasswordChange={handlePasswordChange}
        />
      )}
      {/* Email Modal */}
      {isEmailModalOpen && selectedEmailId && (
        <ChangeEmailModal
          salespersonId={selectedEmailId}
          onClose={() => setIsEmailModalOpen(false)}
          onEmailChange={handleEmailChange}
        />
      )}

      <div className="bg-white w-full max-w-[1400px] border border-black text-black">
        {/* Header */}
        <div className="py-4">
          <div className="px-6">
            <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
              <h2 className="text-2xl text-gray-700 cursor-pointer">
                Salesperson <strong>List</strong>
              </h2>
              <button
                onClick={() =>
                  router.push("/manage-salespersons/salesperson-list/managesalesperson/add")
                }
                className="bg-[#374151] cursor-pointer hover:bg-[#1f2937] text-white px-5 py-2.5 rounded"
              >
                Add Sales Person
              </button>
            </div>
          </div>
          <hr className="border-gray-300 mt-4" />
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row justify-end px-6 mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="border border-gray-300 px-3 py-2 w-full md:w-[220px] rounded-md outline-none focus:border-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setSearchQuery("")}
            className="bg-[#18a3dd] text-white px-4 py-2 rounded-md hover:bg-[#1095cc]"
          >
            {searchQuery ? "Clear" : "Search"}
          </button>
        </div>

        {/* Summary count */}
        <div className="px-6 mb-3">
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {salespersons.length} salesperson{salespersons.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-base font-medium">No Salespersons Found</p>
            {salespersons.length === 0 && (
              <p className="text-sm mt-1">
                Click{" "}
                <button
                  className="text-cyan-500 underline cursor-pointer"
                  onClick={() =>
                    router.push("/manage-salespersons/salesperson-list/managesalesperson/add")
                  }
                >
                  Add Sales Person
                </button>{" "}
                to onboard your first team member.
              </p>
            )}
          </div>
        ) : (
          <div className="px-6 grid gap-3 pb-6">
            {filtered.map((sp) => {
              const imageSrc = resolveImageSrc(sp.profileImage);
              return (
                <div key={sp.id} className="p-4 bg-white border rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <img
                      src={imageSrc}
                      className="w-16 h-20 border rounded object-cover flex-shrink-0"
                      alt={sp.username || "salesperson"}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/uploads/default-avatar.png"; }}
                    />

                    {/* Info Grid */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Username */}
                      <div className="mb-2">
                        <h3 className="text-base font-bold text-gray-800">{sp.username}</h3>
                      </div>

                      {/* Row 2: Name | Designation | Delete | View Leads */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 mb-2">
                        <div className="text-sm text-gray-600 md:col-span-3">
                          {[sp.firstname, sp.lastname].filter(Boolean).join(" ")}
                        </div>
                        <div className="flex items-center gap-2 md:col-span-4">
                          <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            Designation:{" "}
                            <strong className="text-gray-900">{sp.designation || "—"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <button
                            onClick={() => deleteSP(sp.id)}
                            className="flex cursor-pointer items-center gap-1.5 text-sm text-red-600 hover:text-red-800 transition-colors whitespace-nowrap"
                          >
                            <Trash2 className="w-4 h-4 flex-shrink-0" />
                            Delete
                          </button>
                        </div>
                        <div className="flex items-center justify-end md:col-span-3">
                          <button className="bg-red-500 cursor-pointer text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 transition-colors whitespace-nowrap">
                            View Leads
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Email | Contact | Change Password | Change Email */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                        <div className="flex items-center gap-1.5 min-w-0 md:col-span-3">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <a
                            href={`mailto:${sp.email}`}
                            className="text-sm text-blue-500 hover:text-blue-700 truncate"
                            title={sp.email}
                          >
                            {sp.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-4">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            Contact:{" "}
                            <strong className="text-gray-900">{sp.contact || "—"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <button
                            onClick={() => { setSelectedId(sp.id); setIsModalOpen(true); }}
                            className="flex cursor-pointer items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors whitespace-nowrap"
                          >
                            <Key className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Change Password</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-end md:col-span-3">
                          <button
                            onClick={() => { setSelectedEmailId(sp.id); setIsEmailModalOpen(true); }}
                            className="bg-[#2b3342] cursor-pointer text-white text-sm px-4 py-1.5 rounded hover:bg-[#1f2937] transition-colors whitespace-nowrap"
                          >
                            Change Email ID
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}