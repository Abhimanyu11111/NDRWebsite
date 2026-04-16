import { useEffect, useState, useMemo } from "react";
import { Calendar, CheckCircle, Clock, XCircle, Search, Filter, Eye } from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [roomTypeFilter, setRoomTypeFilter] = useState("All");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState("All");
  const [priceSort, setPriceSort] = useState("None");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // correct URL
        const res = await api.get("/admin/dashboard/bookings");
        const data = res.data;

        //  handle both array and { bookings: [] } shape
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data?.bookings && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
          console.warn("Unexpected bookings response:", data);
        }
      } catch (err) {
        console.log("Error fetching bookings:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set(
      bookings.map((b) => b.start_datetime ? new Date(b.start_datetime).getFullYear() : null).filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [bookings]);

  const availableLicenseTypes = useMemo(() => {
    const types = new Set(bookings.map((b) => b.license_type).filter(Boolean));
    return Array.from(types).sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => {
      const matchesSearch =
        b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userPhone?.includes(searchTerm) ||
        b.booking_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const year = b.start_datetime ? new Date(b.start_datetime).getFullYear() : null;
      const month = b.start_datetime ? new Date(b.start_datetime).getMonth() + 1 : null;
      const matchesYear = yearFilter === "All" || String(year) === yearFilter;
      const matchesMonth = monthFilter === "All" || String(month) === monthFilter;
      const matchesRoomType = roomTypeFilter === "All" || b.room_type === roomTypeFilter;
      const matchesLicense = licenseTypeFilter === "All" || b.license_type === licenseTypeFilter;
      return matchesSearch && matchesStatus && matchesYear && matchesMonth && matchesRoomType && matchesLicense;
    });
    if (priceSort === "Low") result = [...result].sort((a, b) => Number(a.total_price || 0) - Number(b.total_price || 0));
    if (priceSort === "High") result = [...result].sort((a, b) => Number(b.total_price || 0) - Number(a.total_price || 0));
    return result;
  }, [bookings, searchTerm, statusFilter, yearFilter, monthFilter, roomTypeFilter, licenseTypeFilter, priceSort]);

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
        {/* Header */}
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
            <StatCard icon={Calendar} label="Total Bookings" value={bookings.length} color="#3b82f6" bgColor="#eff6ff" />
            <StatCard icon={CheckCircle} label="Confirmed" value={bookings.filter((b) => b.status === "CONFIRMED").length} color="#10b981" bgColor="#f0fdf4" />
            <StatCard icon={Clock} label="Pending" value={bookings.filter((b) => b.status === "PENDING").length} color="#f59e0b" bgColor="#fffbeb" />
            <StatCard icon={XCircle} label="Cancelled" value={bookings.filter((b) => b.status === "CANCELLED").length} color="#ef4444" bgColor="#fef2f2" />
          </div>

          {/* Filters */}
          <div style={filtersCard}>
            <div style={filtersGrid}>
              <div style={filterGroup}>
                <label style={filterLabel}>Search Bookings</label>
                <div style={searchWrapper}>
                  <Search size={18} strokeWidth={2.5} style={searchIconStyle} />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInput}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} style={clearButton}>
                      <XCircle size={18} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} />
                  Filter by Status
                </label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectInput}>
                  <option value="All">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} />
                  Room Type
                </label>
                <select value={roomTypeFilter} onChange={(e) => setRoomTypeFilter(e.target.value)} style={selectInput}>
                  <option value="All">All Room Types</option>
                  <option value="OALP">OALP</option>
                  <option value="DSF">DSF</option>
                  <option value="CBM">CBM</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} />
                  License Type
                </label>
                <select value={licenseTypeFilter} onChange={(e) => setLicenseTypeFilter(e.target.value)} style={selectInput}>
                  <option value="All">All License Types</option>
                  {availableLicenseTypes.map((lt) => (
                    <option key={lt} value={lt}>{lt}</option>
                  ))}
                </select>
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} />
                  Filter by Year
                </label>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectInput}>
                  <option value="All">All Years</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} />
                  Filter by Month
                </label>
                <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={selectInput}>
                  <option value="All">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select> 
              </div>

              <div style={filterGroup}>
                <label style={filterLabel}>
                  <Filter size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} />
                  Sort by Price
                </label>
                <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)} style={selectInput}>
                  <option value="None">Default Order</option>
                  <option value="Low">Price: Low to High</option>
                  <option value="High">Price: High to Low</option>
                </select>
              </div>
            </div>

            {(searchTerm || statusFilter !== "All" || yearFilter !== "All" || monthFilter !== "All" || roomTypeFilter !== "All" || licenseTypeFilter !== "All" || priceSort !== "None") && (
              <div style={activeFilters}>
                <span style={activeFilterText}>Active Filters:</span>
                {searchTerm && (
                  <span style={filterTag}>Search: "{searchTerm}" <button onClick={() => setSearchTerm("")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                {statusFilter !== "All" && (
                  <span style={filterTag}>Status: {statusFilter} <button onClick={() => setStatusFilter("All")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                {roomTypeFilter !== "All" && (
                  <span style={filterTag}>Room: {roomTypeFilter} <button onClick={() => setRoomTypeFilter("All")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                {licenseTypeFilter !== "All" && (
                  <span style={filterTag}>License: {licenseTypeFilter} <button onClick={() => setLicenseTypeFilter("All")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                {yearFilter !== "All" && (
                  <span style={filterTag}>Year: {yearFilter} <button onClick={() => setYearFilter("All")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                {monthFilter !== "All" && (
                  <span style={filterTag}>Month: {["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(monthFilter)]} <button onClick={() => setMonthFilter("All")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                {priceSort !== "None" && (
                  <span style={filterTag}>Price: {priceSort === "Low" ? "Low→High" : "High→Low"} <button onClick={() => setPriceSort("None")} style={removeFilter}><XCircle size={14} /></button></span>
                )}
                <button
                  onClick={() => { setSearchTerm(""); setStatusFilter("All"); setYearFilter("All"); setMonthFilter("All"); setRoomTypeFilter("All"); setLicenseTypeFilter("All"); setPriceSort("None"); }}
                  style={{ ...removeFilter, color: "#dc2626", fontSize: 13, fontWeight: 600, padding: "4px 8px" }}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div style={tableCard}>
            {filteredBookings.length === 0 ? (
              <div style={emptyState}>
                <Calendar size={64} strokeWidth={1.5} style={{ color: "#94a3b8", marginBottom: "16px" }} />
                <h3 style={emptyTitle}>No bookings found</h3>
                <p style={emptyText}>
                  {(searchTerm || statusFilter !== "All" || yearFilter !== "All" || monthFilter !== "All" || roomTypeFilter !== "All" || licenseTypeFilter !== "All" || priceSort !== "None")
                    ? "Try adjusting your search or filter criteria"
                    : "No bookings have been made yet"}
                </p>
                {(searchTerm || statusFilter !== "All" || yearFilter !== "All" || monthFilter !== "All" || roomTypeFilter !== "All" || licenseTypeFilter !== "All" || priceSort !== "None") && (
                  <button onClick={() => { setSearchTerm(""); setStatusFilter("All"); setYearFilter("All"); setMonthFilter("All"); setRoomTypeFilter("All"); setLicenseTypeFilter("All"); setPriceSort("None"); }} style={clearFiltersButton}>
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
                        <th style={tableHeader}>Customer</th>
                        <th style={tableHeader}>Room</th>
                        <th style={tableHeader}>Type</th>
                        <th style={tableHeader}>Check-in</th>
                        <th style={tableHeader}>Check-out</th>
                        <th style={tableHeader}>Amount</th>
                        <th style={tableHeader}>Status</th>
                        <th style={tableHeader}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b, index) => (
                        <BookingRow key={b.booking_id || b.id} booking={b} navigate={navigate} isEven={index % 2 === 0} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={resultsFooter}>
                  <span style={resultsText}>
                    Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
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

/* ── Components ── */
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

function BookingRow({ booking, navigate, isEven }) {
  const [isHovered, setIsHovered] = useState(false);

  const statusMap = {
    CONFIRMED: { bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
    PENDING: { bg: "#fef3c7", color: "#92400e", Icon: Clock },
    CANCELLED: { bg: "#fee2e2", color: "#991b1b", Icon: XCircle },
    COMPLETED: { bg: "#dbeafe", color: "#1e40af", Icon: CheckCircle },
    EXPIRED: { bg: "#f1f5f9", color: "#475569", Icon: XCircle },
  };
  const cfg = statusMap[booking.status] || statusMap.PENDING;
  const StatusIcon = cfg.Icon;

  return (
    <tr
      style={{ ...tableRow, backgroundColor: isHovered ? "#f8fafc" : (isEven ? "#ffffff" : "#fafbfc") }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={tableCell}>
        <div style={bookingIdStyle}>
          <code style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
            {booking.booking_id}
          </code>
        </div>
      </td>
      <td style={tableCell}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={customerName}>{booking.userName || "—"}</span>
          <span style={customerEmail}>{booking.userEmail || "—"}</span>
        </div>
      </td>
      <td style={tableCell}><span style={{ fontSize: 14, color: "#334155" }}>{booking.roomTitle || "—"}</span></td>
      <td style={tableCell}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
          background: booking.booking_type === "HALF_DAY" ? "#f0fdf4" : "#eff6ff",
          color: booking.booking_type === "HALF_DAY" ? "#166534" : "#1e40af"
        }}>
          {booking.booking_type || "—"}
          {booking.half_day_slot ? ` (${booking.half_day_slot})` : ""}
        </span>
      </td>
      <td style={tableCell}><span style={{ fontSize: 13, color: "#475569" }}>{booking.start_datetime ? new Date(booking.start_datetime).toLocaleDateString("en-IN") : "—"}</span></td>
      <td style={tableCell}><span style={{ fontSize: 13, color: "#475569" }}>{booking.end_datetime ? new Date(booking.end_datetime).toLocaleDateString("en-IN") : "—"}</span></td>
      <td style={tableCell}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>₹{Number(booking.total_price || 0).toLocaleString("en-IN")}</span>
          {booking.working_day_surcharge > 0 && (
            <span style={{ fontSize: 11, color: "#f97316" }}>+₹{booking.working_day_surcharge} surcharge</span>
          )}
        </div>
      </td>
      <td style={tableCell}>
        <span style={{ ...statusBadge, backgroundColor: cfg.bg, color: cfg.color }}>
          <StatusIcon size={13} strokeWidth={2.5} />
          {booking.status}
        </span>
      </td>
      <td style={tableCell}>
        <button
          onClick={() => navigate(`/admin/bookingdetails/${booking.booking_id}`)}
          style={viewButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
        >
          <Eye size={15} strokeWidth={2.5} />
          View
        </button>
      </td>
    </tr>
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
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" };
const statCard = { backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const iconBox = { width: "56px", height: "56px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const statContent = { flex: 1 };
const statLabel = { fontSize: "14px", color: "#64748b", fontWeight: "500", margin: "0 0 4px 0" };
const statValue = { fontSize: "32px", fontWeight: "700", margin: 0 };
const filtersCard = { backgroundColor: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const filtersGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" };
const filterGroup = { display: "flex", flexDirection: "column", gap: "8px" };
const filterLabel = { fontSize: "14px", fontWeight: "600", color: "#334155", display: "flex", alignItems: "center" };
const searchWrapper = { position: "relative", display: "flex", alignItems: "center" };
const searchIconStyle = { position: "absolute", left: "12px", color: "#94a3b8", pointerEvents: "none" };
const searchInput = { width: "100%", padding: "10px 40px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" };
const clearButton = { position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", display: "flex", alignItems: "center" };
const selectInput = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", backgroundColor: "white", cursor: "pointer" };
const activeFilters = { marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" };
const activeFilterText = { fontSize: "14px", fontWeight: "600", color: "#64748b" };
const filterTag = { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "13px", fontWeight: "500", borderRadius: "6px", border: "1px solid #bfdbfe" };
const removeFilter = { background: "none", border: "none", cursor: "pointer", color: "#1e40af", padding: 0, marginLeft: "4px", display: "flex", alignItems: "center" };
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
const bookingIdStyle = { fontSize: "14px", fontWeight: "600", color: "#3b82f6" };
const customerName = { fontSize: "14px", fontWeight: "600", color: "#0f172a" };
const customerEmail = { fontSize: "13px", color: "#64748b" };
const statusBadge = { display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", fontSize: "12px", fontWeight: "700", borderRadius: "20px" };
const viewButton = { padding: "8px 16px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" };
const resultsFooter = { padding: "14px 20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" };
const resultsText = { fontSize: "14px", color: "#64748b" };