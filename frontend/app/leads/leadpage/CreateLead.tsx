// frontend/app/leads/CreateLead.tsx - COMPLETE CORRECTED VERSION
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';

import ActivityHistory from "./ActivityHistoryPage.js/ActivityHistory";
import CategoriesModal from "@/app/manage-items/categories/CategoriesModal";
import LeadSourceModal from "@/app/manage-items/lead-source/LeadSourceModal";
import LeadStatusModal from "@/app/manage-items/lead-status/LeadStatusModal";
import ProductsTableModal from "@/app/manage-items/products/ProductsTableModal";
import TagModal from "@/app/manage-items/tags/TagModal";

/* --------------------------- TYPES & INTERFACES --------------------------- */

interface Country {
  name: string;
  callingCode: string;
  displayName: string;
}

interface User {
  username: string;
  role: "admin" | "salesperson" | string;
}

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
}

interface LeadSource {
  _id: string;
  name: string;
}

interface LeadStatus {
  _id: string;
  name: string;
}

interface Salesperson {
  _id?: string;
  id?: string;
  username: string;
}

interface Tag {
  _id: string;
  name: string;
  color: string;
  description?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  designation: string;
  website: string;
  salesperson: string;
  category: string;
  product: string;
  leadSource: string;
  leadStatus: string;
  tags: string[];
  leadStartDate: string;
  leadStartTime: string;
  leadRemindDate: string;
  leadRemindTime: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  expectedAmount: string;
  paymentReceived: string;
  comment: string;
  facebook: string;
  skype: string;
  linkedIn: string;
  gtalk: string;
  twitter: string;
  convertOption: string;
}

interface FormErrors {
  firstName?: string;
  salesperson?: string;
  category?: string;
  product?: string;
  leadStatus?: string;
  country?: string;
  [key: string]: string | undefined;
}

interface ExistingData extends Partial<Omit<FormData, 'tags'>> {
  _id?: string;
  tags?: (string | Tag | { _id: string; name?: string })[];
}

interface CreateLeadProps {
  onSave?: (data?: any) => void;
  onCancel?: () => void;
  existingData?: ExistingData;
}

interface NewTag {
  name: string;
  color: string;
  description: string;
}

interface FieldConfig {
  key: keyof FormData;
  placeholder: string;
  isPhone?: boolean;
}

/* --------------------------- MAIN COMPONENT --------------------------- */

