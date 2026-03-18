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
const BOOKINGS_PER_PAGE   = 10;
const PAYMENTS_PER_PAGE   = 5;
// ✅ AUTO LOGOUT: 10 minutes inactivity
const AUTO_LOGOUT_TIME_MS = 10 * 60 * 1000; // 10 minutes

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
  const [recentBookings, setRecentBookings]     = useState([]);
  const [notifications, setNotifications]       = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [paymentAlerts, setPaymentAlerts]       = useState([]);
  const [revenueData, setRevenueData]           = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [approvingRegId, setApprovingRegId]             = useState(null);
  const [rejectingRegId, setRejectingRegId]             = useState(null);
  const [rejectReason, setRejectReason]                 = useState("");
  const [showRejectModal, setShowRejectModal]           = useState(null);

  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState(null);
  const [successMsg, setSuccessMsg]       = useState(null);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [lastUpdated, setLastUpdated]     = useState(null);
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [bookingPage, setBookingPage]     = useState(1);
  const [paymentPage, setPaymentPage]     = useState(1);
  const [pauseRefresh, setPauseRefresh]   = useState(false);
  const [approvingId, setApprovingId]     = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [showUserMenu, setShowUserMenu]   = useState(false);

  // ✅ AUTO LOGOUT STATE
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [logoutCountdown, setLogoutCountdown]     = useState(60); // 60 seconds warning

  const notifPanelRef = useRef(null);
  const userMenuRef   = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef    = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef    = useRef(Date.now());

  // ✅ AUTO LOGOUT: Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowLogoutWarning(false);
    
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Set new inactivity timer (9 minutes before warning)
    inactivityTimerRef.current = setTimeout(() => {
      setShowLogoutWarning(true);
      setLogoutCountdown(60);
      
      // Start countdown
      let count = 60;
      countdownIntervalRef.current = setInterval(() => {
        count--;
        setLogoutCountdown(count);
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current);
          handleAutoLogout();
        }
      }, 1000);
      
      // Auto logout after 1 minute warning
      warningTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, 60000); // 60 seconds
    }, AUTO_LOGOUT_TIME_MS - 60000); // Show warning 1 minute before logout
  }, []);

  // ✅ Handle auto logout
  const handleAutoLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();
    window.location.href = "/login?reason=inactivity";
  }, []);

  // ✅ Handle manual logout
  const handleLogout = useCallback(() => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  // ✅ Stay logged in (dismiss warning)
  const handleStayLoggedIn = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // ✅ Setup activity listeners
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
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
        api.get("/admin/dashboard/bookings?status=PENDING&type=WEEKEND"),
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

  const handleApproval = async (bookingId, action) => {
    try {
      setApprovingId(bookingId);
      setPauseRefresh(true);
      await api.patch(`/admin/bookings/${bookingId}/status`, {
        status: action === "approve" ? "CONFIRMED" : "CANCELLED",
      });
      setPendingApprovals((prev) => prev.filter((b) => b.booking_id !== bookingId));
      setSuccessMsg(`Booking ${action === "approve" ? "approved" : "rejected"} successfully`);
      setTimeout(() => { fetchAll(true); setPauseRefresh(false); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} booking`);
      setPauseRefresh(false);
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveRegistration = async (userId, userName) => {
    try {
      setApprovingRegId(userId);
      setPauseRefresh(true);
      await api.patch(`/admin/dashboard/registrations/${userId}/approve`);
      setPendingRegistrations((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({ ...prev, pendingRegistrations: Math.max(0, prev.pendingRegistrations - 1) }));
      setSuccessMsg(`${userName}'s account has been approved! They can now login.`);
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
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
      if (userMenuRef.current   && !userMenuRef.current.contains(e.target))   setShowUserMenu(false);
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

  const filteredBookings = bookingFilter === "ALL"
    ? recentBookings
    : recentBookings.filter((b) => b.status === bookingFilter);

  const searchedBookings = searchTerm
    ? filteredBookings.filter((b) =>
        b.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredBookings;

  const totalBookingPages = Math.ceil(searchedBookings.length / BOOKINGS_PER_PAGE);
  const paginatedBookings = searchedBookings.slice(
    (bookingPage - 1) * BOOKINGS_PER_PAGE,
    bookingPage * BOOKINGS_PER_PAGE
  );

  const totalPaymentPages = Math.ceil(paymentAlerts.length / PAYMENTS_PER_PAGE);
  const paginatedPayments = paymentAlerts.slice(
    (paymentPage - 1) * PAYMENTS_PER_PAGE,
    paymentPage * PAYMENTS_PER_PAGE
  );

  if (loading) return (
    <>
      <AdminNavbar />
      <div style={styles.center}>
        <div style={styles.spinnerRing} />
        <p style={styles.loadingText}>Loading dashboard…</p>
      </div>
    </>
  );

  return (
    <>
      <AdminNavbar />
      <div style={styles.page}>

        {/* ✅ AUTO LOGOUT WARNING MODAL */}
        {showLogoutWarning && (
          <div style={styles.logoutWarningOverlay} role="dialog" aria-modal="true" aria-label="Inactivity warning">
            <div style={styles.logoutWarningModal}>
              <div style={styles.logoutWarningIcon}>
                <Clock size={48} color="#f59e0b" />
              </div>
              <h2 style={styles.logoutWarningTitle}>Still There?</h2>
              <p style={styles.logoutWarningText}>
                You've been inactive for a while. You'll be logged out in <strong style={{ color: "#ef4444" }}>{logoutCountdown} seconds</strong> for security.
              </p>
              <div style={styles.logoutWarningActions}>
                <button onClick={handleStayLoggedIn} style={styles.stayLoggedInBtn}>
                  <Check size={16} /> Stay Logged In
                </button>
                <button onClick={handleAutoLogout} style={styles.logoutNowBtn}>
                  <LogOut size={16} /> Logout Now
                </button>
              </div>
              <div style={styles.logoutWarningProgress}>
                <div style={{ ...styles.logoutWarningProgressBar, width: `${(logoutCountdown / 60) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* TOASTS */}
        {successMsg && (
          <div style={styles.toast("success")} role="alert" aria-live="polite">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} style={styles.toastClose} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}
        {error && (
          <div style={styles.toast("error")} role="alert" aria-live="assertive">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={styles.toastClose} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}

        {/* REJECT REASON MODAL */}
        {showRejectModal && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Reject registration">
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Reject Registration</h3>
                <button onClick={() => { setShowRejectModal(null); setRejectReason(""); }} style={styles.modalClose}>
                  <X size={18} />
                </button>
              </div>
              <p style={styles.modalDesc}>
                Rejecting <strong>{showRejectModal.name}</strong> ({showRejectModal.email}). Optionally provide a reason:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                style={styles.modalTextarea}
                rows={3}
                aria-label="Rejection reason"
              />
              <div style={styles.modalActions}>
                <button
                  onClick={() => { setShowRejectModal(null); setRejectReason(""); }}
                  style={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectRegistration(showRejectModal.id, showRejectModal.name)}
                  style={styles.modalRejectBtn}
                  disabled={rejectingRegId === showRejectModal.id}
                >
                  {rejectingRegId === showRejectModal.id ? (
                    <><div style={styles.miniSpinner} /> Rejecting…</>
                  ) : (
                    <><X size={14} /> Confirm Reject</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            {lastUpdated && (
              <p style={styles.subtitle}>
                Last updated: {lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                })}
                {pauseRefresh && <span style={styles.pausedLabel}>• Auto-refresh paused</span>}
              </p>
            )}
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() => fetchAll(true)}
              style={styles.refreshBtn}
              disabled={refreshing}
              aria-label="Refresh dashboard data"
            >
              <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative" }} ref={notifPanelRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                style={styles.bellBtn}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                aria-expanded={notifOpen}
              >
                {unreadCount > 0 ? <BellRing size={20} color="#f59e0b" /> : <Bell size={20} color="#64748b" />}
                {unreadCount > 0 && (
                  <span style={styles.badge} aria-hidden="true">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={styles.notifPanel} role="dialog" aria-label="Notifications">
                  <div style={styles.notifHeader}>
                    <span style={styles.notifTitle}>🔔 Notifications</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={styles.markAllBtn} aria-label="Mark all as read">
                          <CheckCircle size={14} /> Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} style={styles.notifClose} aria-label="Close">
                        <X size={16} />
                      </button>
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
                          role="button"
                          tabIndex={0}
                          onKeyPress={(e) => { if (e.key === "Enter" && !n.is_read) markRead(n.id); }}
                        >
                          <div style={styles.notifIconWrap(n.type)} aria-hidden="true">
                            {n.type === "REGISTRATION" && <UserPlus size={14} />}
                            {n.type === "BOOKING"      && <Calendar  size={14} />}
                            {n.type === "PAYMENT"      && <CreditCard size={14} />}
                            {n.type === "SYSTEM"       && <Settings  size={14} />}
                            {!["REGISTRATION","BOOKING","PAYMENT","SYSTEM"].includes(n.type) && <Bell size={14} />}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={styles.notifTypeBadge(n.type)}>{n.type || "GENERAL"}</span>
                            <p style={styles.notifMsg}>{n.message}</p>

                            {n.type === "REGISTRATION" && n.user && (
                              <div style={styles.notifUserDetails}>
                                {n.user.phone && (
                                  <span style={styles.notifDetail}><Phone size={10} /> {n.user.phone}</span>
                                )}
                                {n.user.company && (
                                  <span style={styles.notifDetail}><Building size={10} /> {n.user.company}</span>
                                )}
                              </div>
                            )}

                            <p style={styles.notifTime}>
                              {new Date(n.created_at).toLocaleString("en-IN", {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!n.is_read && <div style={styles.unreadDot} aria-label="Unread" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ IMPROVED LOGOUT BUTTON - More Visible */}
            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              aria-label="Logout"
              title="Logout from admin panel"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>

            {/* User Menu */}
            <div style={{ position: "relative" }} ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((o) => !o)}
                style={styles.userBtn}
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <User size={20} color="#64748b" />
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
                  <button style={styles.userMenuItem} onClick={() => window.location.href = "/admin/settings"} role="menuitem">
                    <Settings size={16} /><span>Settings</span>
                  </button>
                  <button style={styles.userMenuItem} onClick={() => window.location.href = "/admin/profile"} role="menuitem">
                    <User size={16} /><span>Profile</span>
                  </button>
                  <div style={styles.userMenuDivider} />
                  <button style={{ ...styles.userMenuItem, color: "#ef4444" }} onClick={handleLogout} role="menuitem">
                    <LogOut size={16} /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ALERT BANNERS */}
        {pendingRegistrations.length > 0 && (
          <div style={styles.alertBanner("#eff6ff", "#1e40af", "#bfdbfe")} role="alert" aria-live="polite">
            <UserPlus size={18} color="#3b82f6" aria-hidden="true" />
            <span style={{ fontWeight: 600, color: "#1e40af" }}>
              {pendingRegistrations.length} new registration request{pendingRegistrations.length > 1 ? "s" : ""} awaiting your approval
            </span>
          </div>
        )}
        {pendingApprovals.length > 0 && (
          <div style={styles.alertBanner("#fef3c7", "#92400e", "#fde68a")} role="alert" aria-live="polite">
            <AlertTriangle size={18} color="#d97706" aria-hidden="true" />
            <span style={{ fontWeight: 600, color: "#92400e" }}>
              {pendingApprovals.length} weekend booking{pendingApprovals.length > 1 ? "s" : ""} awaiting your approval
            </span>
          </div>
        )}
        {paymentAlerts.length > 0 && (
          <div style={styles.alertBanner("#fee2e2", "#991b1b", "#fecaca")} role="alert" aria-live="polite">
            <XCircle size={18} color="#dc2626" aria-hidden="true" />
            <span style={{ fontWeight: 600, color: "#991b1b" }}>
              {paymentAlerts.length} failed payment{paymentAlerts.length > 1 ? "s" : ""} need attention
            </span>
          </div>
        )}

        {/* PRIMARY STATS */}
        <div style={styles.primaryGrid}>
          <StatCard title="Total Users"     value={stats.totalUsers}   sub={`${stats.activeUsers} active`}          icon={Users}       color="#3b82f6" trend="+12%" up />
          <StatCard title="Total Rooms"     value={stats.totalRooms}   sub={`${stats.activeRooms} available`}        icon={Hotel}       color="#8b5cf6" trend="+5%"  up />
          <StatCard title="Total Bookings"  value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmed`} icon={Calendar}    color="#f59e0b" trend="+18%" up />
          <StatCard
            title="Total Revenue"
            value={`₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`}
            sub={`₹${Number(stats.todayRevenue || 0).toLocaleString("en-IN")} today`}
            icon={DollarSign}
            color="#10b981"
            trend="+24%"
            up
          />
        </div>

        {/* SECONDARY STATS */}
        <div style={styles.secondaryGrid}>
          <MiniCard label="Active Users"         value={stats.activeUsers}          icon={UserCheck}  color="#10b981" />
          <MiniCard label="Pending Bookings"      value={stats.pendingBookings || 0}  icon={Clock}      color="#f59e0b" />
          <MiniCard label="Failed Payments"       value={stats.failedPayments  || 0}  icon={CreditCard} color="#ef4444" />
          <MiniCard label="Dataset Locks Active"  value={stats.activeDatasetLocks || 0} icon={Lock}     color="#6366f1" />
          <MiniCard label="Cancelled Bookings"    value={stats.cancelledBookings || 0} icon={XCircle}   color="#94a3b8" />
          <MiniCard label="Pending Registrations" value={stats.pendingRegistrations || 0} icon={UserPlus} color="#3b82f6" />
        </div>

        {/* REVENUE CHART */}
        {revenueData.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <BarChart3 size={20} style={{ marginRight: 8, color: "#3b82f6" }} />
              Revenue – Last 7 Days
            </h2>
            <RevenueChart data={revenueData} />
          </div>
        )}

        {/* PENDING REGISTRATIONS SECTION */}
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
                    <div style={styles.regAvatar}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.regName}>{u.name}</p>
                      <p style={styles.regEmail}>{u.email}</p>
                    </div>
                    <span style={styles.pendingBadge}>PENDING</span>
                  </div>

                  <div style={styles.regDetails}>
                    {u.phone && (
                      <div style={styles.regDetailRow}>
                        <Phone size={12} color="#64748b" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                    {u.company && (
                      <div style={styles.regDetailRow}>
                        <Building size={12} color="#64748b" />
                        <span>{u.company}</span>
                      </div>
                    )}
                    {(u.city || u.state) && (
                      <div style={styles.regDetailRow}>
                        <MapPin size={12} color="#64748b" />
                        <span>{[u.city, u.state].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                    {u.id_proof_type && (
                      <div style={styles.regDetailRow}>
                        <FileText size={12} color="#64748b" />
                        <span>{u.id_proof_type}: {u.id_proof_number}</span>
                      </div>
                    )}
                    <div style={styles.regDetailRow}>
                      <Clock size={12} color="#64748b" />
                      <span>Registered {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}</span>
                    </div>
                  </div>

                  <div style={styles.regActions}>
                    <button
                      style={styles.approveRegBtn}
                      onClick={() => handleApproveRegistration(u.id, u.name)}
                      disabled={approvingRegId === u.id || rejectingRegId === u.id}
                      aria-label={`Approve ${u.name}`}
                    >
                      {approvingRegId === u.id ? (
                        <><div style={styles.miniSpinner} /> Approving…</>
                      ) : (
                        <><Check size={14} /> Approve</>
                      )}
                    </button>
                    <button
                      style={styles.rejectRegBtn}
                      onClick={() => setShowRejectModal(u)}
                      disabled={approvingRegId === u.id || rejectingRegId === u.id}
                      aria-label={`Reject ${u.name}`}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PENDING WEEKEND APPROVALS */}
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
                      {b.userName} · {b.roomTitle} · ₹{Number(b.total_price).toLocaleString("en-IN")}
                    </p>
                    <p style={styles.approvalDate}>
                      {new Date(b.start_datetime).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      {" – "}
                      {new Date(b.end_datetime).toLocaleDateString("en-IN",   { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    {b.weekend_notice && (
                      <p style={styles.weekendNotice}>📝 {b.weekend_notice}</p>
                    )}
                  </div>
                  <div style={styles.approvalBtns}>
                    <button
                      onClick={() => handleApproval(b.booking_id, "approve")}
                      style={styles.approveBtn}
                      disabled={approvingId === b.booking_id}
                      aria-label={`Approve booking ${b.booking_id}`}
                    >
                      {approvingId === b.booking_id ? <div style={styles.miniSpinner} /> : <Check size={14} />}
                      {approvingId === b.booking_id ? "Processing…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleApproval(b.booking_id, "reject")}
                      style={styles.rejectBtn}
                      disabled={approvingId === b.booking_id}
                      aria-label={`Reject booking ${b.booking_id}`}
                    >
                      {approvingId === b.booking_id ? <div style={styles.miniSpinner} /> : <X size={14} />}
                      {approvingId === b.booking_id ? "Processing…" : "Reject"}
                    </button>
                  </div>
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
              <button style={styles.exportBtn} onClick={() => exportCSV(paymentAlerts, "failed-payments")} aria-label="Export">
                <Download size={14} /> Export
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    {["Order ID","Booking","User","Amount","Attempts","Date","Actions"].map((h) => (
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
                        <button style={styles.retryPaymentBtn} onClick={() => setSuccessMsg("Payment retry initiated")} aria-label={`Retry ${p.order_id}`}>
                          <RotateCcw size={14} /> Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPaymentPages > 1 && (
              <Pagination currentPage={paymentPage} totalPages={totalPaymentPages} onPageChange={setPaymentPage} />
            )}
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
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setBookingPage(1); }}
                  style={styles.searchInput}
                  aria-label="Search bookings"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} style={styles.searchClear} aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button style={styles.exportBtn} onClick={() => exportBookingsCSV(searchedBookings)} aria-label="Export bookings">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          <div style={styles.filterRow}>
            {["ALL","CONFIRMED","PENDING","CANCELLED","COMPLETED"].map((f) => (
              <button
                key={f}
                onClick={() => { setBookingFilter(f); setBookingPage(1); }}
                style={styles.filterBtn(bookingFilter === f)}
                aria-pressed={bookingFilter === f}
              >
                {f}
              </button>
            ))}
          </div>

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
                      {["Booking ID","Guest","Room","Type","Check-in","Check-out","Amount","Working Days","Status"].map((h) => (
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
                          {b.working_day_surcharge > 0 && (
                            <p style={{ margin: 0, fontSize: 11, color: "#f97316" }}>+₹{Number(b.working_day_surcharge).toLocaleString("en-IN")} surcharge</p>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: "center" }}>{b.working_days || "—"}</td>
                        <td style={styles.td}><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalBookingPages > 1 && (
                <Pagination currentPage={bookingPage} totalPages={totalBookingPages} onPageChange={setBookingPage} />
              )}
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
            <ActionCard label="Manage Users"    link="/admin/manageusers"    icon={Users}     desc="View and manage user accounts" />
            <ActionCard label="Manage Rooms"    link="/admin/managedata"     icon={Hotel}     desc="Update room inventory & pricing" />
            <ActionCard label="All Bookings"    link="/admin/managebookings" icon={Calendar}  desc="Track and manage all reservations" />
            <ActionCard label="Payment Logs"    link="/admin/payments"       icon={CreditCard} desc="View transactions & failed payments" />
            <ActionCard label="Dataset Access"  link="/admin/datasets"       icon={Lock}      desc="Monitor dataset locks & access logs" />
            <ActionCard label="Notifications"   link="/admin/notifications"  icon={Bell}      desc="Manage system notifications" />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </>
  );
}

// Helpers
function exportCSV(data, filename) {
  const csv = [
    ["Order ID","Booking ID","User","Amount","Attempts","Date"],
    ...data.map(p => [p.order_id, p.booking_id, p.userName||"—", p.amount, p.fail_count||1, new Date(p.created_at).toLocaleDateString("en-IN")])
  ].map(r => r.join(",")).join("\n");
  downloadCSV(csv, filename);
}

function exportBookingsCSV(data) {
  const csv = [
    ["Booking ID","Guest","Email","Room","Type","Check-in","Check-out","Amount","Status"],
    ...data.map(b => [b.booking_id, b.userName, b.userEmail, b.roomTitle, b.booking_type,
      new Date(b.start_datetime).toLocaleDateString("en-IN"),
      new Date(b.end_datetime).toLocaleDateString("en-IN"),
      b.total_price, b.status])
  ].map(r => r.join(",")).join("\n");
  downloadCSV(csv, "bookings");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  return (
    <div style={{ background:"white", borderRadius:16, padding:"28px", border:"1px solid #e2e8f0" }}>
      <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:140, position:"relative" }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8, position:"relative" }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === i && (
              <div style={{ position:"absolute", top:-40, background:"#0f172a", color:"white", padding:"6px 10px", borderRadius:6, fontSize:12, fontWeight:600, whiteSpace:"nowrap", zIndex:10 }}>
                ₹{d.revenue.toLocaleString("en-IN")}
              </div>
            )}
            <span style={{ fontSize:11, color:"#64748b", fontWeight:600, opacity: hoveredIndex===i ? 1 : 0.7 }}>
              ₹{(d.revenue/1000).toFixed(1)}k
            </span>
            <div style={{
              width:"100%",
              background: hoveredIndex===i ? "#2563eb" : "#3b82f6",
              height:`${(d.revenue/max)*100}%`,
              minHeight:4,
              borderRadius:"6px 6px 0 0",
              transition:"all 0.3s ease",
              cursor:"pointer",
            }} />
            <span style={{ fontSize:11, color: hoveredIndex===i ? "#0f172a" : "#94a3b8", fontWeight: hoveredIndex===i ? 600 : 400 }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  if (totalPages > 7) {
    if (currentPage <= 4) {
      for (let i=1; i<=5; i++) pages.push(i);
      pages.push("..."); pages.push(totalPages);
    } else if (currentPage >= totalPages-3) {
      pages.push(1); pages.push("...");
      for (let i=totalPages-4; i<=totalPages; i++) pages.push(i);
    } else {
      pages.push(1); pages.push("...");
      for (let i=currentPage-1; i<=currentPage+1; i++) pages.push(i);
      pages.push("..."); pages.push(totalPages);
    }
  } else {
    for (let i=1; i<=totalPages; i++) pages.push(i);
  }
  return (
    <div style={styles.pagination}>
      <button onClick={() => onPageChange(currentPage-1)} disabled={currentPage===1} style={styles.paginationBtn} aria-label="Previous page"><ChevronLeft size={16} /></button>
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} style={styles.paginationEllipsis}>…</span>
        ) : (
          <button key={page} onClick={() => onPageChange(page)} style={{ ...styles.paginationBtn, ...(currentPage===page ? styles.paginationBtnActive : {}) }} aria-current={currentPage===page ? "page" : undefined}>{page}</button>
        )
      )}
      <button onClick={() => onPageChange(currentPage+1)} disabled={currentPage===totalPages} style={styles.paginationBtn} aria-label="Next page"><ChevronRight size={16} /></button>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color, trend, up }) {
  return (
    <div style={styles.statCard}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div style={{ ...styles.iconBox, background:`${color}15` }}>
          <Icon size={28} style={{ color }} strokeWidth={2.5} />
        </div>
        {trend && (
          <span style={{ fontSize:13, fontWeight:700, color: up?"#10b981":"#ef4444", display:"flex", alignItems:"center", gap:2 }}>
            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend}
          </span>
        )}
      </div>
      <h2 style={{ fontSize:36, fontWeight:800, color, margin:"0 0 6px", lineHeight:1 }}>{value}</h2>
      <p style={{ fontSize:13, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, margin:"0 0 4px" }}>{title}</p>
      <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>{sub}</p>
    </div>
  );
}

function MiniCard({ label, value, icon: Icon, color }) {
  return (
    <div style={styles.miniCard}>
      <div style={{ ...styles.miniIconBox, background:`${color}15` }}>
        <Icon size={18} style={{ color }} strokeWidth={2.5} />
      </div>
      <div>
        <p style={{ fontSize:12, color:"#64748b", margin:"0 0 2px", fontWeight:500 }}>{label}</p>
        <h3 style={{ fontSize:22, fontWeight:700, color, margin:0 }}>{value}</h3>
      </div>
    </div>
  );
}

function ActionCard({ label, link, icon: Icon, desc }) {
  return (
    <a href={link} style={styles.actionCard} aria-label={`${label}: ${desc}`}>
      <div style={styles.actionIconBox}><Icon size={22} style={{ color:"#3b82f6" }} strokeWidth={2.5} /></div>
      <div style={{ flex:1 }}>
        <h4 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 3px" }}>{label}</h4>
        <p style={{ fontSize:12, color:"#64748b", margin:0 }}>{desc}</p>
      </div>
      <ArrowRight size={18} style={{ color:"#cbd5e1", flexShrink:0 }} />
    </a>
  );
}

function StatusBadge({ status }) {
  const map = {
    CONFIRMED: ["#dcfce7","#166534"],
    PENDING:   ["#fef3c7","#92400e"],
    CANCELLED: ["#fee2e2","#991b1b"],
    COMPLETED: ["#dbeafe","#1e40af"],
    EXPIRED:   ["#f1f5f9","#475569"],
  };
  const [bg, text] = map[status] || ["#f3f4f6","#374151"];
  return (
    <span style={{ padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, background:bg, color:text }} role="status">
      {status}
    </span>
  );
}

// Styles
const styles = {
  page: { maxWidth:1440, margin:"0 auto", padding:"40px 28px", background:"#f8fafc", minHeight:"100vh", fontFamily:"'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" },
  center: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:16 },
  spinnerRing: { width:40, height:40, border:"4px solid #e2e8f0", borderTop:"4px solid #3b82f6", borderRadius:"50%", animation:"spin 1s linear infinite" },
  miniSpinner: { width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin 0.6s linear infinite" },
  loadingText: { color:"#64748b", fontSize:16, fontWeight:500 },
  toast: (type) => ({
    position:"fixed", top:24, right:24, zIndex:9999,
    background: type==="success" ? "#dcfce7" : "#fee2e2",
    color: type==="success" ? "#166534" : "#991b1b",
    padding:"14px 18px", borderRadius:12,
    border:`1px solid ${type==="success" ? "#bbf7d0" : "#fecaca"}`,
    display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:600,
    boxShadow:"0 10px 40px rgba(0,0,0,0.1)", animation:"slideDown 0.3s ease", maxWidth:400,
  }),
  toastClose: { background:"none", border:"none", cursor:"pointer", color:"inherit", opacity:0.7, display:"flex", alignItems:"center", padding:4, marginLeft:8 },

  // ✅ Auto Logout Warning Modal
  logoutWarningOverlay: { 
    position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:10001, 
    display:"flex", alignItems:"center", justifyContent:"center", padding:"20px",
    backdropFilter:"blur(8px)", animation:"fadeIn 0.3s ease"
  },
  logoutWarningModal: { 
    background:"white", borderRadius:20, padding:"40px", width:"100%", maxWidth:460, 
    boxShadow:"0 25px 80px rgba(0,0,0,0.3)", animation:"slideDown 0.3s ease",
    textAlign:"center"
  },
  logoutWarningIcon: { 
    width:80, height:80, borderRadius:"50%", background:"#fef3c7", 
    display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px",
    animation:"pulse 2s ease infinite"
  },
  logoutWarningTitle: { fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 12px" },
  logoutWarningText: { fontSize:15, color:"#64748b", lineHeight:1.6, margin:"0 0 32px" },
  logoutWarningActions: { display:"flex", gap:12, marginBottom:20 },
  stayLoggedInBtn: { 
    flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    padding:"14px 24px", background:"#10b981", color:"white", border:"none", 
    borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer",
    boxShadow:"0 4px 14px rgba(16,185,129,0.4)", transition:"all 0.2s"
  },
  logoutNowBtn: { 
    flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    padding:"14px 24px", background:"white", color:"#64748b", 
    border:"2px solid #e2e8f0", borderRadius:10, fontSize:15, fontWeight:700, 
    cursor:"pointer", transition:"all 0.2s"
  },
  logoutWarningProgress: { 
    width:"100%", height:6, background:"#f1f5f9", borderRadius:10, overflow:"hidden"
  },
  logoutWarningProgressBar: { 
    height:"100%", background:"linear-gradient(90deg, #ef4444, #f59e0b)", 
    borderRadius:10, transition:"width 1s linear"
  },

  // Modal
  modalOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  modal: { background:"white", borderRadius:16, padding:"28px", width:"100%", maxWidth:480, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", animation:"slideDown 0.2s ease" },
  modalHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  modalTitle: { fontSize:18, fontWeight:700, color:"#0f172a", margin:0 },
  modalClose: { background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"flex", padding:4, borderRadius:6 },
  modalDesc: { fontSize:14, color:"#64748b", marginBottom:16, lineHeight:1.6 },
  modalTextarea: { width:"100%", padding:"12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, resize:"vertical", fontFamily:"inherit", outline:"none" },
  modalActions: { display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 },
  modalCancelBtn: { padding:"10px 20px", background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, fontWeight:600, color:"#64748b", cursor:"pointer" },
  modalRejectBtn: { display:"flex", alignItems:"center", gap:6, padding:"10px 20px", background:"#ef4444", color:"white", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer" },

  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:16 },
  pageTitle: { fontSize:32, fontWeight:800, color:"#0f172a", margin:0, letterSpacing:-0.5 },
  subtitle: { fontSize:13, color:"#94a3b8", margin:"6px 0 0", fontWeight:500, display:"flex", alignItems:"center", gap:8 },
  pausedLabel: { color:"#f59e0b", fontWeight:600 },
  headerActions: { display:"flex", gap:12, alignItems:"center" },
  refreshBtn: { display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, fontWeight:600, color:"#475569", cursor:"pointer", transition:"all 0.2s" },
  
  // ✅ Prominent Logout Button
  logoutBtn: { 
    display:"flex", alignItems:"center", gap:8, padding:"10px 18px", 
    background:"linear-gradient(135deg, #ef4444, #dc2626)", color:"white", 
    border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer",
    boxShadow:"0 4px 14px rgba(239,68,68,0.35)", transition:"all 0.2s",
  },
  
  bellBtn: { position:"relative", width:40, height:40, borderRadius:10, background:"white", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" },
  userBtn: { position:"relative", width:40, height:40, borderRadius:10, background:"white", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s" },
  badge: { position:"absolute", top:-4, right:-4, background:"#ef4444", color:"white", fontSize:10, fontWeight:800, borderRadius:"50%", minWidth:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" },

  notifPanel: { position:"absolute", top:48, right:0, width:400, background:"white", borderRadius:16, border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(0,0,0,0.12)", zIndex:999, animation:"slideIn 0.2s ease" },
  notifHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", borderBottom:"1px solid #f1f5f9" },
  notifTitle: { fontWeight:700, fontSize:15, color:"#0f172a" },
  markAllBtn: { background:"none", border:"none", cursor:"pointer", color:"#3b82f6", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:4, padding:"4px 8px", borderRadius:6 },
  notifClose: { background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"flex", alignItems:"center", padding:4, borderRadius:6 },
  notifList: { maxHeight:440, overflowY:"auto" },
  notifEmpty: { padding:"24px 20px", textAlign:"center", color:"#94a3b8", fontSize:14 },
  notifItem: { display:"flex", alignItems:"flex-start", gap:12, padding:"14px 20px", borderBottom:"1px solid #f8fafc", cursor:"pointer", transition:"background 0.15s" },
  notifIconWrap: (type) => ({
    width:32, height:32, borderRadius:8, flexShrink:0, marginTop:2,
    display:"flex", alignItems:"center", justifyContent:"center",
    background: type==="REGISTRATION" ? "#eff6ff" : type==="BOOKING" ? "#f0fdf4" : type==="PAYMENT" ? "#fef9c3" : "#f8fafc",
    color:       type==="REGISTRATION" ? "#3b82f6" : type==="BOOKING" ? "#16a34a" : type==="PAYMENT" ? "#ca8a04" : "#64748b",
  }),
  notifTypeBadge: (type) => ({
    display:"inline-block", fontSize:9, fontWeight:800, letterSpacing:"0.08em",
    textTransform:"uppercase", padding:"2px 6px", borderRadius:4, marginBottom:4,
    background: type==="REGISTRATION" ? "#eff6ff" : type==="BOOKING" ? "#f0fdf4" : type==="PAYMENT" ? "#fef9c3" : "#f8fafc",
    color:       type==="REGISTRATION" ? "#1d4ed8" : type==="BOOKING" ? "#15803d" : type==="PAYMENT" ? "#a16207" : "#64748b",
  }),
  notifMsg: { fontSize:13, color:"#334155", margin:"0 0 4px", lineHeight:1.5 },
  notifUserDetails: { display:"flex", flexWrap:"wrap", gap:8, marginBottom:4 },
  notifDetail: { display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#64748b" },
  notifTime: { fontSize:11, color:"#94a3b8", margin:0 },
  unreadDot: { width:8, height:8, borderRadius:"50%", background:"#3b82f6", flexShrink:0, marginTop:6 },

  userMenu: { position:"absolute", top:48, right:0, width:220, background:"white", borderRadius:12, border:"1px solid #e2e8f0", boxShadow:"0 10px 40px rgba(0,0,0,0.1)", zIndex:999, animation:"slideIn 0.2s ease", overflow:"hidden" },
  userMenuHeader: { display:"flex", alignItems:"center", gap:12, padding:"16px", background:"#f8fafc" },
  userAvatar: { width:40, height:40, borderRadius:"50%", background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center" },
  userName: { fontSize:14, fontWeight:700, color:"#0f172a", margin:0 },
  userRole: { fontSize:12, color:"#64748b", margin:0 },
  userMenuDivider: { height:1, background:"#f1f5f9", margin:"4px 0" },
  userMenuItem: { width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontSize:14, fontWeight:500, color:"#475569", textAlign:"left", transition:"background 0.15s" },

  alertBanner: (bg, text, border) => ({ display:"flex", alignItems:"center", gap:10, padding:"12px 20px", borderRadius:10, marginBottom:16, background:bg, border:`1px solid ${border}`, fontSize:14 }),

  primaryGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:24, marginBottom:24 },
  secondaryGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:48 },
  statCard: { background:"white", padding:"28px", borderRadius:16, boxShadow:"0 1px 3px rgba(0,0,0,0.07)", border:"1px solid #e2e8f0" },
  iconBox: { width:56, height:56, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" },
  miniCard: { background:"white", padding:"18px 20px", borderRadius:12, border:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  miniIconBox: { width:44, height:44, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },

  section: { marginBottom:48 },
  sectionTitle: { fontSize:20, fontWeight:700, color:"#0f172a", marginBottom:20, display:"flex", alignItems:"center" },
  sectionRow: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 },
  countBadge: { marginLeft:10, background:"#3b82f6", color:"white", fontSize:12, fontWeight:700, padding:"2px 10px", borderRadius:12 },

  regGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:16 },
  regCard: { background:"white", borderRadius:14, border:"1px solid #bfdbfe", padding:"20px", boxShadow:"0 2px 8px rgba(59,130,246,0.08)" },
  regCardHeader: { display:"flex", alignItems:"center", gap:12, marginBottom:16 },
  regAvatar: { width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, flexShrink:0 },
  regName: { fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 2px" },
  regEmail: { fontSize:12, color:"#64748b", margin:0 },
  pendingBadge: { fontSize:10, fontWeight:800, letterSpacing:"0.06em", background:"#fef3c7", color:"#92400e", padding:"3px 8px", borderRadius:6, flexShrink:0 },
  regDetails: { background:"#f8fafc", borderRadius:8, padding:"12px", marginBottom:16, display:"flex", flexDirection:"column", gap:8 },
  regDetailRow: { display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#475569" },
  regActions: { display:"flex", gap:10 },
  approveRegBtn: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", background:"#10b981", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" },
  rejectRegBtn:  { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", background:"white", color:"#ef4444", border:"1px solid #ef4444", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" },

  filterRow: { display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 },
  filterBtn: (active) => ({ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, border: active?"1px solid #3b82f6":"1px solid #e2e8f0", background: active?"#3b82f6":"white", color: active?"white":"#64748b", cursor:"pointer", transition:"all 0.15s" }),
  searchBox: { display:"flex", alignItems:"center", gap:8, background:"white", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 12px", minWidth:240 },
  searchInput: { border:"none", outline:"none", fontSize:13, color:"#0f172a", background:"none", flex:1 },
  searchClear: { background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"flex", alignItems:"center", padding:2 },
  exportBtn: { display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12, fontWeight:600, color:"#475569", cursor:"pointer" },
  tableContainer: { background:"white", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
  table: { width:"100%", borderCollapse:"collapse" },
  tableHead: { background:"#f8fafc", borderBottom:"1px solid #e2e8f0" },
  th: { padding:"14px 18px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:0.5 },
  tr: { borderBottom:"1px solid #f1f5f9", transition:"background 0.15s" },
  td: { padding:"14px 18px", fontSize:14, color:"#334155" },
  code: { fontSize:12, background:"#f1f5f9", padding:"2px 6px", borderRadius:4, color:"#475569", fontFamily:"'Fira Code', monospace" },
  typeBadge: (type) => ({ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:5, background: type==="HALF_DAY"?"#f0fdf4":type==="MULTI_DAY"?"#eff6ff":type==="WEEKEND"?"#fef3c7":"#fafafa", color: type==="HALF_DAY"?"#166534":type==="MULTI_DAY"?"#1e40af":type==="WEEKEND"?"#92400e":"#475569", textTransform:"uppercase", letterSpacing:0.3 }),
  failBadge: { fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:5, background:"#fee2e2", color:"#991b1b" },
  retryPaymentBtn: { display:"flex", alignItems:"center", gap:4, padding:"6px 12px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:6, fontSize:12, fontWeight:600, color:"#1e40af", cursor:"pointer" },
  emptyState: { background:"white", borderRadius:14, border:"1px solid #e2e8f0", padding:"48px 20px", textAlign:"center", color:"#94a3b8", fontSize:15 },
  approvalList: { display:"flex", flexDirection:"column", gap:14 },
  approvalCard: { background:"white", borderRadius:14, border:"1px solid #fde68a", padding:"20px 24px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, flexWrap:"wrap", boxShadow:"0 2px 8px rgba(253,211,77,0.15)" },
  approvalId: { fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px", fontFamily:"'Fira Code', monospace" },
  approvalMeta: { fontSize:13, color:"#64748b", margin:"0 0 4px" },
  approvalDate: { fontSize:12, color:"#94a3b8", margin:0 },
  weekendNotice: { fontSize:12, color:"#92400e", margin:"8px 0 0", fontStyle:"italic", background:"#fef3c7", padding:"6px 10px", borderRadius:6 },
  approvalBtns: { display:"flex", gap:10, flexShrink:0, alignItems:"center" },
  approveBtn: { display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#10b981", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" },
  rejectBtn:  { display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#ef4444", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" },
  actionGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:14 },
  actionCard: { background:"white", padding:"18px 20px", borderRadius:12, textDecoration:"none", display:"flex", alignItems:"center", gap:14, border:"1px solid #e2e8f0", transition:"all 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", cursor:"pointer" },
  actionIconBox: { width:46, height:46, borderRadius:10, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  pagination: { display:"flex", justifyContent:"center", alignItems:"center", gap:6, marginTop:20, padding:"16px 0" },
  paginationBtn: { minWidth:36, height:36, padding:"0 10px", background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, fontWeight:600, color:"#475569", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  paginationBtnActive: { background:"#3b82f6", borderColor:"#3b82f6", color:"white" },
  paginationEllipsis: { padding:"0 8px", color:"#94a3b8", fontSize:14 },
};