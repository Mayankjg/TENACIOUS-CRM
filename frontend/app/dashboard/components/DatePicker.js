"use client";
import { FaCalendarAlt } from "react-icons/fa";

export default function DatePicker({
  label,
  date,
  showCalendar,
  setShowCalendar,
  setDate,
}) {
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
          </div>
        )}
      </div>
    </div>
  );
}
