import { useEffect, useState } from "react";
import {
  Users, UserCheck, UserX, Search, Eye, X,
  Mail, Phone, Shield, Calendar, Hash, Activity
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../../api/axiosClient";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Try both possible URLs
        let res;
        try {
          res = await api.get("/admin/users");
        } catch {
          res = await api.get("/admin/dashboard/users");
        }

        const data = res.data;

        // Handle all response shapes
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data?.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else if (data?.data && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          setUsers([]);
          console.warn("Unexpected users response shape:", data);
        }
      } catch (err) {
        console.error("Error fetching users", err);
        setError(err.response?.data?.message || "Failed to load users. Check server logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div style={loadingContainer}>
          <div style={spinnerWrapper}>
            <div style={spinner}></div>
            <p style={loadingText}>Loading users...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <AdminNavbar />
        <div style={loadingContainer}>
          <div style={{ textAlign: "center" }}>
            <UserX size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Failed to Load Users</h2>
            <p style={{ color: "#64748b", marginBottom: 16 }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={pageWrapper}>
        {/* Header */}
        <div style={headerSection}>
          <div style={headerContent}>
            <div>
              <h1 style={pageTitle}>Manage Users</h1>
              <p style={pageSubtitle}>View and manage all registered users</p>
            </div>
            <div style={headerStats}>
              <span style={totalCount}>{users.length}</span>
              <span style={totalLabel}>Total Users</span>
            </div>
          </div>
        </div>

        <div style={contentContainer}>
          {/* Stats */}
          <div style={statsGrid}>
            <StatCard icon={Users} label="Total Users" value={users.length} color="#3b82f6" bgColor="#eff6ff" />
            <StatCard icon={UserCheck} label="Active Users" value={users.filter((u) => u.is_active || u.status === "Active").length} color="#10b981" bgColor="#f0fdf4" />
            <StatCard icon={UserX} label="Inactive Users" value={users.filter((u) => !u.is_active && u.status !== "Active").length} color="#f59e0b" bgColor="#fffbeb" />
          </div>

          {/* Search */}
          <div style={searchCard}>
            <div style={searchWrapper}>
              <Search size={18} strokeWidth={2.5} style={searchIconStyle} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInput}
              />
              {search && (
                <button onClick={() => setSearch("")} style={clearButton}>
                  <X size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={tableCard}>
            {filteredUsers.length === 0 ? (
              <div style={emptyState}>
                <Users size={64} strokeWidth={1.5} style={{ color: "#94a3b8", marginBottom: "16px" }} />
                <h3 style={emptyTitle}>No users found</h3>
                <p style={emptyText}>{search ? "Try adjusting your search criteria" : "No users registered yet"}</p>
                {search && (
                  <button onClick={() => setSearch("")} style={clearFiltersButton}>Clear Search</button>
                )}
              </div>
            ) : (
              <>
                <div style={tableWrapper}>
                  <table style={table}>
                    <thead>
                      <tr style={tableHeaderRow}>
                        <th style={tableHeader}>User ID</th>
                        <th style={tableHeader}>Name</th>
                        <th style={tableHeader}>Email</th>
                        <th style={tableHeader}>Phone</th>
                        <th style={tableHeader}>Role</th>
                        <th style={tableHeader}>Status</th>
                        <th style={tableHeader}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, index) => (
                        <UserRow key={u.id} user={u} onView={setSelectedUser} isEven={index % 2 === 0} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={resultsFooter}>
                  <span style={resultsText}>
                    Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedUser && (
        <div style={overlayStyle} onClick={() => setSelectedUser(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={modalHeaderContent}>
                <div style={modalUserIcon}><Users size={24} strokeWidth={2.5} /></div>
                <div>
                  <h3 style={modalTitle}>User Details</h3>
                  <p style={modalSubtitle}>Complete user information</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={closeBtn}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div style={modalBody}>
              <DetailRow label="User ID" value={`#${selectedUser.id}`} icon={Hash} />
              <DetailRow label="Name" value={selectedUser.name} icon={Users} />
              <DetailRow label="Email" value={selectedUser.email} icon={Mail} />
              <DetailRow label="Phone" value={selectedUser.phone || "—"} icon={Phone} />
              <DetailRow label="Role" value={selectedUser.role} icon={Shield} />
              <DetailRow label="Company" value={selectedUser.company || "—"} icon={Activity} />
              <DetailRow
                label="Status"
                value={
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                    backgroundColor: (selectedUser.is_active || selectedUser.status === "Active") ? "#dcfce7" : "#fee2e2",
                    color: (selectedUser.is_active || selectedUser.status === "Active") ? "#166534" : "#991b1b",
                  }}>
                    {(selectedUser.is_active || selectedUser.status === "Active")
                      ? <UserCheck size={14} /> : <UserX size={14} />}
                    {(selectedUser.is_active || selectedUser.status === "Active") ? "Active" : "Inactive"}
                  </span>
                }
                icon={Activity}
              />
              <DetailRow
                label="Joined"
                value={selectedUser.created_at
                  ? new Date(selectedUser.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
                icon={Calendar}
              />
            </div>
            <div style={modalFooter}>
              <button onClick={() => setSelectedUser(null)} style={closeActionBtn}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1f2937"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#374151"}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Sub-components ── */
function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div style={statCard}>
      <div style={{ ...iconBox, backgroundColor: bgColor }}>
        <Icon size={28} strokeWidth={2.5} style={{ color }} />
      </div>
      <div style={statContent}>
        <p style={statLabel}>{label}</p>
        <p style={{ ...statValue, color }}>{value}</p>
      </div>
    </div>
  );
}

function UserRow({ user, onView, isEven }) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = user.is_active || user.status === "Active";

  return (
    <tr
      style={{ ...tableRow, backgroundColor: isHovered ? "#f8fafc" : (isEven ? "#ffffff" : "#fafbfc") }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={tableCell}><span style={userIdStyle}>#{user.id}</span></td>
      <td style={tableCell}><span style={userNameStyle}>{user.name || "—"}</span></td>
      <td style={tableCell}><span style={userEmailStyle}>{user.email || "—"}</span></td>
      <td style={tableCell}><span style={userPhoneStyle}>{user.phone || "—"}</span></td>
      <td style={tableCell}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
          background: user.role === "ADMIN" ? "#fef3c7" : "#f1f5f9",
          color: user.role === "ADMIN" ? "#92400e" : "#475569"
        }}>
          {user.role || "USER"}
        </span>
      </td>
      <td style={tableCell}>
        <span style={{
          ...statusBadge,
          backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
          color: isActive ? "#166534" : "#991b1b"
        }}>
          {isActive ? <UserCheck size={13} strokeWidth={2.5} /> : <UserX size={13} strokeWidth={2.5} />}
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td style={tableCell}>
        <button onClick={() => onView(user)} style={viewButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}>
          <Eye size={15} strokeWidth={2.5} />
          View
        </button>
      </td>
    </tr>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div style={detailRow}>
      <div style={detailLabel}><Icon size={16} strokeWidth={2.5} style={{ color: "#64748b" }} />{label}</div>
      <div style={detailValue}>{value || "—"}</div>
    </div>
  );
}

/* ── Styles ── */
const pageWrapper = { minHeight: "100vh", backgroundColor: "#f8fafc" };
const loadingContainer = { minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" };
const spinnerWrapper = { textAlign: "center" };
const spinner = { width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" };
const loadingText = { marginTop: "16px", color: "#64748b", fontSize: "16px", fontWeight: "500" };
const headerSection = { backgroundColor: "white", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const headerContent = { maxWidth: "1400px", margin: "0 auto", padding: "32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap" };
const pageTitle = { fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" };
const pageSubtitle = { fontSize: "16px", color: "#64748b", margin: 0 };
const headerStats = { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" };
const totalCount = { fontSize: "36px", fontWeight: "700", color: "#3b82f6", lineHeight: "1" };
const totalLabel = { fontSize: "14px", color: "#64748b", fontWeight: "500" };
const contentContainer = { maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" };
const statCard = { backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const iconBox = { width: "56px", height: "56px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const statContent = { flex: 1 };
const statLabel = { fontSize: "14px", color: "#64748b", fontWeight: "500", margin: "0 0 4px 0" };
const statValue = { fontSize: "32px", fontWeight: "700", margin: 0 };
const searchCard = { backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const searchWrapper = { position: "relative", display: "flex", alignItems: "center" };
const searchIconStyle = { position: "absolute", left: "12px", color: "#94a3b8", pointerEvents: "none" };
const searchInput = { width: "100%", padding: "12px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "15px", outline: "none" };
const clearButton = { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", display: "flex", alignItems: "center" };
const tableCard = { backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const emptyState = { textAlign: "center", padding: "80px 24px" };
const emptyTitle = { fontSize: "20px", fontWeight: "600", color: "#0f172a", margin: "0 0 8px 0" };
const emptyText = { fontSize: "15px", color: "#64748b", margin: "0 0 24px 0" };
const clearFiltersButton = { padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer" };
const tableWrapper = { overflowX: "auto" };
const table = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" };
const tableHeader = { padding: "14px 18px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" };
const tableRow = { borderBottom: "1px solid #e2e8f0", transition: "all 0.2s" };
const tableCell = { padding: "16px 18px", whiteSpace: "nowrap" };
const userIdStyle = { fontSize: "14px", fontWeight: "600", color: "#3b82f6" };
const userNameStyle = { fontSize: "14px", fontWeight: "600", color: "#0f172a" };
const userEmailStyle = { fontSize: "13px", color: "#64748b" };
const userPhoneStyle = { fontSize: "13px", color: "#334155", fontWeight: "500" };
const statusBadge = { display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", fontSize: "12px", fontWeight: "700", borderRadius: "20px" };
const viewButton = { padding: "8px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" };
const resultsFooter = { padding: "14px 20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" };
const resultsText = { fontSize: "14px", color: "#64748b" };
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modalStyle = { background: "white", width: "90%", maxWidth: "520px", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", overflow: "hidden" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" };
const modalHeaderContent = { display: "flex", alignItems: "center", gap: "16px" };
const modalUserIcon = { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalTitle = { fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0" };
const modalSubtitle = { fontSize: "14px", opacity: 0.9, margin: 0 };
const modalBody = { padding: "24px" };
const detailRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", marginBottom: "8px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" };
const detailLabel = { fontSize: "14px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", gap: "8px" };
const detailValue = { fontSize: "14px", color: "#0f172a", fontWeight: "500" };
const modalFooter = { padding: "16px 24px", textAlign: "right", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" };
const closeBtn = { background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "white", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" };
const closeActionBtn = { padding: "10px 24px", background: "#374151", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s" };