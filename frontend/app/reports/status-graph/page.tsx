// "use client";

// import React, { useState, useRef } from "react";
// import { FaCalendarAlt } from "react-icons/fa";

// interface TableRow {
//   id: number;
//   product: string;
//   added: number;
//   followup: number;
// }

// const LeadsByProductList: React.FC = () => {
//   const [fromDate, setFromDate] = useState<string>("");
//   const [toDate, setToDate] = useState<string>("");
//   const [rawFromDate, setRawFromDate] = useState<string>("");
//   const [rawToDate, setRawToDate] = useState<string>("");

//   const fromRef = useRef<HTMLInputElement>(null);
//   const toRef = useRef<HTMLInputElement>(null);

//   // Format date as dd-mm-yyyy
//   const formatDate = (value: string): string => {
//     if (!value) return "";
//     const [y, m, d] = value.split("-");
//     return `${d}-${m}-${y}`;
//   };

//   const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const raw = e.target.value;
//     setRawFromDate(raw);
//     setFromDate(formatDate(raw));
//   };

//   const handleToChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const raw = e.target.value;
//     setRawToDate(raw);
//     setToDate(formatDate(raw));
//   };

//   const handleSearch = (): void => {
//     console.log("Searching from:", rawFromDate, "to:", rawToDate);
//   };

//   const tableData: TableRow[] = [
//     { id: 1, product: "Galaxy S1", added: 1, followup: 1 },
//     { id: 2, product: "Galaxy S2", added: 0, followup: 0 },
//     { id: 3, product: "Bandhani", added: 2, followup: 2 },
//     { id: 4, product: "Lenovo Ideapad", added: 0, followup: 0 },
//     { id: 5, product: "hi", added: 0, followup: 0 },
//   ];

//   return (
//     <>
//       <style>
//         {`
//           /* Hide native date picker icons */
//           input[type="date"]::-webkit-calendar-picker-indicator {
//             opacity: 0;
//             display: none;
//           }
//           input[type="date"]::-webkit-inner-spin-button,
//           input[type="date"]::-webkit-clear-button {
//             display: none;
//           }
//         `}
//       </style>

//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="w-full max-w-5xl bg-white rounded-md shadow border border-gray-300">
//           {/* Header */}
//           <div className="px-6 py-3 border-b border-gray-300 bg-white rounded-t-md">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Leads By <span className="font-bold">Product List</span>
//             </h2>
//           </div>

//           {/* Filter Row */}
//           <div className="flex flex-wrap items-center justify-end gap-16 px-8 py-5 border-b border-gray-200">
//             {/* From Date */}
//             <div className="flex items-center gap-2">
//               <label className="text-gray-700 font-medium text-sm">From</label>
//               <div className="flex">
//                 <input
//                   ref={fromRef}
//                   type="text"
//                   value={fromDate}
//                   readOnly
//                   placeholder="From Date"
//                   className="border border-gray-300 rounded-l-md p-2 pl-3 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-[#00AEEF] text-gray-700 placeholder-gray-400"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => fromRef.current?.showPicker?.()}
//                   className="bg-[#00AEEF] rounded-r-md px-3 flex items-center justify-center hover:bg-[#0095D9] transition"
//                   aria-label="From date"
//                 >
//                   <FaCalendarAlt className="text-white text-base" />
//                 </button>
//                 {/* Hidden native input */}
//                 <input
//                   ref={fromRef}
//                   type="date"
//                   onChange={handleFromChange}
//                   className="absolute opacity-0 pointer-events-none"
//                 />
//               </div>
//             </div>

//             {/* To Date */}
//             <div className="flex items-center gap-4">
//               <label className="text-gray-700 font-medium text-sm">To</label>
//               <div className="flex">
//                 <input
//                   ref={toRef}
//                   type="text"
//                   value={toDate}
//                   readOnly
//                   placeholder="To Date"
//                   className="border border-gray-300 rounded-l-md p-2 pl-3 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-[#00AEEF] text-gray-700 placeholder-gray-400"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => toRef.current?.showPicker?.()}
//                   className="bg-[#00AEEF] rounded-r-md px-3 flex items-center justify-center hover:bg-[#0095D9] transition"
//                   aria-label="To date"
//                 >
//                   <FaCalendarAlt className="text-white text-base" />
//                 </button>
//                 {/* Hidden native input */}
//                 <input
//                   ref={toRef}
//                   type="date"
//                   onChange={handleToChange}
//                   className="absolute opacity-0 pointer-events-none"
//                 />
//               </div>
//             </div>

//             {/* Search Button */}
//             <div className="flex flex-col items-end">
//               <button
//                 onClick={handleSearch}
//                 className="bg-[#00AEEF] text-white font-semibold px-6 py-2 rounded text-sm shadow-sm hover:bg-[#0095D9] transition duration-200 ease-in-out"
//               >
//                 Search
//               </button>
//               <p className="text-red-500 text-xs font-medium mt-1 text-right">
//                 Leads Count Contain (Custom Leads + Deals)
//               </p>
//             </div>
//           </div>

