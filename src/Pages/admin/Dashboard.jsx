import { useEffect, useState } from "react";
import { Users, UserCheck, Hotel, Calendar, ArrowRight, CheckCircle2, Database, Shield } from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../../api/axiosClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/admin/dashboard/counts");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <AdminNavbar />

      <div style={pageStyle}>
        <div style={headerSection}>
          <h1 style={pageTitle}>Admin Dashboard</h1>
          <p style={subtitle}>Overview of your hotel management system</p>
        </div>

        {loading ? (
          <div style={loadingContainer}>
            <div style={spinner}></div>
            <p style={loadingText}>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* ===== SUMMARY CARDS ===== */}
            <div style={cardGrid}>
              <StatCard 
                title="Total Users" 
                value={stats.totalUsers}
                icon={Users}
                color="#3b82f6"
              />
              <StatCard 
                title="Active Users" 
                value={stats.activeUsers}
                icon={UserCheck}
                color="#10b981"
              />
              <StatCard 
                title="Total Rooms" 
                value={stats.totalRooms}
                icon={Hotel}
                color="#8b5cf6"
              />
              <StatCard 
                title="Total Bookings" 
                value={stats.totalBookings}
                icon={Calendar}
                color="#f59e0b"
              />
            </div>

            {/* ===== QUICK ACTIONS ===== */}
            <div style={section}>
              <h2 style={sectionTitle}>Quick Actions</h2>
              <div style={actionGrid}>
                <ActionCard 
                  label="Manage Users" 
                  link="/admin/manageusers"
                  icon={Users}
                  description="View and manage user accounts"
                />
                <ActionCard 
                  label="Manage Rooms" 
                  link="/admin/managedata"
                  icon={Hotel}
                  description="Update room inventory"
                />
                <ActionCard 
                  label="View Bookings" 
                  link="/admin/managebookings"
                  icon={Calendar}
                  description="Track all reservations"
                />
                {/* <ActionCard 
                  label="Reports" 
                  link="#"
                  icon={Database}
                  description="Analytics and insights"
                /> */}
              </div>
            </div>

            {/* ===== SYSTEM INFO ===== */}
            <div style={infoBox}>
              <h3 style={infoTitle}>System Status</h3>
              <div style={statusGrid}>
                <StatusItem label="All services operational" />
                <StatusItem label="Database connected" />
                <StatusItem label="Admin authentication active" />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div style={statCard}>
      <div style={statHeader}>
        <div style={{...iconCircle, background: `${color}15`}}>
          <Icon size={28} strokeWidth={2.5} style={{color: color}} />
        </div>
      </div>
      <p style={statTitle}>{title}</p>
      <h2 style={{...statValue, color: color}}>{value}</h2>
    </div>
  );
}

function ActionCard({ label, link, icon: Icon, description }) {
  return (
    <a href={link} style={actionCard}>
      <div style={actionIcon}>
        <Icon size={24} strokeWidth={2.5} style={{color: "#3b82f6"}} />
      </div>
      <div style={actionContent}>
        <h4 style={actionLabel}>{label}</h4>
        <p style={actionDescription}>{description}</p>
      </div>
      <div style={actionArrow}>
        <ArrowRight size={20} strokeWidth={2.5} style={{color: "#cbd5e1"}} />
      </div>
    </a>
  );
}

function StatusItem({ label }) {
  return (
    <div style={statusItem}>
      <CheckCircle2 size={20} strokeWidth={2.5} style={{color: "#10b981"}} />
      <span style={statusLabel}>{label}</span>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "40px 24px",
  background: "#f8fafc",
  minHeight: "100vh"
};

const headerSection = {
  marginBottom: "32px"
};

const pageTitle = {
  fontSize: "32px",
  fontWeight: "700",
  marginBottom: "8px",
  color: "#0f172a"
};

const subtitle = {
  fontSize: "16px",
  color: "#64748b",
  fontWeight: "400"
};

const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 20px",
  gap: "16px"
};

const spinner = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

const loadingText = {
  color: "#64748b",
  fontSize: "16px"
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
  marginBottom: "48px"
};

const statCard = {
  background: "white",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  border: "1px solid #e2e8f0",
  transition: "all 0.3s ease",
  cursor: "default"
};

const statHeader = {
  marginBottom: "16px"
};

const iconCircle = {
  width: "56px",
  height: "56px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const statTitle = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "8px",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const statValue = {
  fontSize: "36px",
  fontWeight: "700",
  margin: "0"
};

const section = {
  marginBottom: "48px"
};

const sectionTitle = {
  fontSize: "24px",
  fontWeight: "600",
  marginBottom: "20px",
  color: "#0f172a"
};

const actionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px"
};

const actionCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  border: "1px solid #e2e8f0",
  transition: "all 0.3s ease",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};

const actionIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  background: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0"
};

const actionContent = {
  flex: "1"
};

const actionLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 4px 0"
};

const actionDescription = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0"
};

const actionArrow = {
  flexShrink: "0"
};

const infoBox = {
  background: "white",
  padding: "28px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};

const infoTitle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "20px",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const statusGrid = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const statusItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const statusLabel = {
  fontSize: "15px",
  color: "#334155",
  fontWeight: "500"
};