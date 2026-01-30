"use client";
import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaSync } from "react-icons/fa";
import axios from "axios";

interface SalesPerson {
  id: string | number;
  name: string;
  today: number;
  all: number;
  missed: number;
  unscheduled: number;
  closed: number;
  void: number;
}

interface SalesSummaryProps {
  salesPersons: SalesPerson[];
  onRefresh: () => void;
}

interface DatePickerProps {
  label: string;
  date: Date;
  showCalendar: boolean;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

interface CalendarUIProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Lead {
  createdAt: string;
  salesperson?: string;
  createdBy?: string;
  testerSalesman?: string;
  leadStatus?: string;
  category?: string;
  [key: string]: any;
}

export default function SalesSummary({
  salesPersons,
  onRefresh,
}: SalesSummaryProps) {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFromCalendar, setShowFromCalendar] = useState<boolean>(false);
  const [showToCalendar, setShowToCalendar] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<SalesPerson[]>(salesPersons);
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "https://two9-01-2026.onrender.com";

  useEffect(() => {
    setFilteredData(salesPersons);
  }, [salesPersons]);

  const handleSearch = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch all leads
      const leadsRes = await axios.get<Lead[] | { data: Lead[] }>(
        `${API_BASE}/api/leads/get-leads`
      );
      const allLeads: Lead[] = Array.isArray(leadsRes.data)
        ? leadsRes.data
        : leadsRes.data?.data || [];

