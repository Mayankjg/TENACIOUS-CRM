// frontend/app/leads/CreateLead.jsx - COMPLETE MULTI-SOURCE TAG SELECTOR

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

import ActivityHistory from "./ActivityHistoryPage.js/ActivityHistory";
import CategoriesModal from "@/app/manage-items/categories/CategoriesModal";
import LeadSourceModal from "@/app/manage-items/lead-source/LeadSourceModal";
import LeadStatusModal from "@/app/manage-items/lead-status/LeadStatusModal";
import ProductsTableModal from "@/app/manage-items/products/ProductsTableModal";
import TagModal from "@/app/manage-items/tags/TagModal";

import {
  apiGet,
  apiPost,
  apiPut,
  validateSession,
  getUser,
  isAdmin,
  isSalesperson
} from "@/utils/api";

export default function CreateLead({ onSave, onCancel, existingData }) {
  const router = useRouter();
  const activityHistoryRef = useRef(null);
  const isEditMode = Boolean(existingData?._id);

  /* --------------------------- USER & SESSION --------------------------- */
  const [loggedUser, setLoggedUser] = useState(null);

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
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd"
        );
        const data = await response.json();

        const formattedCountries = data
          .map((country) => {
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
          .filter((c) => c.name && c.callingCode)
          .sort((a, b) => a.name.localeCompare(b.name));

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

  /* --------------------------- DEFAULT FORM --------------------------- */
  const defaultForm = useCallback(() => {
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
      leadRemindDate: now.toISOString().split("T")[0],
      leadRemindTime: now.toTimeString().slice(0, 5),
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

  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const submittedRef = useRef(false);

  /* --------------------------- DROPDOWNS --------------------------- */
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [tags, setTags] = useState([]);

  /* 🔥 MULTI-SOURCE TAG SYSTEM 🔥 */
  const [activeTagSource, setActiveTagSource] = useState("crm");
  const [systemeioTags, setSystemeioTags] = useState([]);
  const [whatsappTags, setWhatsappTags] = useState([]);
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
      const formattedTags = (data.tags || []).map(tag => ({
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

      const formattedTags = tagArray.map((tag) => ({
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
  // ✅ FIXED VERSION - Add loggedUser dependency
  useEffect(() => {
    if (!loggedUser) return; // ✅ Wait for user to load

    if (activeTagSource === "systemeio" && systemeioTags.length === 0) {
      fetchSystemeioTags();
    }
    if (activeTagSource === "whatsapp" && whatsappTags.length === 0) {
      fetchWhatsAppTags();
    }
  }, [activeTagSource, loggedUser]); // ✅ Added loggedUser dependency

  // 🔥 Get current tag list based on active source
  const getCurrentTagList = () => {
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

  /* --------------------------- COUNTRY CALLING CODE LOGIC --------------------------- */
  const extractPhoneNumber = (phoneValue, callingCode) => {
    if (!phoneValue) return "";

    const trimmed = phoneValue.trim();

    if (callingCode && trimmed.startsWith(callingCode)) {
      return trimmed.slice(callingCode.length).trim();
    }

    const cleanedPhone = trimmed.replace(/^\+\d{1,4}\s*/, "");
    return cleanedPhone;
  };

  const formatPhoneWithCode = (phoneNumber, callingCode) => {
    if (!phoneNumber) return callingCode ? `${callingCode} ` : "";

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) return callingCode ? `${callingCode} ` : "";

    return callingCode ? `${callingCode} ${cleanPhone}` : cleanPhone;
  };

  const handleCountryChange = (e) => {
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

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;

    const currentCountry = countries.find((c) => c.name === formData.country);
    const callingCode = currentCountry?.callingCode || "";

    if (callingCode && value && !value.startsWith(callingCode)) {
      const expectedPrefix = `${callingCode} `;
      if (!value.startsWith(expectedPrefix)) {
        const numberPart = extractPhoneNumber(value, callingCode);
        const newValue = formatPhoneWithCode(numberPart, callingCode);

        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

          if (t && typeof t === "object" && t.name) {
            return t.name;
          }

          if (t && typeof t === "object" && t._id) {
            const foundTag = tags.find((tag) => tag._id === t._id);
            if (foundTag) return foundTag.name;
          }

          return null;
        })
        .filter(Boolean);

      console.log("✅ Final normalized tags:", normalizedTags);

      setFormData({
        ...defaultForm(),
        ...existingData,
        tags: normalizedTags,
        salesperson: existingData.salesperson || "",
      });
    }
  }, [isEditMode, existingData, defaultForm, tags]);

  useEffect(() => {
    if (!isEditMode && userIsSalesperson && loggedUser?.username) {
      setFormData((p) => ({
        ...p,
        salesperson: loggedUser.username,
      }));
    }
  }, [isEditMode, userIsSalesperson, loggedUser]);

  /* --------------------------- INPUT --------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (userIsSalesperson && name === "salesperson") return;
    if (isEditMode && name === "comment") return;

    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  /* --------------------------- VALIDATION --------------------------- */
  const validateForm = () => {
    const e = {};
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

  const handleCommentUpdate = (newComment) => {
    console.log("📝 Comment Update Triggered:", newComment);
    setLatestComment(newComment);
    setFormData((prev) => ({
      ...prev,
      comment: newComment,
    }));
  };

  /* --------------------------- SUBMIT --------------------------- */
  const handleSubmit = async (e) => {
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

      if (isEditMode) {
        const updatePayload = {
          ...formData,
          comment: latestComment,
          tags: formData.tags || [],
        };

        const result = await apiPut(
          `/api/leads/update-lead/${existingData._id}`,
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
        };

        const result = await apiPost("/api/leads/create-lead", createPayload);

        if (!result.success) {
          throw new Error(result.error || "Failed to create lead");
        }

        console.log("✅ Lead created successfully");
        toast.success(result.data?.message || "Lead created successfully");
        handleReset();
        onSave?.({ success: true });
      }
    } catch (err) {
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
  const [newTag, setNewTag] = useState({
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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

      const createdTag = result.data;

      setTags((p) => [...p, createdTag]);

      setFormData((p) => ({
        ...p,
        tags: [...(p.tags || []), createdTag.name],
      }));

      setShowTagModal(false);
      setNewTag({ name: "", color: "#3B82F6", description: "" });
      toast.success("Tag added and selected!");
    } catch (error) {
      console.error("❌ Add Tag Error:", error);
      toast.error(error.message || "Failed to add tag");
    }
  };

  /* --------------------------- TAG SELECTION --------------------------- */
  const handleTagSelect = (tagName) => {
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

  const removeTag = (tagName) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagName),
    }));
  };

  /* --------------------------- FIELD CONFIG --------------------------- */
  const leftFields = [
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
              {leftFields.map(({ key, placeholder, isPhone }) => (
                <div key={key}>
                  <input
                    name={key}
                    value={formData[key] || ""}
                    onChange={isPhone ? handlePhoneChange : handleChange}
                    placeholder={placeholder}
                    className="border rounded-sm px-3 h-[40px] w-full text-sm"
                  />
                </div>
              ))}
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
                    className={`border rounded-sm px-3 h-[40px] w-full text-sm ${errors.salesperson ? "border-red-500" : ""
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
                    className="bg-gray-300 hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
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
                  className={`border rounded-sm px-3 h-[40px] w-full text-sm ${errors.category ? "border-red-500" : ""
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
                  className="bg-gray-300 hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
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
                  className={`border rounded-sm px-3 h-[40px] w-full text-sm ${errors.product ? "border-red-500" : ""
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
                  className="bg-gray-300 hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
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
                className="border rounded-sm px-3 h-[40px] w-full text-sm"
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
                className="bg-gray-300 hover:bg-gray-400 w-[40px] h-[40px] flex-shrink-0 rounded text-xl transition-colors"
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
                    // Find tag from any source
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

        {/* -------------------- DATES (Start & Remind) -------------------- */}
        <div className="flex flex-col lg:flex-row w-full border-b border-gray-200 mt-6 pb-6 gap-6">
          <div className="flex-1 lg:pr-6 lg:border-r border-gray-300">
            <h3 className="font-semibold mb-2">Lead Start Date</h3>
            <div className="flex gap-2">
              <input
                type="date"
                name="leadStartDate"
                value={formData.leadStartDate}
                onChange={handleChange}
                className="border cursor-pointer rounded-sm px-3 h-[40px] w-1/2 text-sm"
              />
              <input
                type="time"
                name="leadStartTime"
                value={formData.leadStartTime}
                onChange={handleChange}
                className="border cursor-pointer rounded-sm px-3 h-[40px] w-1/2 text-sm"
              />
            </div>
          </div>

          <div className="w-full lg:w-[33%] lg:pl-6">
            <h3 className="font-semibold mb-2">Lead Remind Date</h3>
            <div className="flex gap-2">
              <input
                type="date"
                name="leadRemindDate"
                value={formData.leadRemindDate}
                onChange={handleChange}
                className="border cursor-pointer rounded-sm px-3 h-[40px] w-1/2 text-sm"
              />
              <input
                type="time"
                name="leadRemindTime"
                value={formData.leadRemindTime}
                onChange={handleChange}
                className="border cursor-pointer rounded-sm px-3 h-[40px] w-1/2 text-sm"
              />
            </div>
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
      {isEditMode && (
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