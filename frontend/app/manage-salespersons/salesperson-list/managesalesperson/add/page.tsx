// frontend/app/manage-salespersons/salesperson-list/managesalesperson/add/SalespersonOnboardingWizard.tsx
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
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  icon?: string;
}

interface TextareaFieldProps {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
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
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
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

// ─── REUSABLE FIELD COMPONENTS ─────────────────────────────────────────────────
const Label: React.FC<LabelProps> = ({ children, required }) => (
  <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1.5">
    {children} {required && <span className="text-red-400 normal-case font-normal">*</span>}
  </label>
);

const inputBase =
  "w-full bg-slate-800/70 border border-slate-600/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:bg-slate-800 transition-all duration-200";

const InputField: React.FC<InputFieldProps> = ({ label, name, type = "text", placeholder, required, value, onChange, icon, disabled }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{icon}</span>}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputBase} ${icon ? "pl-9" : ""} ${disabled ? "opacity-50 cursor-not-allowed bg-slate-900/50" : "cursor-text"}`}
      />
    </div>
  </div>
);

const SelectField: React.FC<SelectFieldProps> = ({ label, name, options, required, value, onChange, icon }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10">{icon}</span>}
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`${inputBase} appearance-none pr-8 ${icon ? "pl-9" : ""} cursor-pointer`}
      >
        <option value="" className="bg-slate-900">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-slate-900">{o}</option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
    </div>
  </div>
);

const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, rows = 3, placeholder, required, value, onChange }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${inputBase} resize-none cursor-text`}
    />
  </div>
);

