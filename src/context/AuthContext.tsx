import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on initial load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("nr_access_token");
        if (!token) {
          setLoading(false);
          return;
        }
        const { data } = await api.get(ENDPOINTS.AUTH.ME);
        if (data?.data) {
          setUser(data.data);
        }
      } catch {
        localStorage.removeItem("nr_access_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    if (data?.data) {
      localStorage.setItem("nr_access_token", data.data.accessToken);
      setUser(data.data.user);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, { name, email, password, phone });
    if (data?.data) {
      localStorage.setItem("nr_access_token", data.data.accessToken);
      setUser(data.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem("nr_access_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};