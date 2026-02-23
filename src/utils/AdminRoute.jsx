import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  try {
    const adminData = localStorage.getItem("admin");
    const admin = adminData ? JSON.parse(adminData) : null;
    
    return admin ? children : <Navigate to="/admin/login" />;
  } catch (error) {
    console.error("AdminRoute error:", error);
    return <Navigate to="/admin/login" />;
  }
}