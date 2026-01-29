"use client"; // 👈 Required for using useState and interactivity in Next.js app directory

import React, { useState, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function LeadsByProductList() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rawFromDate, setRawFromDate] = useState("");
  const [rawToDate, setRawToDate] = useState("");

  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Format date as dd-mm-yyyy
  const formatDate = (value) => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    return `${d}-${m}-${y}`;
  };

  const handleFromChange = (e) => {
    const raw = e.target.value;
    setRawFromDate(raw);
    setFromDate(formatDate(raw));
  };

  const handleToChange = (e) => {
    const raw = e.target.value;
    setRawToDate(raw);
    setToDate(formatDate(raw));
  };

  const handleSearch = () => {
    console.log("Searching from:", rawFromDate, "to:", rawToDate);
  };

  return (
    <>
      <style>
        {`
          /* Hide native date picker icons */
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 0;
            display: none;
          }
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-clear-button {
            display: none;
          }
        `}
      </style>

      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-5xl bg-white rounded-md shadow border border-gray-300">
          {/* Header */}
          <div className="px-6 py-3 border-b border-gray-300 bg-white rounded-t-md">
            <h2 className="text-lg font-semibold text-gray-800">
              Leads By <span className="font-bold">Product List</span>
            </h2>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center justify-end gap-16 px-8 py-5 border-b border-gray-200">
            {/* From Date */}
            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium text-sm">From</label>
              <div className="flex">
                <input
                  ref={fromRef}
                  type="text"
                  value={fromDate}
                  readOnly
                  placeholder="From Date"
                  className="border border-gray-300 rounded-l-md p-2 pl-3 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-[#00AEEF] text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => fromRef.current?.showPicker?.()}
                  className="bg-[#00AEEF] rounded-r-md px-3 flex items-center justify-center hover:bg-[#0095D9] transition"
                  name="From date"
                >
                  <FaCalendarAlt className="text-white text-base" />
                </button>
                {/* Hidden native input */}
                <input
                  ref={fromRef}
                  type="date"
                  onChange={handleFromChange}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium text-sm">To</label>
              <div className="flex">
                <input
                  ref={toRef}
                  type="text"
                  value={toDate}
                  readOnly
                  placeholder="To Date"
                  className="border border-gray-300 rounded-l-md p-2 pl-3 w-40 text-sm focus:outline-none focus:ring-1 focus:ring-[#00AEEF] text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => toRef.current?.showPicker?.()}
                  className="bg-[#00AEEF] rounded-r-md px-3 flex items-center justify-center hover:bg-[#0095D9] transition"
                  name="To date"
                >
                  <FaCalendarAlt className="text-white text-base" />
                </button>
                {/* Hidden native input */}
                <input
                  ref={toRef}
                  type="date"
                  onChange={handleToChange}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex flex-col items-end">
              <button
                onClick={handleSearch}
                className="bg-[#00AEEF] text-white font-semibold px-6 py-2 rounded text-sm shadow-sm hover:bg-[#0095D9] transition duration-200 ease-in-out"
              >
                Search
              </button>
              <p className="text-red-500 text-xs font-medium mt-1 text-right">
                Leads Count Contain (Custom Leads + Deals)
              </p>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto px-6 py-4">
            <table className="min-w-full border border-gray-200 rounded-b-md">
              <thead className="bg-gray-100 text-gray-700 border-b-0">
                <tr>
                  <th className="py-2 px-5 text-left w-[10%] font-medium text-sm">
                    SR. NO.
                  </th>
                  <th className="py-2 px-4 text-left font-medium text-sm">
                    PRODUCT
                  </th>
                  <th className="py-2 px-4 text-center font-medium text-sm">
                    LEADS ADDED
                  </th>
                  <th className="py-2 px-4 text-center font-medium text-sm">
                    FOLLOW UP LEADS
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, product: "Galaxy S1", added: 1, followup: 1 },
                  { id: 2, product: "Galaxy S2", added: 0, followup: 0 },
                  { id: 3, product: "Bandhani", added: 2, followup: 2 },
                  { id: 4, product: "Lenovo Ideapad", added: 0, followup: 0 },
                  { id: 5, product: "hi", added: 0, followup: 0 },
                ].map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition text-gray-700 text-sm"
                  >
                    <td className="py-2 px-4 border text-center">{item.id}</td>
                    <td className="py-2 px-4 border">{item.product}</td>
                    <td className="py-2 px-4 border text-center">
                      {item.added}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      {item.followup}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
