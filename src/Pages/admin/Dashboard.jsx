import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users, UserCheck, Hotel, Calendar, DollarSign, Clock,
  Building2, ArrowRight, CheckCircle2, AlertCircle, Bell,
  BellRing, XCircle, TrendingUp, TrendingDown, RefreshCw,
  CreditCard, ShieldAlert, Lock, Eye, Filter, ChevronDown,
  BarChart3, Activity, Zap, AlertTriangle, X, Check, LogOut,
  ChevronLeft, ChevronRight, Search, Download, MoreHorizontal,
  Settings, User, CheckCircle, RotateCcw, UserPlus, ClipboardCheck,
  Phone, Mail, Building, FileText, MapPin
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;
const BOOKINGS_PER_PAGE = 10;
const PAYMENTS_PER_PAGE = 5;
const AUTO_LOGOUT_TIME_MS = 10 * 60 * 1000;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0,
    totalRooms: 0, activeRooms: 0,
    totalBookings: 0, confirmedBookings: 0,
    pendingBookings: 0, cancelledBookings: 0,
    totalRevenue: 0, pendingPayments: 0,
    failedPayments: 0, todayRevenue: 0,
    activeDatasetLocks: 0,
    pendingRegistrations: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [paymentAlerts, setPaymentAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [approvingRegId, setApprovingRegId] = useState(null);
  const [rejectingRegId, setRejectingRegId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [bookingPage, setBookingPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [pauseRefresh, setPauseRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [filterYear, setFilterYear] = useState("");
  const [filterMonthFrom, setFilterMonthFrom] = useState("");
  const [filterMonthTo, setFilterMonthTo] = useState("");
  const [filterLicenseType, setFilterLicenseType] = useState("");
  const [filterRoomType, setFilterRoomType] = useState("");
  const [filterBlockName, setFilterBlockName] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(60);

  const notifPanelRef = useRef(null);
  const userMenuRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowLogoutWarning(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setShowLogoutWarning(true);
      setLogoutCountdown(60);
      let count = 60;
      countdownIntervalRef.current = setInterval(() => {
        count--;
        setLogoutCountdown(count);
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current);
          clearTimeout(warningTimerRef.current);
          handleAutoLogout();
        }
      }, 1000);
      warningTimerRef.current = setTimeout(() => {
        clearInterval(countdownIntervalRef.current);
        handleAutoLogout();
      }, 60000);
    }, AUTO_LOGOUT_TIME_MS - 60000);
  }, []);

  const handleAutoLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("admin");
    sessionStorage.clear();
    window.location.href = "/admin/login?reason=inactivity";
  }, []);

  const handleLogout = useCallback(() => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("admin");
      sessionStorage.clear();
      window.location.href = "/admin/login";
    }
  }, []);

  const handleStayLoggedIn = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => { resetInactivityTimer(); };
    activityEvents.forEach(event => { document.addEventListener(event, handleActivity, { passive: true }); });
    resetInactivityTimer();
    return () => {
      activityEvents.forEach(event => { document.removeEventListener(event, handleActivity); });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const [dashRes, notifRes, approvalsRes, paymentsRes, regRes] = await Promise.allSettled([
        api.get("/admin/dashboard/counts"),
        api.get("/admin/dashboard/notifications?limit=20"),
        api.get("/admin/dashboard/bookings?status=CONFIRMED&payment_status=SUCCESS&limit=10"),
        api.get("/admin/dashboard/payments?status=FAILED&limit=10"),
        api.get("/admin/dashboard/registrations?status=PENDING&limit=50"),
      ]);
      if (dashRes.status === "fulfilled" && dashRes.value.data.success) {
        setStats(dashRes.value.data.stats);
        setRecentBookings(dashRes.value.data.recentBookings || []);
        setRevenueData(dashRes.value.data.revenueChart || []);
      } else if (dashRes.status === "rejected") {
        throw new Error(dashRes.reason?.response?.data?.message || "Failed to load dashboard data");
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
      if (regRes.status === "fulfilled" && regRes.value.data.success) {
        setPendingRegistrations(regRes.value.data.registrations || []);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    if (pauseRefresh) return;
    const interval = setInterval(() => {
      if (!pauseRefresh) fetchAll(true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAll, pauseRefresh]);

  const handleApproveRegistration = async (userId, userName) => {
    try {
      setApprovingRegId(userId);
      setPauseRefresh(true);
      await api.patch(`/admin/dashboard/registrations/${userId}/approve`);
      setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({ ...prev, pendingRegistrations: Math.max(0, prev.pendingRegistrations - 1) }));
      setSuccessMsg(`${userName}'s account has been approved!`);
      fetchAll(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve registration");
    } finally {
      setApprovingRegId(null);
      setPauseRefresh(false);
    }
  };

  const handleRejectRegistration = async (userId, userName) => {
    try {
      setRejectingRegId(userId);
      setPauseRefresh(true);
      await api.patch(`/admin/dashboard/registrations/${userId}/reject`, {
        reason: rejectReason || undefined,
      });
      setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({ ...prev, pendingRegistrations: Math.max(0, prev.pendingRegistrations - 1) }));
      setSuccessMsg(`${userName}'s registration has been rejected.`);
      setShowRejectModal(null);
      setRejectReason("");
      fetchAll(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject registration");
    } finally {
      setRejectingRegId(null);
      setPauseRefresh(false);
    }
  };

  const markRead = async (notifId) => {
    try {
      await api.patch(`/admin/dashboard/notifications/${notifId}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/admin/dashboard/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setSuccessMsg("All notifications marked as read");
    } catch (err) {
      setError("Failed to mark all notifications as read");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setShowUserMenu(false);
        setShowRejectModal(null);
        setShowLogoutWarning(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredBookings = recentBookings.filter((b) => {
    if (bookingFilter !== "ALL" && b.status !== bookingFilter) return false;
    if (filterLicenseType && b.license_type !== filterLicenseType) return false;
    if (filterRoomType && b.room_type !== filterRoomType) return false;
    if (filterBlockName && !(b.block_name || "").toLowerCase().includes(filterBlockName.toLowerCase())) return false;
    const date = new Date(b.start_datetime);
    const bYear = date.getFullYear();
    const bMonth = date.getMonth() + 1;
    if (filterYear && bYear !== Number(filterYear)) return false;
    if (filterMonthFrom && filterMonthTo) {
      const from = Number(filterMonthFrom), to = Number(filterMonthTo);
      if (from <= to) { if (bMonth < from || bMonth > to) return false; }
      else { if (bMonth < from && bMonth > to) return false; }
    } else if (filterMonthFrom && bMonth < Number(filterMonthFrom)) return false;
    else if (filterMonthTo && bMonth > Number(filterMonthTo)) return false;
    return true;
  });

  const searchedBookings = searchTerm
    ? filteredBookings.filter((b) =>
        b.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredBookings;

  const monthRangeCount = (filterMonthFrom || filterMonthTo || filterYear) ? filteredBookings.length : null;
  const activeAdvancedFilterCount = [filterYear, filterMonthFrom, filterMonthTo, filterLicenseType, filterRoomType, filterBlockName].filter(Boolean).length;
  const clearAdvancedFilters = () => {
    setFilterYear(""); setFilterMonthFrom(""); setFilterMonthTo("");
    setFilterLicenseType(""); setFilterRoomType(""); setFilterBlockName("");
  };
  const availableYears = [...new Set(recentBookings.map(b => new Date(b.start_datetime).getFullYear()))].sort((a, b) => b - a);
  const totalBookingPages = Math.ceil(searchedBookings.length / BOOKINGS_PER_PAGE);
  const paginatedBookings = searchedBookings.slice((bookingPage - 1) * BOOKINGS_PER_PAGE, bookingPage * BOOKINGS_PER_PAGE);
  const totalPaymentPages = Math.ceil(paymentAlerts.length / PAYMENTS_PER_PAGE);
  const paginatedPayments = paymentAlerts.slice((paymentPage - 1) * PAYMENTS_PER_PAGE, paymentPage * PAYMENTS_PER_PAGE);

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <AdminNavbar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f4f6fa", gap: 16 }}>
        <div style={styles.spinnerRing} />
        <p style={styles.loadingText}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <AdminNavbar />

      <div style={{ flex: 1, background: "#f4f6fa", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* AUTO LOGOUT WARNING */}
        {showLogoutWarning && (
          <div style={styles.logoutWarningOverlay} role="dialog" aria-modal="true">
            <div style={styles.logoutWarningModal}>
              <div style={styles.logoutWarningIcon}><Clock size={48} color="#f59e0b" /></div>
              <h2 style={styles.logoutWarningTitle}>Still There?</h2>
              <p style={styles.logoutWarningText}>
                You've been inactive. Logging out in <strong style={{ color: "#ef4444" }}>{logoutCountdown}s</strong>.
              </p>
              <div style={styles.logoutWarningActions}>
                <button onClick={handleStayLoggedIn} style={styles.stayLoggedInBtn}><Check size={16} /> Stay Logged In</button>
                <button onClick={handleAutoLogout} style={styles.logoutNowBtn}><LogOut size={16} /> Logout Now</button>
              </div>
              <div style={styles.logoutWarningProgress}>
                <div style={{ ...styles.logoutWarningProgressBar, width: `${(logoutCountdown / 60) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* TOASTS */}
        {successMsg && (
          <div style={styles.toast("success")} role="alert">
            <CheckCircle size={18} /><span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} style={styles.toastClose}><X size={14} /></button>
          </div>
        )}
        {error && (
          <div style={styles.toast("error")} role="alert">
            <AlertCircle size={18} /><span>{error}</span>
            <button onClick={() => setError(null)} style={styles.toastClose}><X size={14} /></button>
          </div>
        )}

        {/* REJECT MODAL */}
        {showRejectModal && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Reject Registration</h3>
                <button onClick={() => { setShowRejectModal(null); setRejectReason(""); }} style={styles.modalClose}><X size={18} /></button>
              </div>
              <p style={styles.modalDesc}>Rejecting <strong>{showRejectModal.name}</strong> ({showRejectModal.email}). Optionally provide a reason:</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection (optional)..." style={styles.modalTextarea} rows={3} />
              <div style={styles.modalActions}>
                <button onClick={() => { setShowRejectModal(null); setRejectReason(""); }} style={styles.modalCancelBtn}>Cancel</button>
                <button onClick={() => handleRejectRegistration(showRejectModal.id, showRejectModal.name)} style={styles.modalRejectBtn} disabled={rejectingRegId === showRejectModal.id}>
                  {rejectingRegId === showRejectModal.id ? <><div style={styles.miniSpinner} /> Rejecting…</> : <><X size={14} /> Confirm Reject</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <div style={{ flex: 1 }} />
          {lastUpdated && (
            <span style={{ fontSize: 12, color: "#94a3b8", marginRight: 8 }}>
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={() => fetchAll(true)} style={styles.refreshBtn} disabled={refreshing} aria-label="Refresh">
            <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          </button>

          {/* Notification Bell */}
          <div style={{ position: "relative" }} ref={notifPanelRef}>
            <button onClick={() => setNotifOpen((o) => !o)} style={styles.topBtn} aria-label="Notifications">
              {unreadCount > 0 ? <BellRing size={18} color="#f59e0b" /> : <Bell size={18} color="#64748b" />}
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
            {notifOpen && (
              <div style={styles.notifPanel} role="dialog">
                <div style={styles.notifHeader}>
                  <span style={styles.notifTitle}>Notifications</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={styles.markAllBtn}><CheckCircle size={14} /> Mark all read</button>
                    )}
                    <button onClick={() => setNotifOpen(false)} style={styles.notifClose}><X size={16} /></button>
                  </div>
                </div>
                <div style={styles.notifList}>
                  {notifications.length === 0 ? (
                    <p style={styles.notifEmpty}>No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{ ...styles.notifItem, background: n.is_read ? "white" : "#eff6ff" }}
                        onClick={() => !n.is_read && markRead(n.id)}
                        role="button" tabIndex={0}
                      >
                        <div style={styles.notifIconWrap(n.type)}>
                          {n.type === "REGISTRATION" && <UserPlus size={14} />}
                          {n.type === "BOOKING" && <Calendar size={14} />}
                          {n.type === "PAYMENT" && <CreditCard size={14} />}
                          {n.type === "SYSTEM" && <Settings size={14} />}
                          {!["REGISTRATION","BOOKING","PAYMENT","SYSTEM"].includes(n.type) && <Bell size={14} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={styles.notifTypeBadge(n.type)}>{n.type || "GENERAL"}</span>
                          <p style={styles.notifMsg}>{n.message}</p>
                          {n.type === "REGISTRATION" && n.user && (
                            <div style={styles.notifUserDetails}>
                              {n.user.phone && <span style={styles.notifDetail}><Phone size={10} /> {n.user.phone}</span>}
                              {n.user.company && <span style={styles.notifDetail}><Building size={10} /> {n.user.company}</span>}
                            </div>
                          )}
                          <p style={styles.notifTime}>{new Date(n.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        {!n.is_read && <div style={styles.unreadDot} />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div style={{ position: "relative" }} ref={userMenuRef}>
            <button onClick={() => setShowUserMenu((o) => !o)} style={styles.userInfoBtn}>
              <div style={styles.userAvatarSmall}><User size={16} color="white" /></div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Admin</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Administrator</div>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </button>
            {showUserMenu && (
              <div style={styles.userMenu} role="menu">
                <div style={styles.userMenuHeader}>
                  <div style={styles.userAvatar}><User size={20} color="#3b82f6" /></div>
                  <div>
                    <p style={styles.userName}>Admin User</p>
                    <p style={styles.userRole}>Administrator</p>
                  </div>
                </div>
                <div style={styles.userMenuDivider} />
                <button style={{ ...styles.userMenuItem, color: "#ef4444" }} onClick={handleLogout} role="menuitem">
                  <LogOut size={16} /><span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* WELCOME SECTION */}
          <div style={styles.welcomeSection}>
            <div>
              <h1 style={styles.welcomeTitle}>Welcome back, Admin!</h1>
              <p style={styles.welcomeSub}>Here's what's happening with your portal today</p>
            </div>
            <div style={styles.dateDisplay}>
              <Calendar size={15} />
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>

          {/* ALERT BANNERS */}
          {pendingRegistrations.length > 0 && (
            <div style={styles.alertBanner("#eff6ff", "#1e40af", "#bfdbfe")} role="alert">
              <UserPlus size={16} color="#3b82f6" />
              <span style={{ fontWeight: 600, color: "#1e40af" }}>
                {pendingRegistrations.length} new registration request{pendingRegistrations.length > 1 ? "s" : ""} awaiting approval
              </span>
            </div>
          )}
          {paymentAlerts.length > 0 && (
            <div style={styles.alertBanner("#fee2e2", "#991b1b", "#fecaca")} role="alert">
              <XCircle size={16} color="#dc2626" />
              <span style={{ fontWeight: 600, color: "#991b1b" }}>
                {paymentAlerts.length} failed payment{paymentAlerts.length > 1 ? "s" : ""} need attention
              </span>
            </div>
          )}

          {/* PRIMARY STATS */}
          <div style={styles.primaryGrid}>
            <StatCard title="Total Users" value={stats.totalUsers} sub={`${stats.activeUsers} Active`} icon={Users} color="#3b82f6" trend="+12%" up />
            <StatCard title="Total Rooms" value={stats.totalRooms} sub={`${stats.activeRooms} Available`} icon={Hotel} color="#8b5cf6" trend="+12%" up />
            <StatCard title="Total Bookings" value={stats.totalBookings} sub={`${stats.confirmedBookings} Confirmed`} icon={Calendar} color="#f59e0b" trend="+12%" up />
            <StatCard
              title="Total Revenue"
              value={`₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`}
              sub={`₹${Number(stats.todayRevenue || 0).toLocaleString("en-IN")} Today`}
              icon={DollarSign}
              color="#ef4444"
              trend="+12%"
              up
            />
          </div>

          {/* SECONDARY STATS */}
          <div style={styles.secondaryGrid}>
            <MiniCard label="Active Users" value={stats.activeUsers} icon={UserCheck} color="#10b981" />
            <MiniCard label="Pending Bookings" value={stats.pendingBookings || 0} icon={Clock} color="#f59e0b" />
            <MiniCard label="Failed Payments" value={stats.failedPayments || 0} icon={CreditCard} color="#ef4444" />
            <MiniCard label="Dataset Locks" value={stats.activeDatasetLocks || 0} icon={Lock} color="#6366f1" />
            <MiniCard label="Cancelled Bookings" value={stats.cancelledBookings || 0} icon={XCircle} color="#94a3b8" />
            <MiniCard label="Pending Registrations" value={stats.pendingRegistrations || 0} icon={UserPlus} color="#3b82f6" />
          </div>

          {/* REVENUE CHART */}
          {revenueData.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <RevenueChart data={revenueData} />
            </div>
          )}

          {/* PENDING REGISTRATIONS */}
          {pendingRegistrations.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <UserPlus size={20} style={{ marginRight: 8, color: "#3b82f6" }} />
                Pending Registration Requests
                <span style={styles.countBadge}>{pendingRegistrations.length}</span>
              </h2>
              <div style={styles.regGrid}>
                {pendingRegistrations.map((u) => (
                  <div key={u.id} style={styles.regCard}>
                    <div style={styles.regCardHeader}>
                      <div style={styles.regAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={styles.regName}>{u.name}</p>
                        <p style={styles.regEmail}>{u.email}</p>
                      </div>
                      <span style={styles.pendingBadge}>Pending</span>
                    </div>
                    <div style={styles.regDetails}>
                      {u.phone && (
                        <div style={styles.regDetailRow}><Phone size={12} color="#64748b" /><span>{u.phone}</span></div>
                      )}
                      {u.company && (
                        <div style={styles.regDetailRow}><Building size={12} color="#64748b" /><span>{u.company}</span></div>
                      )}
                      {(u.city || u.state) && (
                        <div style={styles.regDetailRow}><MapPin size={12} color="#64748b" /><span>{[u.city, u.state].filter(Boolean).join(", ")}</span></div>
                      )}
                      <div style={styles.regDetailRow}>
                        <Clock size={12} color="#64748b" />
                        <span>Registered on {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div style={styles.regActions}>
                      <button
                        style={styles.approveRegBtn}
                        onClick={() => handleApproveRegistration(u.id, u.name)}
                        disabled={approvingRegId === u.id || rejectingRegId === u.id}
                      >
                        {approvingRegId === u.id ? <><div style={styles.miniSpinner} /> Approving…</> : <><Check size={14} /> Approve</>}
                      </button>
                      <button
                        style={styles.rejectRegBtn}
                        onClick={() => setShowRejectModal(u)}
                        disabled={approvingRegId === u.id || rejectingRegId === u.id}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT BOOKINGS FOR REVIEW */}
          {pendingApprovals.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <Calendar size={20} style={{ marginRight: 8, color: "#3b82f6" }} />
                Recent Bookings for Review
              </h2>
              <div style={styles.approvalList}>
                {pendingApprovals.map((b) => (
                  <div key={b.booking_id} style={styles.approvalCard}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.approvalId}>{b.booking_id}</p>
                      <p style={styles.approvalMeta}>{b.userName} · {b.userEmail} · {b.roomTitle} · ₹{Number(b.total_price).toLocaleString("en-IN")}</p>
                      <p style={styles.approvalDate}>
                        {new Date(b.start_datetime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        {" – "}
                        {new Date(b.end_datetime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px" }}>Paid ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAYMENT ALERTS */}
          {paymentAlerts.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionRow}>
                <h2 style={styles.sectionTitle}>
                  <CreditCard size={20} style={{ marginRight: 8, color: "#ef4444" }} />
                  Failed Payments
                </h2>
                <button style={styles.exportBtn} onClick={() => exportCSV(paymentAlerts, "failed-payments")}>
                  <Download size={14} /> Export
                </button>
              </div>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHead}>
                      {["Order ID","Booking","User","Amount","Attempts","Date","Actions"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((p) => (
                      <tr key={p.order_id} style={styles.tr}>
                        <td style={styles.td}><code style={styles.code}>{p.order_id}</code></td>
                        <td style={styles.td}>{p.booking_id}</td>
                        <td style={styles.td}>{p.userName || "—"}</td>
                        <td style={styles.td}><span style={{ fontWeight: 600 }}>₹{Number(p.amount).toLocaleString("en-IN")}</span></td>
                        <td style={styles.td}><span style={styles.failBadge}>{p.fail_count || 1}x failed</span></td>
                        <td style={styles.td}>{new Date(p.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td style={styles.td}>
                          <button style={styles.retryPaymentBtn} onClick={async () => {
                            try {
                              await api.post(`/admin/dashboard/payments/${p.order_id}/retry`);
                              setSuccessMsg(`Payment retry initiated for ${p.order_id}`);
                              setTimeout(() => fetchAll(true), 1500);
                            } catch (err) {
                              setError(err.response?.data?.message || "Failed to retry payment");
                            }
                          }}>
                            <RotateCcw size={14} /> Retry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPaymentPages > 1 && <Pagination currentPage={paymentPage} totalPages={totalPaymentPages} onPageChange={setPaymentPage} />}
            </div>
          )}

          {/* RECENT BOOKINGS */}
          <div style={styles.section}>
            <div style={styles.sectionRow}>
              <h2 style={styles.sectionTitle}>
                <Activity size={20} style={{ marginRight: 8, color: "#3b82f6" }} />
                Recent Bookings
              </h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={styles.searchBox}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" placeholder="Search bookings..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setBookingPage(1); }} style={styles.searchInput} />
                  {searchTerm && <button onClick={() => setSearchTerm("")} style={styles.searchClear}><X size={14} /></button>}
                </div>
                <button style={styles.exportBtn} onClick={() => exportBookingsCSV(searchedBookings)}>
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={styles.filterRow}>
                {["ALL","CONFIRMED","PENDING","CANCELLED","COMPLETED","EXPIRED"].map((f) => (
                  <button key={f} onClick={() => { setBookingFilter(f); setBookingPage(1); }} style={styles.filterBtn(bookingFilter === f)}>{f}</button>
                ))}
              </div>
              <button onClick={() => setShowAdvancedFilters(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid #dbe3f0", cursor: "pointer", background: showAdvancedFilters ? "#eff6ff" : "white", color: showAdvancedFilters ? "#2563eb" : "#475569" }}>
                <Filter size={14} /> More Filters
                {activeAdvancedFilterCount > 0 && <span style={{ background: "#2563eb", color: "white", borderRadius: 99, padding: "1px 7px", fontSize: 11 }}>{activeAdvancedFilterCount}</span>}
              </button>
              {activeAdvancedFilterCount > 0 && (
                <button onClick={clearAdvancedFilters} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid #fecaca", background: "#fff1f2", color: "#b91c1c", cursor: "pointer" }}>
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>

            {showAdvancedFilters && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginBottom: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                <div>
                  <label style={styles.advLabel}>Year</label>
                  <select style={styles.advSelect} value={filterYear} onChange={e => { setFilterYear(e.target.value); setBookingPage(1); }}>
                    <option value="">All Years</option>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.advLabel}>Month From</label>
                  <select style={styles.advSelect} value={filterMonthFrom} onChange={e => { setFilterMonthFrom(e.target.value); setBookingPage(1); }}>
                    <option value="">Any</option>
                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.advLabel}>Month To</label>
                  <select style={styles.advSelect} value={filterMonthTo} onChange={e => { setFilterMonthTo(e.target.value); setBookingPage(1); }}>
                    <option value="">Any</option>
                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.advLabel}>License Type</label>
                  <select style={styles.advSelect} value={filterLicenseType} onChange={e => { setFilterLicenseType(e.target.value); setBookingPage(1); }}>
                    <option value="">All Licenses</option>
                    {["DSG","PETREL","KINGDOM","GEOGRAPHIX","HAMPSON_RUSSELL","OTHER"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.advLabel}>Data Room Type</label>
                  <select style={styles.advSelect} value={filterRoomType} onChange={e => { setFilterRoomType(e.target.value); setBookingPage(1); }}>
                    <option value="">All Types</option>
                    {[["OALP","OALP"],["DSF","DSF"],["CBM","CBM"],["GENERAL","General"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.advLabel}>Block Name</label>
                  <input type="text" placeholder="Search block..." style={styles.advSelect} value={filterBlockName} onChange={e => { setFilterBlockName(e.target.value); setBookingPage(1); }} />
                </div>
                {monthRangeCount !== null && (
                  <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <BarChart3 size={16} color="#2563eb" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1d4ed8" }}>
                      {monthRangeCount} booking{monthRangeCount !== 1 ? "s" : ""} match the selected filters
                    </span>
                  </div>
                )}
              </div>
            )}

            {paginatedBookings.length === 0 ? (
              <div style={styles.emptyState}>
                {searchTerm ? `No bookings found matching "${searchTerm}"` : "No bookings found for this filter."}
              </div>
            ) : (
              <>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHead}>
                        {["Booking ID","Guest","Room","Type","Check-in","Check-out","Amount","Working Days","Status"].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((b) => (
                        <tr key={b.id} style={styles.tr}>
                          <td style={styles.td}><code style={styles.code}>{b.booking_id}</code></td>
                          <td style={styles.td}>
                            <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{b.userName}</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{b.userEmail}</p>
                          </td>
                          <td style={styles.td}>{b.roomTitle}</td>
                          <td style={styles.td}><span style={styles.typeBadge(b.booking_type)}>{b.booking_type}</span></td>
                          <td style={styles.td}>{new Date(b.start_datetime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td style={styles.td}>{new Date(b.end_datetime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td style={styles.td}>
                            <span style={{ fontWeight: 600 }}>₹{Number(b.total_price).toLocaleString("en-IN")}</span>
                            {b.working_day_surcharge > 0 && <p style={{ margin: 0, fontSize: 11, color: "#f97316" }}>+₹{Number(b.working_day_surcharge).toLocaleString("en-IN")} surcharge</p>}
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" }}>{b.working_days || "—"}</td>
                          <td style={styles.td}><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalBookingPages > 1 && <Pagination currentPage={bookingPage} totalPages={totalBookingPages} onPageChange={setBookingPage} />}
              </>
            )}
          </div>

          {/* QUICK ACTIONS */}
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
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function csvCell(val) {
  const str = String(val == null ? "" : val);
  return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
}
function exportCSV(data, filename) {
  const csv = [
    ["Order ID","Booking ID","User","Amount","Attempts","Date"],
    ...data.map(p => [p.order_id, p.booking_id, p.userName || "—", p.amount, p.fail_count || 1, new Date(p.created_at).toLocaleDateString("en-IN")])
  ].map(r => r.map(csvCell).join(",")).join("\n");
  downloadCSV(csv, filename);
}
function exportBookingsCSV(data) {
  const csv = [
    ["Booking ID","Guest","Email","Room","Type","Check-in","Check-out","Amount","Status"],
    ...data.map(b => [b.booking_id, b.userName, b.userEmail, b.roomTitle, b.booking_type,
      new Date(b.start_datetime).toLocaleDateString("en-IN"),
      new Date(b.end_datetime).toLocaleDateString("en-IN"),
      b.total_price, b.status])
  ].map(r => r.map(csvCell).join(",")).join("\n");
  downloadCSV(csv, "bookings");
}
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── RevenueChart (Line Chart) ────────────────────────────────────────────────

function RevenueChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const W = 900, H = 260;
  const pad = { top: 30, right: 30, bottom: 44, left: 72 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const max = Math.max(...data.map(d => d.revenue), 1);
  const ySteps = 4;
  const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => (max * i) / ySteps);

  const pts = data.map((d, i) => ({
    x: pad.left + (data.length <= 1 ? cW / 2 : (i / (data.length - 1)) * cW),
    y: pad.top + cH - (d.revenue / max) * cH,
    revenue: d.revenue,
    label: d.label,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.top + cH).toFixed(1)} L ${pad.left} ${(pad.top + cH).toFixed(1)} Z`;

  return (
    <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Revenue – Last 7 Days</h2>
        <span style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "5px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>Last 7 Days ▾</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map((tick, i) => {
          const y = pad.top + cH - (tick / max) * cH;
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#f1f5f9" strokeWidth={1.5} />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" fontSize={11} fill="#94a3b8" fontFamily="system-ui, sans-serif">
                {tick >= 1000 ? `₹${(tick / 1000).toFixed(1)}k` : `₹${Math.round(tick)}`}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {pts.length > 1 && <path d={areaPath} fill="url(#revAreaGrad)" />}

        {/* Line */}
        {pts.length > 1 && (
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i} style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
            {hoveredIdx === i && (
              <g>
                <rect x={p.x - 46} y={p.y - 38} width={92} height={26} rx={6} fill="#0f172a" />
                <text x={p.x} y={p.y - 20} textAnchor="middle" fontSize={11} fill="white" fontWeight="700" fontFamily="system-ui, sans-serif">
                  ₹{p.revenue.toLocaleString("en-IN")}
                </text>
              </g>
            )}
            <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 7 : 5} fill="white" stroke="#3b82f6" strokeWidth={2.5} />
          </g>
        ))}

        {/* X-axis labels */}
        {pts.map((p, i) => (
          <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="system-ui, sans-serif">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  if (totalPages > 7) {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("..."); pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1); pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("..."); pages.push(totalPages);
    }
  } else {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  }
  return (
    <div style={styles.pagination}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={styles.paginationBtn}><ChevronLeft size={16} /></button>
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} style={styles.paginationEllipsis}>…</span>
        ) : (
          <button key={page} onClick={() => onPageChange(page)} style={{ ...styles.paginationBtn, ...(currentPage === page ? styles.paginationBtnActive : {}) }}>{page}</button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={styles.paginationBtn}><ChevronRight size={16} /></button>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon: Icon, color, trend, up }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      border: "1px solid #e8edf3",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px", fontWeight: 500 }}>{title}</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: "0 0 5px", lineHeight: 1 }}>{value}</h2>
          <p style={{ fontSize: 12, color: "#10b981", margin: 0, fontWeight: 600 }}>{sub}</p>
        </div>
        <div style={{
          width: 50, height: 50, borderRadius: 12,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginLeft: 12,
        }}>
          <Icon size={24} style={{ color }} strokeWidth={2} />
        </div>
      </div>
      {trend && (
        <div style={{ marginTop: 14 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: up ? "#10b981" : "#ef4444",
            background: up ? "#f0fdf4" : "#fef2f2",
            padding: "3px 9px", borderRadius: 6,
          }}>
            {up ? "↑" : "↓"} {trend}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── MiniCard ─────────────────────────────────────────────────────────────────

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

// ─── ActionCard ───────────────────────────────────────────────────────────────

function ActionCard({ label, link, icon: Icon, desc }) {
  return (
    <a href={link} style={styles.actionCard} aria-label={`${label}: ${desc}`}>
      <div style={styles.actionIconBox}><Icon size={22} style={{ color: "#3b82f6" }} strokeWidth={2.5} /></div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 3px" }}>{label}</h4>
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{desc}</p>
      </div>
      <ArrowRight size={18} style={{ color: "#cbd5e1", flexShrink: 0 }} />
    </a>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

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
    <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, background: bg, color: text }}>
      {status}
    </span>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  spinnerRing: { width: 40, height: 40, border: "4px solid #e2e8f0", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" },
  miniSpinner: { width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.6s linear infinite" },
  loadingText: { color: "#64748b", fontSize: 16, fontWeight: 500 },

  toast: (type) => ({
    position: "fixed", top: 24, right: 24, zIndex: 9999,
    background: type === "success" ? "#dcfce7" : "#fee2e2",
    color: type === "success" ? "#166534" : "#991b1b",
    padding: "14px 18px", borderRadius: 12,
    border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "slideDown 0.3s ease", maxWidth: 400,
  }),
  toastClose: { background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.7, display: "flex", alignItems: "center", padding: 4, marginLeft: 8 },

  logoutWarningOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(8px)", animation: "fadeIn 0.3s ease" },
  logoutWarningModal: { background: "white", borderRadius: 20, padding: 40, width: "100%", maxWidth: 460, boxShadow: "0 25px 80px rgba(0,0,0,0.3)", animation: "slideDown 0.3s ease", textAlign: "center" },
  logoutWarningIcon: { width: 80, height: 80, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pulse 2s ease infinite" },
  logoutWarningTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 12px" },
  logoutWarningText: { fontSize: 15, color: "#64748b", lineHeight: 1.6, margin: "0 0 32px" },
  logoutWarningActions: { display: "flex", gap: 12, marginBottom: 20 },
  stayLoggedInBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", background: "#10b981", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  logoutNowBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", background: "white", color: "#64748b", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  logoutWarningProgress: { width: "100%", height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" },
  logoutWarningProgressBar: { height: "100%", background: "linear-gradient(90deg, #ef4444, #f59e0b)", borderRadius: 10, transition: "width 1s linear" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "slideDown 0.2s ease" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
  modalClose: { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4, borderRadius: 6 },
  modalDesc: { fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 1.6 },
  modalTextarea: { width: "100%", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },
  modalCancelBtn: { padding: "10px 20px", background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#64748b", cursor: "pointer" },
  modalRejectBtn: { display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" },

  topBar: {
    background: "white",
    borderBottom: "1px solid #e8edf3",
    padding: "0 28px",
    height: 60,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 40,
  },
  refreshBtn: { width: 36, height: 36, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" },
  topBtn: { position: "relative", width: 36, height: 36, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  badge: { position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", fontSize: 9, fontWeight: 800, borderRadius: "50%", minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
  userInfoBtn: { display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" },
  userAvatarSmall: { width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  notifPanel: { position: "absolute", top: 44, right: 0, width: 390, background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", zIndex: 999, animation: "slideDown 0.2s ease" },
  notifHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" },
  notifTitle: { fontWeight: 700, fontSize: 14, color: "#0f172a" },
  markAllBtn: { background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6 },
  notifClose: { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 },
  notifList: { maxHeight: 420, overflowY: "auto" },
  notifEmpty: { padding: "24px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 },
  notifItem: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 18px", borderBottom: "1px solid #f8fafc", cursor: "pointer" },
  notifIconWrap: (type) => ({
    width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: type === "REGISTRATION" ? "#eff6ff" : type === "BOOKING" ? "#f0fdf4" : type === "PAYMENT" ? "#fef9c3" : "#f8fafc",
    color: type === "REGISTRATION" ? "#3b82f6" : type === "BOOKING" ? "#16a34a" : type === "PAYMENT" ? "#ca8a04" : "#64748b",
  }),
  notifTypeBadge: (type) => ({
    display: "inline-block", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
    textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, marginBottom: 4,
    background: type === "REGISTRATION" ? "#eff6ff" : type === "BOOKING" ? "#f0fdf4" : type === "PAYMENT" ? "#fef9c3" : "#f8fafc",
    color: type === "REGISTRATION" ? "#1d4ed8" : type === "BOOKING" ? "#15803d" : type === "PAYMENT" ? "#a16207" : "#64748b",
  }),
  notifMsg: { fontSize: 13, color: "#334155", margin: "0 0 4px", lineHeight: 1.5 },
  notifUserDetails: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  notifDetail: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" },
  notifTime: { fontSize: 11, color: "#94a3b8", margin: 0 },
  unreadDot: { width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 6 },

  userMenu: { position: "absolute", top: 46, right: 0, width: 210, background: "white", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", zIndex: 999, animation: "slideDown 0.2s ease", overflow: "hidden" },
  userMenuHeader: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f8fafc" },
  userAvatar: { width: 38, height: 38, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 },
  userRole: { fontSize: 12, color: "#64748b", margin: 0 },
  userMenuDivider: { height: 1, background: "#f1f5f9" },
  userMenuItem: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#475569", textAlign: "left" },

  welcomeSection: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 },
  welcomeTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  welcomeSub: { fontSize: 14, color: "#64748b", margin: 0 },
  dateDisplay: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "white", padding: "8px 14px", borderRadius: 10, border: "1px solid #e2e8f0" },

  alertBanner: (bg, text, border) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, marginBottom: 12, background: bg, border: `1px solid ${border}`, fontSize: 14 }),

  primaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 20 },
  secondaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 36 },
  miniCard: { background: "white", padding: "16px 18px", borderRadius: 12, border: "1px solid #e8edf3", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  miniIconBox: { width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },

  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 18, display: "flex", alignItems: "center" },
  sectionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 },
  countBadge: { marginLeft: 10, background: "#3b82f6", color: "white", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 12 },

  regGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  regCard: { background: "white", borderRadius: 14, border: "1px solid #e8edf3", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  regCardHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  regAvatar: { width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #6366f1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 },
  regName: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" },
  regEmail: { fontSize: 12, color: "#64748b", margin: 0 },
  pendingBadge: { fontSize: 11, fontWeight: 700, color: "#d97706", flexShrink: 0 },
  regDetails: { background: "#f8fafc", borderRadius: 8, padding: "10px 12px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 7 },
  regDetailRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" },
  regActions: { display: "flex", gap: 10 },
  approveRegBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  rejectRegBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "white", color: "#ef4444", border: "1.5px solid #ef4444", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },

  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  advLabel: { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#64748b", marginBottom: 6 },
  advSelect: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #dbe3f0", fontSize: 13, background: "white", color: "#0f172a", outline: "none" },
  filterBtn: (active) => ({ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: active ? "1px solid #3b82f6" : "1px solid #e2e8f0", background: active ? "#3b82f6" : "white", color: active ? "white" : "#64748b", cursor: "pointer" }),
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", minWidth: 220 },
  searchInput: { border: "none", outline: "none", fontSize: 13, color: "#0f172a", background: "none", flex: 1 },
  searchClear: { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 2 },
  exportBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" },
  tableContainer: { background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "13px 16px", fontSize: 14, color: "#334155" },
  code: { fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569", fontFamily: "monospace" },
  typeBadge: (type) => ({ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: type === "HALF_DAY" ? "#f0fdf4" : type === "MULTI_DAY" ? "#eff6ff" : type === "WEEKEND" ? "#fef3c7" : "#fafafa", color: type === "HALF_DAY" ? "#166534" : type === "MULTI_DAY" ? "#1e40af" : type === "WEEKEND" ? "#92400e" : "#475569", textTransform: "uppercase", letterSpacing: 0.3 }),
  failBadge: { fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: "#fee2e2", color: "#991b1b" },
  retryPaymentBtn: { display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#1e40af", cursor: "pointer" },
  emptyState: { background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 15 },
  approvalList: { display: "flex", flexDirection: "column", gap: 12 },
  approvalCard: { background: "white", borderRadius: 12, border: "1px solid #e8edf3", padding: "18px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  approvalId: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", fontFamily: "monospace" },
  approvalMeta: { fontSize: 13, color: "#64748b", margin: "0 0 4px" },
  approvalDate: { fontSize: 12, color: "#94a3b8", margin: 0 },
  actionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 },
  actionCard: { background: "white", padding: "16px 18px", borderRadius: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 14, border: "1px solid #e8edf3", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer" },
  actionIconBox: { width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 18, padding: "14px 0" },
  paginationBtn: { minWidth: 34, height: 34, padding: "0 8px", background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  paginationBtnActive: { background: "#3b82f6", borderColor: "#3b82f6", color: "white" },
  paginationEllipsis: { padding: "0 8px", color: "#94a3b8", fontSize: 14 },
};
