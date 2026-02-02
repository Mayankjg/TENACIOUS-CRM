"use client";

import React, { useState, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DataRow {
  id: number;
  date: string;
  contactPerson: string;
  company: string;
  dueDate: string;
  location: string;
  comments: string;
  salesPerson: string;
}

const CommentsBySalesPersonList: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedSalesPerson, setSelectedSalesPerson] =
    useState<string>("All Sales Person");

  const fromDateRef = useRef<any>(null);
  const toDateRef = useRef<any>(null);

  const salesPersons: string[] = [
    "All Sales Person",
    "Test (CEO)",
    "John Doe",
    "Jane Smith",
  ];

  const data: DataRow[] = [
    {
      id: 1,
      date: "03-Nov-25 17:17",
      contactPerson: "MPL ZXS",
      company: "Company Inc.",
      dueDate: "10-Mar-21 14:05",
      location: "Surat, India",
      comments: "hi - By Test",
      salesPerson: "Test (CEO)",
    },
    {
      id: 2,
      date: "28-Oct-25 10:29",
      contactPerson: "MPL1 ZXS1",
      company: "Company Inc.",
      dueDate: "09-Mar-21 10:33",
      location: "Surat, India",
      comments: "Need to have a followup call. - By Test",
      salesPerson: "Test (CEO)",
    },
  ];

  const handleSearch = (): void => {
    console.log("Filter Applied:", selectedSalesPerson, fromDate, toDate);
  };

  const handleExport = (): void => {
    console.log("Export Excel...");
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
            className="bg-[#4B63A1] text-white text-sm font-semibold px-4 py-1.5 rounded shadow-sm hover:bg-[#3B4F8C] transition"
          >
            Export To Excel
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between px-8 py-4">
          {/* Left Filters */}
          <div className="flex items-center flex-wrap gap-6">
            {/* Sales Person Select */}
            <select
              value={selectedSalesPerson}
              onChange={(e) => setSelectedSalesPerson(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-80 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
            >
              {salesPersons.map((person, i) => (
                <option key={i}>{person}</option>
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

          {/* Search Button */}
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleSearch}
              className="bg-[#00AEEF] text-white text-sm font-semibold px-8 py-2 rounded shadow-sm hover:bg-[#0095D9] transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 pb-6 overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 border-b font-semibold">SR.NO.</th>
                <th className="py-2 px-4 border-b font-semibold">DATE</th>
                <th className="py-2 px-4 border-b font-semibold">
                  CONTACT PERSON
                </th>
                <th className="py-2 px-4 border-b font-semibold">COMPANY</th>
                <th className="py-2 px-4 border-b font-semibold">DUE DATE</th>
                <th className="py-2 px-4 border-b font-semibold">LOCATION</th>
                <th className="py-2 px-4 border-b font-semibold">COMMENTS</th>
                <th className="py-2 px-4 border-b font-semibold">
                  SALES PERSON
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 border-b text-gray-700"
                >
                  <td className="py-2 px-4">{row.id}</td>
                  <td className="py-2 px-4">{row.date}</td>
                  <td className="py-2 px-4">{row.contactPerson}</td>
                  <td className="py-2 px-4">{row.company}</td>
                  <td className="py-2 px-4">{row.dueDate}</td>
                  <td className="py-2 px-4">{row.location}</td>
                  <td className="py-2 px-4">{row.comments}</td>
                  <td className="py-2 px-4">{row.salesPerson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommentsBySalesPersonList;