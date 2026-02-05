// frontend/app/leads/CreateLead.tsx - MERGED VERSION WITH CALENDAR & ANALOG CLOCK

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

import {
  apiGet, apiPost, apiPut, validateSession, getUser, isAdmin, isSalesperson
} from "@/utils/api";

// Types
interface Country {
  name: string;
  callingCode: string;
  displayName: string;
}

interface User {
  id: string;
  role: string;
  tenantId: string;
  username: string;
  tenantName?: string;
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
  source?: string;
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

interface ExistingData extends FormData {
  _id: string;
  createdAt?: string;
}

interface CreateLeadProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
  existingData?: ExistingData | null;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
}

interface LeftField {
  key: keyof FormData;
  placeholder: string;
  isPhone?: boolean;
}

export default function CreateLead({ onSave, onCancel, existingData }: CreateLeadProps) {
  const router = useRouter();
  const activityHistoryRef = useRef<HTMLDivElement>(null);
  const isEditMode = Boolean(existingData?._id);

  /* --------------------------- USER & SESSION --------------------------- */
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session");
      router.push("/login");
      return;
    }

    const user = getUser();
    if (user) {
      setLoggedUser(user);
      console.log("✅ User loaded:", {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      });
    }
  }, [router]);

  const userIsAdmin = isAdmin();
  const userIsSalesperson = isSalesperson();

  /* --------------------------- COUNTRIES --------------------------- */
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

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
        console.error("❌ Error fetching countries:", error);
        toast.error("Failed to load countries");
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  /* --------------------------- CALENDAR & TIME PICKER STATE --------------------------- */
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const submittedRef = useRef(false);

  /* --------------------------- DROPDOWNS --------------------------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  /* 🔥 MULTI-SOURCE TAG SYSTEM 🔥 */
  const [activeTagSource, setActiveTagSource] = useState<"crm" | "systemeio" | "whatsapp">("crm");
  const [systemeioTags, setSystemeioTags] = useState<Tag[]>([]);
  const [whatsappTags, setWhatsappTags] = useState<Tag[]>([]);
  const [loadingExternalTags, setLoadingExternalTags] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // 🔥 Fetch Systeme.io Tags
  const fetchSystemeioTags = async () => {
    try {
      setLoadingExternalTags(true);
      console.log("🔄 Fetching Systeme.io tags...");

      const response = await fetch("https://api.systeme.io/v1/tags", {
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SYSTEMEIO_API_KEY || ""}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Systeme.io tags");
      }

      const data = await response.json();
      const formattedTags: Tag[] = (data.tags || []).map((tag: any) => ({
        _id: `systemeio_${tag.id}`,
        name: tag.name,
        color: "#FF6B00",
        source: "systemeio"
      }));

      setSystemeioTags(formattedTags);
      console.log("✅ Systeme.io tags loaded:", formattedTags.length);
    } catch (error) {
      console.error("❌ Failed to fetch Systeme.io tags:", error);
      toast.error("Failed to load Systeme.io tags");
      setSystemeioTags([]);
    } finally {
      setLoadingExternalTags(false);
    }
  };

  // 🔥 Fetch WhatsApp Tags - FIXED VERSION
  const fetchWhatsAppTags = async () => {
    try {
      setLoadingExternalTags(true);
      console.log("🔄 Fetching WhatsApp tags via CRM backend...");

      const customerId = "1"; // working WhatsApp customerId
      const result = await apiGet(`/api/external-tags/whatsapp/${customerId}`);

      console.log("📦 Full API result:", result);

      if (!result.success) {
        throw new Error("API call failed");
      }

      const tagArray = Array.isArray(result.data?.data)
        ? result.data.data
        : [];

      console.log("🏷️ Extracted WhatsApp tags:", tagArray);

      const formattedTags: Tag[] = tagArray.map((tag: any) => ({
        _id: `whatsapp_${tag.id}`,
        name: tag.tag,
        color: "#25D366",
        source: "whatsapp",
      }));

      setWhatsappTags(formattedTags);
    } catch (error) {
      console.error("❌ Failed to fetch WhatsApp tags:", error);
      setWhatsappTags([]);
    } finally {
      setLoadingExternalTags(false);
    }
  };

  // 🔥 Load external tags when switching tabs
  useEffect(() => {
    if (!loggedUser) return;

    if (activeTagSource === "systemeio" && systemeioTags.length === 0) {
      fetchSystemeioTags();
    }
    if (activeTagSource === "whatsapp" && whatsappTags.length === 0) {
      fetchWhatsAppTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTagSource, loggedUser]);

  // 🔥 Get current tag list based on active source
  const getCurrentTagList = (): Tag[] => {
    switch (activeTagSource) {
      case "systemeio":
        return systemeioTags;
      case "whatsapp":
        return whatsappTags;
      case "crm":
      default:
        return tags;
    }
  };

  const fetchDropdownData = useCallback(async () => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch dropdown data - invalid session");
      return;
    }

    try {
      console.log("🔄 Fetching dropdown data...");

      const [cat, prod, src, status, sales, tagsResponse] = await Promise.all([
        apiGet("/api/manage-items/categories/get-categories"),
        apiGet("/api/manage-items/products/get-products"),
        apiGet("/api/manage-items/lead-source/get-lead-sources"),
        apiGet("/api/manage-items/lead-status/get-lead-status"),
        apiGet("/api/salespersons/get-salespersons"),
        apiGet("/api/manage-items/tags/get-tags"),
      ]);

      setCategories(cat.success ? cat.data || [] : []);
      setProducts(prod.success ? prod.data || [] : []);
      setLeadSources(src.success ? src.data || [] : []);
      setLeadStatuses(status.success ? status.data || [] : []);
      setSalespersons(sales.success ? sales.data || [] : []);
      setTags(tagsResponse.success ? tagsResponse.data || [] : []);

      console.log("✅ Dropdown data loaded");
    } catch (error) {
      console.error("❌ Error fetching dropdown data:", error);
      toast.error("Failed to load dropdown data");
    }
  }, []);

  useEffect(() => {
    if (loggedUser) {
      fetchDropdownData();
    }
  }, [loggedUser, fetchDropdownData]);

  /* --------------------------- CALENDAR FUNCTIONS --------------------------- */
  const daysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
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

  const isPastDate = (day: number, isCurrentMonth: boolean): boolean => {
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
      const isInnerCircle = distance < 65;
      let selectedHour: number;
      let hourPosition = Math.round(angle / 30) % 12;

      if (isInnerCircle) {
        selectedHour = hourPosition === 0 ? 12 : hourPosition;
      } else {
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

  const getCurrentAngle = (): number => {
    const [hours, minutes] = formData.leadRemindTime.split(':').map(Number);
    if (selectingMinute) {
      return (minutes / 60) * 360;
    } else {
      let hour12 = hours % 12;
      if (hour12 === 0) hour12 = 12;
      return (hour12 / 12) * 360;
    }
  };

  const getCurrentRadius = (): 'inner' | 'outer' => {
    if (selectingMinute) return 'outer';
    const hours = parseInt(formData.leadRemindTime.split(':')[0]);
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

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "phone" | "mobile") => {
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
        .map((t: any) => {
          if (typeof t === "string") {
            if (t.length === 24 && /^[a-f0-9]{24}$/i.test(t)) {
              const foundTag = tags.find((tag) => tag._id === t);
              if (foundTag) return foundTag.name;
              return null;
            }
            return t;
          }

          if (t && typeof t === "object" && t.name) {
            return t.name;
          }

          if (t && typeof t === "object" && t._id) {
            const foundTag = tags.find((tag) => tag._id === t._id);
            if (foundTag) return foundTag.name;
          }

          return null;
        })
        .filter(Boolean) as string[];

      console.log("✅ Final normalized tags:", normalizedTags);

      setFormData({
        ...defaultForm(),
        ...existingData,
        tags: normalizedTags,
        salesperson: existingData.salesperson || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData, tags]);

  useEffect(() => {
    if (!isEditMode && userIsSalesperson && loggedUser?.username) {
      setFormData((p) => ({
        ...p,
        salesperson: loggedUser.username,
      }));
    }
  }, [isEditMode, userIsSalesperson, loggedUser]);

  /* --------------------------- INPUT --------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (userIsSalesperson && name === "salesperson") return;
    if (isEditMode && name === "comment") return;

    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  /* --------------------------- VALIDATION --------------------------- */
  const validateForm = (): Partial<Record<keyof FormData, string>> => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName) e.firstName = "Required";
    if (!formData.salesperson) e.salesperson = "Required";
    if (!formData.category) e.category = "Required";
    if (!formData.product) e.product = "Required";
    if (!formData.leadStatus) e.leadStatus = "Required";
    return e;
  };

  /* --------------------------- ACTIVITY HISTORY --------------------------- */
  const [latestComment, setLatestComment] = useState("");

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittedRef.current) return;
    submittedRef.current = true;

    if (!validateSession()) {
      console.error("❌ Session invalid - cannot submit");
      toast.error("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    const errs = validateForm();
    setErrors(errs);

    if (Object.keys(errs).length) {
      toast.error("Please fill required fields");
      submittedRef.current = false;
      return;
    }

    try {
      console.log("💾 Submitting lead...", { isEditMode });

      const user = getUser();

      if (!user || !user.tenantId) {
        throw new Error("Missing tenant information");
      }

      if (isEditMode) {
        const updatePayload = {
          ...formData,
          comment: latestComment,
          tags: formData.tags || [],
          tenantId: user.tenantId,
        };

        console.log("📤 Update Payload:", updatePayload);

        const result = await apiPut(
          `/api/leads/update-lead/${existingData!._id}`,
          updatePayload
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to update lead");
        }

        console.log("✅ Lead updated successfully");
        toast.success(result.data?.message || "Lead updated successfully");
        onSave?.(result.data);
      } else {
        const createPayload = {
          ...formData,
          tags: formData.tags || [],
          tenantId: user.tenantId,
        };

        console.log("📤 Create Payload:", createPayload);

        const result = await apiPost("/api/leads/create-lead", createPayload);

        if (!result.success) {
          throw new Error(result.error || "Failed to create lead");
        }

        console.log("✅ Lead created successfully");
        toast.success(result.data?.message || "Lead created successfully");
        handleReset();
        onSave?.({ success: true });
      }
    } catch (err: any) {
      console.error("❌ Submit Error:", err);
      toast.error(err.message || "Something went wrong");
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showLeadSourceModal, setShowLeadSourceModal] = useState(false);
  const [showLeadStatusModal, setShowLeadStatusModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadStatus, setNewLeadStatus] = useState("");
  const [newTag, setNewTag] = useState<Omit<Tag, '_id'>>({
    name: "",
    color: "#3B82F6",
    description: "",
  });

  const addCategory = async () => {
    try {
      const result = await apiPost("/api/manage-items/categories/create-category", {
        name: newCategoryName,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add category");
      }

      setCategories((p) => [...p, result.data]);
      setFormData((p) => ({ ...p, category: result.data.name }));
      setShowCategoryModal(false);
      setNewCategoryName("");
      toast.success("Category added successfully");
    } catch (error: any) {
      console.error("❌ Add Category Error:", error);
      toast.error(error.message || "Failed to add category");
    }
  };

  const addProduct = async () => {
    try {
      const result = await apiPost("/api/manage-items/products/create-product", {
        name: newProduct,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add product");
      }

      setProducts((p) => [...p, result.data]);
      setFormData((p) => ({ ...p, product: result.data.name }));
      setShowProductModal(false);
      setNewProduct("");
      toast.success("Product added successfully");
    } catch (error: any) {
      console.error("❌ Add Product Error:", error);
      toast.error(error.message || "Failed to add product");
    }
  };

  const addLeadSource = async () => {
    try {
      const result = await apiPost("/api/manage-items/lead-source/create-lead-source", {
        name: newLeadName,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add lead source");
      }

      setLeadSources((p) => [...p, result.data]);
      setFormData((p) => ({ ...p, leadSource: result.data.name }));
      setShowLeadSourceModal(false);
      setNewLeadName("");
      toast.success("Lead source added successfully");
    } catch (error: any) {
      console.error("❌ Add Lead Source Error:", error);
      toast.error(error.message || "Failed to add lead source");
    }
  };

  const addLeadStatus = async () => {
    try {
      const result = await apiPost("/api/manage-items/lead-status/create-lead-status", {
        name: newLeadStatus,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add lead status");
      }

      setLeadStatuses((p) => [...p, result.data]);
      setFormData((p) => ({ ...p, leadStatus: result.data.name }));
      setShowLeadStatusModal(false);
      setNewLeadStatus("");
      toast.success("Lead status added successfully");
    } catch (error: any) {
      console.error("❌ Add Lead Status Error:", error);
      toast.error(error.message || "Failed to add lead status");
    }
  };

  const addTag = async () => {
    if (!newTag.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const result = await apiPost("/api/manage-items/tags/create-tag", newTag);

      if (!result.success) {
        throw new Error(result.error || "Failed to add tag");
      }

      const createdTag: Tag = result.data;

      setTags((p) => [...p, createdTag]);

      setFormData((p) => ({
        ...p,
        tags: [...(p.tags || []), createdTag.name],
      }));

      setShowTagModal(false);
      setNewTag({ name: "", color: "#3B82F6", description: "" });
      toast.success("Tag added and selected!");
    } catch (error: any) {
      console.error("❌ Add Tag Error:", error);
      toast.error(error.message || "Failed to add tag");
    }
  };

  /* --------------------------- TAG SELECTION --------------------------- */
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
  const leftFields: LeftField[] = [
    { key: "lastName", placeholder: "Last Name" },
    { key: "company", placeholder: "Company Name" },
    { key: "email", placeholder: "Email address" },
    { key: "phone", placeholder: "Phone Number", isPhone: true },
    { key: "mobile", placeholder: "Mobile", isPhone: true },
    { key: "fax", placeholder: "Fax" },
    { key: "designation", placeholder: "Designation" },
    { key: "website", placeholder: "Website" },
  ];

  /* -------------------- UI -------------------- */
  const currentCountry = countries.find((c) => c.name === formData.country);
  const currentCallingCode = currentCountry?.callingCode || "";
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentAngle = getCurrentAngle();
  const currentRadius = getCurrentRadius();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

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
                      <div className="relative h-[40px]">
                        <div className="absolute left-0 top-0 h-full w-[50px] border border-r-0 rounded-l-sm bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium select-none pointer-events-none z-10">
                          {currentCallingCode || "+91"}
                        </div>

                        <input
                          type="text"
                          name={key}
                          value={extractPhoneNumber(
                            formData[key as "phone" | "mobile"] || "",
                            currentCallingCode
                          )}
                          onChange={(e) =>
                            handlePhoneInputChange(e, key as "phone" | "mobile")
                          }
                          placeholder={placeholder}
                          className="w-full h-full border rounded-sm pl-[68px] pr-3 outline-none text-sm"
                        />

                      </div>
                    </div>
                  );
                }

                // Special handling for website field - add country beside it
                if (key === "website") {
                  return (
                    <React.Fragment key={key}>
                      <div>
                        <input
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="border rounded-sm px-3 h-[40px] w-full text-sm"
                        />
                      </div>

                      {/* Country dropdown beside website */}
                      <div>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleCountryChange}
                          disabled={loadingCountries}
                          className={`border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm ${errors.country ? "border-red-500" : ""
                            }`}
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
                        {errors.country && (
                          <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                        )}
                      </div>
                    </React.Fragment>
                  );
                }

                return (
                  <div key={key}>
                    <input
                      name={key}
                      value={formData[key] || ""}
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
            {userIsAdmin && (
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

            {/* 🔥 MULTI-SOURCE TAG SELECTOR 🔥 */}
            <div>
              <div className="flex gap-2 items-center mb-2">
                <label className="font-medium text-sm">Tags</label>
                {activeTagSource === "crm" && (
                  <button
                    type="button"
                    onClick={() => setShowTagModal(true)}
                    className="bg-gray-300 cursor-pointer hover:bg-gray-400 w-[30px] h-[30px] flex-shrink-0 rounded text-lg transition-colors"
                  >
                    +
                  </button>
                )}
              </div>

              {/* 🔥 TAB SELECTOR - Systeme.io Style */}
              <div className="flex cursor-pointer gap-1 mb-2 border-b border-gray-300">
                <button
                  type="button"
                  onClick={() => setActiveTagSource("crm")}
                  className={`px-4 cursor-pointer py-2 text-sm font-medium transition-all ${activeTagSource === "crm"
                    ? "cursor-pointer border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 cursor-pointer  hover:text-gray-800"
                    }`}
                >
                  CRM Tags
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTagSource("systemeio")}
                  className={`px-4 cursor-pointer py-2 text-sm font-medium transition-all ${activeTagSource === "systemeio"
                    ? " cursor-pointer border-b-2 border-orange-600 text-orange-600"
                    : "text-gray-600 cursor-pointer  hover:text-gray-800"
                    }`}
                >
                  Systeme.io
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTagSource("whatsapp")}
                  className={`px-4 cursor-pointer py-2 text-sm font-medium transition-all ${activeTagSource === "whatsapp"
                    ? "cursor-pointer border-b-2 border-green-600 text-green-600"
                    : "text-gray-600 cursor-pointer  hover:text-gray-800"
                    }`}
                >
                  WhatsApp
                </button>
              </div>

              {/* SELECTED TAGS DISPLAY */}
              <div className="flex flex-wrap cursor-pointer gap-2 mb-2 min-h-[36px] p-2 border rounded-sm bg-gray-50">
                {formData.tags && formData.tags.length > 0 ? (
                  formData.tags.map((tagName) => {
                    let tagColor = "#3B82F6";
                    const crmTag = tags.find((t) => t.name === tagName);
                    const systemeioTag = systemeioTags.find((t) => t.name === tagName);
                    const whatsappTag = whatsappTags.find((t) => t.name === tagName);

                    if (crmTag) tagColor = crmTag.color;
                    else if (systemeioTag) tagColor = systemeioTag.color;
                    else if (whatsappTag) tagColor = whatsappTag.color;

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

              {/* DROPDOWN TO SELECT TAGS FROM CURRENT SOURCE */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  disabled={loadingExternalTags}
                  className="border cursor-pointer rounded-sm px-3 h-[40px] w-full text-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-gray-600">
                    {loadingExternalTags
                      ? "Loading tags..."
                      : formData.tags?.length > 0
                        ? `${formData.tags.length} tag(s) selected`
                        : `Select ${activeTagSource === "crm" ? "CRM" : activeTagSource === "systemeio" ? "Systeme.io" : "WhatsApp"} tags`}
                  </span>
                  <span className="text-gray-400">▼</span>
                </button>

                {/* DROPDOWN MENU */}
                {showTagDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-sm shadow-lg max-h-[200px] overflow-y-auto">
                    {loadingExternalTags ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-500">
                        Loading tags...
                      </div>
                    ) : getCurrentTagList().length > 0 ? (
                      getCurrentTagList().map((tag) => {
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
                            {tag.source && tag.source !== "crm" && (
                              <span className="text-xs text-gray-400 italic">
                                ({tag.source})
                              </span>
                            )}
                          </label>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {activeTagSource === "crm"
                          ? "No tags available. Create one using the + button."
                          : `No ${activeTagSource} tags available.`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CLICK OUTSIDE TO CLOSE DROPDOWN */}
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
                  value={formData.leadRemindDate || 'yyyy-mm-dd'}
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
                  value={formData.leadRemindTime || '00:00'}
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

                {/* Day Picker - only show when neither month nor year picker is active */}
                {!showMonthPicker && !showYearPicker && (
                  <>
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
                          className={`py-1 text-center rounded text-xs ${isPastDate(item.day, item.isCurrentMonth)
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-blue-100 cursor-pointer'
                            }`}
                        >
                          {item.day}
                        </button>
                      ))}
                    </div>
                  </>
                )}
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
        newTag={newTag as any}
        setNewTag={setNewTag as any}
        handleAddTag={addTag}
      />


      {/* -------------------- ACTIVITY HISTORY - ONLY IN EDIT MODE -------------------- */}
      {isEditMode && (
        <div ref={activityHistoryRef}>
          <br />
          <br />
          <ActivityHistory
            leadId={existingData!._id}
            currentComment={latestComment}
            onCommentUpdate={handleCommentUpdate}
          />
        </div>
      )}
    </div>
  );
}