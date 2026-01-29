"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowBigRight, ArrowBigLeft } from "lucide-react";
import { toast } from "react-toastify";

// Import tenant-aware utilities
import { apiGet, validateSession } from "@/utils/api";

interface Lead {
  leadStartDate?: string;
  leadStartTime?: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  email?: string;
  leadStatus: string;
  product?: string;
}

interface DayInfo {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

interface TimeSlot {
  day: Date;
  time: string;
  leads: Lead[];
}

interface LeadsDataByDate {
  [key: string]: Lead[];
}

interface LeadsDataByDateTime {
  [key: string]: Lead[];
}

const LeadsCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const fullDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const timeSlots = [
    "12am",
    "1am",
    "2am",
    "3am",
    "4am",
    "5am",
    "6am",
    "7am",
    "8am",
    "9am",
    "10am",
    "11am",
    "12pm",
    "1pm",
    "2pm",
    "3pm",
    "4pm",
    "5pm",
    "6pm",
    "7pm",
    "8pm",
    "9pm",
    "10pm",
    "11pm",
  ];

  // Validate session on mount
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session");
      return;
    }

    fetchLeads();
  }, []);

  // Fetch with tenant filtering (done by backend)
  const fetchLeads = async (): Promise<void> => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch - invalid session");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching leads for calendar...");

      const result = await apiGet("/api/leads/get-leads");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch leads");
      }

      const items: Lead[] = Array.isArray(result.data)
        ? result.data
        : result.data?.data || result.data?.leads || [];

      console.log("✅ Fetched leads for calendar:", items.length);
      setLeads(items);
    } catch (err) {
      console.error("❌ Fetch leads error:", err);
      toast.error("❌ Failed to load leads data");
    } finally {
      setLoading(false);
    }
  };

  // Group leads by date
  const leadsDataByDate = useMemo<LeadsDataByDate>(() => {
    const grouped: LeadsDataByDate = {};

    leads.forEach((lead) => {
      if (!lead.leadStartDate) return;

      const date = new Date(lead.leadStartDate);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(lead);
    });

    return grouped;
  }, [leads]);

  // Group leads by date and time for week view
  const leadsDataByDateTime = useMemo<LeadsDataByDateTime>(() => {
    const grouped: LeadsDataByDateTime = {};

    leads.forEach((lead) => {
      if (!lead.leadStartDate || !lead.leadStartTime) return;

      const date = new Date(lead.leadStartDate);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      // Parse time (HH:MM format)
      const [hours, minutes] = lead.leadStartTime.split(":");
      let hour = parseInt(hours);
      const isPM = hour >= 12;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const timeSlot = `${displayHour}${isPM ? "pm" : "am"}`;

      const key = `${dateKey}-${timeSlot}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(lead);
    });

    return grouped;
  }, [leads]);

  const getDaysInMonth = (date: Date): DayInfo[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayInfo[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getWeekDays = (date: Date): Date[] => {
    const current = new Date(date);
    const first = current.getDate() - current.getDay();
    const weekDays: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(current);
      day.setDate(first + i);
      weekDays.push(day);
    }

    return weekDays;
  };

  const navigateMonth = (direction: number): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const navigateWeek = (direction: number): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const getLeadsForDate = (date: Date): Lead[] => {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return leadsDataByDate[dateStr] || [];
  };

  const getLeadsForDateTime = (date: Date, timeSlot: string): Lead[] => {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const key = `${dateStr}-${timeSlot}`;
    return leadsDataByDateTime[key] || [];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleTimeSlotClick = (day: Date, time: string): void => {
    const dateTimeLeads = getLeadsForDateTime(day, time);
    if (dateTimeLeads.length > 0) {
      setSelectedTimeSlot({ day, time, leads: dateTimeLeads });
    }
  };

  const closeModal = (): void => {
    setSelectedTimeSlot(null);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="min-h-screen bg-[#e8ecef] p-2 sm:p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto bg-white rounded shadow border border-gray-200">
        {/* Header Section */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl font-normal text-[#4a4a4a]">
              Calendar :{" "}
              <span className="text-[#ef4444] font-normal">
                {monthNames[currentDate.getMonth()]}-{currentDate.getFullYear()}
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-[#334155] rounded-sm"></span>
              <span className="text-base sm:text-lg text-gray-800 font-normal">
                No. Of Leads ({leads.length})
              </span>
            </div>
          </div>
          <hr className="border-t border-gray-300 -mx-4 sm:-mx-6" />
        </div>

        {/* Navigation and View Toggle */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-0 bg-[#38bdf8] rounded overflow-hidden">
              <button
                onClick={() =>
                  viewMode === "month" ? navigateMonth(-1) : navigateWeek(-1)
                }
                className="bg-[#38bdf8] cursor-pointer hover:bg-[#0ea5e9] text-white p-2 sm:p-3 transition-colors border-r border-white/20"
              >
                <ArrowBigLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() =>
                  viewMode === "month" ? navigateMonth(1) : navigateWeek(1)
                }
                className="bg-[#38bdf8] cursor-pointer hover:bg-[#0ea5e9] text-white p-2 sm:p-3 transition-colors"
              >
                <ArrowBigRight size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex rounded overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode("month")}
                className={`px-6 cursor-pointer sm:px-10 py-2 text-sm sm:text-base font-normal transition-colors ${
                  viewMode === "month"
                    ? "bg-[#14b8a6] text-white"
                    : "bg-[#14b8a6] text-white opacity-70 hover:opacity-100"
                }`}
              >
                month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-6 sm:px-10 cursor-pointer py-2 text-sm sm:text-base font-normal transition-colors ${
                  viewMode === "week"
                    ? "bg-[#14b8a6] text-white"
                    : "bg-[#14b8a6] text-white opacity-70 hover:opacity-100"
                }`}
              >
                week
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-2 sm:px-6 pb-6 text-center">
            <p className="text-gray-500">Loading leads data...</p>
          </div>
        )}

        {/* Month View */}
        {!loading && viewMode === "month" && (
          <div className="px-2 sm:px-6 pb-6">
            <div className="bg-white rounded border border-gray-300 overflow-hidden">
              {/* Days Header */}
              <div className="grid grid-cols-7 bg-[#e5e7eb]">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center py-3 sm:py-4 text-xs sm:text-sm font-semibold text-[#6b7280] border-r border-b border-gray-300 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {days.map((dayInfo, index) => {
                  const dayLeads = getLeadsForDate(dayInfo.date);
                  const leadsCount = dayLeads.length;
                  const today = isToday(dayInfo.date);
                  const isLastColumn = (index + 1) % 7 === 0;

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] sm:min-h-[120px] lg:min-h-[140px] border-b border-gray-300 p-2 sm:p-3 ${
                        !isLastColumn ? "border-r border-gray-300" : ""
                      } ${
                        !dayInfo.isCurrentMonth ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-50 transition-colors relative cursor-pointer`}
                      title={
                        leadsCount > 0 ? `${leadsCount} leads scheduled` : ""
                      }
                    >
                      <div className="flex flex-col h-full">
                        <div className="text-left">
                          {today ? (
                            <span className="inline-flex items-center justify-center text-white bg-[#ef4444] rounded-full w-7 h-7 sm:w-8 sm:h-8 text-sm sm:text-base font-normal">
                              {dayInfo.day}
                            </span>
                          ) : (
                            <span
                              className={`text-sm sm:text-base font-normal ${
                                !dayInfo.isCurrentMonth
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }`}
                            >
                              {dayInfo.day}
                            </span>
                          )}
                        </div>

                        {dayInfo.isCurrentMonth && leadsCount > 0 && (
                          <div className="mt-auto">
                            <div className="bg-[#334155] text-white text-xs sm:text-sm font-semibold rounded px-2 sm:px-3 py-1 sm:py-1.5 inline-block">
                              {leadsCount}
                            </div>
                            {/* Show lead names preview */}
                            <div className="mt-1 text-xs text-gray-600 truncate">
                              {dayLeads.slice(0, 2).map((lead, idx) => (
                                <div key={idx} className="truncate">
                                  {lead.firstName} {lead.lastName}
                                </div>
                              ))}
                              {leadsCount > 2 && (
                                <div className="text-gray-500">
                                  +{leadsCount - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Week View */}
        {!loading && viewMode === "week" && (
          <div className="px-2 sm:px-6 pb-6">
            <div className="bg-white rounded border border-gray-300 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  {/* Week Header - Days */}
                  <div className="grid grid-cols-8 bg-[#e5e7eb] border-b border-gray-300">
                    <div className="bg-[#e5e7eb] border-r border-gray-300"></div>
                    {weekDays.map((day, dayIndex) => {
                      const dayLeads = getLeadsForDate(day);
                      return (
                        <div
                          key={dayIndex}
                          className="text-center min-h-[50px] sm:min-h-[60px] p-2 border-r border-gray-300 bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
                        >
                          <div className="text-xs sm:text-sm font-normal text-gray-700">
                            {fullDaysOfWeek[day.getDay()]} {day.getMonth() + 1}/
                            {day.getDate()}
                          </div>
                          {dayLeads.length > 0 && (
                            <div className="text-xs text-[#334155] font-semibold mt-1">
                              ({dayLeads.length} leads)
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* All-day Row */}
                  <div className="grid grid-cols-8 border-b border-gray-300">
                    <div className="bg-[#e5e7eb] text-left py-2 sm:py-3 px-2 text-xs sm:text-sm font-normal text-gray-600 border-r border-gray-300">
                      all-day
                    </div>
                    {weekDays.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="min-h-[40px] sm:min-h-[50px] p-2 border-r border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                      ></div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="overflow-y-auto max-h-[500px]">
                    {timeSlots.map((time, timeIndex) => (
                      <div
                        key={timeIndex}
                        className="grid grid-cols-8 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <div className="text-left py-4 px-2 text-xs sm:text-sm text-gray-600 border-r border-gray-300 bg-gray-50">
                          {time}
                        </div>
                        {weekDays.map((day, dayIndex) => {
                          const timeLeads = getLeadsForDateTime(day, time);
                          return (
                            <div
                              key={dayIndex}
                              className="min-h-[60px] p-2 border-r border-gray-300 bg-white hover:bg-blue-50 transition-colors cursor-pointer relative"
                              onClick={() => handleTimeSlotClick(day, time)}
                            >
                              {timeLeads.length > 0 && (
                                <div className="bg-[#3b82f6] text-white text-xs rounded p-1 mb-1">
                                  <div className="font-semibold">
                                    {timeLeads.length} lead
                                    {timeLeads.length > 1 ? "s" : ""}
                                  </div>
                                  <div className="truncate">
                                    {timeLeads[0].firstName}{" "}
                                    {timeLeads[0].lastName}
                                  </div>
                                  {timeLeads.length > 1 && (
                                    <div className="text-[10px]">
                                      +{timeLeads.length - 1} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Time Slot Details */}
      {selectedTimeSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* HEADER */}
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-xl font-semibold text-slate-800">
                  Leads for{" "}
                  <span className="text-indigo-600 font-bold">
                    {selectedTimeSlot.day.toLocaleDateString()}
                  </span>{" "}
                  at{" "}
                  <span className="text-sky-600 font-bold">
                    {selectedTimeSlot.time}
                  </span>
                </h3>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl transition cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* LEADS LIST */}
              <div className="space-y-4">
                {selectedTimeSlot.leads.map((lead, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition"
                  >
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-slate-700">
                        <span className="text-slate-500 font-medium">
                          Name:
                        </span>{" "}
                        <span className="font-semibold text-slate-800">
                          {lead.firstName} {lead.lastName}
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <span className="text-slate-500 font-medium">
                          Company:
                        </span>{" "}
                        <span className="font-semibold">
                          {lead.company || "N/A"}
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <span className="text-slate-500 font-medium">
                          Phone:
                        </span>{" "}
                        <span className="font-semibold">
                          {lead.phone || "N/A"}
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <span className="text-slate-500 font-medium">
                          Email:
                        </span>{" "}
                        <span className="font-semibold text-sky-700">
                          {lead.email || "N/A"}
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <span className="text-slate-500 font-medium">
                          Status:
                        </span>
                        <span
                          className={`ml-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${
                            lead.leadStatus === "Open"
                              ? "bg-emerald-500"
                              : lead.leadStatus === "Closed"
                              ? "bg-indigo-600"
                              : "bg-gray-400"
                          }`}
                        >
                          {lead.leadStatus}
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <span className="text-slate-500 font-medium">
                          Product:
                        </span>{" "}
                        <span className="font-semibold text-indigo-700">
                          {lead.product || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-6 text-right">
                <button
                  onClick={closeModal}
                  className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-6 py-2 rounded-md font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsCalendar;