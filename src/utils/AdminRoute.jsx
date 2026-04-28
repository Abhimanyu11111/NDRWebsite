import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  let isAuthorized = false;
  try {
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("token");
    const admin = adminData ? JSON.parse(adminData) : null;
    isAuthorized = !!(admin && token);
  } catch {
    isAuthorized = false;
  }
  return isAuthorized ? children : <Navigate to="/admin/login" />;
}