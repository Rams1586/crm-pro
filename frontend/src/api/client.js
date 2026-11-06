import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_admin");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
