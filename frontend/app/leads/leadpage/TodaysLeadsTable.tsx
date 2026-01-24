// frontend/app/leads/TodaysLeadsTable.tsx
"use client";

import { useState, useMemo, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { FaEdit, FaClipboard } from "react-icons/fa";
import AssignLeadsModal from "./AssignLeadsModal"

// Type definitions
interface Lead {
  _id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  city?: string;
  leadStatus: string;
  product?: string;
  tags?: string[];
  category?: string;
  createdAt: string;
  comment?: string;
  [key: string]: any;
}

interface Tag {
  name: string;
  color?: string;
  [key: string]: any;
}

interface TodaysLeadsTableProps {
  leads?: Lead[];
  onDelete?: (ids: string[]) => void;
  onEdit?: (lead: Lead) => void;
}

type SortOrder = "Ascending" | "Descending";

export default function TodaysLeadsTable({ 
  leads = [], 
  onDelete, 
  onEdit 
}: TodaysLeadsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Ascending");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://crm-tenacious-techies-pro-1.onrender.com";

  useEffect(() => {
    const fetchTags = async (): Promise<void> => {
      try {
        const res = await axios.get<Tag[]>(`${API_BASE}/api/manage-items/tags/get-tags`);
        setTags(res.data || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, [API_BASE]);

  const products = useMemo(() => {
    const p = [...new Set(leads.map((lead) => lead.product).filter(Boolean))];
    return p.length ? p : ["No Product"];
  }, [leads]);

  const statuses = useMemo(() => {
    const s = [
      ...new Set(leads.map((lead) => lead.leadStatus).filter(Boolean)),
    ];
    return s.length ? s : ["N/A"];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    if (selectedProduct && selectedProduct !== "All") {
      filtered = filtered.filter((lead) => lead.product === selectedProduct);
    }

    if (selectedStatus && selectedStatus !== "All") {
      filtered = filtered.filter((lead) => lead.leadStatus === selectedStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.firstName?.toLowerCase().includes(term) ||
          lead.lastName?.toLowerCase().includes(term) ||
          lead.company?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term) ||
          lead.phone?.toLowerCase().includes(term) ||
          lead.city?.toLowerCase().includes(term) ||
          lead.leadStatus?.toLowerCase().includes(term)
      );
    }

    filtered = filtered.sort((a, b) =>
      sortOrder === "Ascending"
        ? (a.firstName || "").localeCompare(b.firstName || "")
        : (b.firstName || "").localeCompare(a.firstName || "")
    );

    return filtered;
  }, [leads, selectedProduct, selectedStatus, searchTerm, sortOrder]);

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id: string): void => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = (): void => {
    if (selectedLeads.length === 0) {
      return alert("Please select at least one lead to assign!");
    }
    setShowAssignModal(true);
  };

  const handleAssignToSalesperson = async (
    salespersonId: string,
    salespersonName: string
  ): Promise<void> => {
    try {
      const response = await axios.post(`${API_BASE}/api/leads/assign`, {
        leadIds: selectedLeads,
        salespersonId: salespersonId,
      });

      if (response.status === 200) {
        alert(`${selectedLeads.length} lead(s) assigned to ${salespersonName} successfully!`);
        setSelectedLeads([]);
      } else {
        alert("Failed to assign leads. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning leads:", error);
      alert("Error assigning leads. Please try again.");
    }
  };

  const handleDeleteSelected = (): void => {
    if (selectedLeads.length === 0)
      return alert("Please select at least one lead to delete!");

    const message =
      selectedLeads.length === filteredLeads.length
        ? "Are you sure you want to delete ALL leads?"
        : `Are you sure you want to delete ${selectedLeads.length} lead(s)?`;

    if (window.confirm(message)) {
      onDelete?.(selectedLeads);
      setSelectedLeads([]);
    }
  };

  const handleExport = (): void => {
    if (filteredLeads.length === 0) return alert("No leads to export!");

    const csv = [
      [
        "First Name",
        "Last Name",
        "Company",
        "Email",
        "Phone",
        "City",
        "Status",
        "Tags",
      ].join(","),

      ...filteredLeads.map((l) =>
        [
          l.firstName || "",
          l.lastName || "",
          l.company || "",
          l.email || "",
          l.phone || "",
          l.city || "",
          l.leadStatus || "",
          (l.tags || []).join("; "),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_export.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const handleCellClick = (lead: Lead): void => {
    onEdit?.(lead);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] p-2 text-black relative">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left">
        All <span className="font-bold">Leads</span>
      </h2>

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between bg-white p-2 sm:p-3 rounded shadow-md mb-3 gap-2">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            onClick={handleAssign}
            className="bg-sky-600 cursor-pointer hover:bg-sky-700 text-white px-3 sm:px-4 py-2 rounded-sm font-semibold text-sm"
          >
            Assign
          </button>

          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-sm font-semibold text-sm"
          >
            Delete
          </button>

          <button
            onClick={handleExport}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-sm font-semibold text-sm"
          >
            Export
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-end">
          <select
            value={selectedProduct}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedProduct(e.target.value)}
            className="border cursor-pointer border-gray-300 rounded px-3 py-2 text-gray-700 text-sm"
          >
            <option value="All">Select Product</option>
            {products.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            className="border cursor-pointer border-gray-300 rounded px-2 py-2 text-gray-700 text-sm"
          >
            <option value="All">Please Select</option>
            {statuses.map((s, idx) => (
              <option key={idx} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as SortOrder)}
            className="border cursor-pointer border-gray-300 rounded px-2 py-2 text-gray-700 text-sm"
          >
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="border cursor-pointer border-gray-300 rounded px-2 py-2 w-32 text-sm"
          />

          <button
            onClick={() => setSearchTerm("")}
            className="bg-sky-600 cursor-pointer hover:bg-sky-700 text-white px-3 py-2 rounded font-semibold text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="text-[13px] text-red-600 text-right pr-2 mb-1">
        (Notes: Search By - Contact person, Company, Phone No, Email, City, Status)
      </p>

      {/* DESKTOP TABLE */}
      <div className="w-full overflow-x-auto bg-white shadow-md hidden md:block">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-2 font-semibold text-xs" style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    filteredLeads.length > 0 &&
                    selectedLeads.length === filteredLeads.length
                  }
                />
              </th>
              <th className="border px-2 py-2 text-left font-semibold whitespace-nowrap text-xs" style={{ width: "120px" }}>
                CONTACT PERSON
              </th>
              <th className="border px-2 py-2 text-left font-semibold whitespace-nowrap text-xs" style={{ width: "120px" }}>
                COMPANY
              </th>
              <th className="border px-2 py-2 text-left font-semibold whitespace-nowrap text-xs" style={{ width: "120px" }}>
                PHONE NO
              </th>
              <th className="border px-2 py-2 text-left font-semibold whitespace-nowrap text-xs" style={{ width: "140px" }}>
                EMAIL ID
              </th>
              <th className="border px-2 py-2 text-left font-semibold whitespace-nowrap text-xs" style={{ width: "80px" }}>
                CITY
              </th>
              <th className="border px-2 py-2 text-center font-semibold whitespace-nowrap text-xs" style={{ width: "90px" }}>
                STATUS
              </th>
              <th className="border px-2 py-2 text-center font-semibold whitespace-nowrap text-xs" style={{ width: "110px" }}>
                TAGS
              </th>
              <th className="border px-2 py-2 text-center font-semibold whitespace-nowrap text-xs" style={{ width: "90px" }}>
                DUE DATE
              </th>
              <th className="border px-2 py-2 text-center font-semibold whitespace-nowrap text-xs" style={{ width: "120px" }}>
                COMMENTS
              </th>
              <th className="border px-2 py-2 text-center font-semibold whitespace-nowrap text-xs" style={{ width: "80px" }}>
                ACTION
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead, idx) => (
                <tr key={lead._id || idx} className="hover:bg-gray-50">
                  <td className="border px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead._id)}
                      onChange={() => handleSelectOne(lead._id)}
                    />
                  </td>

                  <td className="border px-2 py-2">
                    <span
                      className="cursor-pointer hover:text-blue-600 break-words text-sm transition-colors"
                      onClick={() => handleCellClick(lead)}
                      title="Click to edit"
                    >
                      {(lead.firstName || "") + " " + (lead.lastName || "")}
                    </span>
                  </td>

                  <td className="border px-2 py-2">
                    <span
                      className="cursor-pointer hover:text-blue-600 break-words text-sm transition-colors"
                      onClick={() => handleCellClick(lead)}
                      title="Click to edit"
                    >
                      {lead.company || ""}
                    </span>
                  </td>

                  <td className="border px-2 py-2">
                    <span
                      className="cursor-pointer hover:text-blue-600 break-all text-sm transition-colors"
                      onClick={() => handleCellClick(lead)}
                      title="Click to edit"
                    >
                      {lead.phone || ""}
                    </span>
                  </td>

                  <td className="border px-2 py-2">
                    <span
                      className="cursor-pointer hover:text-blue-600 break-all text-sm transition-colors"
                      onClick={() => handleCellClick(lead)}
                      title="Click to edit"
                    >
                      {lead.email || ""}
                    </span>
                  </td>

                  <td className="border px-2 py-2">
                    <span
                      className="cursor-pointer hover:text-blue-600 break-words text-sm transition-colors"
                      onClick={() => handleCellClick(lead)}
                      title="Click to edit"
                    >
                      {lead.city || ""}
                    </span>
                  </td>

                  <td className="border px-2 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-semibold whitespace-nowrap inline-block ${lead.leadStatus === "Open"
                        ? "bg-emerald-500"
                        : lead.leadStatus === "Closed"
                          ? "bg-indigo-600"
                          : "bg-gray-400"
                        }`}
                    >
                      {lead.leadStatus}
                    </span>
                  </td>

                  <td className="border px-2 py-2">
                    <div className="flex flex-wrap gap-1 justify-center items-center max-h-[50px] overflow-y-auto">
                      {lead.tags && lead.tags.length > 0 ? (
                        lead.tags.map((tagName, tagIdx) => {
                          const fullTag = tags.find((t) => t.name === tagName);
                          const tagColor = fullTag?.color || "#3B82F6";

                          return (
                            <span
                              key={`${lead._id}-tag-${tagIdx}`}
                              className="px-2 py-0.5 rounded text-white text-xs font-semibold inline-block cursor-pointer hover:opacity-80 break-words"
                              style={{ backgroundColor: tagColor }}
                              title={tagName}
                            >
                              {tagName}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>

                  <td className="border px-2 py-2 text-center">
                    <div className="text-xs whitespace-nowrap">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })
                        : ""}
                    </div>
                  </td>

                  <td className="border px-2 py-2">
                    <div
                      className="text-xs bg-gray-50 px-2 py-1 rounded border min-h-[45px] resize overflow-auto cursor-pointer hover:text-blue-600 break-words"
                      title={lead.comment || "No comments"}
                    >
                      {lead.comment || "No comments"}
                    </div>
                  </td>

                  <td className="border px-2 py-2">
                    <div className="flex justify-center gap-1">
                      <button className="bg-gray-200 cursor-pointer p-1.5 rounded hover:bg-gray-300 transition-colors">
                        <FaClipboard className="text-xs" />
                      </button>

                      <button
                        onClick={() => onEdit?.(lead)}
                        className="bg-yellow-500 cursor-pointer text-white p-1.5 rounded hover:bg-yellow-600 transition-colors"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-4 text-gray-500 text-sm">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE SECTIONS REMOVED FOR BREVITY - KEEP YOUR EXISTING MOBILE CODE */}

      {/* ASSIGN LEADS MODAL */}
      <AssignLeadsModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedLeadsCount={selectedLeads.length}
        onAssign={handleAssignToSalesperson}
      />
    </div>
  );
}