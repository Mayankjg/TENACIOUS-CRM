"use client";

import React, { useState } from "react";
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

interface DataItem {
  name: string;
  leads: number;
}

const LeadsByProduct: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data: DataItem[] = [
    { name: "Galaxy S1", leads: 1 },
    { name: "Galaxy S2", leads: 0 },
    { name: "Bandhani", leads: 2 },
    { name: "Lenovo Ideapad", leads: 0 },
    { name: "hi", leads: 0 },
  ];

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

  return (
    <div className="flex items-center justify-center p-4">
      <div className="border border-gray-300 shadow-md w-full max-w-6xl mx-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-[#f9f9f9]">
          <h2 className="text-gray-700 text-sm font-semibold">
            Leads by <span className="font-bold">Product</span>
          </h2>

          <button
            onClick={handlePrint}
            className="bg-purple-800 text-white text-sm px-4 py-1.5 rounded hover:bg-purple-900"
          >
            Print
          </button>
        </div>

        {/* Chart */}
        <div className="p-6" style={{ userSelect: "none" }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="#e0e0e0" vertical={false} />
              <ReferenceLine y={0.5} stroke="#c0c0c0" />
              <ReferenceLine y={1.5} stroke="#c0c0c0" />
              <ReferenceLine y={2.5} stroke="#c0c0c0" />
              <ReferenceLine y={3.5} stroke="#c0c0c0" />
              <ReferenceLine y={0} stroke="#dddadaff" strokeWidth={1.5} />

              <XAxis
                dataKey="name"
                tick={{ fill: "#333" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#333" }}
                allowDecimals={false}
                domain={[0, "dataMax + 2"]}
                axisLine={false}
                tickLine={false}
              />

              <Legend
                verticalAlign="top"
                align="left"
                content={<CustomLegend />}
                wrapperStyle={{
                  paddingLeft: "10px",
                  paddingBottom: "0px",
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
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index === activeIndex ? "#0056b3" : "#007bff"}
                    style={{
                      transition: "fill 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LeadsByProduct;