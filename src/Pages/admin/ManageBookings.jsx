import { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, XCircle, Search, Filter, Eye } from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/booking/admin/all");
        setBookings(res.data);
      } catch (err) {
        console.log("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div style={loadingContainer}>
          <div style={spinnerWrapper}>
            <div style={spinner}></div>
            <p style={loadingText}>Loading bookings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={pageWrapper}>
        {/* Header Section */}
        <div style={headerSection}>
          <div style={headerContent}>
            <div>
              <h1 style={pageTitle}>Manage Bookings</h1>
              <p style={pageSubtitle}>View and manage all booking requests</p>
            </div>
            <div style={headerStats}>
              <span style={totalCount}>{bookings.length}</span>
              <span style={totalLabel}>Total Bookings</span>
            </div>
          </div>
        </div>

        <div style={contentContainer}>
          {/* Stats Cards */}
          <div style={statsGrid}>
            <StatCard
              icon={Calendar}
              label="Total Bookings"
              value={bookings.length}
              color="#3b82f6"
              bgColor="#eff6ff"
            />
            <StatCard
              icon={CheckCircle}
              label="Confirmed"
              value={bookings.filter((b) => b.status === "Booked").length}
              color="#10b981"
              bgColor="#f0fdf4"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={bookings.filter((b) => b.status === "Pending").length}
              color="#f59e0b"
              bgColor="#fffbeb"
            />
            <StatCard
              icon={XCircle}
              label="Cancelled"
              value={bookings.filter((b) => b.status === "Cancelled").length}
              color="#ef4444"
              bgColor="#fef2f2"
            />
          </div>

          {/* Filters Section */}
          <div style={filtersCard}>
            <div style={filtersGrid}>
              <div style={filterGroup}>
                <label style={filterLabel}>Search Bookings</label>
                <div style={searchWrapper}>
                  <Search size={18} strokeWidth={2.5} style={searchIconStyle} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInput}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      style={clearButton}
                    >
                      <XCircle size={18} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{marginRight: "6px"}} />
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={selectInput}
                >
                  <option>All</option>
                  <option>Booked</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            {(searchTerm || statusFilter !== "All") && (
              <div style={activeFilters}>
                <span style={activeFilterText}>Active Filters:</span>
                {searchTerm && (
                  <span style={filterTag}>
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} style={removeFilter}>
                      <XCircle size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                )}
                {statusFilter !== "All" && (
                  <span style={filterTag}>
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("All")} style={removeFilter}>
                      <XCircle size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table Card */}
          <div style={tableCard}>
            {filteredBookings.length === 0 ? (
              <div style={emptyState}>
                <Calendar size={64} strokeWidth={1.5} style={{color: "#94a3b8", marginBottom: "16px"}} />
                <h3 style={emptyTitle}>No bookings found</h3>
                <p style={emptyText}>
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "No bookings have been made yet"}
                </p>
                {(searchTerm || statusFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                    }}
                    style={clearFiltersButton}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={tableWrapper}>
                  <table style={table}>
                    <thead>
                      <tr style={tableHeaderRow}>
                        <th style={tableHeader}>Booking ID</th>
                        <th style={tableHeader}>Customer Details</th>
                        <th style={tableHeader}>Contact</th>
                        <th style={tableHeader}>Amount</th>
                        <th style={tableHeader}>Status</th>
                        <th style={tableHeader}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b, index) => (
                        <BookingRow
                          key={b.id}
                          booking={b}
                          navigate={navigate}
                          isEven={index % 2 === 0}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Results Footer */}
                <div style={resultsFooter}>
                  <span style={resultsText}>
                    Showing <strong>{filteredBookings.length}</strong> of{" "}
                    <strong>{bookings.length}</strong> bookings
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div style={statCard}>
      <div style={{...iconBox, backgroundColor: bgColor}}>
        <Icon size={28} strokeWidth={2.5} style={{color: color}} />
      </div>
      <div style={statContent}>
        <p style={statLabel}>{label}</p>
        <p style={{...statValue, color: color}}>{value}</p>
      </div>
    </div>
  );
}