export default function CreateLead({ onSave, onCancel, existingData }: CreateLeadProps) {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tt-crm-pro.onrender.com";

  const router = useRouter();
  const activityHistoryRef = useRef<HTMLDivElement>(null);

  const isEditMode = Boolean(existingData?._id);

  /* --------------------------- USER --------------------------- */
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("ts-user");
    if (user) setLoggedUser(JSON.parse(user));
  }, []);

  const isAdmin = loggedUser?.role === "admin";
  const isSalesperson = loggedUser?.role === "salesperson";

  /* --------------------------- COUNTRIES (REST Countries API) --------------------------- */
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState<boolean>(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd"
        );
        const data = await response.json();

        const formattedCountries: Country[] = data
          .map((country: any) => {
            const name = country.name?.common || "";
            const root = country.idd?.root || "";
            const suffixes = country.idd?.suffixes || [];

            let callingCode = "";
            if (root) {
              callingCode = suffixes.length > 0 ? `${root}${suffixes[0]}` : root;
            }

            return {
              name,
              callingCode,
              displayName: callingCode ? `${name} (${callingCode})` : name,
            };
          })
          .filter((c: Country) => c.name && c.callingCode)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        setLoadingCountries(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        toast.error("Failed to load countries");
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  /* --------------------------- CALENDAR & TIME PICKER STATE --------------------------- */
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectingMinute, setSelectingMinute] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  /* --------------------------- DEFAULT FORM --------------------------- */
  const defaultForm = useCallback((): FormData => {
    const now = new Date();
    return {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      mobile: "",
      fax: "",
      designation: "",
      website: "",
      salesperson: "",
      category: "",
      product: "",
      leadSource: "",
      leadStatus: "",
      tags: [],
      leadStartDate: now.toISOString().split("T")[0],
      leadStartTime: now.toTimeString().slice(0, 5),
      leadRemindDate: "",
      leadRemindTime: "12:15",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      expectedAmount: "",
      paymentReceived: "",
      comment: "",
      facebook: "",
      skype: "",
      linkedIn: "",
      gtalk: "",
      twitter: "",
      convertOption: "",
    };
  }, []);

  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const submittedRef = useRef<boolean>(false);

  /* --------------------------- DROPDOWNS --------------------------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [cat, prod, src, status, sales, tagsResponse] = await Promise.all([
        axios.get<Category[]>(`${API_BASE}/api/manage-items/categories/get-categories`),
        axios.get<Product[]>(`${API_BASE}/api/manage-items/products/get-products`),
        axios.get<LeadSource[]>(`${API_BASE}/api/manage-items/lead-source/get-lead-sources`),
        axios.get<LeadStatus[]>(`${API_BASE}/api/manage-items/lead-status/get-lead-status`),
        axios.get<Salesperson[]>(`${API_BASE}/api/salespersons/get-salespersons`),
        axios.get<Tag[]>(`${API_BASE}/api/manage-items/tags/get-tags`),
      ]);

      setCategories(cat.data || []);
      setProducts(prod.data || []);
      setLeadSources(src.data || []);
      setLeadStatuses(status.data || []);
      setSalespersons(sales.data || []);
      setTags(tagsResponse.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  /* --------------------------- CALENDAR FUNCTIONS --------------------------- */
  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray: { day: number; isCurrentMonth: boolean }[] = [];

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
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setFormData(prev => ({ ...prev, leadRemindDate: `${year}-${month}-${dayStr}` }));
    setShowCalendar(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  /* --------------------------- ANALOG CLOCK TIME PICKER FUNCTIONS --------------------------- */

  const handleClockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    const distance = Math.sqrt(x * x + y * y);
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;

    if (selectingMinute) {
      // Calculate minute based on angle (0-59)
      let selectedMinute = Math.round(angle / 6) % 60;
      const timeValue = `${formData.leadRemindTime.split(':')[0]}:${selectedMinute.toString().padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, leadRemindTime: timeValue }));

      if (!isDragging) {
        setTimeout(() => {
          setShowTimePicker(false);
          setSelectingMinute(false);
        }, 200);
      }
    } else {
      // Determine if clicking inner or outer circle for hours
      const isInnerCircle = distance < 65; // Adjusted threshold
      let selectedHour: number;

      // Calculate hour from angle (0-11 positions)
      let hourPosition = Math.round(angle / 30) % 12;

      if (isInnerCircle) {
        // Inner circle: 1-12
        selectedHour = hourPosition === 0 ? 12 : hourPosition;
      } else {
        // Outer circle: 13-24 (0 for midnight)
        selectedHour = hourPosition === 0 ? 0 : hourPosition + 12;
      }

      const timeValue = `${selectedHour.toString().padStart(2, '0')}:${formData.leadRemindTime.split(':')[1]}`;
      setFormData(prev => ({ ...prev, leadRemindTime: timeValue }));

      if (!isDragging) {
        setSelectingMinute(true);
      }
    }
  };

  const handleClockMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !clockRef.current) return;
    handleClockClick(e);
  };

  const handleTimeClick = (hour: number) => {
    const timeValue = `${hour.toString().padStart(2, '0')}:${formData.leadRemindTime.split(':')[1]}`;
    setFormData(prev => ({ ...prev, leadRemindTime: timeValue }));
    setSelectingMinute(true);
  };

  const handleMinuteClick = (minute: number) => {
    const timeValue = `${formData.leadRemindTime.split(':')[0]}:${minute.toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, leadRemindTime: timeValue }));
    setTimeout(() => {
      setShowTimePicker(false);
      setSelectingMinute(false);
    }, 200);
  };

  const getCurrentAngle = () => {
    const [hours, minutes] = formData.leadRemindTime.split(':').map(Number);
    if (selectingMinute) {
      // For minutes: 0-59 maps to 0-360 degrees
      return (minutes / 60) * 360;
    } else {
      // For hours: convert to 12-hour format for angle calculation
      let hour12 = hours % 12;
      if (hour12 === 0) hour12 = 12;
      return (hour12 / 12) * 360;
    }
  };

  const getCurrentRadius = () => {
    if (selectingMinute) return 'outer';
    const hours = parseInt(formData.leadRemindTime.split(':')[0]);
    // Inner circle: 1-12, Outer circle: 0, 13-23
    return (hours >= 1 && hours <= 12) ? 'inner' : 'outer';
  };

  /* --------------------------- COUNTRY CALLING CODE LOGIC --------------------------- */

  const extractPhoneNumber = (phoneValue: string, callingCode: string): string => {
    if (!phoneValue) return "";

    const trimmed = phoneValue.trim();

    if (callingCode && trimmed.startsWith(callingCode)) {
      return trimmed.slice(callingCode.length).trim();
    }

    const cleanedPhone = trimmed.replace(/^\+\d{1,4}\s*/, "");
    return cleanedPhone;
  };

  const formatPhoneWithCode = (phoneNumber: string, callingCode: string): string => {
    if (!phoneNumber) return callingCode ? `${callingCode} ` : "";

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) return callingCode ? `${callingCode} ` : "";

    return callingCode ? `${callingCode} ${cleanPhone}` : cleanPhone;
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryName = e.target.value;
    const selectedCountry = countries.find((c) => c.name === selectedCountryName);
    const newCallingCode = selectedCountry?.callingCode || "";

    const currentCountry = countries.find((c) => c.name === formData.country);
    const currentCallingCode = currentCountry?.callingCode || "";

    const purePhone = extractPhoneNumber(formData.phone, currentCallingCode);
    const pureMobile = extractPhoneNumber(formData.mobile, currentCallingCode);

    const newPhone = formatPhoneWithCode(purePhone, newCallingCode);
    const newMobile = formatPhoneWithCode(pureMobile, newCallingCode);

    setFormData((prev) => ({
      ...prev,
      country: selectedCountryName,
      phone: newPhone,
      mobile: newMobile,
    }));

    setErrors((prev) => ({ ...prev, country: "" }));
  };

  const isPastDate = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    return selectedDate < today;
  };

  /* --------------------------- PHONE INPUT HANDLERS --------------------------- */

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'phone' | 'mobile') => {
    const rawValue = e.target.value;

    const currentCountry = countries.find((c) => c.name === formData.country);
    const callingCode = currentCountry?.callingCode || "";

    const fullValue = callingCode ? `${callingCode} ${rawValue}` : rawValue;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: fullValue,
    }));
  };

  /* --------------------------- EDIT MODE - NORMALIZE TAGS --------------------------- */
  useEffect(() => {
    if (isEditMode && existingData && tags.length > 0) {
      console.log("📝 Edit Mode - Processing tags:", existingData.tags);

      const normalizedTags = (existingData.tags || [])
        .map((t) => {
          if (typeof t === "string") {
            if (t.length === 24 && /^[a-f0-9]{24}$/i.test(t)) {
              const foundTag = tags.find((tag) => tag._id === t);
              if (foundTag) return foundTag.name;
              return null;
            }
            return t;
          }

          if (t && typeof t === "object" && "name" in t && t.name) {
            return t.name;
          }

          if (t && typeof t === "object" && "_id" in t && t._id) {
            const foundTag = tags.find((tag) => tag._id === t._id);
            if (foundTag) return foundTag.name;
          }

          return null;
        })
        .filter(Boolean) as string[];

      console.log("Final normalized tags:", normalizedTags);

      setFormData({
        ...defaultForm(),
        ...existingData,
        tags: normalizedTags,
        salesperson: existingData.salesperson || "",
      } as FormData);
    }
  }, [isEditMode, existingData, defaultForm, tags]);

  useEffect(() => {
    if (!isEditMode && isSalesperson && loggedUser?.username) {
      setFormData((p) => ({
        ...p,
        salesperson: loggedUser.username,
      }));
    }
  }, [isEditMode, isSalesperson, loggedUser]);

  /* --------------------------- INPUT --------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (isSalesperson && name === "salesperson") return;
    if (isEditMode && name === "comment") return;

    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  /* --------------------------- VALIDATION --------------------------- */
  const validateForm = (): FormErrors => {
    const e: FormErrors = {};
    if (!formData.firstName) e.firstName = "Required";
    if (!formData.salesperson) e.salesperson = "Required";
    if (!formData.category) e.category = "Required";
    if (!formData.product) e.product = "Required";
    if (!formData.leadStatus) e.leadStatus = "Required";
    return e;
  };

  /* --------------------------- ACTIVITY HISTORY --------------------------- */
  const [latestComment, setLatestComment] = useState<string>("");

  useEffect(() => {
    if (isEditMode && formData.comment) {
      setLatestComment(formData.comment);
    }
  }, [isEditMode, formData.comment]);

  const handleCommentUpdate = (newComment: string) => {
    console.log("📝 Comment Update Triggered:", newComment);
    setLatestComment(newComment);
    setFormData((prev) => ({
      ...prev,
      comment: newComment,
    }));
  };

  /* --------------------------- SUBMIT --------------------------- */

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;

    const errs = validateForm();
    setErrors(errs);

    if (Object.keys(errs).length) {
      toast.error("Please fill required fields");
      submittedRef.current = false;
      return;
    }

    try {
      let res: AxiosResponse;

      if (isEditMode && existingData?._id) {
        const updatePayload = {
          ...formData,
          comment: latestComment,
          tags: formData.tags || [],
        };

        console.log("🚀 Sending Update:", updatePayload);

        res = await axios.put(
          `${API_BASE}/api/leads/update-lead/${existingData._id}`,
          updatePayload
        );

        toast.success(res.data?.message || "Lead updated successfully");
        onSave?.(res.data);

      } else {
        const createPayload = {
          ...formData,
          tags: formData.tags || [],
        };

        console.log("🚀 Creating Lead:", createPayload);

        res = await axios.post(
          `${API_BASE}/api/leads/create-lead`,
          createPayload
        );

        toast.success(res.data?.message || "Lead created successfully");
        handleReset();
        onSave?.({ success: true });
      }

    } catch (err: any) {
      console.error("❌ Submit Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      submittedRef.current = false;
    }
  };

  /* --------------------------- RESET / CANCEL --------------------------- */
  const handleReset = () => {
    setFormData(defaultForm());
    setErrors({});
    setLatestComment("");
    toast.info("Form Reset");
  };

  const handleCancelClick = () => {
    onCancel?.();
  };

  /* --------------------------- SCROLL --------------------------- */
  const scrollToActivityHistory = () => {
    activityHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* --------------------------- MODALS --------------------------- */
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showLeadSourceModal, setShowLeadSourceModal] = useState<boolean>(false);
  const [showLeadStatusModal, setShowLeadStatusModal] = useState<boolean>(false);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);

  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newProduct, setNewProduct] = useState<string>("");
  const [newLeadName, setNewLeadName] = useState<string>("");
  const [newLeadStatus, setNewLeadStatus] = useState<string>("");
  const [newTag, setNewTag] = useState<NewTag>({
    name: "",
    color: "#3B82F6",
    description: "",
  });

  const addCategory = async () => {
    try {
      const res = await axios.post<Category>(
        `${API_BASE}/api/manage-items/categories/create-category`,
        { name: newCategoryName }
      );
      setCategories((p) => [...p, res.data]);
      setFormData((p) => ({ ...p, category: res.data.name }));
      setShowCategoryModal(false);
      setNewCategoryName("");
      toast.success("Category added successfully");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const addProduct = async () => {
    try {
      const res = await axios.post<Product>(
        `${API_BASE}/api/manage-items/products/create-product`,
        { name: newProduct }
      );
      setProducts((p) => [...p, res.data]);
      setFormData((p) => ({ ...p, product: res.data.name }));
      setShowProductModal(false);
      setNewProduct("");
      toast.success("Product added successfully");
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const addLeadSource = async () => {
    try {
      const res = await axios.post<LeadSource>(
        `${API_BASE}/api/manage-items/lead-source/create-lead-source`,
        { name: newLeadName }
      );
      setLeadSources((p) => [...p, res.data]);
      setFormData((p) => ({ ...p, leadSource: res.data.name }));
      setShowLeadSourceModal(false);
      setNewLeadName("");
      toast.success("Lead source added successfully");
    } catch (error) {
      toast.error("Failed to add lead source");
    }
  };

  const addLeadStatus = async () => {
    try {
      const res = await axios.post<LeadStatus>(
        `${API_BASE}/api/manage-items/lead-status/create-lead-status`,
        { name: newLeadStatus }
      );
      setLeadStatuses((p) => [...p, res.data]);
      setFormData((p) => ({ ...p, leadStatus: res.data.name }));
      setShowLeadStatusModal(false);
      setNewLeadStatus("");
      toast.success("Lead status added successfully");
    } catch (error) {
      toast.error("Failed to add lead status");
    }
  };

  const addTag = async () => {
    if (!newTag.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const res = await axios.post<Tag>(
        `${API_BASE}/api/manage-items/tags/create-tag`,
        newTag
      );

      const createdTag = res.data;

      setTags((p) => [...p, createdTag]);

      setFormData((p) => ({
        ...p,
        tags: [...(p.tags || []), createdTag.name],
      }));

      setShowTagModal(false);
      setNewTag({ name: "", color: "#3B82F6", description: "" });
      toast.success("Tag added and selected!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add tag");
    }
  };

  /* --------------------------- TAG SELECTION WITH DROPDOWN --------------------------- */
  const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);

  const handleTagSelect = (tagName: string) => {
    setFormData((prev) => {
      const exists = prev.tags?.includes(tagName);
      return {
        ...prev,
        tags: exists
          ? prev.tags.filter((t) => t !== tagName)
          : [...(prev.tags || []), tagName],
      };
    });
  };

  const removeTag = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagName),
    }));
  };

  /* --------------------------- FIELD CONFIG --------------------------- */
  const leftFields: FieldConfig[] = [
    { key: "lastName", placeholder: "Last Name" },
    { key: "company", placeholder: "Company Name" },
    { key: "email", placeholder: "Email address" },
    { key: "phone", placeholder: "Phone Number", isPhone: true },
    { key: "mobile", placeholder: "Mobile", isPhone: true },
    { key: "fax", placeholder: "Fax" },
    { key: "designation", placeholder: "Designation" },
    { key: "website", placeholder: "Website" },
  ];

  /* ----------------------------------------------------
      UI — FULL PAGE LAYOUT (RESPONSIVE)
     ---------------------------------------------------- */

  const currentCountry = countries.find((c) => c.name === formData.country);
  const currentCallingCode = currentCountry?.callingCode || "";

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentAngle = getCurrentAngle();
  const currentRadius = getCurrentRadius();

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <form
        onSubmit={handleSubmit}
        className="mx-auto bg-white shadow-md rounded-lg p-4 sm:p-6 text-black max-w-6xl"
      >
        <h2 className="text-xl font-semibold mb-6">
          {existingData ? "Update" : "Create New"} <b>Lead</b>
        </h2>

        {/* -------------------- LEAD INFORMATION -------------------- */}
        <h3 className="font-semibold mb-2">Lead Information</h3>

        <div className="flex flex-col lg:flex-row w-full border-b border-gray-200 pb-6 gap-6">
          {/* LEFT (2/3 on desktop, full width on mobile) */}
          <div className="flex-1 lg:pr-6 lg:border-r border-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name (required) */}
              <div>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name *"
                  className={`border rounded-sm px-3 h-[40px] w-full text-sm ${errors.firstName ? "border-red-500" : ""
                    }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Remaining left fields */}
              {leftFields.map(({ key, placeholder, isPhone }) => {
                if (isPhone) {
                  return (
                    <div key={key}>
                      <div className="flex border rounded-sm overflow-hidden h-[40px]">
                        <div className="w-[15%] bg-gray-200 border-r border-gray-300 flex items-center justify-center text-gray-600 text-sm select-none cursor-not-allowed">
                          {currentCallingCode || "+91"}
                        </div>

                        <input
                          type="text"
                          name={key}
                          value={extractPhoneNumber((formData[key as keyof FormData] || "") as string, currentCallingCode)}
                          onChange={(e) => handlePhoneInputChange(e, key as 'phone' | 'mobile')}
                          placeholder={placeholder}
                          className="flex-1 px-3 outline-none text-sm"
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <input
                      name={key}
                      value={(formData[key as keyof FormData] || "") as string}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="border rounded-sm px-3 h-[40px] w-full text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT (1/3 on desktop, full width on mobile) */}
          <div className="w-full lg:w-[33%] lg:pl-6 flex flex-col gap-3">
            {/* Salesperson (admin only) */}
            {isAdmin && (
              <div>
                <div className="flex gap-2">
                  <select
                    name="salesperson"
                    value={formData.salesperson}
                    onChange={handleChange}
                    className={`border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm ${errors.salesperson ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">Select Sales person *</option>
                    {salespersons.map((sp) => (
                      <option key={sp._id || sp.id} value={sp.username}>
                        {sp.username}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
                    onClick={() =>
                      router.push(
                        "/manage-salespersons/salesperson-list/managesalesperson/add"
                      )
                    }
                  >
                    +
                  </button>
                </div>
                {errors.salesperson && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.salesperson}
                  </p>
                )}
              </div>
            )}

            {/* Category */}
            <div>
              <div className="flex gap-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm ${errors.category ? "border-red-500" : ""
                    }`}
                >
                  <option value="">Select Category *</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
                >
                  +
                </button>
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Product */}
            <div>
              <div className="flex gap-2">
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className={`border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm ${errors.product ? "border-red-500" : ""
                    }`}
                >
                  <option value="">Select Product *</option>
                  {products.map((p) => (
                    <option key={p._id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
                >
                  +
                </button>
              </div>
              {errors.product && (
                <p className="text-red-500 text-xs mt-1">{errors.product}</p>
              )}
            </div>

            {/* Lead Source */}
            <div className="flex gap-2">
              <select
                name="leadSource"
                value={formData.leadSource}
                onChange={handleChange}
                className="border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm"
              >
                <option value="">Select Lead Source</option>
                {leadSources.map((src) => (
                  <option key={src._id} value={src.name}>
                    {src.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowLeadSourceModal(true)}
                className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
              >
                +
              </button>
            </div>

            {/* Lead Status */}
            <div>
              <div className="flex gap-2">
                <select
                  name="leadStatus"
                  value={formData.leadStatus}
                  onChange={handleChange}
                  className={`border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm ${errors.leadStatus ? "border-red-500" : ""
                    }`}
                >
                  <option value="">Select Lead Status *</option>
                  {leadStatuses.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowLeadStatusModal(true)}
                  className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
                >
                  +
                </button>
              </div>
              {errors.leadStatus && (
                <p className="text-red-500 text-xs mt-1">{errors.leadStatus}</p>
              )}
            </div>

            {/* TAGS - DROPDOWN WITH MULTI-SELECT */}
            <div>
              <div className="flex gap-2 items-center mb-2">
                <label className="font-medium text-sm">Tags</label>
                <button
                  type="button"
                  onClick={() => setShowTagModal(true)}
                  className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[30px] h-[30px] flex-shrink-0 rounded text-lg transition-colors"
                >
                  +
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] p-2 border rounded-sm bg-gray-50">
                {formData.tags && formData.tags.length > 0 ? (
                  formData.tags.map((tagName) => {
                    const tag = tags.find((t) => t.name === tagName);
                    const tagColor = tag?.color || "#3B82F6";

                    return (
                      <span
                        key={tagName}
                        className="inline-flex cursor-pointer items-center gap-1 px-2 py-1 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: tagColor }}
                      >
                        {tagName}
                        <button
                          type="button"
                          onClick={() => removeTag(tagName)}
                          className="ml-1 cursor-pointer hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-400">No tags selected</span>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                >
                  <span className="text-gray-600">
                    {formData.tags?.length > 0
                      ? `${formData.tags.length} tag(s) selected`
                      : "Select tags"}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>

                {showTagDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-sm shadow-lg max-h-[200px] overflow-y-auto">
                    {tags.length > 0 ? (
                      tags.map((tag) => {
                        const isSelected = formData.tags?.includes(tag.name);

                        return (
                          <label
                            key={tag._id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTagSelect(tag.name)}
                              className="rounded"
                            />
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm flex-1">{tag.name}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No tags available. Create one using the + button.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {showTagDropdown && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTagDropdown(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* -------------------- DATES (Start & Remind) WITH CALENDAR & ANALOG CLOCK -------------------- */}
        <div className="flex flex-col lg:flex-row w-full border-b border-gray-200 mt-6 pb-6 gap-6">
          <div className="flex-1 lg:pr-6 lg:border-r border-gray-300">
            <h3 className="font-semibold mb-2 text-sm">Lead Start Date</h3>
            <div className="flex gap-2">
              <div className="relative w-[30%]">
                <input
                  type="text"
                  value={formData.leadStartDate}
                  readOnly
                  className="w-full pl-2 pr-9 h-[38px] border rounded-sm bg-gray-0 text-gray-700 text-xs cursor-not-allowed"
                />
                <button type="button" className="absolute right-0 top-0 h-full w-9 bg-blue-500 text-white rounded-r flex items-center justify-center cursor-not-allowed">
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={formData.leadStartTime}
                readOnly
                className="w-[30%] px-2 h-[38px] border rounded-sm bg-gray-0 text-gray-700 text-center text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="w-full lg:w-[33%] lg:pl-6 relative">
            <h3 className="font-semibold mb-2 text-sm">Lead Remind Date</h3>
            <div className="flex gap-2">
              <div className="relative w-1/2">
                <input
                  type="text"
                  value={formData.leadRemindDate || '0000-00-00'}
                  readOnly
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full pl-2 pr-9 h-[38px] border rounded-sm bg-white text-gray-400 cursor-pointer text-xs"
                  placeholder="0000-00-00"
                />
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="absolute right-0 top-0 h-full w-9 bg-blue-500 text-white rounded-r flex items-center justify-center hover:bg-blue-600"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              {/* Analog Time Picker Input */}
              <div className="relative w-1/2">
                <input
                  type="text"
                  value={formData.leadRemindTime || '12:15'}
                  readOnly
                  onClick={() => {
                    setShowTimePicker(!showTimePicker);
                    setSelectingMinute(false);
                  }}
                  className="w-full px-2 h-[38px] border rounded-sm bg-white text-gray-700 text-center cursor-pointer text-xs hover:bg-gray-50"
                  placeholder="00:00"
                />
              </div>
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
              <div className="absolute mt-1 bg-white border rounded-lg shadow-lg p-2 w-50 z-30">
                <div className="flex items-center justify-between mb-2">
                  <button type="button" onClick={prevMonth} className="text-blue-500 hover:text-blue-700 w-7 h-7 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <h3 className="font-semibold text-gray-700 text-xs">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button type="button" onClick={nextMonth} className="text-blue-500 hover:text-blue-700 w-7 h-7 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-gray-600 py-0.5">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0">
                  {daysInMonth(currentMonth).map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(item.day, item.isCurrentMonth)}
                      disabled={isPastDate(item.day, item.isCurrentMonth)}
                      className={`py-1 text-center rounded text-xs
    ${isPastDate(item.day, item.isCurrentMonth)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-blue-100 cursor-pointer'
                        }`}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analog Clock Time Picker Popup */}
            {showTimePicker && (
              <div className="absolute mt-2 bg-white border border-gray-500 rounded-lg shadow-lg overflow-hidden w-52 z-30 left-[65%] transform -translate-x-1/2">
                <div className="text-center mb-1 bg-white py-1.5">
                  <span className={`text-2xl font-light cursor-pointer ${selectingMinute ? 'text-gray-400' : 'text-cyan-400'}`}
                    onClick={() => setSelectingMinute(false)}>
                    {formData.leadRemindTime.split(':')[0]}
                  </span>
                  <span className="text-2xl font-light text-gray-400 mx-1">:</span>
                  <span className={`text-2xl font-light cursor-pointer ${selectingMinute ? 'text-cyan-400' : 'text-gray-400'}`}
                    onClick={() => setSelectingMinute(true)}>
                    {formData.leadRemindTime.split(':')[1]}
                  </span>
                </div>

                <div className="bg-gray-100 p-1.5">
                  <div
                    ref={clockRef}
                    className="relative w-40 h-40 mx-auto cursor-pointer select-none"
                    onClick={handleClockClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleClockMouseMove}
                  >
                    <div className="absolute inset-0 border-2 border-gray-300 rounded-full bg-white"></div>

                    {!selectingMinute ? (
                      <>
                        {/* Inner circle: 1-12 */}
                        {[...Array(12)].map((_, i) => {
                          const hour = i + 1;
                          const angle = (hour * 30 - 90) * (Math.PI / 180);
                          const radius = 40;
                          const x = 80 + radius * Math.cos(angle);
                          const y = 80 + radius * Math.sin(angle);
                          const currentHour = parseInt(formData.leadRemindTime.split(':')[0]);
                          const isSelected = currentHour === hour;

                          return (
                            <button
                              key={hour}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTimeClick(hour);
                              }}
                              className={`absolute w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-cyan-100 transition-colors ${isSelected ? 'bg-cyan-400 text-white font-semibold shadow-md' : 'text-gray-700 font-normal'
                                }`}
                              style={{
                                left: `${x - 12}px`,
                                top: `${y - 12}px`
                              }}
                            >
                              {hour}
                            </button>
                          );
                        })}

                        {/* Outer circle: 13-24/0 */}
                        {[...Array(12)].map((_, i) => {
                          const hour = i === 11 ? 0 : i + 13;
                          const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
                          const radius = 66;
                          const x = 80 + radius * Math.cos(angle);
                          const y = 80 + radius * Math.sin(angle);
                          const currentHour = parseInt(formData.leadRemindTime.split(':')[0]);
                          const isSelected = currentHour === hour;

                          return (
                            <button
                              key={`outer-${hour}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTimeClick(hour);
                              }}
                              className={`absolute w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-cyan-100 transition-colors ${isSelected ? 'bg-cyan-400 text-white font-semibold shadow-md' : 'text-gray-600 font-normal'
                                }`}
                              style={{
                                left: `${x - 12}px`,
                                top: `${y - 12}px`
                              }}
                            >
                              {hour === 0 ? '00' : hour}
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      /* Minutes: 0, 5, 10, ..., 55 */
                      [...Array(12)].map((_, i) => {
                        const minute = i * 5;
                        const angle = (i * 30 - 90) * (Math.PI / 180);
                        const radius = 66;
                        const x = 80 + radius * Math.cos(angle);
                        const y = 80 + radius * Math.sin(angle);
                        const currentMinute = parseInt(formData.leadRemindTime.split(':')[1]);
                        const isSelected = currentMinute === minute;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMinuteClick(minute);
                            }}
                            className={`absolute w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-cyan-100 transition-colors ${isSelected ? 'bg-cyan-400 text-white font-semibold shadow-md' : 'text-gray-600 font-normal'
                              }`}
                            style={{
                              left: `${x - 12}px`,
                              top: `${y - 12}px`
                            }}
                          >
                            {String(minute).padStart(2, '0')}
                          </button>
                        );
                      })
                    )}

                    {/* Clock hand with circle at end */}
                    <div
                      className="absolute w-0.5 bg-cyan-400 origin-bottom pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        height: selectingMinute ? '62px' : (currentRadius === 'inner' ? '38px' : '62px'),
                        transform: `translateX(-50%) translateY(-100%) rotate(${currentAngle}deg)`,
                        transformOrigin: 'bottom center',
                        transition: isDragging ? 'none' : 'all 0.15s ease-out'
                      }}
                    >
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full border-2 border-white shadow"></div>
                    </div>

                    {/* Center dot */}
                    <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Close time picker on outside click */}
            {showTimePicker && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => {
                  setShowTimePicker(false);
                  setSelectingMinute(false);
                }}
              />
            )}
          </div>
        </div>

        {/* -------------------- ADDRESS -------------------- */}
        <div className="flex flex-col lg:flex-row w-full mt-6 pb-6 border-b border-gray-200 gap-6">
          <div className="flex-1 lg:pr-6 lg:border-r border-gray-300">
            <h3 className="font-semibold mb-2">Address Information</h3>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-sm px-3 py-2 text-sm"
              placeholder="Address"
              style={{ minHeight: 70 }}
            />

            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="border rounded-sm px-3 h-[40px] w-full text-sm mt-4"
            />
          </div>

          <div className="w-full lg:w-[33%] lg:pl-6">
            <div className="h-full flex flex-col">
              <h3 className="font-semibold mb-2 lg:invisible">Address Details</h3>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="border rounded-sm px-3 h-[40px] w-full text-sm mb-3"
              />

              <select
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                disabled={loadingCountries}
                className="border rounded-sm px-3 h-[40px] w-full text-sm mb-3"
              >
                <option value="">
                  {loadingCountries ? "Loading countries..." : "Select Country"}
                </option>
                {countries.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.displayName}
                  </option>
                ))}
              </select>

              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* -------------------- PAYMENT -------------------- */}
        <div className="flex flex-col lg:flex-row w-full mt-6 pb-6 border-b border-gray-200 gap-6">
          <div className="flex-1 lg:pr-6 lg:border-r border-gray-300">
            <h3 className="font-semibold mb-2">Payment Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="expectedAmount"
                value={formData.expectedAmount}
                onChange={handleChange}
                placeholder="Expected Amount"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />

              <input
                name="paymentReceived"
                value={formData.paymentReceived}
                onChange={handleChange}
                placeholder="Payment Received"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
            </div>
          </div>

          <div className="w-full lg:w-[33%] lg:pl-6">
            <h3 className="font-semibold mb-2 lg:invisible">Comment</h3>

            <div className="flex gap-3 items-start">
              <textarea
                name="comment"
                value={isEditMode ? latestComment : formData.comment}
                onChange={handleChange}
                disabled={isEditMode}
                className={`flex-1 border rounded-sm px-3 py-2 text-sm leading-snug ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                placeholder="Comment"
                style={{ minHeight: 40 }}
              />

              {isEditMode && (
                <button
                  type="button"
                  onClick={scrollToActivityHistory}
                  className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 rounded text-sm font-medium h-[38px] transition-colors"
                >
                  Add Comment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* -------------------- SOCIAL -------------------- */}
        <div className="flex flex-col lg:flex-row w-full mt-6 pb-6 gap-6">
          <div className="flex-1 lg:pr-6 lg:border-r border-gray-300">
            <h3 className="font-semibold mb-2">Social Information</h3>

            <div className="space-y-3">
              <input
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="Facebook"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
              <input
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleChange}
                placeholder="LinkedIn"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
              <input
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="Twitter"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
            </div>
          </div>

          <div className="w-full lg:w-[33%] lg:pl-6">
            <h3 className="font-semibold mb-2 lg:invisible">Social Details</h3>

            <div className="space-y-3">
              <input
                name="skype"
                value={formData.skype}
                onChange={handleChange}
                placeholder="Skype"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
              <input
                name="gtalk"
                value={formData.gtalk}
                onChange={handleChange}
                placeholder="Gtalk"
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* -------------------- BOTTOM ACTIONS -------------------- */}
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-wrap">
              <label className="text-red-700 cursor-pointer font-semibold">
                Convert to Customer
              </label>

              <label className="text-teal-600 cursor-pointer font-semibold flex items-center gap-2">
                <input
                  type="radio"
                  name="convertOption"
                  value="deal"
                  checked={formData.convertOption === "deal"}
                  onChange={handleChange}
                />
                Convert to Deals
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                type="submit"
                disabled={submittedRef.current}
                className="bg-sky-600 cursor-pointer hover:bg-sky-700 text-white w-full sm:w-28 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittedRef.current ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white w-full sm:w-28 py-1.5 rounded text-sm transition-colors"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleCancelClick}
                className="bg-white cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-28 py-1.5 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* -------------------- MODALS -------------------- */}
      <CategoriesModal
        showModal={showCategoryModal}
        setShowModal={setShowCategoryModal}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleAddCategory={addCategory}
      />

      <ProductsTableModal
        showPopup={showProductModal}
        setShowPopup={setShowProductModal}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleSaveProduct={addProduct}
      />

      <LeadSourceModal
        showModal={showLeadSourceModal}
        setShowModal={setShowLeadSourceModal}
        newLeadName={newLeadName}
        setNewLeadName={setNewLeadName}
        handleAddLeadSource={addLeadSource}
      />

      <LeadStatusModal
        showModal={showLeadStatusModal}
        setShowModal={setShowLeadStatusModal}
        newLeadStatus={newLeadStatus}
        setNewLeadStatus={setNewLeadStatus}
        handleAddLeadStatus={addLeadStatus}
      />

      <TagModal
        showModal={showTagModal}
        setShowModal={setShowTagModal}
        newTag={newTag}
        setNewTag={setNewTag}
        handleAddTag={addTag}
      />

      {/* -------------------- ACTIVITY HISTORY - ONLY IN EDIT MODE -------------------- */}
      {isEditMode && existingData?._id && (
        <div ref={activityHistoryRef}>
          <br />
          <br />
          <ActivityHistory
            leadId={existingData._id}
            currentComment={latestComment}
            onCommentUpdate={handleCommentUpdate}
          />
        </div>
      )}
    </div>
  );
}