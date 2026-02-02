"use client";
import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

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
}

interface DatePickerProps {
  label: string;
  date: Date;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  setDate: (date: Date) => void;
}

export default function SalesSummary({ salesPersons }: SalesSummaryProps) {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFromCalendar, setShowFromCalendar] = useState<boolean>(false);
  const [showToCalendar, setShowToCalendar] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-out">
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
          Salesperson <span className="font-bold">Summary</span>
        </h2>
      </div>

      {/* Calendar Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 bg-white">
        <DatePicker
          label="From"
          date={fromDate}
          showCalendar={showFromCalendar}
          setShowCalendar={setShowFromCalendar}
          setDate={setFromDate}
        />

        <div className="ml-[100px]">
          <DatePicker
            label="To"
            date={toDate}
            showCalendar={showToCalendar}
            setShowCalendar={setShowToCalendar}
            setDate={setToDate}
          />
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded text-sm font-semibold w-full sm:w-auto">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-2 sm:px-6 pb-6">
        <table className="min-w-full border border-gray-200 text-xs sm:text-sm text-gray-700 text-center">
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
                  className="px-2 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {salesPersons.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.id}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.name}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.today}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.all}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.missed}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.unscheduled}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200">
                  {row.closed}
                </td>
                <td className="px-2 sm:px-4 py-2 border-r border-gray-200 text-red-600 font-semibold">
                  {row.void}
                </td>
                <td className="px-2 sm:px-4 py-2">
                  <button className="bg-red-500 text-white px-3 sm:px-4 py-1.5 rounded text-xs hover:bg-red-600">
                    View Leads
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DatePicker({ label, date, showCalendar, setShowCalendar, setDate }: DatePickerProps) {
  return (
    <div className="flex items-center gap-2 relative">
      <label className="text-gray-700 font-medium text-sm">{label}</label>

      <div className="relative inline-block">
        <input
          type="text"
          readOnly
          value={date.toISOString().split("T")[0]}
          onClick={() => setShowCalendar(!showCalendar)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm pr-12 cursor-pointer w-[150px] text-[#666]"
        />

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-0 top-0 h-full bg-[#0099E6] px-3 flex items-center justify-center rounded-r-md"
        >
          <FaCalendarAlt className="text-white text-base" />
        </button>

        {showCalendar && (
          <div className="absolute bottom-[110%] left-0 bg-white shadow-lg rounded-lg p-3 border border-gray-200 w-[220px] z-[999999]">
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
                const firstDay = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  1
                ).getDay();
                const days = new Date(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  0
                ).getDate();
                const num = i - firstDay + 1;
                const isCurrent = num === date.getDate();
                const isValid = num > 0 && num <= days;

                return (
                  <div
                    key={i}
                    className={`py-1.5 rounded-md cursor-pointer 
                      ${
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
          </div>
        )}
      </div>
    </div>
  );
}