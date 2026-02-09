// "use client";

// import { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// interface ChartDataItem {
//   date: string;
//   leads: number;
// }

// export default function Home() {
//   // State for leads data
//   const [chartData, setChartData] = useState<ChartDataItem[]>([]);

//   // Simulate dynamic API fetch
//   useEffect(() => {
//     // You can replace this with an actual API call later
//     const fetchData = async () => {
//       const data: ChartDataItem[] = [
//         { date: "2016-08-01", leads: 13 },
//         { date: "2016-08-03", leads: 10 },
//         { date: "2016-08-04", leads: 2 },
//         { date: "2016-08-05", leads: 7 },
//         { date: "2016-08-08", leads: 2 },
//       ];
//       setChartData(data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-5xl">
//         <h2 className="text-xl font-semibold mb-4 text-black">
//           Monthly <span className="text-blue-600">Leads</span>
//         </h2>

//         <div className="w-full h-[500px]">
//           <ResponsiveContainer width="50%" height="100%">
//             <BarChart
//               data={chartData}
//               margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="leads" fill="#007bff" name="No of leads" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </main>
//   );
// }


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

interface Product {
  _id: string;
  name: string;
  description?: string;
  source?: string;
}

interface Lead {
  _id: string;
  product?: string;
  [key: string]: any;
}

const LeadsByProduct: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("🔄 Fetching products...");
        const result = await apiGet("/api/manage-items/products/get-products");
        
        if (result.success) {
          setProducts(result.data || []);
          console.log("✅ Products fetched:", result.data?.length || 0);
        } else {
          console.error("❌ Failed to fetch products:", result.error);
          setProducts([]);
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        setProducts([]);
      }
    };
    
    fetchProducts();
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

  // Calculate product-wise lead count dynamically
  const data: DataItem[] = useMemo(() => {
    if (products.length === 0) return [];

    // Count leads for each product
    const productLeadCount = new Map<string, number>();

    // Initialize all products with 0 leads
    products.forEach(product => {
      productLeadCount.set(product.name, 0);
    });

    // Count leads for each product
    leads.forEach(lead => {
      if (lead.product && productLeadCount.has(lead.product)) {
        productLeadCount.set(lead.product, (productLeadCount.get(lead.product) || 0) + 1);
      }
    });

    // Convert to array format
    return Array.from(productLeadCount.entries()).map(([name, leads]) => ({
      name,
      leads,
    }));
  }, [products, leads]);

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
      <div className="flex items-center justify-center p-4 min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products data...</p>
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
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
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
                  tick={{ fill: "#333" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#333" }}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">
                Add products from the Manage Items section
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsByProduct;