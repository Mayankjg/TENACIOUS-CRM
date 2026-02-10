"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiGet } from "@/utils/api";

// Types
interface Salesperson {
  _id: string;
  id?: string | number;
  username: string;
  firstname: string;
  lastname: string;
  email?: string;
  designation?: string;
  contact?: string;
}

interface Comment {
  _id?: string;
  text: string;
  createdAt: string;
  addedBy?: string;
  addedByName?: string;
}

interface Lead {
  _id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  city?: string;
  leadStatus?: string;
  createdAt?: string;
  dueDate?: string;
  assignedTo?: string;
  assignedToName?: string;
  comment?: string;
  comments?: Comment[];
  [key: string]: any;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
}

interface DatePickerCustomProps {
  label: string;
  date: Date | null;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  setDate: (date: Date | null) => void;
}

interface CalendarUIProps {
  date: Date;
  setDate: (date: Date) => void;
  setShowCalendar: (show: boolean) => void;
}

const CommentsBySalesPersonList: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>("All");
  const [showFromCalendar, setShowFromCalendar] = useState<boolean>(false);
  const [showToCalendar, setShowToCalendar] = useState<boolean>(false);
  
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch salespersons dynamically
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        console.log("🔄 Fetching salespersons...");
        
        const result = await apiGet("/api/salespersons/get-salespersons");
        
        if (result.success && result.data) {
          setSalespersons(result.data);
          console.log("✅ Salespersons fetched:", result.data.length);
        } else {
          console.error("❌ Failed to fetch salespersons:", result.error);
          setSalespersons([]);
        }
      } catch (error) {
        console.error("❌ Error fetching salespersons:", error);
        setSalespersons([]);
      }
    };
    
    fetchSalespersons();
  }, []);

  // Fetch leads with comments
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching leads with comments...");
        
        const result = await apiGet("/api/leads/get-leads");
        
        if (result.success && result.data) {
          const leadsData = result.data;
          console.log("✅ Raw leads data:", leadsData.length);
          
          const processedLeads = leadsData.map((lead: Lead) => {
            if (lead.comment && !lead.comments) {
              return {
                ...lead,
                comments: [{
                  _id: `${lead._id}-comment-1`,
                  text: lead.comment,
                  createdAt: lead.createdAt || new Date().toISOString(),
                  addedBy: lead.assignedTo,
                  addedByName: lead.assignedToName || "Unknown"
                }]
              };
            }
            return lead;
          });
          
          const leadsWithComments = processedLeads.filter(
            (lead: Lead) => {
              const hasComments = (lead.comments && lead.comments.length > 0) || 
                                 (lead.comment && lead.comment.trim() !== "");
              return hasComments;
            }
          );
          
          setLeads(leadsWithComments);
          setFilteredLeads(leadsWithComments);
          console.log("✅ Leads with comments:", leadsWithComments.length);
        } else {
          console.error("❌ Failed to fetch leads:", result.error);
          setLeads([]);
          setFilteredLeads([]);
        }
      } catch (error: any) {
        console.error("❌ Error fetching leads:", error);
        setLeads([]);
        setFilteredLeads([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

  // Handle search/filter
  const handleSearch = (): void => {
    console.log("🔍 Filter Applied:", selectedSalesPerson, fromDate, toDate);
    
    let filtered = [...leads];

    if (selectedSalesPerson && selectedSalesPerson !== "All") {
      filtered = filtered.filter((lead) => {
        if (lead.assignedTo === selectedSalesPerson) {
          return true;
        }
        
        if (lead.comments) {
          return lead.comments.some(
            (comment) => comment.addedBy === selectedSalesPerson
          );
        }
        
        return false;
      });
    }

    if (fromDate || toDate) {
      filtered = filtered.filter((lead) => {
        if (lead.comments && lead.comments.length > 0) {
          return lead.comments.some((comment) => {
            const commentDate = new Date(comment.createdAt);
            
            let matchesFrom = true;
            let matchesTo = true;
            
            if (fromDate) {
              const startOfDay = new Date(fromDate);
              startOfDay.setHours(0, 0, 0, 0);
              matchesFrom = commentDate >= startOfDay;
            }
            
            if (toDate) {
              const endOfDay = new Date(toDate);
              endOfDay.setHours(23, 59, 59, 999);
              matchesTo = commentDate <= endOfDay;
            }
            
            return matchesFrom && matchesTo;
          });
        }
        
        if (lead.createdAt) {
          const leadDate = new Date(lead.createdAt);
          let matchesFrom = true;
          let matchesTo = true;
          
          if (fromDate) {
            const startOfDay = new Date(fromDate);
            startOfDay.setHours(0, 0, 0, 0);
            matchesFrom = leadDate >= startOfDay;
          }
          
          if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            matchesTo = leadDate <= endOfDay;
          }
          
          return matchesFrom && matchesTo;
        }
        
        return false;
      });
    }

    setFilteredLeads(filtered);
    console.log("✅ Filtered results:", filtered.length);
  };

  // Reset filters
  const handleReset = (): void => {
    setSelectedSalesPerson("All");
    setFromDate(null);
    setToDate(null);
    setFilteredLeads(leads);
    console.log("🔄 Filters reset");
  };

  // Export to Excel
  const handleExport = (): void => {
    if (filteredLeads.length === 0) {
      return alert("No data to export!");
    }

    const rows: string[] = [];
    
    rows.push([
      "SR.NO.",
      "DATE",
      "CONTACT PERSON",
      "COMPANY",
      "DUE DATE",
      "LOCATION",
      "COMMENTS",
      "SALES PERSON",
    ].join(","));

    let serialNo = 1;
    filteredLeads.forEach((lead) => {
      const contactPerson = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
      const company = lead.company || "";
      const location = lead.city || "";
      
      if (lead.comments && lead.comments.length > 0) {
        lead.comments.forEach((comment) => {
          const commentDate = comment.createdAt
            ? new Date(comment.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const dueDate = lead.dueDate
            ? new Date(lead.dueDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const commentText = `${comment.text} - By ${comment.addedByName || "Unknown"}`;
          const salesPerson = comment.addedByName || lead.assignedToName || "Unknown";

          rows.push([
            serialNo,
            `"${commentDate}"`,
            `"${contactPerson}"`,
            `"${company}"`,
            `"${dueDate}"`,
            `"${location}"`,
            `"${commentText}"`,
            `"${salesPerson}"`,
          ].join(","));

          serialNo++;
        });
      }
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "comments_by_salesperson.csv";
    a.click();

    window.URL.revokeObjectURL(url);
    console.log("✅ Export completed");
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  const getSalespersonId = (person: Salesperson): string => {
    return person._id || String(person.id) || "";
  };

  const generateTableRows = () => {
    const rows: React.ReactNode[] = [];
    let serialNo = 1;

    filteredLeads.forEach((lead) => {
      const contactPerson = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "-";
      const company = lead.company || "-";
      const location = lead.city || "-";
      const dueDate = formatDate(lead.dueDate || lead.createdAt);

      if (lead.comments && lead.comments.length > 0) {
        lead.comments.forEach((comment, commentIdx) => {
          const commentDate = formatDate(comment.createdAt);
          const salesPersonName = comment.addedByName || lead.assignedToName || "-";

          rows.push(
            <tr
              key={`${lead._id}-comment-${commentIdx}-${serialNo}`}
              className="hover:bg-gray-50 border-b text-gray-700"
            >
              <td className="py-2 px-4">{serialNo}</td>
              <td className="py-2 px-4">{commentDate}</td>
              <td className="py-2 px-4">{contactPerson}</td>
              <td className="py-2 px-4">{company}</td>
              <td className="py-2 px-4">{dueDate}</td>
              <td className="py-2 px-4">{location}</td>
              <td className="py-2 px-4 max-w-xs">
                <div className="whitespace-pre-wrap break-words">
                  {comment.text} - <span className="font-semibold">By {salesPersonName}</span>
                </div>
              </td>
              <td className="py-2 px-4">{salesPersonName}</td>
            </tr>
          );
          serialNo++;
        });
      }
    });

    return rows;
  };

  const getTotalCommentsCount = () => {
    return filteredLeads.reduce((total, lead) => {
      return total + (lead.comments?.length || 0);
    }, 0);
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
            disabled={filteredLeads.length === 0}
            className={`text-white text-sm font-semibold px-4 py-1.5 rounded shadow-sm transition ${
              filteredLeads.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#4B63A1] hover:bg-[#3B4F8C] cursor-pointer"
            }`}
          >
            Export To Excel
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between px-8 py-4 gap-4">
          {/* Left Filters */}
          <div className="flex items-center flex-wrap gap-6">
            {/* Sales Person Select */}
            <select
              value={selectedSalesPerson}
              onChange={(e) => setSelectedSalesPerson(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-80 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00AEEF]"
            >
              <option value="All">All Sales Person</option>
              {salespersons.map((person) => (
                <option key={getSalespersonId(person)} value={getSalespersonId(person)}>
                  {person.username} {person.designation ? `(${person.designation})` : ""}
                </option>
              ))}
            </select>

            {/* From Date - NEW CUSTOM CALENDAR */}
            <div className="w-full md:w-auto cursor-pointer">
              <DatePickerCustom
                label="From"
                date={fromDate}
                showCalendar={showFromCalendar}
                setShowCalendar={setShowFromCalendar}
                setDate={setFromDate}
              />
            </div>

            {/* To Date - NEW CUSTOM CALENDAR */}
            <div className="w-full md:w-auto cursor-pointer">
              <DatePickerCustom
                label="To"
                date={toDate}
                showCalendar={showToCalendar}
                setShowCalendar={setShowToCalendar}
                setDate={setToDate}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-[#00AEEF] text-white text-sm font-semibold px-8 py-2 rounded shadow-sm hover:bg-[#0095D9] transition"
            >
              Search
            </button>

            <button
              onClick={handleReset}
              className="bg-gray-500 text-white text-sm font-semibold px-6 py-2 rounded shadow-sm hover:bg-gray-600 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading comments...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="px-6 pb-6 overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-4 border-b font-semibold text-left">SR.NO.</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">DATE</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">
                    CONTACT PERSON
                  </th>
                  <th className="py-2 px-4 border-b font-semibold text-left">COMPANY</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">DUE DATE</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">LOCATION</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">COMMENTS</th>
                  <th className="py-2 px-4 border-b font-semibold text-left">
                    SALES PERSON
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.length > 0 ? (
                  generateTableRows()
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      {leads.length === 0
                        ? "No comments found in the system."
                        : "No comments match your search criteria. Try adjusting your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Info */}
        {!loading && filteredLeads.length > 0 && (
          <div className="px-6 pb-4 text-sm text-gray-600 flex justify-between items-center border-t pt-3">
            <span>
              Showing {getTotalCommentsCount()} comment(s) from {filteredLeads.length} lead(s)
            </span>
            <span className="text-xs text-gray-500">
              Note: Each row represents one comment
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsBySalesPersonList;

/* ------------------ CUSTOM DATE PICKER (UPDATED WITH CALENDAR FROM FIRST CODE) ------------------ */

function DatePickerCustom({ label, date, showCalendar, setShowCalendar, setDate }: DatePickerCustomProps) {
  const [currentMonth, setCurrentMonth] = useState(date || new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    if (date) {
      setCurrentMonth(date);
    }
  }, [date]);

  const handleCalendarButtonClick = () => {
    if (!date) {
      setDate(new Date());
      setCurrentMonth(new Date());
    }
    setShowCalendar(!showCalendar);
  };

  const daysInMonth = (dateObj: Date): CalendarDay[] => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray: CalendarDay[] = [];

    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      daysArray.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push({ day: i, isCurrentMonth: true });
    }

    const remainingDays = 42 - daysArray.length;
    for (let i = 1; i <= remainingDays; i++) {
      daysArray.push({ day: i, isCurrentMonth: false });
    }

    return daysArray;
  };

  const handleDateSelect = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const newDate = new Date(year, month, day);
    setDate(newDate);
    setShowCalendar(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setShowYearPicker(false);
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  return (
    <div className="flex items-center gap-2 relative w-full md:w-auto">
      <label className="text-gray-700 font-medium text-sm w-20">{label}</label>

      <div className="relative inline-block w-full md:w-auto">
        <input
          type="text"
          value={date ? date.toISOString().split("T")[0] : 'yyyy-mm-dd'}
          readOnly
          onClick={handleCalendarButtonClick}
          placeholder="yyyy-mm-dd"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm pr-12 cursor-pointer w-full md:w-[150px] text-gray-400"
        />

        <button
          type="button"
          onClick={handleCalendarButtonClick}
          className="absolute cursor-pointer right-0 top-0 h-full bg-blue-500 px-3 flex items-center justify-center rounded-r-md hover:bg-blue-600"
        >
          <Calendar className="text-white w-4 h-4" />
        </button>

        {showCalendar && (
          <>
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 w-50 z-[9999]">
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prevMonth} className="text-blue-500 hover:text-blue-700 w-7 h-7 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMonthPicker(!showMonthPicker);
                      setShowYearPicker(false);
                    }}
                    className="font-semibold text-gray-700 text-xs hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    {monthNames[currentMonth.getMonth()]}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowYearPicker(!showYearPicker);
                      setShowMonthPicker(false);
                    }}
                    className="font-semibold text-gray-700 text-xs hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    {currentMonth.getFullYear()}
                  </button>
                </div>

                <button type="button" onClick={nextMonth} className="text-blue-500 hover:text-blue-700 w-7 h-7 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Month Picker */}
              {showMonthPicker && (
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {fullMonthNames.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`py-1 px-1 text-[12px] rounded hover:bg-gray-200 ${
                        index === currentMonth.getMonth()
                          ? "bg-blue-500 text-white font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {/* Year Picker */}
              {showYearPicker && (
                <div className="max-h-[150px] overflow-y-auto mb-2">
                  <div className="grid grid-cols-4 gap-1">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`py-1 px-1 text-[12px] rounded hover:bg-gray-200 ${
                          year === currentMonth.getFullYear()
                            ? "bg-blue-500 text-white font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Picker */}
              {!showMonthPicker && !showYearPicker && (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-bold text-gray-600 py-0.5">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0">
                    {daysInMonth(currentMonth).map((item, index) => {
                      const isSelected = date && 
                        item.isCurrentMonth && 
                        item.day === date.getDate() && 
                        currentMonth.getMonth() === date.getMonth() && 
                        currentMonth.getFullYear() === date.getFullYear();

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateSelect(item.day, item.isCurrentMonth)}
                          className={`py-1 text-center rounded text-xs ${
                            !item.isCurrentMonth
                              ? 'text-gray-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-500 text-white font-bold'
                              : 'text-gray-700 hover:bg-blue-100 cursor-pointer'
                          }`}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => {
                setShowCalendar(false);
                setShowMonthPicker(false);
                setShowYearPicker(false);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}