import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token and ensure proper multipart headers for FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nr_access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If payload is FormData, remove application/json so browser generates multipart boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;