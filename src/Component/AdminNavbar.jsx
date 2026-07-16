import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Database,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Emblem from "../assets/images/emblem1.png";
import api from "../api/axiosClient";

export default function AdminNavbar() {
  const [collapsed, setCollapsed] = useState(false);

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/manageusers", label: "Manage users", icon: Users },
    { path: "/admin/managedata", label: "Manage Data", icon: Database },
    { path: "/admin/managebookings", label: "Manage bookings", icon: Calendar },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await api.post("/auth/logout");
      } catch {
        // Continue client-side logout even if the session is already expired.
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("admin");
      sessionStorage.clear();
      window.location.replace("/admin/login");
    }
  };

  return (
    <aside
      style={{
        width: collapsed ? 72 : 240,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1e40af 0%, #312e81 100%)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        zIndex: 50,
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          padding: "20px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          position: "relative",
          minHeight: 78,
        }}
      >
        <img
          src={Emblem}
          alt="NDR Logo"
          style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
        />
        {!collapsed && (
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "white", lineHeight: 1.3 }}>
              NDR (National Data Repository)
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>
              Management Portal
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            position: "absolute",
            right: -13,
            top: "50%",
            transform: "translateY(-50%)",
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "white",
            border: "1.5px solid #e2e8f0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          {collapsed ? (
            <ChevronRight size={13} color="#475569" />
          ) : (
            <ChevronLeft size={13} color="#475569" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              title={collapsed ? link.label : ""}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "12px 0" : "11px 14px",
                borderRadius: 10,
                textDecoration: "none",
                color: isActive ? "white" : "rgba(255,255,255,0.65)",
                background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              })}
            >
              <Icon size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "11px 0" : "11px 14px",
            background: "transparent",
            border: "1.5px solid rgba(252,165,165,0.5)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.borderColor = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(252,165,165,0.5)";
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
