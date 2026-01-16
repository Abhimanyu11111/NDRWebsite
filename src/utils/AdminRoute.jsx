import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const admin = JSON.parse(localStorage.getItem("admin"));
  return admin ? children : <Navigate to="/admin/login" />;
}