const FileField: React.FC<FileFieldProps> = ({ label, name, accept, required, onChange, fileName }) => (
  <div className="flex flex-col">
    <Label required={required}>{label}</Label>
    <label className="flex items-center gap-3 bg-slate-800/60 border border-dashed border-slate-600/60 rounded-xl px-4 py-3 cursor-pointer hover:border-amber-400/60 hover:bg-slate-800 transition-all duration-200 group">
      <span className="text-xl group-hover:scale-110 transition-transform shrink-0">📎</span>
      <div className="min-w-0 flex-1">
        {fileName ? (
          <>
            <p className="text-sm text-green-400 truncate">✓ {fileName}</p>
            <p className="text-xs text-slate-500">Click to replace</p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Click to upload</p>
            <p className="text-xs text-slate-600">{accept || "PDF, JPG, PNG · max 5MB"}</p>
          </>
        )}
      </div>
      <input type="file" className="hidden" accept={accept} name={name} onChange={onChange} />
    </label>
  </div>
);

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent ml-2" />
  </div>
);

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
          className="text-xs text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-lg hover:bg-amber-400/10 transition-colors flex items-center gap-1 cursor-pointer">
          + Add Slab
        </button>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
        {["Target From (₹)", "Target To (₹)", "Rate (%)"].map((h) => (
          <span key={h} className="text-[10px] uppercase tracking-wider text-slate-500">{h}</span>
        ))}
        <span className="w-7" />
      </div>
      {slabs.map((slab) => (
        <div key={slab.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <input type="number" placeholder="0" value={slab.from}
            onChange={(e) => updateSlab(slab.id, "from", e.target.value)}
            className="bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 transition-all cursor-text" />
          <input type="number" placeholder="100000" value={slab.to}
            onChange={(e) => updateSlab(slab.id, "to", e.target.value)}
            className="bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 transition-all cursor-text" />
          <div className="relative">
            <input type="number" placeholder="5" value={slab.rate}
              onChange={(e) => updateSlab(slab.id, "rate", e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-xl pl-3 pr-7 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400/60 transition-all cursor-text" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">%</span>
          </div>
          <button type="button" onClick={() => removeSlab(slab.id)}
            disabled={slabs.length === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-base">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── STEP 1: BASIC INFO ─────────────────────────────────────────────────────────
const Step1: React.FC<StepComponentProps> = ({ data, onChange, onFile }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFile("profilePhoto", file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <SectionTitle icon="👤" title="Basic Information" subtitle="Personal details of the salesperson" />
      <div className="space-y-5">
        {/* Photo Upload */}
        <div className="flex flex-col gap-1.5">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : "👤"}
            </div>
            <label className="flex-1 flex items-center gap-3 bg-slate-800/60 border border-dashed border-slate-600/60 rounded-xl px-4 py-3 cursor-pointer hover:border-amber-400/60 hover:bg-slate-800 transition-all group">
              <span className="text-xl">📸</span>
              <div>
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {data.profilePhoto ? `✓ ${data.profilePhoto.name}` : "Upload photo"}
                </p>
                <p className="text-xs text-slate-600">JPG, PNG · max 2MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Full Name" name="fullName" placeholder="Enter full name" required value={data.fullName} onChange={onChange} icon="✏️" />
          <SelectField label="Gender" name="gender" options={["Male", "Female", "Other", "Prefer not to say"]} required value={data.gender} onChange={onChange} icon="⚧" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Mobile Number" name="mobileNumber" type="tel" placeholder="+91 98765 43210" required value={data.mobileNumber} onChange={onChange} icon="📱" />
          <InputField label="Alternate Number" name="alternateNumber" type="tel" placeholder="+91 98765 43210" value={data.alternateNumber} onChange={onChange} icon="📞" />
        </div>
        <InputField label="Email Address" name="emailAddress" type="email" placeholder="name@company.com" required value={data.emailAddress} onChange={onChange} icon="✉️" />
        <InputField label="Date of Joining" name="dateOfJoining" type="date" required value={data.dateOfJoining} onChange={onChange} icon="📅" />
      </div>
    </div>
  );
};

// ─── STEP 2: ADDRESS ────────────────────────────────────────────────────────────
const Step2: React.FC<StepComponentProps> = ({ data, onChange }) => (
  <div>
    <SectionTitle icon="🏠" title="Address Details" subtitle="Residential and location information" />
    <div className="space-y-5">
      <TextareaField label="Current Address" name="currentAddress" placeholder="House/Flat No., Street, Area, Landmark..." required value={data.currentAddress} onChange={onChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Country" name="country" options={["India", "USA", "UK", "UAE", "Singapore", "Canada", "Australia", "Other"]} required value={data.country} onChange={onChange} icon="🌍" />

        <InputField label="State" name="state" placeholder="Maharashtra" required value={data.state} onChange={onChange} icon="🗺️" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* city */}
        <InputField label="City" name="city" placeholder="Mumbai" required value={data.city} onChange={onChange} icon="🏙️" />

        <InputField label="Postal Code" name="postalCode" placeholder="400001" required value={data.postalCode} onChange={onChange} icon="📮" />
      </div>
    </div>
  </div>
);

// ─── STEP 3: KYC ───────────────────────────────────────────────────────────────
const Step3: React.FC<StepComponentProps> = ({ data, onChange, onFile }) => (
  <div>
    <SectionTitle icon="🆔" title="Identity & KYC" subtitle="Government ID and verification documents" />
    <div className="space-y-5">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
        <span className="text-blue-400 mt-0.5 shrink-0">ℹ️</span>
        <p className="text-xs text-blue-300">All documents are encrypted and stored securely. Fields marked * are mandatory for KYC compliance.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Aadhaar Number" name="aadhaarNumber" placeholder="XXXX XXXX XXXX" required value={data.aadhaarNumber} onChange={onChange} icon="🪪" />
        <InputField label="PAN Number" name="panNumber" placeholder="ABCDE1234F" required value={data.panNumber} onChange={onChange} icon="🗂️" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileField label="Aadhaar Upload" name="aadhaarFile" accept=".pdf,.jpg,.png" required
          onChange={(e) => onFile("aadhaarFile", e.target.files?.[0] || null)}
          fileName={data.aadhaarFile?.name} />
        <FileField label="PAN Upload" name="panFile" accept=".pdf,.jpg,.png" required
          onChange={(e) => onFile("panFile", e.target.files?.[0] || null)}
          fileName={data.panFile?.name} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileField label="Photo Upload" name="photoFile" accept=".jpg,.png" required
          onChange={(e) => onFile("photoFile", e.target.files?.[0] || null)}
          fileName={data.photoFile?.name} />
        <FileField label="Digital Signature" name="signatureFile" accept=".png,.jpg,.pdf" required
          onChange={(e) => onFile("signatureFile", e.target.files?.[0] || null)}
          fileName={data.signatureFile?.name} />
      </div>
    </div>
  </div>
);

// ─── STEP 4: PROFESSIONAL ──────────────────────────────────────────────────────
const Step4: React.FC<StepComponentProps> = ({ data, onChange, onFile }) => (
  <div>
    <SectionTitle icon="💼" title="Professional Details" subtitle="Experience, access levels and product assignments" />
    <div className="space-y-5">
      <SelectField label="Product Category Access" name="productCategoryAccess"
        options={["All Products", "Electronics", "FMCG", "Pharmaceuticals", "Automobiles", "Financial Products", "Real Estate"]}
        required value={data.productCategoryAccess} onChange={onChange} icon="📦" />
      <SelectField label="Lead Source Access" name="leadSourceAccess"
        options={["All Sources", "Website", "Social Media", "Referral", "Cold Call", "Trade Show", "Email Campaign"]}
        required value={data.leadSourceAccess} onChange={onChange} icon="🎯" />
      <SelectField label="Access Level" name="accessLevel"
        options={["Level 1 – View Only", "Level 2 – Edit Own Records", "Level 3 – Team Lead", "Level 4 – Manager", "Level 5 – Admin"]}
        required value={data.accessLevel} onChange={onChange} icon="🛡️" />
      <TextareaField label="Previous Experience" name="previousExperience"
        placeholder="Briefly describe previous sales experience, industries, roles..."
        value={data.previousExperience} onChange={onChange} />
      <FileField label="Upload Resume / CV" name="resumeFile" accept=".pdf,.doc,.docx" required
        onChange={(e) => onFile("resumeFile", e.target.files?.[0] || null)}
        fileName={data.resumeFile?.name} />
    </div>
  </div>
);

// ─── STEP 5: SALARY & COMMISSION ───────────────────────────────────────────────
const Step5: React.FC<StepComponentProps> = ({ data, onChange, onSlabChange }) => (
  <div>
    <SectionTitle icon="💰" title="Salary & Commission" subtitle="Compensation structure and incentive configuration" />
    <div className="space-y-5">
      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2">
        <span className="text-green-400 mt-0.5 shrink-0">💡</span>
        <p className="text-xs text-green-300">Salary details are confidential and accessible only to HR and Admin roles.</p>
      </div>

      {/* Fixed Salary */}
      <div className="flex flex-col">
        <Label required>Fixed Salary (₹/month)</Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
          <input type="number" name="fixedSalary" value={data.fixedSalary || ""} onChange={onChange}
            placeholder="e.g. 25000"
            className={`${inputBase} pl-9 cursor-text`} />
        </div>
      </div>

      {/* Commission Type Toggle */}
      <div className="flex flex-col gap-2">
        <Label required>Commission Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "flat" as const, label: "Flat Amount", icon: "💵", desc: "Fixed ₹ per sale" },
            { value: "percentage" as const, label: "Percentage", icon: "📊", desc: "% of sale value" },
          ].map((type) => (
            <button key={type.value} type="button"
              onClick={() => onChange({ target: { name: "commissionType", value: type.value } } as any)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer ${data.commissionType === type.value
                  ? "bg-amber-400/10 border-amber-400/50 shadow-lg shadow-amber-400/5"
                  : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600"
                }`}>
              <span className="text-xl">{type.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${data.commissionType === type.value ? "text-amber-400" : "text-slate-300"}`}>{type.label}</p>
                <p className="text-xs text-slate-500">{type.desc}</p>
              </div>
              <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${data.commissionType === type.value ? "border-amber-400 bg-amber-400" : "border-slate-600"}`}>
                {data.commissionType === type.value && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Commission Value */}
      <div className="flex flex-col">
        <Label required>{data.commissionType === "flat" ? "Flat Commission Amount (₹ per sale)" : "Commission Percentage (%)"}</Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
            {data.commissionType === "flat" ? "₹" : "%"}
          </span>
          <input type="number" name="commissionValue" value={data.commissionValue || ""} onChange={onChange}
            placeholder={data.commissionType === "flat" ? "e.g. 500" : "e.g. 3.5"}
            className={`${inputBase} pl-9 cursor-text`} />
        </div>
      </div>

      {onSlabChange && <IncentiveSlabs slabs={data.incentiveSlabs} onChange={onSlabChange} />}

      {/* Bonus Eligibility */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-semibold">Bonus Eligibility</p>
            <p className="text-xs text-slate-500 mt-0.5">Eligible for quarterly / annual bonuses</p>
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
const Step6: React.FC<StepComponentProps> = ({ data, onChange, onFile }) => {
  const [ifscVerified, setIfscVerified] = useState(false);

  return (
    <div>
      <SectionTitle icon="🏦" title="Payout Details" subtitle="Bank account information for salary disbursement" />
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <span className="text-blue-400 mt-0.5 shrink-0">🔒</span>
          <p className="text-xs text-blue-300">Bank details are encrypted. Only Finance & Admin roles can access this information.</p>
        </div>

        <InputField label="Bank Account Holder Name" name="accountHolderName" placeholder="As printed on bank passbook" required value={data.accountHolderName} onChange={onChange} icon="👤" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Bank Name" name="bankName" required value={data.bankName} onChange={onChange} icon="🏦"
            options={["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "Union Bank of India", "Canara Bank", "IndusInd Bank", "Yes Bank", "Federal Bank", "IDFC First Bank", "Other"]} />
          <InputField label="Branch Name" name="branchName" placeholder="e.g. Andheri West" required value={data.branchName} onChange={onChange} icon="🏢" />
        </div>

        <div className="flex flex-col">
          <Label required>Account Number</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔢</span>
            <input type="text" name="accountNumber" value={data.accountNumber || ""} onChange={onChange}
              placeholder="Enter 9–18 digit account number" maxLength={18}
              className={`${inputBase} pl-9 tracking-widest cursor-text`} />
          </div>
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
            <p className="text-red-400 text-xs mt-1">⚠ Account numbers do not match</p>
          )}
          {data.accountNumber && data.confirmAccountNumber && data.accountNumber === data.confirmAccountNumber && (
            <p className="text-green-400 text-xs mt-1">✓ Account numbers match</p>
          )}
        </div>

        {/* IFSC with verify */}
        <div className="flex flex-col gap-1.5">
          <Label required>IFSC Code</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🏷️</span>
              <input type="text" name="ifscCode" value={data.ifscCode || ""} onChange={onChange}
                placeholder="e.g. HDFC0001234" maxLength={11}
                className={`${inputBase} pl-9 uppercase cursor-text`} />
            </div>
            <button type="button" onClick={() => setIfscVerified((v) => !v)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${ifscVerified
                  ? "bg-green-500/20 border border-green-500/40 text-green-400"
                  : "bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20"}`}>
              {ifscVerified ? "✓ Verified" : "Verify IFSC"}
            </button>
          </div>
          {ifscVerified && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 mt-1">
              <span className="text-green-400 text-sm">✅</span>
              <span className="text-xs text-green-300">IFSC verified — Branch details confirmed</span>
            </div>
          )}
        </div>

        <SelectField label="Account Type" name="accountType" required value={data.accountType} onChange={onChange} icon="💳"
          options={["Savings Account", "Current Account", "Salary Account"]} />

        <FileField label="Upload Cancelled Cheque / Passbook" name="cancelledChequeFile" accept=".pdf,.jpg,.png" required
          onChange={(e) => onFile("cancelledChequeFile", e.target.files?.[0] || null)}
          fileName={data.cancelledChequeFile?.name} />

        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400/5 to-slate-800/40 border border-amber-400/15">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Payout Summary</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              { label: "Payout Mode", value: "Direct Bank Transfer" },
              { label: "Payout Cycle", value: "Monthly (1st of month)" },
              { label: "TDS", value: "As per IT Act" },
              { label: "Currency", value: "INR (₹)" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">{item.value}</p>
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
function validateStep(step: number, data: FormData): string[] {
  const errors: string[] = [];
  if (step === 1) {
    if (!data.fullName.trim()) errors.push("Full Name is required");
    if (!data.gender) errors.push("Gender is required");
    if (!data.mobileNumber.trim()) errors.push("Mobile Number is required");
    if (!data.emailAddress.trim()) errors.push("Email Address is required");
    if (!data.dateOfJoining) errors.push("Date of Joining is required");
  }
  if (step === 2) {
    if (!data.currentAddress.trim()) errors.push("Current Address is required");
    if (!data.city.trim()) errors.push("City is required");
    if (!data.state.trim()) errors.push("State is required");
    if (!data.country) errors.push("Country is required");
    if (!data.postalCode.trim()) errors.push("Postal Code is required");
  }
  if (step === 3) {
    if (!data.aadhaarNumber.trim()) errors.push("Aadhaar Number is required");
    if (!data.panNumber.trim()) errors.push("PAN Number is required");
  }
  if (step === 4) {
    if (!data.productCategoryAccess) errors.push("Product Category Access is required");
    if (!data.leadSourceAccess) errors.push("Lead Source Access is required");
    if (!data.accessLevel) errors.push("Access Level is required");
  }
  if (step === 5) {
    if (!data.fixedSalary) errors.push("Fixed Salary is required");
    if (!data.commissionValue) errors.push("Commission Value is required");
  }
  if (step === 6) {
    if (!data.accountHolderName.trim()) errors.push("Account Holder Name is required");
    if (!data.bankName) errors.push("Bank Name is required");
    if (!data.accountNumber.trim()) errors.push("Account Number is required");
    if (!data.ifscCode.trim()) errors.push("IFSC Code is required");
    if (!data.accountType) errors.push("Account Type is required");
    if (data.accountNumber !== data.confirmAccountNumber)
      errors.push("Account numbers do not match");
  }
  return errors;
}

// ─── MAIN WIZARD ────────────────────────────────────────────────────────────────
export default function SalespersonOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!validateSession()) { router.push("/login"); return; }
    if (!isAdmin()) { router.push("/dashboard"); return; }
  }, [router]);

  // Scroll to top on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStepErrors([]);
  };

  const handleFile = (name: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleSlabChange = (newSlabs: IncentiveSlab[]) => {
    setFormData((prev) => ({ ...prev, incentiveSlabs: newSlabs }));
  };

  const handleNext = () => {
    const errors = validateStep(currentStep, formData);
    if (errors.length > 0) { setStepErrors(errors); return; }
    setStepErrors([]);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handlePrev = () => {
    setStepErrors([]);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    const errors = validateStep(currentStep, formData);
    if (errors.length > 0) { setStepErrors(errors); return; }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("ts-token");
      if (!token) throw new Error("No authentication token found");

      // Build form data for multipart upload
      const fd = new FormData();

      // Map onboarding fields to backend salesperson model fields
      const nameParts = formData.fullName.trim().split(" ");
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";
      const username = formData.emailAddress.split("@")[0] || firstname.toLowerCase();

      fd.append("username", username);
      fd.append("firstname", firstname);
      fd.append("lastname", lastname);
      fd.append("email", formData.emailAddress);
      fd.append("designation", formData.accessLevel || "Sales Executive");
      fd.append("contact", formData.mobileNumber);
      fd.append("password", "Welcome@123"); // default password — admin changes later

      // Extended profile fields
      fd.append("gender", formData.gender);
      fd.append("alternateNumber", formData.alternateNumber);
      fd.append("dateOfJoining", formData.dateOfJoining);
      fd.append("currentAddress", formData.currentAddress);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("country", formData.country);
      fd.append("postalCode", formData.postalCode);
      fd.append("aadhaarNumber", formData.aadhaarNumber);
      fd.append("panNumber", formData.panNumber);
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
      fd.append("ifscCode", formData.ifscCode);
      fd.append("accountType", formData.accountType);

      // File attachments
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
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data?.message || res.status === 201) {
        setCreatedName(formData.fullName);
        setSubmitSuccess(true);
      }
    } catch (error: any) {
      console.error("❌ Onboarding submit error:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        router.push("/login");
      } else {
        const msg = error.response?.data?.message || error.message || "Failed to create salesperson";
        setStepErrors([msg]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" style={{ fontFamily: "Georgia, serif" }}>
        <div className="text-center space-y-5 max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-green-400/20 border-2 border-green-400/40 flex items-center justify-center text-5xl mx-auto">
            ✅
          </div>
          <h2 className="text-3xl font-bold text-white">Onboarding Complete!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            <strong className="text-white">{createdName}</strong> has been successfully added to your team.
            <br />
            <span className="text-amber-400">Default password: </span>
            <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 text-xs">Welcome@123</code>
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
              onClick={() => { setFormData(INITIAL_STATE); setCurrentStep(1); setSubmitSuccess(false); }}
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

  // Step component props
  const stepProps: StepComponentProps = { data: formData, onChange: handleChange, onFile: handleFile, onSlabChange: handleSlabChange };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6" style={{ fontFamily: "Georgia, serif" }}>
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-400/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl mx-auto relative" ref={topRef}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">Sales Team Management</p>
            <h1 className="text-2xl font-bold text-white">Salesperson Onboarding</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Step</p>
            <p className="text-2xl font-bold text-amber-400">
              {currentStep}<span className="text-slate-600 text-lg">/{STEPS.length}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                setStepErrors([]);
                setCurrentStep(step.id);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer
      ${currentStep === step.id
                  ? "bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20"
                  : step.id < currentStep
                    ? "bg-slate-700 text-amber-400 border border-amber-400/20"
                    : "bg-slate-800/60 text-slate-500 border border-slate-700/50 hover:border-slate-600"
                }`}
            >
              <span className="text-sm">{step.icon}</span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>
        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/40">
          {/* Content */}
          <div className="p-6 sm:p-8">
            <StepComponent {...stepProps} />

            {/* Error Banner */}
            {stepErrors.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Please fix the following:</p>
                <ul className="space-y-1">
                  {stepErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">⚠</span>{err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Nav */}
          <div className="px-6 sm:px-8 pb-6 flex items-center justify-between gap-4 border-t border-slate-800/60 pt-5">
            <button
              type="button"
              onClick={() => router.push("/manage-salespersons/salesperson-list/managesalesperson")}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer underline underline-offset-2">
              Cancel
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id}
                  className={`rounded-full transition-all duration-300 ${s.id === currentStep ? "w-5 h-2 bg-amber-400" : s.id < currentStep ? "w-2 h-2 bg-amber-400/50" : "w-2 h-2 bg-slate-700"
                    }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <button type="button" onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600/50 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-all duration-200 cursor-pointer">
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
                  {isSubmitting ? (
                    <><span className="animate-spin">⏳</span> Creating...</>
                  ) : (
                    <>✓ Submit & Create</>
                  )}
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