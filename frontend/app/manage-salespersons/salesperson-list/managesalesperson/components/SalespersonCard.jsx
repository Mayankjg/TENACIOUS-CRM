// frontend/app/manage-salespersons/salesperson-list/managesalesperson/components/SalespersonCard.jsx
// MULTI-TENANT FIXED

"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Mail, Phone, Briefcase, Trash2, Key } from "lucide-react";

import NewPasswordModal from "./NewPasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";

// ✅ CRITICAL: Import tenant-aware utilities
import { 
  apiGet, 
  apiDelete, 
  apiPut, 
  validateSession,
  isAdmin,
  getTenantInfo 
} from "@/utils/api";

export default function SalespersonCard() {
  const router = useRouter();

  const [salespersons, setSalespersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  // ✅ CRITICAL: Validate session and admin role on mount
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session");
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      console.error("❌ Not authorized - Admin only");
      router.push("/dashboard");
      return;
    }

    const tenantInfo = getTenantInfo();
    console.log("✅ Salesperson List - Tenant Context:", tenantInfo);

    fetchList();
  }, [router]);

  // ✅ CRITICAL: Fetch salespersons with tenant filtering (done by backend)
  const fetchList = async () => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch salespersons - invalid session");
      return;
    }

    try {
      setLoading(true);
      
      console.log("🔄 Fetching salespersons...");

      const result = await apiGet("/api/salespersons/get-salespersons");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch salespersons");
      }

      console.log("✅ Fetched salespersons:", result.data?.length || 0);

      setSalespersons(result.data || []);
    } catch (error) {
      console.error("❌ Error fetching salespersons:", error);
      alert(error.message || "Failed to load salespersons");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CRITICAL: Delete salesperson with tenant validation
  const deleteSP = async (id) => {
    if (!confirm("Delete this salesperson?")) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting salesperson:", id);

      const result = await apiDelete(`/api/salespersons/delete-salesperson/${id}`);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete salesperson");
      }

      console.log("✅ Salesperson deleted successfully");

      setSalespersons((prev) => prev.filter((sp) => sp.id !== id));
      alert("Salesperson deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting salesperson:", error);
      alert(error.message || "Failed to delete salesperson");
    }
  };

  // ✅ CRITICAL: Update password with tenant validation
  const handlePasswordChange = async (id, newPassword) => {
    if (!validateSession()) {
      console.error("❌ Cannot update password - invalid session");
      return;
    }

    try {
      console.log("🔑 Updating password for salesperson:", id);

      const result = await apiPut(
        `/api/salespersons/update-salesperson-password/${id}`,
        { newPassword }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update password");
      }

      console.log("✅ Password updated successfully");
      alert("Password Updated!");
    } catch (error) {
      console.error("❌ Error updating password:", error);
      alert(error.message || "Failed to update password");
    }
  };

  // ✅ CRITICAL: Update email with tenant validation
  const handleEmailChange = async (id, email) => {
    if (!validateSession()) {
      console.error("❌ Cannot update email - invalid session");
      return;
    }

    try {
      console.log("📧 Updating email for salesperson:", id);

      const result = await apiPut(
        `/api/salespersons/update-salesperson-email/${id}`,
        { email }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update email");
      }

      console.log("✅ Email updated successfully");

      setSalespersons((prev) =>
        prev.map((sp) =>
          sp.id === id ? { ...sp, email: result.data.email } : sp
        )
      );

      alert("Email updated successfully!");
    } catch (error) {
      console.error("❌ Error updating email:", error);
      alert(error.message || "Failed to update email");
    }
  };

  const resolveImageSrc = (profileImage) => {
    if (!profileImage)
      return "/uploads/default-avatar.png";

    if (/^https?:\/\//i.test(profileImage)) return profileImage;

    if (profileImage.startsWith("/uploads")) {
      return profileImage;
    }

    return profileImage;
  };

  const filtered = searchQuery
    ? salespersons.filter(
        (sp) =>
          (sp.username || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (sp.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : salespersons;

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salespersons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9fafb] p-5 min-h-[80vh] flex justify-center">
      {/* PASSWORD MODAL */}
      {isModalOpen && (
        <NewPasswordModal
          salespersonId={selectedId}
          onClose={() => setIsModalOpen(false)}
          onPasswordChange={handlePasswordChange}
        />
      )}

      {/* EMAIL MODAL */}
      {isEmailModalOpen && (
        <ChangeEmailModal
          salespersonId={selectedEmailId}
          onClose={() => setIsEmailModalOpen(false)}
          onEmailChange={handleEmailChange}
        />
      )}

      <div className="bg-white w-full max-w-[1400px] border border-black text-black">
        {/* HEADER */}
        <div className="py-4">
          <div className="px-6">
            <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
              <h2 className="text-2xl text-gray-700 cursor-pointer">
                Salesperson <strong>List</strong>
              </h2>

              <button
                onClick={() =>
                  router.push(
                    "/manage-salespersons/salesperson-list/managesalesperson/add"
                  )
                }
                className="bg-[#374151] cursor-pointer hover:bg-[#1f2937] text-white px-5 py-2.5 rounded"
              >
                Add Sales Person
              </button>
            </div>
          </div>

          <hr className="border-gray-300 mt-4" />
        </div>

        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-end px-6 mb-4 gap-2">
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 px-3 py-2 w-full md:w-[200px] rounded-md outline-none focus:border-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button className="bg-[#18a3dd] text-white px-4 py-2 rounded-md hover:bg-[#1095cc]">
            Search
          </button>
        </div>

        {/* LIST */}
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No Salespersons Found
          </p>
        ) : (
          <div className="px-6 grid gap-3 pb-6">
            {filtered.map((sp) => {
              const imageSrc = resolveImageSrc(sp.profileImage);

              return (
                <div
                  key={sp.id}
                  className="p-4 bg-white border rounded-lg hover:bg-gray-50 shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* LEFT - Image */}
                    <img
                      src={imageSrc || "/default-avatar.png"}
                      className="w-16 h-20 border rounded object-cover flex-shrink-0"
                      alt={sp.username || "salesperson"}
                    />

                    {/* MIDDLE - Info Grid */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Username */}
                      <div className="mb-2">
                        <h3 className="text-base font-bold text-gray-800">
                          {sp.username}
                        </h3>
                      </div>

                      {/* Row 2: First Name | Designation | Delete | View Leads */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 mb-2">
                        <div className="text-sm text-gray-600 md:col-span-3">
                          {sp.firstname} {sp.lastname}
                        </div>

                        <div className="flex items-center gap-2 md:col-span-4">
                          <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            Designation:{" "}
                            <strong className="text-gray-900">
                              {sp.designation}
                            </strong>
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

                      {/* Row 3: Email | Contact | Change Password | Change Email ID */}
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
                            <strong className="text-gray-900">
                              {sp.contact}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                          <button
                            onClick={() => {
                              setSelectedId(sp.id);
                              setIsModalOpen(true);
                            }}
                            className="flex cursor-pointer items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors whitespace-nowrap"
                          >
                            <Key className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              Change Password
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center justify-end md:col-span-3">
                          <button
                            onClick={() => {
                              setSelectedEmailId(sp.id);
                              setIsEmailModalOpen(true);
                            }}
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