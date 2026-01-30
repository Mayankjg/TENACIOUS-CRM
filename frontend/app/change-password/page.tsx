"use client";

import { useState, FormEvent, ChangeEvent } from "react";

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState<FormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Password change data:", formData);
    // Add your password change logic (API call, etc.)
  };

  const handleCancel = (): void => {
    setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen bg-[#e9ecef] flex justify-center items-start pt-10">
      <div className="w-full max-w-[1250px] bg-white border border-gray-200 rounded-sm shadow-sm">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-[18px] text-gray-800">
            Change <span className="font-semibold">Password</span>
          </h2>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-10 pb-0">
          {/* Old Password */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-[60%] border border-gray-300 rounded-sm px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-[60%] border border-gray-300 rounded-sm px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-0">
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-[60%] border border-gray-300 rounded-sm px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Section with Buttons */}
          <div className="bg-[#f5f7f9] h-[80px] w-[107%] mt-10 flex items-center gap-3 px-10 border-t border-gray-200 -mx-10 rounded-b-sm">
            <button
              type="submit"
              className="bg-[#007bff] text-white px-10 py-2 rounded-sm hover:bg-blue-600 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white border border-gray-300 text-gray-700 px-10 py-2 rounded-sm hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}