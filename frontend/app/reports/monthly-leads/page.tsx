// frontend/app/reports/monthly-leads/MonthlyLeadsGraph.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* --------------------------- TYPES & INTERFACES --------------------------- */

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  leadStartDate?: string;
}

interface ChartData {
  date: string;
  count: number;
}

/* --------------------------- MAIN COMPONENT --------------------------- */

export default function MonthlyLeadsGraph() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://tt-crm-pro.onrender.com";

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [maxCount, setMaxCount] = useState<number>(0);

  // Fetch leads and process
  useEffect(() => {
    fetchLeadsData();
  }, []);

  const fetchLeadsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/leads/get-leads`);

      if (response.data && Array.isArray(response.data)) {
        processChartData(response.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads data");
      setLoading(false);
    }
  };

  const processChartData = (leads: Lead[]) => {
    const dateCounts: { [key: string]: number } = {};

    // Count leads by date
    leads.forEach((lead) => {
      const dateStr = lead.leadStartDate || lead.createdAt;
      const date = new Date(dateStr).toISOString().split("T")[0];

      if (!dateCounts[date]) {
        dateCounts[date] = 0;
      }
      dateCounts[date]++;
    });

    // Convert to array and sort
    const chartArray: ChartData[] = Object.keys(dateCounts)
      .sort()
      .map((date) => ({
        date,
        count: dateCounts[date],
      }));

    setChartData(chartArray);
    
    // Find max count for scaling
    const max = Math.max(...chartArray.map((d) => d.count));
    setMaxCount(max);
  };

  // Format date for display (e.g., "2016-08-01")
  const formatDate = (dateStr: string) => {
    return dateStr; // Already in YYYY-MM-DD format
  };

  // Calculate bar height percentage
  const getBarHeight = (count: number) => {
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  };

  /* --------------------------- RENDER --------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <h2 className="text-2xl font-normal text-gray-700 mb-8">
          Monthly <b>Leads</b>
        </h2>

        {/* Chart Container */}
        <div className="bg-white border border-gray-200 rounded p-6">
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No data available
            </div>
          ) : (
            <div className="relative">
              {/* Legend */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-4 bg-blue-500"></div>
                <span className="text-sm text-gray-600">No of leads</span>
              </div>

              {/* Chart Area */}
              <div className="relative" style={{ height: "400px" }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-sm text-gray-600 pr-4">
                  <div>{maxCount}</div>
                  <div>{Math.round(maxCount * 0.75)}</div>
                  <div>{Math.round(maxCount * 0.5)}</div>
                  <div>{Math.round(maxCount * 0.25)}</div>
                  <div>0</div>
                </div>

                {/* Grid lines */}
                <div className="absolute left-12 right-0 top-0 bottom-12 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-200"></div>
                  ))}
                </div>

                {/* Bars Container */}
                <div className="absolute left-12 right-0 top-0 bottom-12 flex items-end justify-start gap-8 px-4">
                  {chartData.map((data, index) => {
                    const barHeight = getBarHeight(data.count);
                    
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-end"
                        style={{ minWidth: "60px" }}
                      >
                        {/* Bar */}
                        <div
                          className="bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                          style={{
                            width: "60px",
                            height: `${barHeight}%`,
                            minHeight: data.count > 0 ? "5px" : "0px",
                          }}
                          title={`${data.count} leads`}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="absolute left-12 right-0 bottom-0 flex items-center justify-start gap-8 px-4 pt-4">
                  {chartData.map((data, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 text-center"
                      style={{ minWidth: "60px" }}
                    >
                      {formatDate(data.date)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}