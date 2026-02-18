// frontend/utils/api.ts - TENANT-AWARE API UTILITIES

import axios, { AxiosRequestConfig } from "axios";

// ============================================
// TYPES
// ============================================
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName?: string;
  avatar?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

interface TenantInfo {
  tenantId: string;
  tenantName: string;
  role: string;
}

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://one4-02-2026.onrender.com";

// Configure axios defaults
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

// ============================================
// GET STORED TOKEN
// ============================================
export const getToken = (): string | null => {
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
export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const userStr = localStorage.getItem("ts-user");
    if (!userStr) {
      console.warn("⚠️ No user data found");
      return null;
    }

    const user: User = JSON.parse(userStr);
    
    //Validate tenant data
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
export const configureAuthHeader = (): void => {
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
export const apiRequest = async <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  try {
    // Ensure token is in headers
    configureAuthHeader();

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error: any) {
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
export const apiGet = async <T = any>(url: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: "GET",
    url,
  });
};

/**
 * POST request with automatic tenant isolation
 */
export const apiPost = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: "POST",
    url,
    data,
  });
};

/**
 * PUT request with automatic tenant isolation
 */
export const apiPut = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: "PUT",
    url,
    data,
  });
};

/**
 * DELETE request with automatic tenant isolation
 */
export const apiDelete = async <T = any>(url: string): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: "DELETE",
    url,
  });
};

// ============================================
// VALIDATE SESSION
// ============================================
export const validateSession = (): boolean => {
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

  console.log("✅ Session valid:", {
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId,
  });

  return true;
};

// ============================================
// CHECK USER ROLE
// ============================================
export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "admin";
};

export const isSalesperson = (): boolean => {
  const user = getUser();
  return user?.role === "salesperson";
};

// ============================================
// GET TENANT INFO
// ============================================
export const getTenantInfo = (): TenantInfo | null => {
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