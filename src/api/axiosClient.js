import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("user");
      sessionStorage.clear();
      const isAdminPath = window.location.pathname.startsWith("/admin");
      window.location.replace(isAdminPath ? "/admin/login" : "/login");
    }
    return Promise.reject(error);
  }
);

export default api;
