"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaLock, FaUserPlus, FaEnvelopeOpenText } from "react-icons/fa";

export default function Login() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "admin",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await loginUser(form); 
      // alert("Login Successful!");
      router.push("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center transition-all duration-500 p-0 m-0"
      // style={{
      //   backgroundImage: "url('../images/login-bg.jpg')",
      // }}
    >
      {/* Card Section */}
      <div className="bg-white/95 p-6 sm:p-10 rounded-xl shadow-2xl w-[90%] sm:w-[700px] text-black">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-gray-800">
          Sign In! Tenacious Sales
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email + Password Row */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            {/* Email */}
            <div className="w-full sm:w-1/2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="w-full sm:w-1/2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Below Section */}
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            {/* Left side options */}
            <div className="space-y-2 text-sm text-gray-700 w-full sm:w-1/2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>

              <div className="flex items-center space-x-2">
                <FaLock className="text-blue-600" />
                <a href="#" className="text-blue-600">
                  Forgot Password?
                </a>
                <span>|</span>
                <FaUserPlus className="text-blue-600" />
                <Link href="/signup" className="text-blue-600">
                  Sign Up
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <FaEnvelopeOpenText className="text-gray-600" />
                <a href="#" className="text-gray-600 text-sm">
                  Resend Activation Link
                </a>
              </div>
            </div>

            {/* Role + Login button */}
            <div className="space-y-3 w-full sm:w-1/2 flex flex-col items-start">
              <div className="flex space-x-4 text-gray-800">
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    defaultChecked
                    onChange={handleChange}
                  />{" "}
                  Admin
                </label>

                <label>
                  <input
                    type="radio"
                    name="role"
                    value="salesperson"
                    onChange={handleChange}
                  />{" "}
                  Salesperson
                </label>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
