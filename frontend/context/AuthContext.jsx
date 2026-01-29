// frontend/context/AuthContext.jsx - COMPLETE MULTI-TENANT FIX

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // CRITICAL: Configure axios baseURL
  axios.defaults.baseURL = "https://tenacious-techies-crm-01.onrender.com";
  axios.defaults.withCredentials = true;

  // ============================================
  // LOAD STORED USER + TOKEN ON MOUNT
  // ============================================
  useEffect(() => {
    const savedUser = localStorage.getItem("ts-user");
    const savedToken = localStorage.getItem("ts-token") || Cookies.get("ts-token");

    console.log("🔍 Auth Context - Initial Load:", {
      hasUser: !!savedUser,
      hasToken: !!savedToken,
    });

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        //  Validate tenant data
        if (!parsedUser.tenantId) {
          console.error("❌ Invalid user data - missing tenantId");
          handleInvalidSession();
          return;
        }

        setUser(parsedUser);
        console.log("✅ User loaded:", {
          id: parsedUser.id,
          role: parsedUser.role,
          tenantId: parsedUser.tenantId,
        });
      } catch (err) {
        console.error("❌ Failed to parse user data:", err);
        handleInvalidSession();
        return;
      }
    }

    if (savedToken) {
      setToken(savedToken);
      //  Set Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      console.log("✅ Token configured in axios");
    }

    setTokenReady(true);
    setLoading(false);
  }, []);

  // ============================================
  // HANDLE INVALID SESSION
  // ============================================
  const handleInvalidSession = () => {
    localStorage.removeItem("ts-user");
    localStorage.removeItem("ts-token");
    Cookies.remove("ts-token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    setTokenReady(false);
  };

  // ============================================
  // SIGNUP
  // ============================================
  async function signupUser(formData) {
    try {
      const res = await axios.post("/api/auth/register", formData);
      console.log("✅ Signup successful:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data);
      throw err;
    }
  }

  // ============================================
  // LOGIN - FIXED WITH TENANT VALIDATION
  // ============================================
  async function loginUser(formData) {
    try {
      console.log("🔐 Attempting login...", { email: formData.email, role: formData.role });

      const res = await axios.post("/api/auth/login", formData);
      const { user, token } = res.data;

      console.log("✅ Login response:", {
        userId: user?.id,
        role: user?.role,
        tenantId: user?.tenantId,
        hasToken: !!token,
      });

      //  Validate tenant data in response
      if (!user || !user.tenantId) {
        console.error("❌ Invalid login response - missing tenant data");
        throw new Error("Invalid server response - missing tenant information");
      }

      if (!token) {
        console.error("❌ Invalid login response - missing token");
        throw new Error("Invalid server response - missing authentication token");
      }

      //  Store with tenant validation
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId, // ✅ MUST HAVE
        tenantName: user.tenantName || user.username,
        avatar: user.avatar || "/images/profile.png",
      };

      console.log("💾 Storing user data:", userData);

      localStorage.setItem("ts-user", JSON.stringify(userData));
      localStorage.setItem("ts-token", token);
      Cookies.set("ts-token", token, { 
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      });

      setUser(userData);
      setToken(token);

      //  Set Authorization header immediately
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setTokenReady(true);

      console.log("✅Login complete - tenant context set");

      return res.data;
    } catch (err) {
      console.error("❌ Login error:", {
        message: err.message,
        response: err.response?.data,
      });
      handleInvalidSession();
      throw err;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  function logout() {
    console.log("👋 Logging out user");
    
    localStorage.removeItem("ts-user");
    localStorage.removeItem("ts-token");
    Cookies.remove("ts-token");
    delete axios.defaults.headers.common["Authorization"];

    setUser(null);
    setToken(null);
    setTokenReady(false);

    // IMPORTANT: Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // ============================================
  // AXIOS INTERCEPTOR - HANDLE 401 GLOBALLY
  // ============================================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error("❌ 401 Unauthorized - Session expired");
          handleInvalidSession();
          
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tokenReady,
        loading,
        signupUser,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}