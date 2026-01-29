"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
// Full Working Dynamic Chart Component + Tailwind UI
export default function Home() {
  // State for leads data
  const [chartData, setChartData] = useState([]);

  // Simulate dynamic API fetch
  useEffect(() => {
    // You can replace this with an actual API call later
    const fetchData = async () => {
      const data = [
        { date: "2016-08-01", leads: 13 },
        { date: "2016-08-03", leads: 10 },
        { date: "2016-08-04", leads: 2 },
        { date: "2016-08-05", leads: 7 },
        { date: "2016-08-08", leads: 2 },
      ];
      setChartData(data);
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-5xl">
        <h2 className="text-xl font-semibold mb-4 text-black">
          Monthly <span className="text-blue-600">Leads</span>
        </h2>

        <div className="w-full h-[500px]">
          {" "}
          {/* Increased height */}
          <ResponsiveContainer width="50%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#007bff" name="No of leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