function BookingRow({ booking, navigate, isEven }) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      Booked: { bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
      Pending: { bg: "#fef3c7", color: "#92400e", Icon: Clock },
      Cancelled: { bg: "#fee2e2", color: "#991b1b", Icon: XCircle }
    };
    return configs[status] || configs.Pending;
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.Icon;

  return (
    <tr
      style={{
        ...tableRow,
        backgroundColor: isHovered ? "#f8fafc" : (isEven ? "#ffffff" : "#fafbfc")
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={tableCell}>
        <div style={bookingId}>#{booking.id}</div>
      </td>
      <td style={tableCell}>
        <div style={customerInfo}>
          <div style={customerName}>{booking.user_name}</div>
          <div style={customerEmail}>{booking.user_email}</div>
        </div>
      </td>
      <td style={tableCell}>
        <div style={phoneNumber}>{booking.user_phone}</div>
      </td>
      <td style={tableCell}>
        <div style={amount}>₹{booking.amount?.toLocaleString('en-IN')}</div>
      </td>
      <td style={tableCell}>
        <span style={{...statusBadge, backgroundColor: statusConfig.bg, color: statusConfig.color}}>
          <StatusIcon size={14} strokeWidth={2.5} />
          {booking.status}
        </span>
      </td>
      <td style={tableCell}>
        <button
          onClick={() => navigate(`/admin/bookingdetails/${booking.id}`)}
          style={viewButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
        >
          <Eye size={16} strokeWidth={2.5} />
          View Details
        </button>
      </td>
    </tr>
  );
}

/* ================= STYLES ================= */

const pageWrapper = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc"
};

const loadingContainer = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const spinnerWrapper = {
  textAlign: "center"
};

const spinner = {
  width: "48px",
  height: "48px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto"
};

const loadingText = {
  marginTop: "16px",
  color: "#64748b",
  fontSize: "16px",
  fontWeight: "500"
};

const headerSection = {
  backgroundColor: "white",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
};

const headerContent = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "32px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "24px",
  flexWrap: "wrap"
};

const pageTitle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 8px 0"
};

const pageSubtitle = {
  fontSize: "16px",
  color: "#64748b",
  margin: 0
};

const headerStats = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "4px"
};

const totalCount = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#3b82f6",
  lineHeight: "1"
};

const totalLabel = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500"
};

const contentContainer = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "32px 24px"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
  marginBottom: "32px"
};

const statCard = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease"
};

const iconBox = {
  width: "56px",
  height: "56px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const statContent = {
  flex: 1
};

const statLabel = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500",
  margin: "0 0 4px 0"
};

const statValue = {
  fontSize: "32px",
  fontWeight: "700",
  margin: 0
};

const filtersCard = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};

const filtersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px"
};

const filterGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const filterLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155",
  display: "flex",
  alignItems: "center"
};

const searchWrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const searchIconStyle = {
  position: "absolute",
  left: "12px",
  color: "#94a3b8",
  pointerEvents: "none"
};

const searchInput = {
  width: "100%",
  padding: "10px 40px 10px 40px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  transition: "all 0.2s"
};

const clearButton = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#94a3b8",
  padding: "4px",
  display: "flex",
  alignItems: "center"
};

const selectInput = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "white",
  cursor: "pointer",
  transition: "all 0.2s"
};

const activeFilters = {
  marginTop: "16px",
  paddingTop: "16px",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  alignItems: "center"
};

const activeFilterText = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#64748b"
};

const filterTag = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  backgroundColor: "#eff6ff",
  color: "#1e40af",
  fontSize: "13px",
  fontWeight: "500",
  borderRadius: "6px",
  border: "1px solid #bfdbfe"
};

const removeFilter = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#1e40af",
  padding: "0",
  marginLeft: "4px",
  display: "flex",
  alignItems: "center"
};

const tableCard = {
  backgroundColor: "white",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};

const emptyState = {
  textAlign: "center",
  padding: "80px 24px"
};

const emptyTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 8px 0"
};

const emptyText = {
  fontSize: "15px",
  color: "#64748b",
  margin: "0 0 24px 0"
};

const clearFiltersButton = {
  padding: "10px 20px",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s"
};

const tableWrapper = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const tableHeaderRow = {
  backgroundColor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0"
};

const tableHeader = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const tableRow = {
  borderBottom: "1px solid #e2e8f0",
  transition: "all 0.2s"
};

const tableCell = {
  padding: "20px",
  whiteSpace: "nowrap"
};

const bookingId = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#3b82f6"
};

const customerInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const customerName = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#0f172a"
};

const customerEmail = {
  fontSize: "14px",
  color: "#64748b"
};

const phoneNumber = {
  fontSize: "14px",
  color: "#334155",
  fontWeight: "500"
};

const amount = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#0f172a"
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  fontSize: "13px",
  fontWeight: "600",
  borderRadius: "20px"
};

const viewButton = {
  padding: "10px 20px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

const resultsFooter = {
  padding: "16px 20px",
  borderTop: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc"
};

const resultsText = {
  fontSize: "14px",
  color: "#64748b"
};