"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiGet } from "@/utils/api";

// Types
interface Salesperson {
  _id: string;
  id?: string | number;
  username: string;
  firstname: string;
  lastname: string;
  email?: string;
  designation?: string;
  contact?: string;
}

interface Comment {
  _id?: string;
  text: string;
  createdAt: string;
  addedBy?: string; // salesperson ID
  addedByName?: string; // salesperson name
}

interface Lead {
  _id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  city?: string;
  leadStatus?: string;
  createdAt?: string;
  dueDate?: string;
  assignedTo?: string; // salesperson ID
  assignedToName?: string; // salesperson name
  comment?: string; // Single comment field
  comments?: Comment[]; // Array of comments
  [key: string]: any;
}

const CommentsBySalesPersonList: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>("All");
  
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const fromDateRef = useRef<any>(null);
  const toDateRef = useRef<any>(null);

  // Fetch salespersons dynamically
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        console.log("🔄 Fetching salespersons...");
        
        const result = await apiGet("/api/salespersons/get-salespersons");
        
        if (result.success && result.data) {
          setSalespersons(result.data);
          console.log("✅ Salespersons fetched:", result.data.length);
        } else {
          console.error("❌ Failed to fetch salespersons:", result.error);
          setSalespersons([]);
        }
      } catch (error) {
        console.error("❌ Error fetching salespersons:", error);
        setSalespersons([]);
      }
    };
    
    fetchSalespersons();
  }, []);

  // Fetch leads with comments
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching leads with comments...");
        
        // Try the correct API endpoint for fetching leads
        const result = await apiGet("/api/leads/get-leads");
        
        if (result.success && result.data) {
          const leadsData = result.data;
          console.log("✅ Raw leads data:", leadsData.length);
          
          // Process leads to handle both single comment and comments array
          const processedLeads = leadsData.map((lead: Lead) => {
            // If lead has a single comment field, convert it to comments array
            if (lead.comment && !lead.comments) {
              return {
                ...lead,
                comments: [{
                  _id: `${lead._id}-comment-1`,
                  text: lead.comment,
                  createdAt: lead.createdAt || new Date().toISOString(),
                  addedBy: lead.assignedTo,
                  addedByName: lead.assignedToName || "Unknown"
                }]
              };
            }
            return lead;
          });
          
          // Filter only leads that have comments
          const leadsWithComments = processedLeads.filter(
            (lead: Lead) => {
              const hasComments = (lead.comments && lead.comments.length > 0) || 
                                 (lead.comment && lead.comment.trim() !== "");
              return hasComments;
            }
          );
          
          setLeads(leadsWithComments);
          setFilteredLeads(leadsWithComments);
          console.log("✅ Leads with comments:", leadsWithComments.length);
        } else {
          console.error("❌ Failed to fetch leads:", result.error);
          setLeads([]);
          setFilteredLeads([]);
        }
      } catch (error: any) {
        console.error("❌ Error fetching leads:", error);
        setLeads([]);
        setFilteredLeads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  // Handle search/filter
  const handleSearch = (): void => {
    console.log("🔍 Filter Applied:", selectedSalesPerson, fromDate, toDate);
    
    let filtered = [...leads];

    // Filter by salesperson
    if (selectedSalesPerson && selectedSalesPerson !== "All") {
      filtered = filtered.filter((lead) => {
        // Check if assigned to the salesperson
        if (lead.assignedTo === selectedSalesPerson) {
          return true;
        }
        
        // Check if any comment was added by the selected salesperson
        if (lead.comments) {
          return lead.comments.some(
            (comment) => comment.addedBy === selectedSalesPerson
          );
        }
        
        return false;
      });
    }

    // Filter by date range - based on comment date or lead created date
    if (fromDate || toDate) {
      filtered = filtered.filter((lead) => {
        // If lead has comments array, check comment dates
        if (lead.comments && lead.comments.length > 0) {
          return lead.comments.some((comment) => {
            const commentDate = new Date(comment.createdAt);
            
            let matchesFrom = true;
            let matchesTo = true;
            
            if (fromDate) {
              const startOfDay = new Date(fromDate);
              startOfDay.setHours(0, 0, 0, 0);
              matchesFrom = commentDate >= startOfDay;
            }
            
            if (toDate) {
              const endOfDay = new Date(toDate);
              endOfDay.setHours(23, 59, 59, 999);
              matchesTo = commentDate <= endOfDay;
            }
            
            return matchesFrom && matchesTo;
          });
        }
        
        // Fallback to lead creation date
        if (lead.createdAt) {
          const leadDate = new Date(lead.createdAt);
          let matchesFrom = true;
          let matchesTo = true;
          
          if (fromDate) {
            const startOfDay = new Date(fromDate);
            startOfDay.setHours(0, 0, 0, 0);
            matchesFrom = leadDate >= startOfDay;
          }
          
          if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            matchesTo = leadDate <= endOfDay;
          }
          
          return matchesFrom && matchesTo;
        }
        
        return false;
      });
    }

    setFilteredLeads(filtered);
    console.log("✅ Filtered results:", filtered.length);
  };

  // Reset filters
  const handleReset = (): void => {
    setSelectedSalesPerson("All");
    setFromDate(null);
    setToDate(null);
    setFilteredLeads(leads);
    console.log("🔄 Filters reset");
  };

  // Export to Excel
  const handleExport = (): void => {
    if (filteredLeads.length === 0) {
      return alert("No data to export!");
    }

    const rows: string[] = [];
    
    // Header
    rows.push([
      "SR.NO.",
      "DATE",
      "CONTACT PERSON",
      "COMPANY",
      "DUE DATE",
      "LOCATION",
      "COMMENTS",
      "SALES PERSON",
    ].join(","));

    // Data rows
    let serialNo = 1;
    filteredLeads.forEach((lead) => {
      const contactPerson = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
      const company = lead.company || "";
      const location = lead.city || "";
      
      if (lead.comments && lead.comments.length > 0) {
        lead.comments.forEach((comment) => {
          const commentDate = comment.createdAt
            ? new Date(comment.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const dueDate = lead.dueDate
            ? new Date(lead.dueDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const commentText = `${comment.text} - By ${comment.addedByName || "Unknown"}`;
          const salesPerson = comment.addedByName || lead.assignedToName || "Unknown";

          rows.push([
            serialNo,
            `"${commentDate}"`,
            `"${contactPerson}"`,
            `"${company}"`,
            `"${dueDate}"`,
            `"${location}"`,
            `"${commentText}"`,
            `"${salesPerson}"`,
          ].join(","));

          serialNo++;
        });
      }
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "comments_by_salesperson.csv";
    a.click();

    window.URL.revokeObjectURL(url);
    console.log("✅ Export completed");
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  // Get salesperson ID (handle both _id and id fields)
  const getSalespersonId = (person: Salesperson): string => {
    return person._id || String(person.id) || "";
  };

  // Generate rows for display - each comment gets its own row
  const generateTableRows = () => {
    const rows: React.ReactNode[] = [];
    let serialNo = 1;

    filteredLeads.forEach((lead) => {
      const contactPerson = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "-";
      const company = lead.company || "-";
      const location = lead.city || "-";
      const dueDate = formatDate(lead.dueDate || lead.createdAt);

      if (lead.comments && lead.comments.length > 0) {
        lead.comments.forEach((comment, commentIdx) => {
          const commentDate = formatDate(comment.createdAt);
          const salesPersonName = comment.addedByName || lead.assignedToName || "-";

          rows.push(
            <tr
              key={`${lead._id}-comment-${commentIdx}-${serialNo}`}
              className="hover:bg-gray-50 border-b text-gray-700"
            >
              <td className="py-2 px-4">{serialNo}</td>
              <td className="py-2 px-4">{commentDate}</td>
              <td className="py-2 px-4">{contactPerson}</td>
              <td className="py-2 px-4">{company}</td>
              <td className="py-2 px-4">{dueDate}</td>
              <td className="py-2 px-4">{location}</td>
              <td className="py-2 px-4 max-w-xs">
                <div className="whitespace-pre-wrap break-words">
                  {comment.text} - <span className="font-semibold">By {salesPersonName}</span>
                </div>
              </td>
              <td className="py-2 px-4">{salesPersonName}</td>
            </tr>
          );
          serialNo++;
        });
      }
    });

    return rows;
  };

  // Calculate total comments count
  const getTotalCommentsCount = () => {
    return filteredLeads.reduce((total, lead) => {
      return total + (lead.comments?.length || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-6">
      <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-md shadow-md">
        {/* Header */}
        <div className="border-b border-gray-300 px-5 py-3 flex justify-between items-center">
          <h2 className="text-gray-800 text-base font-semibold">
            Comments Given By <span className="font-bold">Sales Person</span>
          </h2>

          <button
            onClick={handleExport}
            disabled={filteredLeads.length === 0}
            className={`text-white text-sm font-semibold px-4 py-1.5 rounded shadow-sm transition ${
              filteredLeads.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4B63A1] hover:bg-[#3B4F8C] cursor-pointer"
            }`}
          >
            Export To Excel
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between px-8 py-4 gap-4">
          {/* Left Filters */}
          <div className="flex items-center flex-wrap gap-6">
            {/* Sales Person Select */}
            <select
              value={selectedSalesPerson}
              onChange={(e) => setSelectedSalesPerson(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-80 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
            >
              <option value="All">All Sales Person</option>
              {salespersons.map((person) => (
                <option key={getSalespersonId(person)} value={getSalespersonId(person)}>
                  {person.username} {person.designation ? `(${person.designation})` : ""}
                </option>
              ))}
            </select>

            {/* From Date */}
            <div className="relative flex items-center">
              <DatePicker
                ref={fromDateRef}
                selected={fromDate}
                onChange={(d: Date | null) => setFromDate(d)}
                placeholderText="From Date"
                dateFormat="dd-MM-yyyy"
                className="border border-gray-300 rounded-md p-2 w-64 pl-3 text-sm focus:ring-1 focus:ring-[#00AEEF]"
              />
              <FaCalendarAlt
                className="absolute right-3 text-[#00AEEF] cursor-pointer"
                onClick={() => fromDateRef.current?.setOpen(true)}
              />
            </div>

            {/* To Date */}
            <div className="relative flex items-center">
              <DatePicker
                ref={toDateRef}
                selected={toDate}
                onChange={(d: Date | null) => setToDate(d)}
                placeholderText="To Date"
                dateFormat="dd-MM-yyyy"
                className="border border-gray-300 rounded-md p-2 w-64 pl-3 text-sm focus:ring-1 focus:ring-[#00AEEF]"
              />
              <FaCalendarAlt
                className="absolute right-3 text-[#00AEEF] cursor-pointer"
                onClick={() => toDateRef.current?.setOpen(true)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-[#00AEEF] text-white text-sm font-semibold px-8 py-2 rounded shadow-sm hover:bg-[#0095D9] transition"
            >
              Search
            </button>

            <button
              onClick={handleReset}
              className="bg-gray-500 text-white text-sm font-semibold px-6 py-2 rounded shadow-sm hover:bg-gray-600 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading comments...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="px-6 pb-6 overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-4 border-b font-semibold text-left">SR.NO.</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">DATE</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">
                    CONTACT PERSON
                  </th>
                  <th className="py-2 px-4 border-b font-semibold text-left">COMPANY</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">DUE DATE</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">LOCATION</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">COMMENTS</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">
                    SALES PERSON
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.length > 0 ? (
                  generateTableRows()
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      {leads.length === 0
                        ? "No comments found in the system."
                        : "No comments match your search criteria. Try adjusting your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Info */}
        {!loading && filteredLeads.length > 0 && (
          <div className="px-6 pb-4 text-sm text-gray-600 flex justify-between items-center border-t pt-3">
            <span>
              Showing {getTotalCommentsCount()} comment(s) from {filteredLeads.length} lead(s)
            </span>
            <span className="text-xs text-gray-500">
              Note: Each row represents one comment
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsBySalesPersonList;



// "use client";

// import React, { useState, useRef } from "react";
// import { FaCalendarAlt } from "react-icons/fa";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// interface DataRow {
//   id: number;
//   date: string;
//   contactPerson: string;
//   company: string;
//   dueDate: string;
//   location: string;
//   comments: string;
//   salesPerson: string;
// }

// const CommentsBySalesPersonList: React.FC = () => {
//   const [fromDate, setFromDate] = useState<Date | null>(null);
//   const [toDate, setToDate] = useState<Date | null>(null);
//   const [selectedSalesPerson, setSelectedSalesPerson] =
//     useState<string>("All Sales Person");

//   const fromDateRef = useRef<any>(null);
//   const toDateRef = useRef<any>(null);

//   const salesPersons: string[] = [
//     "All Sales Person",
//     "Test (CEO)",
//     "John Doe",
//     "Jane Smith",
//   ];

//   const data: DataRow[] = [
//     {
//       id: 1,
//       date: "03-Nov-25 17:17",
//       contactPerson: "MPL ZXS",
//       company: "Company Inc.",
//       dueDate: "10-Mar-21 14:05",
//       location: "Surat, India",
//       comments: "hi - By Test",
//       salesPerson: "Test (CEO)",
//     },
//     {
//       id: 2,
//       date: "28-Oct-25 10:29",
//       contactPerson: "MPL1 ZXS1",
//       company: "Company Inc.",
//       dueDate: "09-Mar-21 10:33",
//       location: "Surat, India",
//       comments: "Need to have a followup call. - By Test",
//       salesPerson: "Test (CEO)",
//     },
//   ];

//   const handleSearch = (): void => {
//     console.log("Filter Applied:", selectedSalesPerson, fromDate, toDate);
//   };

//   const handleExport = (): void => {
//     console.log("Export Excel...");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex justify-center items-start py-6">
//       <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-md shadow-md">
//         {/* Header */}
//         <div className="border-b border-gray-300 px-5 py-3 flex justify-between items-center">
//           <h2 className="text-gray-800 text-base font-semibold">
//             Comments Given By <span className="font-bold">Sales Person</span>
//           </h2>

//           <button
//             onClick={handleExport}
//             className="bg-[#4B63A1] text-white text-sm font-semibold px-4 py-1.5 rounded shadow-sm hover:bg-[#3B4F8C] transition"
//           >
//             Export To Excel
//           </button>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap items-center justify-between px-8 py-4">
//           {/* Left Filters */}
//           <div className="flex items-center flex-wrap gap-6">
//             {/* Sales Person Select */}
//             <select
//               value={selectedSalesPerson}
//               onChange={(e) => setSelectedSalesPerson(e.target.value)}
//               className="border border-gray-300 rounded-md p-2 w-80 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
//             >
//               {salesPersons.map((person, i) => (
//                 <option key={i}>{person}</option>
//               ))}
//             </select>

//             {/* From Date */}
//             <div className="relative flex items-center">
//               <DatePicker
//                 ref={fromDateRef}
//                 selected={fromDate}
//                 onChange={(d: Date | null) => setFromDate(d)}
//                 placeholderText="From Date"
//                 dateFormat="dd-MM-yyyy"
//                 className="border border-gray-300 rounded-md p-2 w-64 pl-3 text-sm focus:ring-1 focus:ring-[#00AEEF]"
//               />
//               <FaCalendarAlt
//                 className="absolute right-3 text-[#00AEEF] cursor-pointer"
//                 onClick={() => fromDateRef.current?.setOpen(true)}
//               />
//             </div>

//             {/* To Date */}
//             <div className="relative flex items-center">
//               <DatePicker
//                 ref={toDateRef}
//                 selected={toDate}
//                 onChange={(d: Date | null) => setToDate(d)}
//                 placeholderText="To Date"
//                 dateFormat="dd-MM-yyyy"
//                 className="border border-gray-300 rounded-md p-2 w-64 pl-3 text-sm focus:ring-1 focus:ring-[#00AEEF]"
//               />
//               <FaCalendarAlt
//                 className="absolute right-3 text-[#00AEEF] cursor-pointer"
//                 onClick={() => toDateRef.current?.setOpen(true)}
//               />
//             </div>
//           </div>

//           {/* Search Button */}
//           <div className="mt-4 sm:mt-0">
//             <button
//               onClick={handleSearch}
//               className="bg-[#00AEEF] text-white text-sm font-semibold px-8 py-2 rounded shadow-sm hover:bg-[#0095D9] transition"
//             >
//               Search
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="px-6 pb-6 overflow-x-auto">
//           <table className="min-w-full text-sm border border-gray-300">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700">
//                 <th className="py-2 px-4 border-b font-semibold">SR.NO.</th>
//                 <th className="py-2 px-4 border-b font-semibold">DATE</th>
//                 <th className="py-2 px-4 border-b font-semibold">
//                   CONTACT PERSON
//                 </th>
//                 <th className="py-2 px-4 border-b font-semibold">COMPANY</th>
//                 <th className="py-2 px-4 border-b font-semibold">DUE DATE</th>
//                 <th className="py-2 px-4 border-b font-semibold">LOCATION</th>
//                 <th className="py-2 px-4 border-b font-semibold">COMMENTS</th>
//                 <th className="py-2 px-4 border-b font-semibold">
//                   SALES PERSON
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {data.map((row) => (
//                 <tr
//                   key={row.id}
//                   className="hover:bg-gray-50 border-b text-gray-700"
//                 >
//                   <td className="py-2 px-4">{row.id}</td>
//                   <td className="py-2 px-4">{row.date}</td>
//                   <td className="py-2 px-4">{row.contactPerson}</td>
//                   <td className="py-2 px-4">{row.company}</td>
//                   <td className="py-2 px-4">{row.dueDate}</td>
//                   <td className="py-2 px-4">{row.location}</td>
//                   <td className="py-2 px-4">{row.comments}</td>
//                   <td className="py-2 px-4">{row.salesPerson}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CommentsBySalesPersonList;


















// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { FaCalendarAlt } from "react-icons/fa";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { apiGet } from "@/utils/api";

// interface Salesperson {
//   _id: string;
//   name: string;
//   email?: string;
//   role?: string;
// }

// interface Comment {
//   _id: string;
//   text: string;
//   createdAt: string;
//   salesPersonId: string;
//   salesPersonName: string;
// }

// interface DataRow {
//   _id: string;
//   date: string;
//   contactPerson: string;
//   company: string;
//   dueDate: string;
//   location: string;
//   comments: Comment[];
//   salesPersonId: string;
//   salesPersonName: string;
// }

// const CommentsBySalesPersonList: React.FC = () => {
//   const [fromDate, setFromDate] = useState<Date | null>(null);
//   const [toDate, setToDate] = useState<Date | null>(null);
//   const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>("All");
//   const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
//   const [data, setData] = useState<DataRow[]>([]);
//   const [filteredData, setFilteredData] = useState<DataRow[]>([]);
//   const [loading, setLoading] = useState(false);

//   const fromDateRef = useRef<any>(null);
//   const toDateRef = useRef<any>(null);

//   // Fetch salespersons dynamically
//   useEffect(() => {
//     const fetchSalespersons = async () => {
//       try {
//         console.log("🔄 Fetching salespersons...");
        
//         const result = await apiGet("/api/users/salespersons");
        
//         if (result.success) {
//           setSalespersons(result.data || []);
//           console.log("✅ Salespersons fetched:", result.data?.length || 0);
//         } else {
//           console.error("❌ Failed to fetch salespersons:", result.error);
//           setSalespersons([]);
//         }
//       } catch (error) {
//         console.error("❌ Error fetching salespersons:", error);
//         setSalespersons([]);
//       }
//     };
    
//     fetchSalespersons();
//   }, []);

//   // Fetch comments data
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         setLoading(true);
//         console.log("🔄 Fetching comments...");
        
//         const result = await apiGet("/api/leads/comments");
        
//         if (result.success) {
//           setData(result.data || []);
//           setFilteredData(result.data || []);
//           console.log("✅ Comments fetched:", result.data?.length || 0);
//         } else {
//           console.error("❌ Failed to fetch comments:", result.error);
//           setData([]);
//           setFilteredData([]);
//         }
//       } catch (error) {
//         console.error("❌ Error fetching comments:", error);
//         setData([]);
//         setFilteredData([]);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchComments();
//   }, []);

//   // Handle search/filter
//   const handleSearch = (): void => {
//     console.log("Filter Applied:", selectedSalesPerson, fromDate, toDate);
    
//     let filtered = [...data];

//     // Filter by salesperson
//     if (selectedSalesPerson && selectedSalesPerson !== "All") {
//       filtered = filtered.filter(
//         (row) => row.salesPersonId === selectedSalesPerson
//       );
//     }

//     // Filter by date range
//     if (fromDate) {
//       filtered = filtered.filter(
//         (row) => new Date(row.date) >= fromDate
//       );
//     }

//     if (toDate) {
//       filtered = filtered.filter(
//         (row) => new Date(row.date) <= toDate
//       );
//     }

//     setFilteredData(filtered);
//   };

//   // Reset filters
//   const handleReset = (): void => {
//     setSelectedSalesPerson("All");
//     setFromDate(null);
//     setToDate(null);
//     setFilteredData(data);
//   };

//   // Export to Excel
//   const handleExport = (): void => {
//     if (filteredData.length === 0) {
//       return alert("No data to export!");
//     }

//     const csv = [
//       [
//         "SR.NO.",
//         "DATE",
//         "CONTACT PERSON",
//         "COMPANY",
//         "DUE DATE",
//         "LOCATION",
//         "COMMENTS",
//         "SALES PERSON",
//       ].join(","),

//       ...filteredData.map((row, idx) => [
//         idx + 1,
//         row.date,
//         row.contactPerson,
//         row.company,
//         row.dueDate,
//         row.location,
//         `"${formatComments(row.comments)}"`, // Wrap in quotes to handle commas
//         row.salesPersonName,
//       ].join(","))
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "comments_by_salesperson.csv";
//     a.click();

//     window.URL.revokeObjectURL(url);
//   };

//   // Format comments with "By - SalespersonName"
//   const formatComments = (comments: Comment[]): string => {
//     if (!comments || comments.length === 0) return "No comments";
    
//     return comments
//       .map((comment) => `${comment.text} - By ${comment.salesPersonName}`)
//       .join("; ");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex justify-center items-start py-6">
//       <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-md shadow-md">
//         {/* Header */}
//         <div className="border-b border-gray-300 px-5 py-3 flex justify-between items-center">
//           <h2 className="text-gray-800 text-base font-semibold">
//             Comments Given By <span className="font-bold">Sales Person</span>
//           </h2>

//           <button
//             onClick={handleExport}
//             className="bg-[#4B63A1] text-white text-sm font-semibold px-4 py-1.5 rounded shadow-sm hover:bg-[#3B4F8C] transition"
//           >
//             Export To Excel
//           </button>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap items-center justify-between px-8 py-4 gap-4">
//           {/* Left Filters */}
//           <div className="flex items-center flex-wrap gap-6">
//             {/* Sales Person Select */}
//             <select
//               value={selectedSalesPerson}
//               onChange={(e) => setSelectedSalesPerson(e.target.value)}
//               className="border border-gray-300 rounded-md p-2 w-80 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
//             >
//               <option value="All">All Sales Person</option>
//               {salespersons.map((person) => (
//                 <option key={person._id} value={person._id}>
//                   {person.name} {person.role ? `(${person.role})` : ""}
//                 </option>
//               ))}
//             </select>

//             {/* From Date */}
//             <div className="relative flex items-center">
//               <DatePicker
//                 ref={fromDateRef}
//                 selected={fromDate}
//                 onChange={(d: Date | null) => setFromDate(d)}
//                 placeholderText="From Date"
//                 dateFormat="dd-MM-yyyy"
//                 className="border border-gray-300 rounded-md p-2 w-64 pl-3 text-sm focus:ring-1 focus:ring-[#00AEEF]"
//               />
//               <FaCalendarAlt
//                 className="absolute right-3 text-[#00AEEF] cursor-pointer"
//                 onClick={() => fromDateRef.current?.setOpen(true)}
//               />
//             </div>

//             {/* To Date */}
//             <div className="relative flex items-center">
//               <DatePicker
//                 ref={toDateRef}
//                 selected={toDate}
//                 onChange={(d: Date | null) => setToDate(d)}
//                 placeholderText="To Date"
//                 dateFormat="dd-MM-yyyy"
//                 className="border border-gray-300 rounded-md p-2 w-64 pl-3 text-sm focus:ring-1 focus:ring-[#00AEEF]"
//               />
//               <FaCalendarAlt
//                 className="absolute right-3 text-[#00AEEF] cursor-pointer"
//                 onClick={() => toDateRef.current?.setOpen(true)}
//               />
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-2">
//             <button
//               onClick={handleSearch}
//               className="bg-[#00AEEF] text-white text-sm font-semibold px-8 py-2 rounded shadow-sm hover:bg-[#0095D9] transition"
//             >
//               Search
//             </button>

//             <button
//               onClick={handleReset}
//               className="bg-gray-500 text-white text-sm font-semibold px-6 py-2 rounded shadow-sm hover:bg-gray-600 transition"
//             >
//               Reset
//             </button>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="px-6 py-8 text-center text-gray-500">
//             Loading comments...
//           </div>
//         )}

//         {/* Table */}
//         {!loading && (
//           <div className="px-6 pb-6 overflow-x-auto">
//             <table className="min-w-full text-sm border border-gray-300">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-700">
//                   <th className="py-2 px-4 border-b font-semibold text-left">SR.NO.</th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">DATE</th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">
//                     CONTACT PERSON
//                   </th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">COMPANY</th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">DUE DATE</th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">LOCATION</th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">COMMENTS</th>
//                   <th className="py-2 px-4 border-b font-semibold text-left">
//                     SALES PERSON
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredData.length > 0 ? (
//                   filteredData.map((row, idx) => (
//                     <tr
//                       key={row._id}
//                       className="hover:bg-gray-50 border-b text-gray-700"
//                     >
//                       <td className="py-2 px-4">{idx + 1}</td>
//                       <td className="py-2 px-4">{row.date}</td>
//                       <td className="py-2 px-4">{row.contactPerson}</td>
//                       <td className="py-2 px-4">{row.company}</td>
//                       <td className="py-2 px-4">{row.dueDate}</td>
//                       <td className="py-2 px-4">{row.location}</td>
//                       <td className="py-2 px-4 max-w-xs">
//                         <div className="whitespace-pre-wrap break-words">
//                           {formatComments(row.comments)}
//                         </div>
//                       </td>
//                       <td className="py-2 px-4">{row.salesPersonName}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="text-center py-8 text-gray-500 text-sm"
//                     >
//                       No comments found. Try adjusting your filters.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Results Info */}
//         {!loading && filteredData.length > 0 && (
//           <div className="px-6 pb-4 text-sm text-gray-600 text-right">
//             Showing {filteredData.length} result(s)
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CommentsBySalesPersonList;