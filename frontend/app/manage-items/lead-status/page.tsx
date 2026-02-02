// frontend/app/manage-items/lead-status/page.tsx - FINAL MULTI-TENANT COMPLETE

"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaPen } from "react-icons/fa";
import LeadStatusModal from "./LeadStatusModal";

//Import tenant-aware utilities
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  validateSession,
} from "@/utils/api";

interface LeadStatus {
  _id?: string;
  id?: string;
  name: string;
  [key: string]: any;
}

export default function LeadStatus() {
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newLeadStatus, setNewLeadStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  //Validate session on mount
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session in Lead Status");
      return;
    }

    fetchStatuses();
  }, []);

  //Fetch with tenant filtering (done by backend)
  const fetchStatuses = async () => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch lead statuses - invalid session");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching lead statuses...");

      const result = await apiGet("/api/manage-items/lead-status/get-lead-status");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch lead statuses");
      }

      console.log("✅ Fetched lead statuses:", result.data?.length || 0);
      setLeadStatuses(result.data || []);
    } catch (err: any) {
      console.error("❌ Fetch lead statuses error:", err);
      alert(err.message || "Failed to load lead statuses");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const value = !selectAll;
    setSelectAll(value);
    setSelectedIds(value ? leadStatuses.map((lead) => lead._id || lead.id || "") : []);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select lead statuses to delete");
      return;
    }

    if (!confirm(`Delete ${selectedIds.length} selected lead status(es)?`)) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting lead statuses:", selectedIds);

      const results = await Promise.all(
        selectedIds.map((id) =>
          apiDelete(`/api/manage-items/lead-status/delete-lead-status/${id}`)
        )
      );

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        console.error("❌ Some deletions failed:", failed);
      }

      setSelectedIds([]);
      setSelectAll(false);
      fetchStatuses();
    } catch (err) {
      console.error("❌ Delete selected lead statuses error:", err);
      alert("Failed to delete lead statuses");
    }
  };

  //Add with automatic tenant isolation
  const handleAddLeadStatus = async () => {
    if (!newLeadStatus.trim()) {
      alert("Please enter a lead status name");
      return;
    }

    if (!validateSession()) {
      console.error("❌ Cannot add lead status - invalid session");
      return;
    }

    try {
      console.log("➕ Adding lead status:", newLeadStatus);

      const result = await apiPost("/api/manage-items/lead-status/create-lead-status", {
        name: newLeadStatus.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add lead status");
      }

      console.log("✅ Lead status added successfully");
      setNewLeadStatus("");
      setShowModal(false);
      fetchStatuses();
    } catch (err: any) {
      console.error("❌ Add lead status error:", err);
      alert(err.message || "Failed to add lead status");
    }
  };

  //Update with tenant validation
  const handleUpdate = async (id: string) => {
    if (!validateSession()) {
      console.error("❌ Cannot update - invalid session");
      return;
    }

    try {
      console.log("💾 Updating lead status:", id);

      const result = await apiPut(
        `/api/manage-items/lead-status/update-lead-status/${id}`,
        { name: editedName }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update lead status");
      }

      console.log("✅ Lead status updated successfully");
      setEditingId(null);
      setEditedName("");
      fetchStatuses();
    } catch (err: any) {
      console.error("❌ Update lead status error:", err);
      alert(err.message || "Failed to update lead status");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedName("");
  };

  //Delete with tenant validation
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead status?")) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting lead status:", id);

      const result = await apiDelete(
        `/api/manage-items/lead-status/delete-lead-status/${id}`
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to delete lead status");
      }

      console.log("✅ Lead status deleted successfully");
      fetchStatuses();
    } catch (err: any) {
      console.error("❌ Delete lead status error:", err);
      alert(err.message || "Failed to delete lead status");
    }
  };

  const handleSearch = () => {
    console.log("🔍 Searching for:", search);
  };

  const filteredLeads = leadStatuses.filter((l) =>
    (l.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start p-4 sm:p-6 transition-all duration-500 ease-in-out">
      <div className="bg-white w-full max-w-6xl rounded-md shadow-md border border-gray-300 relative text-black">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-300 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-black">
            Lead Status
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#073763] cursor-pointer hover:bg-[#042645] text-white px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            Add Lead Status
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-end items-center p-4 gap-2">
          <input
            type="text"
            placeholder="Search Lead Status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black text-sm sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="bg-[#2986cc] cursor-pointer hover:bg-[#0b5394] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading lead statuses...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto px-4 py-4 text-black">
            <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300">
              <thead
                style={{
                  backgroundColor: "rgb(211, 214, 220)",
                  borderColor: "rgb(211, 214, 220)",
                }}
              >
                <tr className="text-black">
                  <th className="border-t border-l border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left">
                    SR. NO.
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    LEAD STATUS
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-3 text-center font-semibold">
                    EDIT
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-6 text-center font-semibold">
                    DELETE
                  </th>
                  <th className="border-t border-r border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-1 text-center font-semibold">
                    VIEW LEADS
                  </th>
                </tr>
              </thead>

              <tbody className="font-medium text-black">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead, index) => {
                    const id = lead._id || lead.id || "";
                    return (
                      <tr
                        key={id}
                        className={`hover:bg-gray-50 transition ${
                          selectedIds.includes(id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border text-center border-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(id)}
                            onChange={() => handleCheckboxChange(id)}
                          />
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-4 border text-left border-gray-300">
                          {index + 1}
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-300">
                          {editingId === id ? (
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full text-black text-xs sm:text-sm"
                            />
                          ) : (
                            lead.name
                          )}
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-3 border text-center border-gray-300">
                          {editingId === id ? (
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                              <button
                                onClick={() => handleUpdate(id)}
                                className="text-blue-600 cursor-pointer font-semibold"
                              >
                                Update
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={handleCancel}
                                className="text-gray-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(id);
                                setEditedName(lead.name);
                              }}
                              className="text-gray-700 cursor-pointer hover:text-blue-600"
                            >
                              <FaPen size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-6 border text-center border-gray-300">
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-red-600 cursor-pointer hover:text-red-700"
                          >
                            <FaTrash size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </td>

                        <td className="border py-2 sm:py-3 text-center border-gray-300">
                          <button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium shadow-sm">
                            View Leads
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 sm:py-6 text-gray-500 border border-gray-300 text-black text-xs sm:text-sm"
                    >
                      No lead statuses found
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 sm:px-3 py-2 sm:py-3 text-left border-t border border-gray-300"
                  >
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedIds.length === 0}
                      className="bg-red-600 cursor-pointer text-white px-8 sm:px-12 py-1 sm:py-1.5 rounded-md hover:bg-red-700 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Selected ({selectedIds.length})
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <LeadStatusModal
        showModal={showModal}
        newLeadStatus={newLeadStatus}
        setNewLeadStatus={setNewLeadStatus}
        handleAddLeadStatus={handleAddLeadStatus}
        setShowModal={setShowModal}
      />
    </div>
  );
}