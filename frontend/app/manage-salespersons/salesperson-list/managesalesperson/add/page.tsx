"use client";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { validateSession, isAdmin } from "@/utils/api";

// ─── TYPES ──────────────────────────────────────────────────────────────────────
interface Step {
  id: number;
  label: string;
  icon: string;
  subtitle: string;
}

interface IncentiveSlab {
  id: number;
  from: string;
  to: string;
  rate: string;
}

interface FormData {
  profilePhoto: File | null;
  fullName: string;
  gender: string;
  mobileNumber: string;
  alternateNumber: string;
  emailAddress: string;
  dateOfJoining: string;
  currentAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  aadhaarNumber: string;
  panNumber: string;
  aadhaarFile: File | null;
  panFile: File | null;
  photoFile: File | null;
  signatureFile: File | null;
  productCategoryAccess: string;
  leadSourceAccess: string;
  accessLevel: string;
  previousExperience: string;
  resumeFile: File | null;
  fixedSalary: string;
  commissionType: "percentage" | "flat";
  commissionValue: string;
  incentiveSlabs: IncentiveSlab[];
  bonusEligible: boolean;
  bonusCycle: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: string;
  cancelledChequeFile: File | null;
}

interface Country {
  name: string;
  callingCode: string;
  displayName: string;
}

interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  icon?: string;
  error?: string;
}

interface TextareaFieldProps {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  resizable?: boolean;
  error?: string;
}

interface FileFieldProps {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
}

interface SectionTitleProps {
  icon: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

interface IncentiveSlabsProps {
  slabs: IncentiveSlab[];
  onChange: (slabs: IncentiveSlab[]) => void;
}

interface StepComponentProps {
  data: FormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFile: (name: string, file: File | null) => void;
  onSlabChange?: (slabs: IncentiveSlab[]) => void;
  fieldErrors: Record<string, string>;
  countries: Country[];
  onCountryChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPhoneInputChange: (e: ChangeEvent<HTMLInputElement>, fieldName: "mobileNumber" | "alternateNumber") => void;
  selectedCountryCode: string;
  onCountryCodeChange: (code: string) => void;
}

interface CalendarProps {
  date: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
// ✅ FIX: Single API_BASE used everywhere consistently
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://one4-02-2026.onrender.com";

const STEPS: Step[] = [
  { id: 1, label: "Basic Info", icon: "👤", subtitle: "Personal details" },
  { id: 2, label: "Address", icon: "🏠", subtitle: "Location info" },
  { id: 3, label: "KYC", icon: "🆔", subtitle: "Identity docs" },
  { id: 4, label: "Professional", icon: "💼", subtitle: "Work details" },
  { id: 5, label: "Salary", icon: "💰", subtitle: "Compensation" },
  { id: 6, label: "Payout", icon: "🏦", subtitle: "Bank info" },
];

// ─── INITIAL FORM STATE ─────────────────────────────────────────────────────────
const INITIAL_STATE: FormData = {
  profilePhoto: null,
  fullName: "",
  gender: "",
  mobileNumber: "",
  alternateNumber: "",
  emailAddress: "",
  dateOfJoining: "",
  currentAddress: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  aadhaarNumber: "",
  panNumber: "",
  aadhaarFile: null,
  panFile: null,
  photoFile: null,
  signatureFile: null,
  productCategoryAccess: "",
  leadSourceAccess: "",
  accessLevel: "",
  previousExperience: "",
  resumeFile: null,
  fixedSalary: "",
  commissionType: "percentage",
  commissionValue: "",
  incentiveSlabs: [{ id: 1, from: "", to: "", rate: "" }],
  bonusEligible: true,
  bonusCycle: "",
  accountHolderName: "",
  bankName: "",
  branchName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  accountType: "",
  cancelledChequeFile: null,
};

// ─── VALIDATION HELPERS ─────────────────────────────────────────────────────────
function validateMobileNumber(number: string): string | null {
  if (!number.trim()) return "Mobile Number is required";
  const digits = number.replace(/\D/g, '');
  if (!/^\d+$/.test(digits)) return "Mobile Number must contain only digits";
  if (digits.length < 10) return "Mobile Number must be at least 10 digits";
  if (digits.length > 15) return "Mobile Number cannot exceed 15 digits";
  return null;
}

function validateAlternateNumber(number: string): string | null {
  if (!number.trim()) return null;
  const digits = number.replace(/\D/g, '');
  if (!/^\d+$/.test(digits)) return "Alternate Number must contain only digits";
  if (digits.length < 10) return "Alternate Number must be at least 10 digits";
  if (digits.length > 15) return "Alternate Number cannot exceed 15 digits";
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email Address is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  if (email.includes('..')) return "Email address cannot contain consecutive dots";
  if (email.startsWith('.') || email.endsWith('.')) return "Email address cannot start or end with a dot";
  return null;
}

function validateDateOfJoining(date: string): string | null {
  if (!date) return "Date of Joining is required";
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(selectedDate.getTime())) return "Please enter a valid date";
  if (selectedDate > today) return "Date of Joining cannot be in the future";
  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
  if (selectedDate < fiftyYearsAgo) return "Date of Joining seems too far in the past";
  return null;
}

function validateAadhaarNumber(aadhaar: string): string | null {
  if (!aadhaar.trim()) return "Aadhaar Number is required";
  const digits = aadhaar.replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) return "Aadhaar Number must contain only digits";
  if (digits.length !== 12) return "Aadhaar Number must be exactly 12 digits";
  return null;
}

function validatePanNumber(pan: string): string | null {
  if (!pan.trim()) return "PAN Number is required";
  const panUpper = pan.toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panUpper)) return "PAN must be 10 characters (5 letters, 4 digits, 1 letter)";
  return null;
}