//           {/* Table Section */}
//           <div className="overflow-x-auto px-6 py-4">
//             <table className="min-w-full border border-gray-200 rounded-b-md">
//               <thead className="bg-gray-100 text-gray-700 border-b-0">
//                 <tr>
//                   <th className="py-2 px-5 text-left w-[10%] font-medium text-sm">
//                     SR. NO.
//                   </th>
//                   <th className="py-2 px-4 text-left font-medium text-sm">
//                     PRODUCT
//                   </th>
//                   <th className="py-2 px-4 text-center font-medium text-sm">
//                     LEADS ADDED
//                   </th>
//                   <th className="py-2 px-4 text-center font-medium text-sm">
//                     FOLLOW UP LEADS
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tableData.map((item) => (
//                   <tr
//                     key={item.id}
//                     className="hover:bg-gray-50 transition text-gray-700 text-sm"
//                   >
//                     <td className="py-2 px-4 border text-center">{item.id}</td>
//                     <td className="py-2 px-4 border">{item.product}</td>
//                     <td className="py-2 px-4 border text-center">
//                       {item.added}
//                     </td>
//                     <td className="py-2 px-4 border text-center">
//                       {item.followup}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default LeadsByProductList;



"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Cell,
} from "recharts";
import { apiGet } from "@/utils/api";

interface DataItem {
  name: string;
  leads: number;
}

interface Status {
  _id: string;
  name: string;
  description?: string;
  source?: string;
}

interface Lead {
  _id: string;
  leadStatus?: string;
  [key: string]: any;
}

const StatusList: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        console.log("🔄 Fetching statuses...");
        const result = await apiGet("/api/manage-items/lead-status/get-lead-status");
        
        if (result.success) {
          setStatuses(result.data || []);
          console.log("✅ Statuses fetched:", result.data?.length || 0);
        } else {
          console.error("❌ Failed to fetch statuses:", result.error);
          setStatuses([]);
        }
      } catch (error) {
        console.error("❌ Error fetching statuses:", error);
        setStatuses([]);
      }
    };
    
    fetchStatuses();
  }, []);

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        console.log("🔄 Fetching leads...");
        const result = await apiGet("/api/leads/get-leads");
        
        if (result.success) {
          setLeads(result.data || []);
          console.log("✅ Leads fetched:", result.data?.length || 0);
        } else {
          console.error("❌ Failed to fetch leads:", result.error);
          setLeads([]);
        }
      } catch (error) {
        console.error("❌ Error fetching leads:", error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  // Calculate status-wise lead count dynamically
  const chartData: DataItem[] = useMemo(() => {
    if (statuses.length === 0) return [];

    // Count leads for each status
    const statusLeadCount = new Map<string, number>();

    // Initialize all statuses with 0 leads
    statuses.forEach(status => {
      statusLeadCount.set(status.name, 0);
    });

    // Count leads for each status
    leads.forEach(lead => {
      if (lead.leadStatus && statusLeadCount.has(lead.leadStatus)) {
        statusLeadCount.set(lead.leadStatus, (statusLeadCount.get(lead.leadStatus) || 0) + 1);
      }
    });

    // Convert to array format
    return Array.from(statusLeadCount.entries()).map(([name, leads]) => ({
      name,
      leads,
    }));
  }, [statuses, leads]);

  const handlePrint = (): void => {
    window.print();
  };

  // Custom Legend
  const CustomLegend = () => (
    <div className="flex items-center pb-1 pl-12">
      <div
        style={{
          width: 25,
          height: 13,
          backgroundColor: "#007bff",
          marginRight: 6,
          borderRadius: 2,
        }}
      ></div>
      <span className="text-black text-[13px] font-medium">No of leads</span>
    </div>
  );

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded px-3 py-2 shadow-md">
          <p className="m-0 font-bold text-black text-[13px]">{label}</p>
          <p className="m-0 text-black text-[13px]">
            No of leads: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f6f8fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statuses data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="border border-gray-300 shadow-md w-full max-w-6xl mx-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f9f9f9]">
          <h2 className="text-gray-700 text-sm font-semibold">
            Leads by <span className="font-bold">Status</span>
          </h2>

          <button
            onClick={handlePrint}
            className="bg-purple-800 text-white text-sm px-4 py-2 rounded hover:bg-purple-900 font-semibold"
          >
            Print
          </button>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="p-6" style={{ userSelect: "none" }}>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid stroke="#e0e0e0" vertical={false} strokeDasharray="0" />
                <ReferenceLine y={0} stroke="#333333" strokeWidth={1} />
                <ReferenceLine y={1} stroke="#e0e0e0" strokeWidth={1} />
                <ReferenceLine y={2} stroke="#e0e0e0" strokeWidth={1} />
                <ReferenceLine y={3} stroke="#e0e0e0" strokeWidth={1} />
                <ReferenceLine y={4} stroke="#e0e0e0" strokeWidth={1} />
                <ReferenceLine y={5} stroke="#e0e0e0" strokeWidth={1} />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#333", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#333", fontSize: 12 }}
                  allowDecimals={false}
                  domain={[0, "dataMax + 1"]}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />

                <Legend
                  verticalAlign="top"
                  align="left"
                  content={<CustomLegend />}
                  wrapperStyle={{
                    paddingLeft: "10px",
                    paddingBottom: "10px",
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />

                <Bar
                  dataKey="leads"
                  name="No of leads"
                  barSize={60}
                  isAnimationActive={false}
                  onMouseEnter={(_, index: number) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === activeIndex ? "#0056b3" : "#007bff"}
                      style={{
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No statuses found</p>
            <p className="text-gray-400 text-sm mt-2">
              Add statuses from the Manage Items section
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusList;