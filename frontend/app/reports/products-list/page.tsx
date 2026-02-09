"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiGet } from "@/utils/api";

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

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
      }
    };
    
    fetchLeads();
  }, []);

  // Calculate product-wise lead count dynamically with date filtering
  const tableData = useMemo(() => {
    if (products.length === 0) return [];

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

    // Count leads for each product
    const productLeadCount = new Map<string, number>();

    // Initialize all products with 0 leads
    products.forEach(product => {
      productLeadCount.set(product.name, 0);
    });

    // Count leads for each product
    filteredLeads.forEach(lead => {
      if (lead.product && productLeadCount.has(lead.product)) {
        productLeadCount.set(lead.product, (productLeadCount.get(lead.product) || 0) + 1);
      }
    });

    // Convert to array format
    return Array.from(productLeadCount.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products, leads, fromDate, toDate]);

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
            Leads By <span className="font-bold">Products List</span>
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
                    PRODUCT NAME
                  </th>
                  <th className="border-t border-r border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    LEADS ADDED
                  </th>
                  {/* <th className="border-t border-r border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    FOLLOW UP LEADS
                  </th> */}
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
                    {/* <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-300">
                      {item.count}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 sm:py-6 text-gray-500 text-xs sm:text-sm">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;