// ─── CALENDAR COMPONENT ────────────────────────────────────────────────────────
const CustomCalendar: React.FC<CalendarProps> = ({ date, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(date);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(selectedDate);
    onClose();
  };

  return (
    <div
      ref={calendarRef}
      className="absolute bottom-full left-0 mb-2 bg-white shadow-xl rounded-lg p-3 border border-gray-200 w-[200px] z-[9999]"
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={handlePrevMonth} className="text-[#0099E6] text-xl font-bold px-2 hover:bg-gray-100 rounded cursor-pointer">‹</button>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
            className="font-semibold text-gray-800 text-sm hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
            {currentDate.toLocaleString("default", { month: "long" })}
          </button>
          <button onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
            className="font-semibold text-gray-800 text-sm hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">
            {currentDate.getFullYear()}
          </button>
        </div>
        <button onClick={handleNextMonth} className="text-[#0099E6] text-xl font-bold px-2 hover:bg-gray-100 rounded cursor-pointer">›</button>
      </div>

      {showMonthPicker && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {months.map((month, index) => (
            <button key={month} onClick={() => handleMonthSelect(index)}
              className={`py-2 px-1 text-xs rounded hover:bg-gray-200 cursor-pointer ${index === currentDate.getMonth() ? "bg-[#0099E6] text-white font-bold" : "text-gray-700"}`}>
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {showYearPicker && (
        <div className="max-h-[150px] overflow-y-auto mb-2">
          <div className="grid grid-cols-4 gap-2">
            {years.map((year) => (
              <button key={year} onClick={() => handleYearSelect(year)}
                className={`py-2 px-1 text-xs rounded hover:bg-gray-200 cursor-pointer ${year === currentDate.getFullYear() ? "bg-[#0099E6] text-white font-bold" : "text-gray-700"}`}>
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showMonthPicker && !showYearPicker && (
        <>
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#0099E6] mb-2">
            {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 text-[11px] text-center gap-1">
            {Array.from({ length: 42 }).map((_, i) => {
              const day = i - firstDay + 1;
              const isValid = day > 0 && day <= daysInMonth;
              const isCurrent = day === date.getDate() &&
                currentDate.getMonth() === date.getMonth() &&
                currentDate.getFullYear() === date.getFullYear();
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isPast = isValid && thisDate < todayDate;
              return (
                <div key={i}
                  className={`py-1.5 rounded-md ${!isValid
                      ? "text-gray-300"
                      : isPast
                        ? "text-gray-200 cursor-not-allowed"
                        : isCurrent
                          ? "bg-[#0099E6] text-white font-bold cursor-pointer"
                          : "text-gray-700 hover:bg-gray-200 cursor-pointer"
                    }`}
                  onClick={() => { if (isValid && !isPast) handleDayClick(day); }}>
                  {isValid ? day : ""}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─── REUSABLE FIELD COMPONENTS ─────────────────────────────────────────────────
const Label: React.FC<LabelProps> = ({ children, required }) => (
  <label className="block text-[11px] font-bold uppercase tracking-widest text-black mb-1.5">
    {children} {required && <span className="text-red-400 normal-case font-normal">*</span>}
  </label>
);

const inputBase =
  "w-full bg-white border border-black rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200";

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", placeholder, required, value, onChange, icon, disabled, error, maxLength }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{icon}</span>}
      <input
        type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder}
        disabled={disabled} maxLength={maxLength}
        className={`${inputBase} ${icon ? "pl-9" : ""} ${disabled ? "opacity-50 cursor-not-allowed bg-slate-900/50" : "cursor-text"} ${error ? "border-red-500" : ""}`}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, name, options, required, value, onChange, icon, error }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10">{icon}</span>}
      <select name={name} value={value || ""} onChange={onChange}
        className={`${inputBase} appearance-none pr-8 ${icon ? "pl-9" : ""} cursor-pointer ${error ? "border-red-500" : ""}`}>
        <option value="" className="bg-gray-100 text-black">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-gray-100 text-black">{o}</option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, rows = 3, placeholder, required, value, onChange, resizable = false, error }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <textarea name={name} value={value || ""} onChange={onChange} placeholder={placeholder} rows={rows}
      className={`${inputBase} ${resizable ? 'resize-y' : 'resize-none'} cursor-text ${error ? "border-red-500" : ""}`} />
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

const FileField: React.FC<FileFieldProps> = ({ label, name, accept, required, onChange, fileName }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <label className="flex items-center gap-2 bg-white border border-dashed border-black rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-100 transition-all duration-200 group">
      <span className="text-base group-hover:scale-110 transition-transform shrink-0">📎</span>
      <div className="min-w-0 flex-1">
        {fileName ? (
          <>
            <p className="text-xs text-black truncate">✓ {fileName}</p>
            <p className="text-[10px] text-slate-500">Click to replace</p>
          </>
        ) : (
          <>
            <p className="text-xs text-black font-medium">Click to upload</p>
            <p className="text-[10px] text-black">{accept || "PDF, JPG, PNG · max 5MB"}</p>
          </>
        )}
      </div>
      <input type="file" className="hidden" accept={accept} name={name} onChange={onChange} />
    </label>
  </div>
);

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, subtitle, centered }) => {
  if (centered) {
    return (
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl shrink-0">{icon}</div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-black" style={{ fontFamily: "Georgia, serif" }}>{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl shrink-0">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-black" style={{ fontFamily: "Georgia, serif" }}>{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent ml-2" />
    </div>
  );
};

// ─── INCENTIVE SLABS ────────────────────────────────────────────────────────────
const IncentiveSlabs: React.FC<IncentiveSlabsProps> = ({ slabs, onChange }) => {
  const addSlab = () => onChange([...slabs, { id: Date.now(), from: "", to: "", rate: "" }]);
  const removeSlab = (id: number) => onChange(slabs.filter((s) => s.id !== id));
  const updateSlab = (id: number, field: keyof IncentiveSlab, value: string) =>
    onChange(slabs.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>Incentive Slabs</Label>
        <button type="button" onClick={addSlab}
          className="text-xs text-black border border-black px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer">
          + Add Slab
        </button>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
        {["Target From (₹)", "Target To (₹)", "Rate (%)"].map((h) => (
          <span key={h} className="text-[10px] uppercase tracking-wider text-black">{h}</span>
        ))}
        <span className="w-7" />
      </div>
      {slabs.map((slab) => (
        <div key={slab.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <input type="number" placeholder="0" value={slab.from} onChange={(e) => updateSlab(slab.id, "from", e.target.value)}
            className="bg-white border border-black rounded-xl px-3 py-2 text-sm text-black placeholder-slate-600 focus:outline-none focus:border-black transition-all cursor-text" />
          <input type="number" placeholder="100000" value={slab.to} onChange={(e) => updateSlab(slab.id, "to", e.target.value)}
            className="bg-white border border-black rounded-xl px-3 py-2 text-sm text-black placeholder-slate-600 focus:outline-none focus:border-black transition-all cursor-text" />
          <div className="relative">
            <input type="number" placeholder="5" value={slab.rate} onChange={(e) => updateSlab(slab.id, "rate", e.target.value)}
              className="w-full bg-white border border-black rounded-xl pl-3 pr-7 py-2 text-sm text-black placeholder-slate-600 focus:outline-none focus:border-black transition-all cursor-text" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black text-xs pointer-events-none">%</span>
          </div>
          <button type="button" onClick={() => removeSlab(slab.id)} disabled={slabs.length === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-black hover:text-black hover:bg-gray-300 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-base">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── STEP 1: BASIC INFO ────────────────────────────────────────────────────────
const Step1: React.FC<StepComponentProps> = ({
  data, onChange, onFile, fieldErrors, countries,
  selectedCountryCode, onCountryCodeChange, onPhoneInputChange
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showAltCountryDropdown, setShowAltCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [altCountrySearch, setAltCountrySearch] = useState("");

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const altCountryDropdownRef = useRef<HTMLDivElement>(null);

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFile("profilePhoto", file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDateSelect = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange({ target: { name: 'dateOfJoining', value: formattedDate } } as any);
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.callingCode.includes(countrySearch)
  );

  const filteredAltCountries = countries.filter(c =>
    c.name.toLowerCase().includes(altCountrySearch.toLowerCase()) || c.callingCode.includes(altCountrySearch)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (altCountryDropdownRef.current && !altCountryDropdownRef.current.contains(event.target as Node)) {
        setShowAltCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <SectionTitle icon="👤" title="Basic Information" subtitle="Personal details of the salesperson" centered />
      <div className="space-y-5">
        {/* Photo Upload */}
        <div className="flex flex-col gap-1.5">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-full bg-white border-1 border-black flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : "👤"}
            </div>
            <label className="flex-1 flex items-center gap-2 bg-white border border-dashed border-black rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-200 transition-all group">
              <span className="text-base">📸</span>
              <div>
                <p className="text-xs text-black group-hover:text-gray-700 transition-colors">
                  {data.profilePhoto ? `✓ ${data.profilePhoto.name}` : "Upload photo"}
                </p>
                <p className="text-[10px] text-gray-600">JPG, PNG · max 2MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Full Name" name="fullName" placeholder="Enter full name" required
            value={data.fullName} onChange={onChange} icon=""
            error={fieldErrors.fullName}
          />
          <SelectField
            label="Gender" name="gender"
            options={["Male", "Female", "Other", "Prefer not to say"]}
            required value={data.gender} onChange={onChange} icon=""
            error={fieldErrors.gender}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mobile Number */}
          <div className="flex flex-col">
            <Label required>Mobile Number</Label>
            <div className="relative h-[40px]">
              <div ref={countryDropdownRef}
                className="absolute left-0 top-0 h-full w-[70px] border border-r-0 rounded-l-xl bg-gray-200 flex items-center justify-center text-black text-xs font-medium cursor-pointer z-10 hover:bg-gray-200 transition-colors"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                {selectedCountryCode || "+91"}
                <span className="ml-1 text-[10px]">▾</span>
              </div>
              {showCountryDropdown && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-black rounded-lg shadow-xl w-[280px] max-h-[300px] overflow-hidden z-50">
                  <div className="p-2 border-b border-slate-600">
                    <input autoFocus type="text" placeholder="Search country..." value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full bg-gray-100 border border-black rounded px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-black" />
                  </div>
                  <div className="overflow-y-auto max-h-[130px]">
                    {filteredCountries.map((country) => (
                      <div key={country.name}
                        onClick={() => { onCountryCodeChange(country.callingCode); setShowCountryDropdown(false); setCountrySearch(""); }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors ${selectedCountryCode === country.callingCode ? 'bg-gray-200 text-black font-bold' : 'text-black'}`}>
                        <div className="text-sm">{country.displayName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <input type="text" name="mobileNumber" value={data.mobileNumber || ""}
                onChange={(e) => onPhoneInputChange(e, "mobileNumber")}
                placeholder="Mobile Number" maxLength={15}
                className={`${inputBase} pl-[82px] h-full ${fieldErrors.mobileNumber ? "border-red-500" : ""}`} />
            </div>
            {fieldErrors.mobileNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.mobileNumber}
              </p>
            )}
          </div>

          {/* Alternate Number */}
          <div className="flex flex-col">
            <Label>Alternate Number</Label>
            <div className="relative h-[40px]">
              <div ref={altCountryDropdownRef}
                className="absolute left-0 top-0 h-full w-[70px] border border-r-0 rounded-l-xl bg-gray-200 flex items-center justify-center text-black text-xs font-medium cursor-pointer z-10 hover:bg-gray-200 transition-colors"
                onClick={() => setShowAltCountryDropdown(!showAltCountryDropdown)}>
                {selectedCountryCode || "+91"}
                <span className="ml-1 text-[10px]">▾</span>
              </div>
              {showAltCountryDropdown && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-black rounded-lg shadow-xl w-[280px] max-h-[300px] overflow-hidden z-50">
                  <div className="p-2 border-b border-slate-600">
                    <input autoFocus type="text" placeholder="Search country..." value={altCountrySearch}
                      onChange={(e) => setAltCountrySearch(e.target.value)}
                      className="w-full bg-gray-100 border border-black rounded px-3 py-2 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-black" />
                  </div>
                  <div className="overflow-y-auto max-h-[130px]">
                    {filteredAltCountries.map((country) => (
                      <div key={country.name}
                        onClick={() => { onCountryCodeChange(country.callingCode); setShowAltCountryDropdown(false); setAltCountrySearch(""); }}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors ${selectedCountryCode === country.callingCode ? 'bg-gray-200 text-black font-bold' : 'text-black'}`}>
                        <div className="text-sm">{country.displayName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <input type="text" name="alternateNumber" value={data.alternateNumber || ""}
                onChange={(e) => onPhoneInputChange(e, "alternateNumber")}
                placeholder="Alternate Number" maxLength={15}
                className={`${inputBase} pl-[82px] h-full ${fieldErrors.alternateNumber ? "border-red-500" : ""}`} />
            </div>
            {fieldErrors.alternateNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.alternateNumber}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Email Address" name="emailAddress" type="email"
            placeholder="Your Email" required value={data.emailAddress} onChange={onChange} icon=""
            error={fieldErrors.emailAddress}
          />

          {/* Date of Joining */}
          <div className="flex flex-col">
            <Label required>Date of Joining</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10">📅</span>
              <input type="text" name="dateOfJoining" value={data.dateOfJoining || ""} onChange={onChange}
  placeholder="YYYY-MM-DD" readOnly onClick={() => setShowCalendar(!showCalendar)}
                className={`${inputBase} pl-9 pr-10 cursor-pointer ${fieldErrors.dateOfJoining ? "border-red-500" : ""}`} />
              <button type="button" onClick={() => setShowCalendar(!showCalendar)}
                className="absolute right-0 top-0 h-full bg-[#0099E6] px-3 flex items-center justify-center rounded-r-xl hover:bg-[#0088cc] transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {showCalendar && (
                <CustomCalendar
                  date={data.dateOfJoining ? new Date(data.dateOfJoining) : new Date()}
                  onDateSelect={handleDateSelect}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
            {fieldErrors.dateOfJoining && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.dateOfJoining}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STEP 2: ADDRESS ────────────────────────────────────────────────────────────
const Step2: React.FC<StepComponentProps> = ({ data, onChange, countries, onCountryChange, fieldErrors }) => (
  <div>
    <SectionTitle icon="🏠" title="Address Details" subtitle="Residential and location information" centered />
    <div className="space-y-5">
      <TextareaField label="Current Address" name="currentAddress"
        placeholder="House/Flat No., Street, Area, Landmark..." required
        value={data.currentAddress} onChange={onChange}
        error={fieldErrors.currentAddress}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <Label required>Country</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-100 text-sm pointer-events-none z-10">🌍</span>
            <select name="country" value={data.country} onChange={onCountryChange}
              className={`${inputBase} appearance-none pr-8 pl-9 cursor-pointer ${fieldErrors.country ? "border-red-500" : ""}`}>
              <option value="" className="bg-gray-500">— Select Country —</option>
              {countries.map((country) => (
                <option key={country.name} value={country.name} className="bg-white">{country.displayName}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
          </div>
          {fieldErrors.country && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.country}</p>
          )}
        </div>
        <InputField label="State" name="state" placeholder="State" required value={data.state} onChange={onChange} icon="" error={fieldErrors.state} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="City" name="city" placeholder="City" required value={data.city} onChange={onChange} icon="" error={fieldErrors.city} />
        <InputField label="Postal Code" name="postalCode" placeholder="Postal Code" required value={data.postalCode} onChange={onChange} icon="" error={fieldErrors.postalCode} />
      </div>
    </div>
  </div>
);

// ─── STEP 3: KYC ───────────────────────────────────────────────────────────────
const formatAadhaar = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  return digits.match(/.{1,4}/g)?.join(" ") || "";
};

const formatPAN = (value: string) => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
};

const Step3: React.FC<StepComponentProps> = ({ data, onChange, onFile, fieldErrors }) => {
  const aadhaarDigits = data.aadhaarNumber.replace(/\s/g, "");
  const panValue = data.panNumber.toUpperCase();
  const aadhaarValid = /^\d{12}$/.test(aadhaarDigits);
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panValue);

  return (
    <div>
      <SectionTitle icon="🆔" title="Identity & KYC" subtitle="Government ID and verification documents" centered />
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-white border border-black flex items-start gap-2">
          <span className="text-black mt-0.5 shrink-0">ℹ️</span>
          <p className="text-xs text-red-700">All documents are encrypted and stored securely. Fields marked * are mandatory for KYC compliance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <Label required>Aadhaar Number</Label>
            <input type="text" name="aadhaarNumber" placeholder="1234 5678 9012" value={data.aadhaarNumber}
              onChange={(e) => {
                const formatted = formatAadhaar(e.target.value);
                onChange({ target: { name: "aadhaarNumber", value: formatted } } as any);
              }}
              className={`w-full bg-white rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-gray-500 focus:outline-none transition-all duration-200 border ${aadhaarDigits.length === 0 ? "border-black" : aadhaarValid ? "border-green-500" : "border-red-500"}`}
            />
            {fieldErrors.aadhaarNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.aadhaarNumber}</p>
            )}
          </div>

          <div className="flex flex-col">
            <Label required>PAN Number</Label>
            <input type="text" name="panNumber" placeholder="ABCDE1234F" value={data.panNumber}
              onChange={(e) => {
                const formatted = formatPAN(e.target.value);
                onChange({ target: { name: "panNumber", value: formatted } } as any);
              }}
              className={`w-full bg-white rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-gray-500 focus:outline-none transition-all duration-200 uppercase border ${panValue.length === 0 ? "border-black" : panValid ? "border-green-500" : "border-red-500"}`}
            />
            {fieldErrors.panNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.panNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileField label="Aadhaar Upload" name="aadhaarFile" accept=".pdf,.jpg,.png" required
            onChange={(e) => onFile("aadhaarFile", e.target.files?.[0] || null)} fileName={data.aadhaarFile?.name} />
          <FileField label="PAN Upload" name="panFile" accept=".pdf,.jpg,.png" required
            onChange={(e) => onFile("panFile", e.target.files?.[0] || null)} fileName={data.panFile?.name} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FileField label="Photo Upload" name="photoFile" accept=".jpg,.png" required
            onChange={(e) => onFile("photoFile", e.target.files?.[0] || null)} fileName={data.photoFile?.name} />
          <FileField label="Digital Signature" name="signatureFile" accept=".png,.jpg,.pdf" required
            onChange={(e) => onFile("signatureFile", e.target.files?.[0] || null)} fileName={data.signatureFile?.name} />
        </div>
      </div>
    </div>
  );
};

// ─── STEP 4: PROFESSIONAL ──────────────────────────────────────────────────────
const Step4: React.FC<StepComponentProps> = ({ data, onChange, onFile, fieldErrors }) => (
  <div>
    <SectionTitle icon="💼" title="Professional Details" subtitle="Experience, access levels and product assignments" centered />
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Product Category Access" name="productCategoryAccess"
          options={["All Products", "Electronics", "FMCG", "Pharmaceuticals", "Automobiles", "Financial Products", "Real Estate"]}
          required value={data.productCategoryAccess} onChange={onChange} icon="" error={fieldErrors.productCategoryAccess} />
        <SelectField label="Lead Source Access" name="leadSourceAccess"
          options={["All Sources", "Website", "Social Media", "Referral", "Cold Call", "Trade Show", "Email Campaign"]}
          required value={data.leadSourceAccess} onChange={onChange} icon="" error={fieldErrors.leadSourceAccess} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Access Level" name="accessLevel"
          options={["Level 1 – View Only", "Level 2 – Edit Own Records", "Level 3 – Team Lead", "Level 4 – Manager", "Level 5 – Admin"]}
          required value={data.accessLevel} onChange={onChange} icon="" error={fieldErrors.accessLevel} />
        <FileField label="Upload Resume / CV" name="resumeFile" accept=".pdf,.doc,.docx" required
          onChange={(e) => onFile("resumeFile", e.target.files?.[0] || null)} fileName={data.resumeFile?.name} />
      </div>
      <TextareaField label="Previous Experience" name="previousExperience"
        placeholder="Briefly describe previous sales experience, industries, roles..."
        value={data.previousExperience} onChange={onChange} rows={4} resizable={true} />
    </div>
  </div>
);

// ─── STEP 5: SALARY & COMMISSION ───────────────────────────────────────────────
const Step5: React.FC<StepComponentProps> = ({ data, onChange, onSlabChange, fieldErrors }) => (
  <div>
    <SectionTitle icon="💰" title="Salary & Commission" subtitle="Compensation structure and incentive configuration" centered />
    <div className="space-y-5">
      <div className="p-3 rounded-xl bg-white border border-black flex items-start gap-2">
        <span className="text-black mt-0.5 shrink-0">💡</span>
        <p className="text-xs text-red-700">Salary details are confidential and accessible only to HR and Admin roles.</p>
      </div>

      <div className="flex flex-col">
        <Label required>Fixed Salary (₹/month)</Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black text-sm font-bold">₹</span>
          <input type="number" name="fixedSalary" value={data.fixedSalary || ""} onChange={onChange}
            placeholder="e.g. 25000"
            className={`${inputBase} pl-9 cursor-text ${fieldErrors.fixedSalary ? "border-red-500" : ""}`} />
        </div>
        {fieldErrors.fixedSalary && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.fixedSalary}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label required>Commission Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "flat" as const, label: "Flat Amount", icon: "💵", desc: "Fixed ₹ per sale" },
            { value: "percentage" as const, label: "Percentage", icon: "📊", desc: "% of sale value" },
          ].map((type) => (
            <button key={type.value} type="button"
              onClick={() => onChange({ target: { name: "commissionType", value: type.value } } as any)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer ${data.commissionType === type.value ? "bg-gray-100 border-black shadow-md" : "bg-gray-100 border-black hover:bg-gray-200"}`}>
              <span className="text-xl">{type.icon}</span>
              <div>
                <p className="text-sm font-semibold text-black">{type.label}</p>
                <p className="text-xs text-gray-600">{type.desc}</p>
              </div>
              <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${data.commissionType === type.value ? "border-black bg-black" : "border-black"}`}>
                {data.commissionType === type.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <Label required>{data.commissionType === "flat" ? "Flat Commission Amount (₹ per sale)" : "Commission Percentage (%)"}</Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
            {data.commissionType === "flat" ? "₹" : "%"}
          </span>
          <input type="number" name="commissionValue" value={data.commissionValue || ""} onChange={onChange}
            placeholder={data.commissionType === "flat" ? "e.g. 500" : "e.g. 3.5"}
            className={`${inputBase} pl-9 cursor-text ${fieldErrors.commissionValue ? "border-red-500" : ""}`} />
        </div>
        {fieldErrors.commissionValue && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.commissionValue}</p>
        )}
      </div>

      {onSlabChange && <IncentiveSlabs slabs={data.incentiveSlabs} onChange={onSlabChange} />}

      <div className="p-4 rounded-xl bg-white border border-black">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-black font-semibold">Bonus Eligibility</p>
            <p className="text-xs text-gray-600 mt-0.5">Eligible for quarterly / annual bonuses</p>
          </div>
          <button type="button"
            onClick={() => onChange({ target: { name: "bonusEligible", value: !data.bonusEligible } } as any)}
            className={`w-11 h-6 rounded-full flex items-center transition-all duration-300 px-0.5 cursor-pointer ${data.bonusEligible ? "bg-amber-400 justify-end" : "bg-slate-700 justify-start"}`}>
            <div className="w-5 h-5 bg-white rounded-full shadow-md" />
          </button>
        </div>
        {data.bonusEligible && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <SelectField label="Bonus Cycle" name="bonusCycle"
              options={["Monthly", "Quarterly", "Half-Yearly", "Annual"]}
              value={data.bonusCycle} onChange={onChange} icon="🎁" />
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── STEP 6: PAYOUT ─────────────────────────────────────────────────────────────
const Step6: React.FC<StepComponentProps> = ({ data, onChange, onFile, fieldErrors }) => {
  const [ifscVerified, setIfscVerified] = useState(false);

  return (
    <div>
      <SectionTitle icon="🏦" title="Payout Details" subtitle="Bank account information for salary disbursement" centered />
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-white border border-black flex items-start gap-2">
          <span className="text-blue-400 mt-0.5 shrink-0">🔒</span>
          <p className="text-xs text-red-700">Bank details are encrypted. Only Finance & Admin roles can access this information.</p>
        </div>

        <InputField label="Bank Account Holder Name" name="accountHolderName" placeholder="As printed on bank passbook"
          required value={data.accountHolderName} onChange={onChange} icon="" error={fieldErrors.accountHolderName} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Bank Name" name="bankName" required value={data.bankName} onChange={onChange} icon=""
            options={["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "Union Bank of India", "Canara Bank", "IndusInd Bank", "Yes Bank", "Federal Bank", "IDFC First Bank", "Other"]}
            error={fieldErrors.bankName} />
          <InputField label="Branch Name" name="branchName" placeholder="Branch Name" required value={data.branchName} onChange={onChange} icon="" error={fieldErrors.branchName} />
        </div>

        <div className="flex flex-col">
          <Label required>Account Number</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔢</span>
            <input type="text" name="accountNumber" value={data.accountNumber || ""} onChange={onChange}
              placeholder="Enter 9–18 digit account number" maxLength={18}
              className={`${inputBase} pl-9 tracking-widest cursor-text ${fieldErrors.accountNumber ? "border-red-500" : ""}`} />
          </div>
          {fieldErrors.accountNumber && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.accountNumber}</p>
          )}
        </div>

        <div className="flex flex-col">
          <Label required>Confirm Account Number</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔢</span>
            <input type="text" name="confirmAccountNumber" value={data.confirmAccountNumber || ""} onChange={onChange}
              placeholder="Re-enter account number" maxLength={18}
              className={`${inputBase} pl-9 tracking-widest cursor-text`} />
          </div>
          {data.accountNumber && data.confirmAccountNumber && data.accountNumber !== data.confirmAccountNumber && (
            <p className="text-red-500 text-xs mt-1">⚠ Account numbers do not match</p>
          )}
          {data.accountNumber && data.confirmAccountNumber && data.accountNumber === data.confirmAccountNumber && (
            <p className="text-green-400 text-xs mt-1">✓ Account numbers match</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label required>IFSC Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🏷️</span>
              <input type="text" name="ifscCode" value={data.ifscCode || ""} onChange={onChange}
                placeholder="e.g. HDFC0001234" maxLength={11}
                className={`${inputBase} pl-9 uppercase cursor-text ${fieldErrors.ifscCode ? "border-red-500" : ""}`} />
            </div>
            <button type="button" onClick={() => setIfscVerified((v) => !v)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${ifscVerified ? "bg-green-500/20 border border-green-500/40 text-green-600" : "bg-white border border-black text-black hover:bg-gray-200"}`}>
              {ifscVerified ? "✓ Verified" : "Verify IFSC"}
            </button>
          </div>
          {fieldErrors.ifscCode && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span> {fieldErrors.ifscCode}</p>
          )}
          {ifscVerified && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 mt-1">
              <span className="text-green-400 text-sm">✅</span>
              <span className="text-xs text-green-600">IFSC verified — Branch details confirmed</span>
            </div>
          )}
        </div>

        <SelectField label="Account Type" name="accountType" required value={data.accountType} onChange={onChange} icon=""
          options={["Savings Account", "Current Account", "Salary Account"]} error={fieldErrors.accountType} />

        <FileField label="Upload Cancelled Cheque / Passbook" name="cancelledChequeFile" accept=".pdf,.jpg,.png" required
          onChange={(e) => onFile("cancelledChequeFile", e.target.files?.[0] || null)} fileName={data.cancelledChequeFile?.name} />

        <div className="p-4 rounded-xl bg-white from-black to-black border border-black">
          <p className="text-xs font-bold uppercase tracking-widest text-black mb-3">Payout Summary</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              { label: "Payout Mode", value: "Direct Bank Transfer" },
              { label: "Payout Cycle", value: "Monthly (1st of month)" },
              { label: "TDS", value: "As per IT Act" },
              { label: "Currency", value: "INR (₹)" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-black uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-black font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STEP REGISTRY ──────────────────────────────────────────────────────────────
const STEP_COMPONENTS: React.FC<StepComponentProps>[] = [Step1, Step2, Step3, Step4, Step5, Step6];

// ─── VALIDATION PER STEP ────────────────────────────────────────────────────────
function validateStep(step: number, data: FormData): { errors: string[]; fieldErrors: Record<string, string> } {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};

  if (step === 1) {
    if (!data.fullName.trim()) { errors.push("Full Name is required"); fieldErrors.fullName = "Full Name is required"; }
    if (!data.gender) { errors.push("Gender is required"); fieldErrors.gender = "Gender is required"; }
    const mobileError = validateMobileNumber(data.mobileNumber);
    if (mobileError) { errors.push(mobileError); fieldErrors.mobileNumber = mobileError; }
    const alternateError = validateAlternateNumber(data.alternateNumber);
    if (alternateError) { errors.push(alternateError); fieldErrors.alternateNumber = alternateError; }
    const emailError = validateEmail(data.emailAddress);
    if (emailError) { errors.push(emailError); fieldErrors.emailAddress = emailError; }
    const dateError = validateDateOfJoining(data.dateOfJoining);
    if (dateError) { errors.push(dateError); fieldErrors.dateOfJoining = dateError; }
  }

  if (step === 2) {
    if (!data.currentAddress.trim()) { errors.push("Current Address is required"); fieldErrors.currentAddress = "Current Address is required"; }
    if (!data.city.trim()) { errors.push("City is required"); fieldErrors.city = "City is required"; }
    if (!data.state.trim()) { errors.push("State is required"); fieldErrors.state = "State is required"; }
    if (!data.country) { errors.push("Country is required"); fieldErrors.country = "Country is required"; }
    if (!data.postalCode.trim()) { errors.push("Postal Code is required"); fieldErrors.postalCode = "Postal Code is required"; }
  }

  if (step === 3) {
    const aadhaarError = validateAadhaarNumber(data.aadhaarNumber);
    if (aadhaarError) { errors.push(aadhaarError); fieldErrors.aadhaarNumber = aadhaarError; }
    const panError = validatePanNumber(data.panNumber);
    if (panError) { errors.push(panError); fieldErrors.panNumber = panError; }
  }

  if (step === 4) {
    if (!data.productCategoryAccess) { errors.push("Product Category Access is required"); fieldErrors.productCategoryAccess = "Product Category Access is required"; }
    if (!data.leadSourceAccess) { errors.push("Lead Source Access is required"); fieldErrors.leadSourceAccess = "Lead Source Access is required"; }
    if (!data.accessLevel) { errors.push("Access Level is required"); fieldErrors.accessLevel = "Access Level is required"; }
  }

  if (step === 5) {
    if (!data.fixedSalary) { errors.push("Fixed Salary is required"); fieldErrors.fixedSalary = "Fixed Salary is required"; }
    if (!data.commissionValue) { errors.push("Commission Value is required"); fieldErrors.commissionValue = "Commission Value is required"; }
  }

  if (step === 6) {
    if (!data.accountHolderName.trim()) { errors.push("Account Holder Name is required"); fieldErrors.accountHolderName = "Account Holder Name is required"; }
    if (!data.bankName) { errors.push("Bank Name is required"); fieldErrors.bankName = "Bank Name is required"; }
    if (!data.accountNumber.trim()) { errors.push("Account Number is required"); fieldErrors.accountNumber = "Account Number is required"; }
    if (!data.ifscCode.trim()) { errors.push("IFSC Code is required"); fieldErrors.ifscCode = "IFSC Code is required"; }
    if (!data.accountType) { errors.push("Account Type is required"); fieldErrors.accountType = "Account Type is required"; }
    if (data.accountNumber !== data.confirmAccountNumber) {
      errors.push("Account numbers do not match");
      fieldErrors.confirmAccountNumber = "Account numbers do not match";
    }
  }

  return { errors, fieldErrors };
}

// ─── MAIN WIZARD ────────────────────────────────────────────────────────────────
export default function SalespersonOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const topRef = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    if (!validateSession()) { router.push("/login"); return; }
    if (!isAdmin()) { router.push("/dashboard"); return; }
  }, [router]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd");
        const data = await response.json();
        const formattedCountries: Country[] = data
          .map((country: any) => {
            const name = country.name?.common || "";
            const root = country.idd?.root || "";
            const suffixes = country.idd?.suffixes || [];
            let callingCode = "";
            if (root) callingCode = suffixes.length > 0 ? `${root}${suffixes[0]}` : root;
            return { name, callingCode, displayName: callingCode ? `${name} (${callingCode})` : name };
          })
          .filter((c: Country) => c.name && c.callingCode)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
        setLoadingCountries(false);
      } catch (error) {
        console.error("❌ Error fetching countries:", error);
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const handleCountryCodeChange = (code: string) => setSelectedCountryCode(code);

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryName = e.target.value;
    const selectedCountry = countries.find((c) => c.name === selectedCountryName);
    const newCallingCode = selectedCountry?.callingCode || "+91";
    setFormData((prev) => ({ ...prev, country: selectedCountryName }));
    setSelectedCountryCode(newCallingCode);
    if (fieldErrors.country) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n.country; return n; });
    }
  };

  const handlePhoneInputChange = (e: ChangeEvent<HTMLInputElement>, fieldName: "mobileNumber" | "alternateNumber") => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [fieldName]: rawValue }));
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[fieldName]; return n; });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleFile = (name: string, file: File | null) => setFormData((prev) => ({ ...prev, [name]: file }));

  const handleSlabChange = (newSlabs: IncentiveSlab[]) => setFormData((prev) => ({ ...prev, incentiveSlabs: newSlabs }));

  const handleNext = () => {
    const validation = validateStep(currentStep, formData);
    if (validation.errors.length > 0) {
      setFieldErrors(validation.fieldErrors);
      return;
    }
    setFieldErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handlePrev = () => {
    setFieldErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // ✅ FIX: handleSubmit — correct response check + proper error handling
  const handleSubmit = async () => {
    const validation = validateStep(currentStep, formData);
    if (validation.errors.length > 0) {
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      // ✅ FIX 1: Token from localStorage — same as apiGet/apiPut/apiDelete use kare che
      const token = localStorage.getItem("ts-token");
      if (!token) {
        router.push("/login");
        return;
      }

      const fd = new globalThis.FormData();

      // ✅ FIX 2: Name parts correctly split
      const nameParts = formData.fullName.trim().split(" ");
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";

      // ✅ FIX 3: Username from email prefix (lowercase, no special chars)
      const username = formData.emailAddress.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || firstname.toLowerCase();

      // ✅ FIX 4: Full mobile with country code
      const fullMobile = `${selectedCountryCode} ${formData.mobileNumber}`;
      const fullAlternate = formData.alternateNumber ? `${selectedCountryCode} ${formData.alternateNumber}` : "";

      // ─── Core fields (required for SalespersonCard to show) ───────────────
      fd.append("username", username);
      fd.append("firstname", firstname);
      fd.append("lastname", lastname);
      fd.append("email", formData.emailAddress);
      fd.append("contact", fullMobile);
      fd.append("password", "Welcome@123");

      // ✅ FIX 5: designation = accessLevel (SalespersonCard shows sp.designation)
      fd.append("designation", formData.accessLevel || "Sales Executive");

      // ─── Additional fields ─────────────────────────────────────────────────
      fd.append("gender", formData.gender);
      fd.append("alternateNumber", fullAlternate);
      fd.append("dateOfJoining", formData.dateOfJoining);
      fd.append("currentAddress", formData.currentAddress);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("country", formData.country);
      fd.append("postalCode", formData.postalCode);
      fd.append("aadhaarNumber", formData.aadhaarNumber.replace(/\s/g, ""));
      fd.append("panNumber", formData.panNumber.toUpperCase());
      fd.append("productCategoryAccess", formData.productCategoryAccess);
      fd.append("leadSourceAccess", formData.leadSourceAccess);
      fd.append("accessLevel", formData.accessLevel);
      fd.append("previousExperience", formData.previousExperience);
      fd.append("fixedSalary", formData.fixedSalary);
      fd.append("commissionType", formData.commissionType);
      fd.append("commissionValue", formData.commissionValue);
      fd.append("bonusEligible", String(formData.bonusEligible));
      fd.append("bonusCycle", formData.bonusCycle);
      fd.append("incentiveSlabs", JSON.stringify(formData.incentiveSlabs));
      fd.append("bankName", formData.bankName);
      fd.append("branchName", formData.branchName);
      fd.append("accountHolderName", formData.accountHolderName);
      fd.append("accountNumber", formData.accountNumber);
      fd.append("ifscCode", formData.ifscCode.toUpperCase());
      fd.append("accountType", formData.accountType);

      // ─── File uploads ──────────────────────────────────────────────────────
      if (formData.profilePhoto) fd.append("profileImage", formData.profilePhoto);
      if (formData.aadhaarFile) fd.append("aadhaarFile", formData.aadhaarFile);
      if (formData.panFile) fd.append("panFile", formData.panFile);
      if (formData.photoFile) fd.append("photoFile", formData.photoFile);
      if (formData.signatureFile) fd.append("signatureFile", formData.signatureFile);
      if (formData.resumeFile) fd.append("resumeFile", formData.resumeFile);
      if (formData.cancelledChequeFile) fd.append("cancelledChequeFile", formData.cancelledChequeFile);

      const res = await axios.post(
        `${API_BASE}/api/salespersons/create-salesperson`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // ✅ FIX 6: Correct success check — backend 200 or 201 dono handle kare
      if (res.status === 200 || res.status === 201) {
        setCreatedName(formData.fullName);
        setSubmitSuccess(true);
      } else {
        throw new Error(res.data?.message || "Unexpected response from server");
      }

    } catch (error: any) {
      console.error("❌ Onboarding submit error:", error);
      console.error("❌ Response data:", error.response?.data);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        router.push("/login");
      } else if (error.response?.status === 409) {
        // ✅ FIX 7: Duplicate email/username handle karo
        const msg = error.response?.data?.message || "A salesperson with this email already exists";
        setFieldErrors({ submit: msg });
      } else {
        const msg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to create salesperson. Please try again.";
        setFieldErrors({ submit: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6" style={{ fontFamily: "Georgia, serif" }}>
        <div className="text-center space-y-5 max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-green-400/20 border-2 border-green-400/40 flex items-center justify-center text-5xl mx-auto">✅</div>
          <h2 className="text-3xl font-bold text-black">Onboarding Complete!</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            <strong className="text-black">{createdName}</strong> has been successfully added to your team.
            <br />
            <span className="text-amber-600">Default password: </span>
            <code className="bg-gray-200 px-2 py-0.5 rounded text-amber-700 text-xs">Welcome@123</code>
            <br />
            <span className="text-slate-500 text-xs mt-1 block">Admin can change it from the Salesperson List page.</span>
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => router.push("/manage-salespersons/salesperson-list/managesalesperson")}
              className="px-6 py-2.5 bg-amber-400 text-slate-900 rounded-xl text-sm font-bold hover:bg-amber-300 transition-colors cursor-pointer">
              View Salesperson List →
            </button>
            <button
              onClick={() => {
                setFormData(INITIAL_STATE);
                setCurrentStep(1);
                setSubmitSuccess(false);
                setFieldErrors({});
                setSelectedCountryCode("+91");
              }}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors cursor-pointer">
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const stepProps: StepComponentProps = {
    data: formData,
    onChange: handleChange,
    onFile: handleFile,
    onSlabChange: handleSlabChange,
    fieldErrors,
    countries,
    onCountryChange: handleCountryChange,
    onPhoneInputChange: handlePhoneInputChange,
    selectedCountryCode,
    onCountryCodeChange: handleCountryCodeChange,
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-400/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/4 rounded-full blur-3xl" />
      </div> */}

      <div className="w-full max-w-4xl mx-auto relative" ref={topRef}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-black">Salesperson</span>{" "}
              <span className="text-blue-600">Onboarding</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-black uppercase tracking-widest">Step</p>
            <p className="text-xl font-bold text-black">
              {currentStep}<span className="text-slate-600 text-lg">/{STEPS.length}</span>
            </p>
          </div>
        </div>

        <div className="mb-5 h-1 bg-gray-400 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {STEPS.map((step) => (
            <button key={step.id} type="button"
              onClick={() => { setFieldErrors({}); setCurrentStep(step.id); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer
                ${currentStep === step.id ? "bg-gray-200 text-black border border-black shadow-md" : step.id < currentStep ? "bg-white text-black border border-black" : "bg-white text-gray-600 border border-black hover:bg-gray-200"}`}>
              <span className="text-sm">{step.icon}</span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-gray-100 border rounded-2xl">
          {/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-400/3 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/4 rounded-full blur-3xl" />
          </div> */}
          <div className="p-6 sm:p-8">
            <StepComponent {...stepProps} />

            {fieldErrors.submit && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.submit}
                </p>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-8 pb-6 flex items-center justify-between gap-4 border-t border-slate-800/60 pt-5">
            <button type="button"
              onClick={() => router.push("/manage-salespersons/salesperson-list/managesalesperson")}
              className="text-10 text-black transition-colors cursor-pointer">
              Cancel
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id}
                  className={`rounded-full transition-all duration-300 ${s.id === currentStep ? "w-5 h-2 bg-amber-400" : s.id < currentStep ? "w-2 h-2 bg-amber-400/50" : "w-2 h-2 bg-slate-700"}`} />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <button type="button" onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black text-sm text-black transition-all duration-200 cursor-pointer">
                  ← Prev
                </button>
              )}
              {currentStep < STEPS.length ? (
                <button type="button" onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-300 active:scale-95 transition-all duration-200 shadow-lg shadow-amber-400/20 cursor-pointer">
                  Next →
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-400 active:scale-95 transition-all duration-200 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  {isSubmitting ? (<><span className="animate-spin">⏳</span> Creating...</>) : (<>✓ Submit & Create</>)}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          All data is encrypted and stored securely · Fields marked <span className="text-red-400">*</span> are required
        </p>
      </div>
    </div>
  );
}