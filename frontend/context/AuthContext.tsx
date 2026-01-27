"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

// Type definitions
interface User {
  username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  [key: string]: any;
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  country: string;
  countryCode: string;
  contactNo: string;
  promoCode?: string;
  role: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  tokenReady: boolean;
  loading: boolean;
  signupUser: (formData: SignupFormData) => Promise<any>;
  loginUser: (formData: LoginFormData) => Promise<AuthResponse>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | undefined => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return undefined;
};

const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  axios.defaults.baseURL = "https://tt-crm-pro.onrender.com";
  axios.defaults.withCredentials = true;

  // LOAD STORED USER + TOKEN
  useEffect(() => {
    const savedUser = localStorage.getItem("ts-user");
    const savedToken = localStorage.getItem("ts-token") || getCookie("ts-token");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
      }
    }

    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }

    setTokenReady(true);
    setLoading(false);
  }, []);

  // SIGNUP
  async function signupUser(formData: SignupFormData): Promise<any> {
    const res = await axios.post("/api/auth/register", formData);
    return res.data;
  }

  // LOGIN
  async function loginUser(formData: LoginFormData): Promise<AuthResponse> {
    const res = await axios.post<AuthResponse>("/api/auth/login", formData);

    const { user, token } = res.data;

    localStorage.setItem("ts-user", JSON.stringify(user));
    localStorage.setItem("ts-token", token);
    setCookie("ts-token", token);

    setUser(user);
    setToken(token);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setTokenReady(true);

    return res.data;
  }

  // LOGOUT
  function logout(): void {
    localStorage.removeItem("ts-user");
    localStorage.removeItem("ts-token");
    removeCookie("ts-token");

    delete axios.defaults.headers.common["Authorization"];

    setUser(null);
    setToken(null);
    setTokenReady(false);
  }

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}