      // Filter leads by date range
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      const dateFilteredLeads = allLeads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= from && leadDate <= to;
      });

      // Calculate stats for each salesperson with date filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedData: SalesPerson[] = salesPersons.map((sp) => {
        const spLeads = dateFilteredLeads.filter(
          (lead) =>
            lead.salesperson === sp.name ||
            lead.createdBy === sp.id ||
            lead.testerSalesman === sp.name
        );

        const todayLeads = spLeads.filter((l) => {
          const createdDate = new Date(l.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          return createdDate.getTime() === today.getTime();
        });

        return {
          ...sp,
          today: todayLeads.length,
          all: spLeads.length,
          missed: spLeads.filter((l) => l.leadStatus === "Miss").length,
          unscheduled: spLeads.filter(
            (l) =>
              l.leadStatus === "Unscheduled" || l.category === "Unscheduled"
          ).length,
          closed: spLeads.filter((l) => l.leadStatus === "Closed").length,
          void: spLeads.filter((l) => l.leadStatus === "Void").length,
        };
      });

      setFilteredData(updatedData);
    } catch (error) {
      console.error("❌ Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLeads = (salesperson: SalesPerson): void => {
    // Navigate to leads page with salesperson filter
    window.location.href = `/leads/leadpage?salesperson=${encodeURIComponent(
      salesperson.name
    )}`;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 text-black">
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
          Sales Person <span className="font-bold">Summary</span>
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
        >
          <FaSync className={loading ? "animate-spin" : "cursor-pointer"} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 px-4 sm:px-6 py-4 bg-gray-50">
        <div className="w-full md:w-auto cursor-pointer">
          <DatePicker
            label="From"
            date={fromDate}
            showCalendar={showFromCalendar}
            setShowCalendar={setShowFromCalendar}
            setDate={setFromDate}
          />
        </div>

        <div className="w-full md:w-auto md:ml-[100px] cursor-pointer">
          <DatePicker
            label="To"
            date={toDate}
            showCalendar={showToCalendar}
            setShowCalendar={setShowToCalendar}
            setDate={setToDate}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-8 py-2 rounded text-sm font-semibold w-full md:w-auto disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="px-2 sm:px-6 pb-6">
        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-xs md:text-sm text-gray-700 text-center">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "SR NO",
                  "SALES PERSON",
                  "TODAY LEADS",
                  "ALL",
                  "MISSED",
                  "UNSCHEDULED",
                  "CLOSED",
                  "VOID",
                  "VIEW",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold whitespace-nowrap border-b border-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 border-r border-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300 font-medium">
                      {row.name}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                        {row.today}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300">
                      {row.all}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300">
                      {row.missed}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300">
                      {row.unscheduled}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300">
                      {row.closed}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-300 text-red-600 font-semibold">
                      {row.void}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleViewLeads(row)}
                        className="bg-red-500 cursor-pointer text-white px-4 py-1.5 rounded text-xs hover:bg-red-600"
                      >
                        View Leads
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No salespersons found
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-3 font-semibold text-left border-t border-gray-300"
                >
                  TOTAL
                </td>
                <td className="px-4 py-3 font-bold border-t border-gray-300">
                  {filteredData.reduce((sum, sp) => sum + sp.today, 0)}
                </td>
                <td className="px-4 py-3 font-bold border-t border-gray-300">
                  {filteredData.reduce((sum, sp) => sum + sp.all, 0)}
                </td>
                <td className="px-4 py-3 font-bold border-t border-gray-300">
                  {filteredData.reduce((sum, sp) => sum + sp.missed, 0)}
                </td>
                <td className="px-4 py-3 font-bold border-t border-gray-300">
                  {filteredData.reduce((sum, sp) => sum + sp.unscheduled, 0)}
                </td>
                <td className="px-4 py-3 font-bold border-t border-gray-300">
                  {filteredData.reduce((sum, sp) => sum + sp.closed, 0)}
                </td>
                <td className="px-4 py-3 font-bold text-red-600 border-t border-gray-300">
                  {filteredData.reduce((sum, sp) => sum + sp.void, 0)}
                </td>
                <td className="px-4 py-3 border-t border-gray-300"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* MOBILE TABLE */}
        <div className="lg:hidden space-y-4 mt-4">
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <div key={row.id} className="border border-gray-500">
                <div className="border-b px-4 py-2 text-sm font-semibold bg-gray-50">
                  SR NO : <span className="font-normal">{index + 1}</span>
                </div>

                <div className="border-b px-4 py-2 text-sm">
                  <strong>Sales Person :</strong> {row.name}
                </div>

                <div className="border-b px-4 py-2 text-sm">
                  <strong>Today Leads :</strong>{" "}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                    {row.today}
                  </span>
                </div>

                <div className="border-b px-4 py-2 text-sm">
                  <strong>All :</strong> {row.all}
                </div>

                <div className="border-b px-4 py-2 text-sm">
                  <strong>Missed :</strong> {row.missed}
                </div>

                <div className="border-b px-4 py-2 text-sm">
                  <strong>Unscheduled :</strong> {row.unscheduled}
                </div>

                <div className="border-b px-4 py-2 text-sm">
                  <strong>Closed :</strong> {row.closed}
                </div>

                <div className="border-b px-4 py-2 text-sm text-red-600 font-semibold">
                  <strong>Void :</strong> {row.void}
                </div>

                <div className="px-4 py-3">
                  <button
                    onClick={() => handleViewLeads(row)}
                    className="bg-red-500 text-white px-4 py-1.5 rounded text-xs w-full"
                  >
                    View Leads
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No salespersons found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ DATE PICKER ------------------ */
function DatePicker({
  label,
  date,
  showCalendar,
  setShowCalendar,
  setDate,
}: DatePickerProps) {
  return (
    <div className="flex items-center gap-2 relative w-full md:w-auto">
      <label className="text-gray-700 font-medium text-sm w-20">{label}</label>

      <div className="relative inline-block w-full md:w-auto">
        <input
          type="text"
          readOnly
          value={date.toISOString().split("T")[0]}
          onClick={() => setShowCalendar(!showCalendar)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm pr-12 cursor-pointer w-full md:w-[150px] text-[#666]"
        />

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute cursor-pointer right-0 top-0 h-full bg-[#0099E6] px-3 flex items-center justify-center rounded-r-md"
        >
          <FaCalendarAlt className="text-white text-base" />
        </button>

        {showCalendar && (
          <div className="absolute bottom-[110%] left-0 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-[220px] z-[999999]">
            <CalendarUI
              date={date}
              setDate={setDate}
              setShowCalendar={setShowCalendar}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------ CALENDAR UI ------------------ */
function CalendarUI({ date, setDate, setShowCalendar }: CalendarUIProps) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => {
            const prev = new Date(date);
            prev.setMonth(prev.getMonth() - 1);
            setDate(prev);
          }}
          className="text-[#0099E6] text-lg font-bold"
        >
          ‹
        </button>

        <h3 className="font-semibold text-gray-800 text-sm">
          {date.toLocaleString("default", { month: "long" })}{" "}
          {date.getFullYear()}
        </h3>

        <button
          onClick={() => {
            const next = new Date(date);
            next.setMonth(next.getMonth() + 1);
            setDate(next);
          }}
          className="text-[#0099E6] text-lg font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#0099E6] mb-1">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-[11px] text-center gap-[2px]">
        {Array.from({ length: 42 }).map((_, i) => {
          const num = i - firstDay + 1;
          const isValid = num > 0 && num <= days;
          const isCurrent = num === date.getDate();

          return (
            <div
              key={i}
              className={`py-1.5 rounded-md cursor-pointer ${
                isValid
                  ? isCurrent
                    ? "bg-[#0099E6] text-white font-bold"
                    : "text-gray-700 hover:bg-gray-200"
                  : "text-gray-300"
              }`}
              onClick={() => {
                if (isValid) {
                  const newDate = new Date(date);
                  newDate.setDate(num);
                  setDate(newDate);
                  setShowCalendar(false);
                }
              }}
            >
              {isValid ? num : ""}
            </div>
          );
        })}
      </div>
    </>
  );
}