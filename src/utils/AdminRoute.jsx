import { Navigate } from "react-router-dom";

const decodeJwtPayload = (token) => {
  const payload = token?.split(".")[1];
  if (!payload) return null;
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
};

export default function AdminRoute({ children }) {
  let isAuthorized = false;
  try {
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("token");
    const admin = adminData ? JSON.parse(adminData) : null;
    const decoded = decodeJwtPayload(token);
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : 0;
    isAuthorized = !!(
      admin &&
      token &&
      admin.role === "ADMIN" &&
      decoded?.role === "ADMIN" &&
      expiresAt > Date.now()
    );
  } catch {
    isAuthorized = false;
  }
  return isAuthorized ? children : <Navigate to="/admin/login" />;
}
