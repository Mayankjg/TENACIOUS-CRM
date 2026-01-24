"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { FaTrash, FaPen } from "react-icons/fa";
import LeadStatusModal from "./LeadStatusModal";

const API_BASE = "https://tt-crm-pro.onrender.com/api";

interface LeadStatus {
  _id?: string;
  id?: string;
  name: string;
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

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async (): Promise<void> => {
    try {
      const res = await fetch(
        `${API_BASE}/manage-items/lead-status/get-lead-status`
      );
      const data = await res.json();
      setLeadStatuses(data);
    } catch (err) {
      console.error("Fetch lead statuses error:", err);
    }
  };

  const handleCheckboxChange = (id: string): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (): void => {
    const value = !selectAll;
    setSelectAll(value);
    setSelectedIds(value ? leadStatuses.map((lead) => lead._id || lead.id || "") : []);
  };

  const handleDeleteSelected = async (): Promise<void> => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(
            `${API_BASE}/manage-items/lead-status/delete-lead-status/${id}`,
            {
              method: "DELETE",
            }
          )
        )
      );
      setSelectedIds([]);
      setSelectAll(false);
      fetchStatuses();
    } catch (err) {
      console.error("Delete selected lead statuses error:", err);
    }
  };

  const handleAddLeadStatus = async (): Promise<void> => {
    if (newLeadStatus.trim() === "") return;
    try {
      await fetch(`${API_BASE}/manage-items/lead-status/create-lead-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLeadStatus.trim() }),
      });
      setNewLeadStatus("");
      setShowModal(false);
      fetchStatuses();
    } catch (err) {
      console.error("Add lead status error:", err);
    }
  };

  const handleUpdate = async (id: string): Promise<void> => {
    try {
      await fetch(
        `${API_BASE}/manage-items/lead-status/update-lead-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: editedName }),
        }
      );
      setEditingId(null);
      setEditedName("");
      fetchStatuses();
    } catch (err) {
      console.error("Update lead status error:", err);
    }
  };

  const handleCancel = (): void => {
    setEditingId(null);
    setEditedName("");
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await fetch(
        `${API_BASE}/manage-items/lead-status/delete-lead-status/${id}`,
        {
          method: "DELETE",
        }
      );
      fetchStatuses();
    } catch (err) {
      console.error("Delete lead status error:", err);
    }
  };

  const handleSearch = (): void => {
    console.log("Searching for:", search);
  };

  const filteredLeads = leadStatuses.filter((l) =>
    (l.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start p-4 sm:p-6 transition-all duration-500 ease-in-out">
      <div className="bg-white w-full max-w-6xl rounded-md shadow-md border border-gray-300 relative text-black">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-300 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-black">Lead Status</h2>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
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

        {/* Table */}
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
                <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left">SR. NO.</th>
                <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                  LEAD STATUS
                </th>
                <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-3 text-center font-semibold">EDIT</th>
                <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-6 text-center font-semibold">DELETE</th>
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
                      className={`hover:bg-gray-50 transition ${selectedIds.includes(id) ? "bg-blue-50" : ""
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
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedName(e.target.value)}
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
                    className="bg-red-600 cursor-pointer text-white px-8 sm:px-12 py-1 sm:py-1.5 rounded-md hover:bg-red-700 text-xs sm:text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
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