import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (admin?.token) {
    config.headers.Authorization = `Bearer ${admin.token}`;
  }
  return config;
});

export default api;
