"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import "./signup.css";

interface FormData {
  username: string;
  email: string;
  password: string;
  country: string;
  countryCode: string;
  contactNo: string;
  promoCode: string;
  role: string;
}

interface CountryCodes {
  [key: string]: string;
}

export default function Signup() {
  const router = useRouter();
  const { signupUser } = useAuth();

  const COUNTRY_CODES: CountryCodes = {
    India: "+91",
    USA: "+1",
    UK: "+44",
  };

  const [form, setForm] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    country: "",
    countryCode: "",
    contactNo: "",
    promoCode: "",
    role: "admin", // forced admin
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Auto Code Logic (READ ONLY)
    if (name === "country") {
      const code = COUNTRY_CODES[value] || "";
      setForm((prev) => ({
        ...prev,
        country: value,
        countryCode: code,
      }));
      return;
    }

    // Normal update
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Force role to admin on the backend as well
      const payload = { ...form, role: "admin" };
      await signupUser(payload);
      alert("Signup Successful!");
      router.push("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center transition-all duration-500 p-0 m-0"
      style={{
        backgroundImage: "url('../images/signup-bg.jpg')",
      }}
    >
      <div className="bg-white/95 p-6 sm:p-10 rounded-xl shadow-2xl w-[95%] sm:w-[750px] text-black">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-gray-800">
          Sign Up Now! Tenacious Sales
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username + Email */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Username
              </label>
              <input
                name="username"
                placeholder="Enter username"
                required
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter email"
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password + Country */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter password"
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Select Country
              </label>
              <select
                name="country"
                required
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Country</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </div>
          </div>

          {/* Code + Contact + Promo */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/2 flex space-x-4">
              <div className="w-1/3">
                <label className="block text-gray-700 mb-1 font-medium">
                  Code
                </label>
                <input
                  name="countryCode"
                  value={form.countryCode}
                  placeholder="+91"
                  required
                  readOnly // 👈 User cannot edit
                  className="w-full border p-3 rounded-md bg-gray-200 cursor-not-allowed outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-2/3">
                <label className="block text-gray-700 mb-1 font-medium">
                  Contact No
                </label>
                <input
                  name="contactNo"
                  required
                  placeholder="Enter contact no"
                  onChange={handleChange}
                  className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Promo Code
              </label>
              <input
                name="promoCode"
                placeholder="Enter promo code"
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>

            <Link
              href="/login"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}