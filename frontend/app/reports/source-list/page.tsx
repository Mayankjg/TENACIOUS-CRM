"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiGet } from "@/utils/api";

interface Source {
  _id: string;
  name: string;
  description?: string;
  source?: string;
}

interface Lead {
  _id: string;
  source?: string;
  createdAt?: string;
  [key: string]: any;
}

const SourceList: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch sources
  useEffect(() => {
    const fetchSources = async () => {
      try {
        console.log("🔄 Fetching sources...");
        // Try this endpoint first (following the same pattern as products)
        const result = await apiGet("/api/manage-items/lead-source/get-lead-source");
        
        if (result.success) {
          setSources(result.data || []);
          console.log("✅ Sources fetched:", result.data?.length || 0);
        } else {
          console.error("❌ Failed to fetch sources:", result.error);
          setSources([]);
        }
      } catch (error) {
        console.error("❌ Error fetching sources:", error);
        setSources([]);
      }
    };
    
    fetchSources();
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
      }
    };
    
    fetchLeads();
  }, []);

  // Calculate source-wise lead count dynamically with date filtering
  const tableData = useMemo(() => {
    if (sources.length === 0) return [];

    // Filter leads by date range if dates are selected
    let filteredLeads = leads;
    
    if (fromDate || toDate) {
      filteredLeads = leads.filter(lead => {
        if (!lead.createdAt) return false;
        
        const leadDate = new Date(lead.createdAt);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        
        if (from && to) {
          return leadDate >= from && leadDate <= to;
        } else if (from) {
          return leadDate >= from;
        } else if (to) {
          return leadDate <= to;
        }
        
        return true;
      });
    }

    // Count leads for each source
    const sourceLeadCount = new Map<string, number>();

    // Initialize all sources with 0 leads
    sources.forEach(source => {
      sourceLeadCount.set(source.name, 0);
    });

    // Count leads for each source
    filteredLeads.forEach(lead => {
      if (lead.source && sourceLeadCount.has(lead.source)) {
        sourceLeadCount.set(lead.source, (sourceLeadCount.get(lead.source) || 0) + 1);
      }
    });

    // Convert to array format
    return Array.from(sourceLeadCount.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [sources, leads, fromDate, toDate]);

  const handleSearch = () => {
    // The data will automatically update through the useMemo dependency
    console.log("🔍 Searching with dates:", { fromDate, toDate });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start p-4 sm:p-6">
      <div className="bg-white w-full max-w-6xl rounded-md border border-gray-300 relative text-black">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-300 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-black">
            Leads By <span className="font-bold">Sources List</span>
          </h2>
        </div>

        {/* Date Filter Section */}
        <div className="flex flex-col sm:flex-row justify-end items-center p-4 gap-2 border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />
            
            <label className="text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
            />

            <button
              onClick={handleSearch}
              className="bg-[#2986cc] cursor-pointer hover:bg-[#0b5394] text-white px-4 py-2 rounded-md text-sm font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        <p className="text-sm text-red-600 text-right mt-2 mr-5">
          Leads Count Contain (Custom Leads + Deals)
        </p>

        {/* Table */}
        <div className="overflow-x-auto px-4 py-4 text-black">
          {tableData.length > 0 ? (
            <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300">
              <thead
                style={{
                  backgroundColor: "rgb(211, 214, 220)",
                  borderColor: "rgb(211, 214, 220)",
                }}
              >
                <tr className="text-black">
                  <th className="border-t border-l border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left">
                    SR. NO.
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    SOURCE NAME
                  </th>
                  <th className="border-t border-r border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    LEADS ADDED
                  </th>
                </tr>
              </thead>
              <tbody className="font-medium text-black">
                {tableData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 border text-left border-gray-300">
                      {index + 1}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-300">
                      {item.name}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-300">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 sm:py-6 text-gray-500 text-xs sm:text-sm">
              No sources found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourceList;