// frontend/utils/api.js - TENANT-AWARE API UTILITIES

import axios from "axios";

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://tenacious-techies-crm-01.onrender.com";

// Configure axios defaults
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

// ============================================
// GET STORED TOKEN
// ============================================
export const getToken = () => {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("ts-token");
  if (!token) {
    console.warn("⚠️ No auth token found");
  }
  return token;
};

// ============================================
// GET STORED USER WITH TENANT
// ============================================
export const getUser = () => {
  if (typeof window === "undefined") return null;
  
  try {
    const userStr = localStorage.getItem("ts-user");
    if (!userStr) {
      console.warn("⚠️ No user data found");
      return null;
    }

    const user = JSON.parse(userStr);
    
    // ✅ CRITICAL: Validate tenant data
    if (!user.tenantId) {
      console.error("❌ User data missing tenantId");
      return null;
    }

    return user;
  } catch (err) {
    console.error("❌ Failed to parse user data:", err);
    return null;
  }
};

// ============================================
// CONFIGURE AUTH HEADER
// ============================================
export const configureAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("✅ Auth header configured");
  } else {
    delete axios.defaults.headers.common["Authorization"];
    console.warn("⚠️ No token available for auth header");
  }
};

// ============================================
// API REQUEST WRAPPER WITH ERROR HANDLING
// ============================================
export const apiRequest = async (config) => {
  try {
    // Ensure token is in headers
    configureAuthHeader();

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ API Error:", {
      url: config.url,
      method: config.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error("❌ Session expired - clearing auth data");
      localStorage.removeItem("ts-user");
      localStorage.removeItem("ts-token");
      
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// ============================================
// TENANT-AWARE API METHODS
// ============================================

/**
 * GET request with automatic tenant isolation
 */
export const apiGet = async (url) => {
  return apiRequest({
    method: "GET",
    url,
  });
};

/**
 * POST request with automatic tenant isolation
 */
export const apiPost = async (url, data) => {
  return apiRequest({
    method: "POST",
    url,
    data,
  });
};

/**
 * PUT request with automatic tenant isolation
 */
export const apiPut = async (url, data) => {
  return apiRequest({
    method: "PUT",
    url,
    data,
  });
};

/**
 * DELETE request with automatic tenant isolation
 */
export const apiDelete = async (url) => {
  return apiRequest({
    method: "DELETE",
    url,
  });
};

// ============================================
// VALIDATE SESSION
// ============================================
export const validateSession = () => {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    console.error("❌ Invalid session - missing user or token");
    return false;
  }

  if (!user.tenantId) {
    console.error("❌ Invalid session - missing tenantId");
    return false;
  }

  console.log("Session valid:", {
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId,
  });

  return true;
};

// ============================================
// CHECK USER ROLE
// ============================================
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};

export const isSalesperson = () => {
  const user = getUser();
  return user?.role === "salesperson";
};

// ============================================
// GET TENANT INFO
// ============================================
export const getTenantInfo = () => {
  const user = getUser();
  if (!user) return null;

  return {
    tenantId: user.tenantId,
    tenantName: user.tenantName || user.username,
    role: user.role,
  };
};

// ============================================
// EXPORT API BASE URL
// ============================================
export { API_BASE };