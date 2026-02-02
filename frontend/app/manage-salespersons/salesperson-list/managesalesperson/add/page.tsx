// frontend/app/manage-salespersons/salesperson-list/managesalesperson/add/page.tsx
// MULTI-TENANT FIXED

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// CRITICAL: Import tenant-aware utilities
import { validateSession, isAdmin } from "@/utils/api";

// --- Type Definitions ---

interface SalespersonFormData {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  country: string;
  countryCode: string;
  contactNo: string;
  profileImage: File | null;
}

const AddSalespersonForm: React.FC = () => {
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://two9-01-2026.onrender.com";

  const [formData, setFormData] = useState<SalespersonFormData>({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    country: "",
    countryCode: "",
    contactNo: "",
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // CRITICAL: Validate session and admin role on mount
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session");
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      console.error("❌ Not authorized - Admin only");
      router.push("/dashboard");
      return;
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // -------------------------------
  // HANDLE IMAGE (INPUT + DRAG / DROP)
  // -------------------------------
  const processImageFile = (file: File | undefined | null) => {
    if (!file) return;

    setFormData((prev) => ({ ...prev, profileImage: file }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.userName.trim()) newErrors.userName = "User Name is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.country) newErrors.country = "Please select a country";
    if (!formData.contactNo.trim())
      newErrors.contactNo = "Contact Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CRITICAL: Save with automatic tenant isolation (JWT token contains tenantId)
  const handleSave = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    if (!validateSession()) {
      console.error("❌ Cannot save - invalid session");
      alert("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();

    form.append("username", formData.userName);
    form.append("firstname", formData.firstName);
    form.append("lastname", formData.lastName);
    form.append("email", formData.email);
    form.append("designation", formData.designation);
    form.append("country", formData.country);
    form.append("contact", formData.countryCode + " " + formData.contactNo);
    form.append("password", "123456");

    if (formData.profileImage) {
      form.append("profileImage", formData.profileImage);
    }

    try {
      console.log("💾 Creating salesperson...");

      // Get token from localStorage
      const token = localStorage.getItem("ts-token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await axios.post(
        `${API_BASE}/api/salespersons/create-salesperson`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Salesperson created successfully");

      alert("Salesperson Saved Successfully!");
      router.push("/manage-salespersons/salesperson-list/managesalesperson");
    } catch (error: any) {
      console.error("❌ Error creating salesperson:", error);
      
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        router.push("/login");
      } else {
        alert(error.response?.data?.message || "Error: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      typeof window !== "undefined" &&
      confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost."
      )
    ) {
      router.push("/manage-salespersons/salesperson-list/managesalesperson");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm text-black">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-normal text-gray-700">
            Add <span className="font-semibold">Salesperson</span>
          </h1>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8">
          {/* ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                User Name*
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="User Name"
                className={`w-full px-4 py-2.5 border ${
                  errors.userName ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.userName && (
                <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
              )}
            </div>

            {/* IMAGE UPLOAD + DRAG DROP */}
            <div className="flex items-start gap-6">
              <div className="flex flex-col w-full">
                <label className="block text-sm text-gray-600 mb-2">
                  Profile Image
                </label>

                {/* File Input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded file:border file:border-gray-300
                  file:bg-white file:text-gray-700 cursor-pointer"
                />

                {/* Drag Drop Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`mt-3 border-2 ${
                    dragOver ? "border-cyan-500 bg-cyan-50" : "border-gray-300"
                  } border-dashed rounded p-3 text-center text-gray-500 text-sm cursor-pointer`}
                >
                  Drag & Drop Image Here
                </div>
              </div>

              <div className="w-[120px] h-[120px] border border-gray-300 rounded bg-white flex items-start justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-300 text-xs mt-2">No image</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                First Name*
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className={`w-full px-4 py-2.5 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Last Name*
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className={`w-full px-4 py-2.5 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className={`w-full px-4 py-2.5 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Designation*
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Designation"
                className={`w-full px-4 py-2.5 border ${
                  errors.designation ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors.designation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.designation}
                </p>
              )}
            </div>
          </div>

          {/* ROW 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Country*
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.country ? "border-red-500" : "border-gray-300"
                } rounded`}
              >
                <option value="">Select Country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="India">India</option>
                <option value="Australia">Australia</option>
              </select>
              {errors.country && (
                <p className="text-red-500 text-xs mt-1">{errors.country}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Country Code
                </label>
                <input
                  type="text"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  placeholder="Code"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Contact No*
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  placeholder="Contact No"
                  className={`w-full px-4 py-2.5 border ${
                    errors.contactNo ? "border-red-500" : "border-gray-300"
                  } rounded`}
                />
                {errors.contactNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactNo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-[#e5e9ec] border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-8 cursor-pointer py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 cursor-pointer text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSalespersonForm;