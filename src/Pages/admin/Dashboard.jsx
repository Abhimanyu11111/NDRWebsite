import { useEffect, useState, useCallback } from "react";
import {
  Users, UserCheck, Hotel, Calendar, DollarSign, Clock,
  Building2, ArrowRight, CheckCircle2, AlertCircle, Bell,
  BellRing, XCircle, TrendingUp, TrendingDown, RefreshCw,
  CreditCard, ShieldAlert, Lock, Eye, Filter, ChevronDown,
  BarChart3, Activity, Zap, AlertTriangle, X, Check
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../../api/axiosClient";

// ─── Auto-refresh interval ────────────────────────────────────────────────────
const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0,
    totalRooms: 0, activeRooms: 0,
    totalBookings: 0, confirmedBookings: 0,
    pendingBookings: 0, cancelledBookings: 0,
    totalRevenue: 0, pendingPayments: 0,
    failedPayments: 0, todayRevenue: 0,
    activeDatasetLocks: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [paymentAlerts, setPaymentAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bookingFilter, setBookingFilter] = useState("ALL");

  // ─── Fetch all dashboard data ─────────────────────────────────────────────
  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const [dashRes, notifRes, approvalsRes, paymentsRes] = await Promise.allSettled([
        api.get("/admin/dashboard/counts"),
        api.get("/admin/dashboard/notifications?limit=20"),
        api.get("/admin/dashboard/bookings?status=PENDING&type=WEEKEND"),
        api.get("/admin/dashboard/payments?status=FAILED&limit=10"),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value.data.success) {
        setStats(dashRes.value.data.stats);
        setRecentBookings(dashRes.value.data.recentBookings || []);
        setRevenueData(dashRes.value.data.revenueChart || []);
      }
      if (notifRes.status === "fulfilled" && notifRes.value.data.success) {
        setNotifications(notifRes.value.data.notifications || []);
      }
      if (approvalsRes.status === "fulfilled" && approvalsRes.value.data.success) {
        setPendingApprovals(approvalsRes.value.data.bookings || []);
      }
      if (paymentsRes.status === "fulfilled" && paymentsRes.value.data.success) {
        setPaymentAlerts(paymentsRes.value.data.payments || []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ─── Approve / Reject weekend booking ────────────────────────────────────
  const handleApproval = async (bookingId, action) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status: action === "approve" ? "CONFIRMED" : "CANCELLED" });
      setPendingApprovals((prev) => prev.filter((b) => b.booking_id !== bookingId));
      fetchAll(true);
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  // ─── Mark notification read ───────────────────────────────────────────────
  const markRead = async (notifId) => {
    try {
      await api.patch(`/admin/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => n.id === notifId ? { ...n, is_read: true } : n)
      );
    } catch (_) { }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredBookings = bookingFilter === "ALL"
    ? recentBookings
    : recentBookings.filter((b) => b.status === bookingFilter);

  if (loading) return (
    <>
      <AdminNavbar />
      <div style={styles.center}>
        <div style={styles.spinnerRing} />
        <p style={styles.loadingText}>Loading dashboard…</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <AdminNavbar />
      <div style={styles.center}>
        <AlertCircle size={48} color="#ef4444" />
        <h2 style={styles.errorTitle}>Failed to Load Dashboard</h2>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => fetchAll()} style={styles.retryBtn}>Retry</button>
      </div>
    </>
  );

  return (
    <>
      <AdminNavbar />
      <div style={styles.page}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            {lastUpdated && (
              <p style={styles.subtitle}>
                Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
              </p>
            )}
          </div>
          <div style={styles.headerActions}>
            {/* Refresh */}
            <button onClick={() => fetchAll(true)} style={styles.refreshBtn} disabled={refreshing}>
              <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen((o) => !o)} style={styles.bellBtn}>
                {unreadCount > 0 ? <BellRing size={20} color="#f59e0b" /> : <Bell size={20} color="#64748b" />}
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div style={styles.notifPanel}>
                  <div style={styles.notifHeader}>
                    <span style={styles.notifTitle}>🔔 Notifications</span>
                    <button onClick={() => setNotifOpen(false)} style={styles.notifClose}>
                      <X size={16} />
                    </button>
                  </div>
                  <div style={styles.notifList}>
                    {notifications.length === 0 ? (
                      <p style={styles.notifEmpty}>No notifications</p>
                    ) : notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{ ...styles.notifItem, background: n.is_read ? "white" : "#eff6ff" }}
                        onClick={() => markRead(n.id)}
                      >
                        <div style={styles.notifDot(n.type)} />
                        <div style={{ flex: 1 }}>
                          <p style={styles.notifMsg}>{n.message}</p>
                          <p style={styles.notifTime}>
                            {new Date(n.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                        {!n.is_read && <div style={styles.unreadDot} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ALERT BANNERS ───────────────────────────────────────────────── */}
        {pendingApprovals.length > 0 && (
          <div style={styles.alertBanner("#fef3c7", "#92400e", "#fde68a")}>
            <AlertTriangle size={18} color="#d97706" />
            <span style={{ fontWeight: 600, color: "#92400e" }}>
              {pendingApprovals.length} weekend booking(s) awaiting your approval
            </span>
          </div>
        )}
        {paymentAlerts.length > 0 && (
          <div style={styles.alertBanner("#fee2e2", "#991b1b", "#fecaca")}>
            <XCircle size={18} color="#dc2626" />
            <span style={{ fontWeight: 600, color: "#991b1b" }}>
              {paymentAlerts.length} failed payment(s) need attention
            </span>
          </div>
        )}

        {/* ── PRIMARY STATS ───────────────────────────────────────────────── */}
        <div style={styles.primaryGrid}>
          <StatCard title="Total Users" value={stats.totalUsers}
            sub={`${stats.activeUsers} active`} icon={Users} color="#3b82f6" trend="+12%" up />
          <StatCard title="Total Rooms" value={stats.totalRooms}
            sub={`${stats.activeRooms} available`} icon={Hotel} color="#8b5cf6" trend="+5%" up />
          <StatCard title="Total Bookings" value={stats.totalBookings}
            sub={`${stats.confirmedBookings} confirmed`} icon={Calendar} color="#f59e0b" trend="+18%" up />
          <StatCard title="Total Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`}
            sub={`₹${Number(stats.todayRevenue || 0).toLocaleString("en-IN")} today`}
            icon={DollarSign} color="#10b981" trend="+24%" up />
        </div>

        {/* ── SECONDARY STATS ─────────────────────────────────────────────── */}
        <div style={styles.secondaryGrid}>
          <MiniCard label="Active Users" value={stats.activeUsers} icon={UserCheck} color="#10b981" />
          <MiniCard label="Pending Bookings" value={stats.pendingBookings || 0} icon={Clock} color="#f59e0b" />
          <MiniCard label="Failed Payments" value={stats.failedPayments || 0} icon={CreditCard} color="#ef4444" />
          <MiniCard label="Dataset Locks Active" value={stats.activeDatasetLocks || 0} icon={Lock} color="#6366f1" />
          <MiniCard label="Cancelled Bookings" value={stats.cancelledBookings || 0} icon={XCircle} color="#94a3b8" />
          <MiniCard label="Pending Payments" value={stats.pendingPayments} icon={AlertCircle} color="#f97316" />
        </div>

        {/* ── REVENUE SPARKLINE ────────────────────────────────────────────── */}
        {revenueData.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <BarChart3 size={20} style={{ marginRight: 8, color: "#3b82f6" }} />
              Revenue – Last 7 Days
            </h2>
            <RevenueChart data={revenueData} />
          </div>
        )}

        {/* ── PENDING APPROVALS ────────────────────────────────────────────── */}
        {pendingApprovals.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <ShieldAlert size={20} style={{ marginRight: 8, color: "#f59e0b" }} />
              Pending Weekend Approvals
            </h2>
            <div style={styles.approvalList}>
              {pendingApprovals.map((b) => (
                <div key={b.booking_id} style={styles.approvalCard}>
                  <div style={{ flex: 1 }}>
                    <p style={styles.approvalId}>{b.booking_id}</p>
                    <p style={styles.approvalMeta}>
                      {b.userName} · {b.roomTitle} · ₹{b.total_price}
                    </p>
                    <p style={styles.approvalDate}>
                      {new Date(b.start_datetime).toLocaleDateString("en-IN")} –{" "}
                      {new Date(b.end_datetime).toLocaleDateString("en-IN")}
                    </p>
                    {b.weekend_notice && (
                      <p style={styles.weekendNotice}>📝 {b.weekend_notice}</p>
                    )}
                  </div>
                  <div style={styles.approvalBtns}>
                    <button onClick={() => handleApproval(b.booking_id, "approve")} style={styles.approveBtn}>
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleApproval(b.booking_id, "reject")} style={styles.rejectBtn}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENT ALERTS ───────────────────────────────────────────────── */}
        {paymentAlerts.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <CreditCard size={20} style={{ marginRight: 8, color: "#ef4444" }} />
              Failed Payments
            </h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    {["Order ID", "Booking", "User", "Amount", "Attempts", "Date"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paymentAlerts.map((p) => (
                    <tr key={p.order_id} style={styles.tr}>
                      <td style={styles.td}><code style={styles.code}>{p.order_id}</code></td>
                      <td style={styles.td}>{p.booking_id}</td>
                      <td style={styles.td}>{p.userName || "—"}</td>
                      <td style={styles.td}>₹{p.amount}</td>
                      <td style={styles.td}>
                        <span style={styles.failBadge}>{p.fail_count || 1}x failed</span>
                      </td>
                      <td style={styles.td}>{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RECENT BOOKINGS ──────────────────────────────────────────────── */}
        <div style={styles.section}>
          <div style={styles.sectionRow}>
            <h2 style={styles.sectionTitle}>
              <Activity size={20} style={{ marginRight: 8, color: "#3b82f6" }} />
              Recent Bookings
            </h2>
            {/* Filter tabs */}
            <div style={styles.filterRow}>
              {["ALL", "CONFIRMED", "PENDING", "CANCELLED", "COMPLETED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  style={styles.filterBtn(bookingFilter === f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={styles.emptyState}>No bookings found for this filter.</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    {["Booking ID", "Guest", "Room", "Type", "Check-in", "Check-out", "Amount", "Working Days", "Status"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id} style={styles.tr}>
                      <td style={styles.td}><code style={styles.code}>{b.booking_id}</code></td>
                      <td style={styles.td}>
                        <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{b.userName}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{b.userEmail}</p>
                      </td>
                      <td style={styles.td}>{b.roomTitle}</td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge(b.booking_type)}>{b.booking_type}</span>
                      </td>
                      <td style={styles.td}>{new Date(b.start_datetime).toLocaleDateString("en-IN")}</td>
                      <td style={styles.td}>{new Date(b.end_datetime).toLocaleDateString("en-IN")}</td>
                      <td style={styles.td} >
                        <span style={{ fontWeight: 600 }}>₹{b.total_price}</span>
                        {b.working_day_surcharge > 0 && (
                          <p style={{ margin: 0, fontSize: 11, color: "#f97316" }}>+₹{b.working_day_surcharge} surcharge</p>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>{b.working_days || "—"}</td>
                      <td style={styles.td}><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Zap size={20} style={{ marginRight: 8, color: "#f59e0b" }} />
            Quick Actions
          </h2>
          <div style={styles.actionGrid}>
            <ActionCard label="Manage Users" link="/admin/manageusers" icon={Users} desc="View and manage user accounts" />
            <ActionCard label="Manage Rooms" link="/admin/managedata" icon={Hotel} desc="Update room inventory & pricing" />
            <ActionCard label="All Bookings" link="/admin/managebookings" icon={Calendar} desc="Track and manage all reservations" />
            <ActionCard label="Payment Logs" link="/admin/payments" icon={CreditCard} desc="View transactions & failed payments" />
            <ActionCard label="Dataset Access" link="/admin/datasets" icon={Lock} desc="Monitor dataset locks & access logs" />
            <ActionCard label="Notifications" link="/admin/notifications" icon={Bell} desc="Manage system notifications" />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

// ─── Revenue Bar Chart (pure CSS, no library) ─────────────────────────────────
function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
              ₹{(d.revenue / 1000).toFixed(1)}k
            </span>
            <div style={{
              width: "100%", background: "#3b82f6",
              height: `${(d.revenue / max) * 100}%`,
              minHeight: 4, borderRadius: "6px 6px 0 0",
              opacity: 0.8 + (i / data.length) * 0.2,
              transition: "height 0.6s ease"
            }} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, color, trend, up }) {
  return (
    <div style={styles.statCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ ...styles.iconBox, background: `${color}15` }}>
          <Icon size={28} style={{ color }} strokeWidth={2.5} />
        </div>
        {trend && (
          <span style={{ fontSize: 13, fontWeight: 700, color: up ? "#10b981" : "#ef4444", display: "flex", alignItems: "center", gap: 2 }}>
            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend}
          </span>
        )}
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color, margin: "0 0 6px", lineHeight: 1 }}>{value}</h2>
      <p style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 4px" }}>{title}</p>
      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{sub}</p>
    </div>
  );
}

function MiniCard({ label, value, icon: Icon, color }) {
  return (
    <div style={styles.miniCard}>
      <div style={{ ...styles.miniIconBox, background: `${color}15` }}>
        <Icon size={18} style={{ color }} strokeWidth={2.5} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px", fontWeight: 500 }}>{label}</p>
        <h3 style={{ fontSize: 22, fontWeight: 700, color, margin: 0 }}>{value}</h3>
      </div>
    </div>
  );
}

function ActionCard({ label, link, icon: Icon, desc }) {
  return (
    <a href={link} style={styles.actionCard}>
      <div style={styles.actionIconBox}><Icon size={22} style={{ color: "#3b82f6" }} strokeWidth={2.5} /></div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{label}</h4>
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{desc}</p>
      </div>
      <ArrowRight size={18} style={{ color: "#cbd5e1", flexShrink: 0 }} />
    </a>
  );
}

function StatusBadge({ status }) {
  const map = {
    CONFIRMED: ["#dcfce7", "#166534"],
    PENDING: ["#fef3c7", "#92400e"],
    CANCELLED: ["#fee2e2", "#991b1b"],
    COMPLETED: ["#dbeafe", "#1e40af"],
    EXPIRED: ["#f1f5f9", "#475569"],
  };
  const [bg, text] = map[status] || ["#f3f4f6", "#374151"];
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: 0.5, background: bg, color: text
    }}>
      {status}
    </span>
  );
}

// ─── Styles object ────────────────────────────────────────────────────────────
const styles = {
  page: {
    maxWidth: 1440, margin: "0 auto", padding: "40px 28px",
    background: "#f8fafc", minHeight: "100vh",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  center: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "80vh", gap: 16,
  },
  spinnerRing: {
    width: 40, height: 40,
    border: "4px solid #e2e8f0", borderTop: "4px solid #3b82f6",
    borderRadius: "50%", animation: "spin 1s linear infinite",
  },
  loadingText: { color: "#64748b", fontSize: 16, fontWeight: 500 },
  errorTitle: { fontSize: 24, fontWeight: 600, color: "#0f172a", margin: 0 },
  errorText: { fontSize: 16, color: "#64748b", textAlign: "center", maxWidth: 400 },
  retryBtn: {
    padding: "12px 24px", background: "#3b82f6", color: "white",
    border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 32, flexWrap: "wrap", gap: 16,
  },
  pageTitle: { fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#94a3b8", margin: "6px 0 0", fontWeight: 500 },
  headerActions: { display: "flex", gap: 12, alignItems: "center" },
  refreshBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", background: "white", border: "1px solid #e2e8f0",
    borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569",
    cursor: "pointer", transition: "all 0.2s",
  },
  bellBtn: {
    position: "relative", width: 40, height: 40, borderRadius: 10,
    background: "white", border: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    background: "#ef4444", color: "white",
    fontSize: 10, fontWeight: 800, borderRadius: "50%",
    width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
  },
  notifPanel: {
    position: "absolute", top: 48, right: 0,
    width: 360, background: "white", borderRadius: 16,
    border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    zIndex: 999, animation: "slideIn 0.2s ease",
  },
  notifHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
  },
  notifTitle: { fontWeight: 700, fontSize: 15, color: "#0f172a" },
  notifClose: {
    background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
    display: "flex", alignItems: "center",
  },
  notifList: { maxHeight: 400, overflowY: "auto" },
  notifEmpty: { padding: "24px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 },
  notifItem: {
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "14px 20px", borderBottom: "1px solid #f8fafc",
    cursor: "pointer", transition: "background 0.15s",
  },
  notifDot: (type) => ({
    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
    background: type === "PAYMENT" ? "#10b981" : type === "BOOKING" ? "#3b82f6" : "#f59e0b",
  }),
  notifMsg: { fontSize: 13, color: "#334155", margin: "0 0 4px", lineHeight: 1.5 },
  notifTime: { fontSize: 11, color: "#94a3b8", margin: 0 },
  unreadDot: { width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 6 },
  alertBanner: (bg, text, border) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 20px", borderRadius: 10, marginBottom: 16,
    background: bg, border: `1px solid ${border}`, fontSize: 14,
  }),
  primaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginBottom: 24 },
  secondaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 48 },
  statCard: {
    background: "white", padding: "28px", borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0",
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  miniCard: {
    background: "white", padding: "18px 20px", borderRadius: 12,
    border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  miniIconBox: {
    width: 44, height: 44, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  section: { marginBottom: 48 },
  sectionTitle: {
    fontSize: 20, fontWeight: 700, color: "#0f172a",
    marginBottom: 20, display: "flex", alignItems: "center",
  },
  sectionRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12,
  },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterBtn: (active) => ({
    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    border: active ? "1px solid #3b82f6" : "1px solid #e2e8f0",
    background: active ? "#3b82f6" : "white",
    color: active ? "white" : "#64748b", cursor: "pointer", transition: "all 0.15s",
  }),
  tableContainer: {
    background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
    overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: {
    padding: "14px 18px", textAlign: "left",
    fontSize: 12, fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 18px", fontSize: 14, color: "#334155" },
  code: { fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569" },
  typeBadge: (type) => ({
    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
    background: type === "HALF_DAY" ? "#f0fdf4" : type === "MULTI_DAY" ? "#eff6ff" : "#fafafa",
    color: type === "HALF_DAY" ? "#166534" : type === "MULTI_DAY" ? "#1e40af" : "#475569",
  }),
  failBadge: {
    fontSize: 11, fontWeight: 700, padding: "3px 8px",
    borderRadius: 5, background: "#fee2e2", color: "#991b1b",
  },
  emptyState: {
    background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
    padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 15,
  },
  approvalList: { display: "flex", flexDirection: "column", gap: 14 },
  approvalCard: {
    background: "white", borderRadius: 14, border: "1px solid #fde68a",
    padding: "20px 24px", display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", gap: 20, flexWrap: "wrap",
    boxShadow: "0 2px 8px rgba(253,211,77,0.15)",
  },
  approvalId: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  approvalMeta: { fontSize: 13, color: "#64748b", margin: "0 0 4px" },
  approvalDate: { fontSize: 12, color: "#94a3b8", margin: 0 },
  weekendNotice: { fontSize: 12, color: "#92400e", margin: "6px 0 0", fontStyle: "italic" },
  approvalBtns: { display: "flex", gap: 10, flexShrink: 0, alignItems: "center" },
  approveBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", background: "#10b981", color: "white",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  rejectBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", background: "#ef4444", color: "white",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  actionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 },
  actionCard: {
    background: "white", padding: "18px 20px", borderRadius: 12,
    textDecoration: "none", display: "flex", alignItems: "center", gap: 14,
    border: "1px solid #e2e8f0", transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)", cursor: "pointer",
  },
  actionIconBox: {
    width: 46, height: 46, borderRadius: 10, background: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
};