// frontend/app/leads/TodaysLeadsTable.tsx - MULTI-TENANT COMPLETE

"use client";

import { useState, useMemo, useEffect } from "react";
import { FaEdit, FaClipboard } from "react-icons/fa";
import { apiGet } from "@/utils/api";

/* --------------------------- TYPES --------------------------- */
interface Tag {
  _id: string;
  name: string;
  color: string;
  description?: string;
}

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
  product?: string;
  tags?: string[];
  comment?: string;
  createdAt?: string;
  [key: string]: any;
}

interface TodaysLeadsTableProps {
  leads?: Lead[];
  onDelete?: (ids: string[]) => void;
  onEdit?: (lead: Lead) => void;
}

type SortOrder = "Ascending" | "Descending";

/* --------------------------- COMPONENT --------------------------- */
export default function TodaysLeadsTable({ 
  leads = [], 
  onDelete, 
  onEdit 
}: TodaysLeadsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Ascending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // ✅ CRITICAL: Fetch tags using tenant-aware API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        console.log("🔄 Fetching tags with tenant isolation...");
        
        const result = await apiGet("/api/manage-items/tags/get-tags");
        
        if (result.success) {
          setTags(result.data || []);
          console.log("✅ Tags fetched:", result.data?.length || 0);
        } else {
          console.error("❌ Failed to fetch tags:", result.error);
          setTags([]);
        }
      } catch (error) {
        console.error("❌ Error fetching tags:", error);
        setTags([]);
      }
    };
    
    fetchTags();
  }, []);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to assign!");
      return;
    }
    alert(`${selectedLeads.length} lead(s) assigned successfully!`);
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead to delete!");
      return;
    }

    const message =
      selectedLeads.length === filteredLeads.length
        ? "Are you sure you want to delete ALL leads?"
        : `Are you sure you want to delete ${selectedLeads.length} lead(s)?`;

    if (window.confirm(message)) {
      onDelete?.(selectedLeads);
      setSelectedLeads([]);
    }
  };

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      alert("No leads to export!");
      return;
    }

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

  const handleCellClick = (lead: Lead) => {
    onEdit?.(lead);
  };

  const getStatusColor = (status?: string): string => {
    if (status === "Open") return "bg-emerald-500";
    if (status === "Closed") return "bg-indigo-600";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] p-2 text-black">
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
            onChange={(e) => setSelectedProduct(e.target.value)}
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
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="border cursor-pointer border-gray-300 rounded px-2 py-2 text-gray-700 text-sm"
          >
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      <p className="text-[10px] text-red-600 text-right pr-2 mb-1">
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
                      className={`px-2 py-1 rounded text-white text-xs font-semibold whitespace-nowrap inline-block ${getStatusColor(
                        lead.leadStatus
                      )}`}
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
                        ? new Date(lead.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
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

      {/* MOBILE CARD LIST */}
      <div className="block md:hidden space-y-4 mt-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead, idx) => (
            <div
              key={lead._id || idx}
              className="bg-white rounded border border-[1.5px] border-black shadow-sm overflow-hidden"
            >
              <div className="border-b p-2 flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedLeads.includes(lead._id)}
                  onChange={() => handleSelectOne(lead._id)}
                />
                <span className="font-semibold text-gray-800 text-sm break-words">
                  {lead.firstName} {lead.lastName}
                </span>
              </div>

              <div className="border-b p-2 text-sm">
                <strong>Company:</strong>{" "}
                <span className="break-words">{lead.company}</span>
              </div>

              <div className="border-b p-2 text-sm">
                <strong>Phone No:</strong>{" "}
                <span className="break-all">{lead.phone}</span>
              </div>

              <div className="border-b p-2 text-sm">
                <strong>Email ID:</strong>{" "}
                <span className="break-all">{lead.email}</span>
              </div>

              <div className="border-b p-2 text-sm">
                <strong>City:</strong> {lead.city}
              </div>

              <div className="border-b p-2 text-sm flex items-center gap-2 flex-wrap">
                <strong>Status:</strong>
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(
                    lead.leadStatus
                  )}`}
                >
                  {lead.leadStatus}
                </span>
              </div>

              <div className="border-b p-2 text-sm">
                <strong>Tags:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.tags && lead.tags.length > 0 ? (
                    lead.tags.map((tagName, tagIdx) => {
                      const fullTag = tags.find((t) => t.name === tagName);
                      const tagColor = fullTag?.color || "#3B82F6";

                      return (
                        <span
                          key={`${lead._id}-mobile-tag-${tagIdx}`}
                          className="px-2 py-1 rounded text-white text-xs break-words"
                          style={{ backgroundColor: tagColor }}
                        >
                          {tagName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 text-xs">No tags</span>
                  )}
                </div>
              </div>

              <div className="border-b p-2 text-sm">
                <strong>Due Date:</strong>{" "}
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString()
                  : ""}
              </div>

              <div className="border-b p-2 text-sm">
                <strong>Comments:</strong>
                <div
                  className="border w-full p-2 text-sm mt-1 rounded bg-gray-50 max-h-[100px] overflow-y-auto whitespace-pre-wrap break-words cursor-pointer hover:bg-gray-100"
                  title={lead.comment || "No comments"}
                >
                  {lead.comment || "No comments"}
                </div>
              </div>

              <div className="p-2 flex gap-2">
                <button className="bg-gray-200 p-2 rounded hover:bg-gray-300">
                  <FaClipboard />
                </button>

                <button
                  onClick={() => onEdit?.(lead)}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                >
                  <FaEdit />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">
            No leads found.
          </p>
        )}
      </div>
    </div>
  );
}