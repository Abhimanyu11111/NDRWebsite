import { useEffect, useState, useCallback } from "react";
import {
    Bell, BellRing, AlertCircle, RefreshCw, Search,
    X, Trash2, CheckCheck, CreditCard, Calendar, Info,
    ShieldAlert, Filter, Clock
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;

const TYPE_CONFIG = {
    PAYMENT: { color: "#10b981", bg: "#f0fdf4", icon: CreditCard, label: "Payment" },
    BOOKING: { color: "#3b82f6", bg: "#eff6ff", icon: Calendar, label: "Booking" },
    SYSTEM: { color: "#f59e0b", bg: "#fffbeb", icon: ShieldAlert, label: "System" },
    INFO: { color: "#8b5cf6", bg: "#f5f3ff", icon: Info, label: "Info" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [readFilter, setReadFilter] = useState("ALL"); // ALL | UNREAD | READ
    const [search, setSearch] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    const fetchNotifications = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            setError(null);

            const res = await api.get("/admin/dashboard/notifications?limit=100");
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
            }
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            setActionLoading((p) => ({ ...p, [id]: "read" }));
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (_) { }
        finally { setActionLoading((p) => ({ ...p, [id]: null })); }
    };

    const markUnread = async (id) => {
        try {
            setActionLoading((p) => ({ ...p, [id]: "unread" }));
            await api.patch(`/admin/notifications/${id}/unread`);
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, is_read: false } : n)
            );
        } catch (_) { }
        finally { setActionLoading((p) => ({ ...p, [id]: null })); }
    };

    const deleteNotif = async (id) => {
        try {
            setActionLoading((p) => ({ ...p, [id]: "delete" }));
            await api.delete(`/admin/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (_) { }
        finally { setActionLoading((p) => ({ ...p, [id]: null })); }
    };

    const markAllRead = async () => {
        try {
            await api.patch("/admin/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (_) { }
    };

    const filtered = notifications.filter((n) => {
        if (typeFilter !== "ALL" && n.type !== typeFilter) return false;
        if (readFilter === "UNREAD" && n.is_read) return false;
        if (readFilter === "READ" && !n.is_read) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!n.message?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    if (loading) return (
        <>
            <AdminNavbar />
            <div style={styles.center}>
                <div style={styles.spinnerRing} />
                <p style={styles.loadingText}>Loading notifications…</p>
            </div>
        </>
    );

    if (error) return (
        <>
            <AdminNavbar />
            <div style={styles.center}>
                <AlertCircle size={48} color="#ef4444" />
                <h2 style={styles.errorTitle}>Failed to Load</h2>
                <p style={styles.errorText}>{error}</p>
                <button onClick={() => fetchNotifications()} style={styles.retryBtn}>Retry</button>
            </div>
        </>
    );

    return (
        <>
            <AdminNavbar />
            <div style={styles.page}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <h1 style={styles.pageTitle}>Notifications</h1>
                            {unreadCount > 0 && (
                                <span style={styles.unreadBadge}>{unreadCount} unread</span>
                            )}
                        </div>
                        {lastUpdated && (
                            <p style={styles.subtitle}>Last updated: {lastUpdated.toLocaleTimeString("en-IN")}</p>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={styles.markAllBtn}>
                                <CheckCheck size={16} /> Mark all read
                            </button>
                        )}
                        <button onClick={() => fetchNotifications(true)} style={styles.refreshBtn} disabled={refreshing}>
                            <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                            {refreshing ? "Refreshing…" : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* STATS ROW */}
                <div style={styles.statsRow}>
                    {[
                        { label: "Total", value: notifications.length, color: "#3b82f6" },
                        { label: "Unread", value: unreadCount, color: "#f59e0b" },
                        { label: "Read", value: notifications.length - unreadCount, color: "#10b981" },
                        { label: "Payments", value: notifications.filter(n => n.type === "PAYMENT").length, color: "#10b981" },
                        { label: "Bookings", value: notifications.filter(n => n.type === "BOOKING").length, color: "#3b82f6" },
                        { label: "System", value: notifications.filter(n => n.type === "SYSTEM").length, color: "#f59e0b" },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={styles.miniStat}>
                            <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* FILTER BAR */}
                <div style={styles.filterBar}>
                    {/* Search */}
                    <div style={styles.searchBox}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search notifications…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} style={styles.clearBtn}><X size={14} /></button>
                        )}
                    </div>

                    {/* Type filter */}
                    <div style={styles.filterRow}>
                        {["ALL", "BOOKING", "PAYMENT", "SYSTEM", "INFO"].map((t) => (
                            <button key={t} onClick={() => setTypeFilter(t)} style={styles.filterBtn(typeFilter === t)}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Read filter */}
                    <div style={styles.filterRow}>
                        {["ALL", "UNREAD", "READ"].map((r) => (
                            <button key={r} onClick={() => setReadFilter(r)}
                                style={{ ...styles.filterBtn(readFilter === r), minWidth: 70 }}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RESULTS */}
                <div style={styles.resultsRow}>
                    <span style={styles.resultsText}>
                        Showing <strong>{filtered.length}</strong> of <strong>{notifications.length}</strong> notifications
                    </span>
                </div>

                {/* NOTIFICATION LIST */}
                {filtered.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Bell size={40} color="#cbd5e1" />
                        <p>No notifications found</p>
                    </div>
                ) : (
                    <div style={styles.notifList}>
                        {filtered.map((n) => {
                            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG["INFO"];
                            const Icon = config.icon;
                            const isActing = actionLoading[n.id];
                            return (
                                <div
                                    key={n.id}
                                    style={{
                                        ...styles.notifCard,
                                        background: n.is_read ? "white" : "#eff6ff",
                                        borderLeft: `4px solid ${n.is_read ? "#e2e8f0" : config.color}`,
                                        opacity: isActing === "delete" ? 0.4 : 1,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{ ...styles.notifIconBox, background: config.bg }}>
                                        <Icon size={18} style={{ color: config.color }} strokeWidth={2.5} />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={styles.notifTopRow}>
                                            <span style={{ ...styles.typePill, background: config.bg, color: config.color }}>
                                                {config.label}
                                            </span>
                                            {!n.is_read && <span style={styles.unreadDot} />}
                                        </div>
                                        <p style={styles.notifMsg}>{n.message}</p>
                                        <div style={styles.notifMeta}>
                                            <Clock size={12} color="#94a3b8" />
                                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                                                {new Date(n.created_at).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={styles.notifActions}>
                                        {n.is_read ? (
                                            <button
                                                onClick={() => markUnread(n.id)}
                                                style={styles.actionBtn("#eff6ff", "#3b82f6")}
                                                title="Mark as unread"
                                                disabled={!!isActing}
                                            >
                                                <BellRing size={14} /> Unread
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => markRead(n.id)}
                                                style={styles.actionBtn("#f0fdf4", "#16a34a")}
                                                title="Mark as read"
                                                disabled={!!isActing}
                                            >
                                                <CheckCheck size={14} /> Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotif(n.id)}
                                            style={styles.actionBtn("#fef2f2", "#dc2626")}
                                            title="Delete"
                                            disabled={!!isActing}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

const styles = {
    page: {
        maxWidth: 1200, margin: "0 auto", padding: "40px 28px",
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
        marginBottom: 28, flexWrap: "wrap", gap: 16,
    },
    pageTitle: { fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: "#94a3b8", margin: "6px 0 0", fontWeight: 500 },
    unreadBadge: {
        background: "#f59e0b", color: "white",
        fontSize: 12, fontWeight: 700, padding: "3px 10px",
        borderRadius: 20, letterSpacing: 0.3,
    },
    markAllBtn: {
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#16a34a", cursor: "pointer",
    },
    refreshBtn: {
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", background: "white", border: "1px solid #e2e8f0",
        borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
    },
    statsRow: {
        display: "flex", gap: 0, marginBottom: 28,
        background: "white", borderRadius: 12, border: "1px solid #e2e8f0",
        overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    miniStat: {
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        padding: "18px 12px", gap: 4,
        borderRight: "1px solid #f1f5f9",
    },
    filterBar: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        padding: "18px 24px", marginBottom: 16,
        display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    searchBox: {
        display: "flex", alignItems: "center", gap: 10,
        border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
        background: "#f8fafc", flex: "1 1 240px",
    },
    searchInput: {
        border: "none", outline: "none", background: "transparent",
        fontSize: 14, color: "#334155", flex: 1, fontFamily: "inherit",
    },
    clearBtn: {
        background: "none", border: "none", cursor: "pointer",
        color: "#94a3b8", display: "flex", alignItems: "center", padding: 0,
    },
    filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
    filterBtn: (active) => ({
        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
        border: active ? "1px solid #3b82f6" : "1px solid #e2e8f0",
        background: active ? "#3b82f6" : "white",
        color: active ? "white" : "#64748b", cursor: "pointer",
    }),
    resultsRow: { marginBottom: 12 },
    resultsText: { fontSize: 13, color: "#64748b" },
    notifList: { display: "flex", flexDirection: "column", gap: 10 },
    notifCard: {
        background: "white", borderRadius: 12, border: "1px solid #e2e8f0",
        padding: "16px 20px", display: "flex", alignItems: "flex-start",
        gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    },
    notifIconBox: {
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    notifTopRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
    typePill: {
        fontSize: 11, fontWeight: 700, padding: "2px 8px",
        borderRadius: 5, letterSpacing: 0.4, textTransform: "uppercase",
    },
    unreadDot: {
        width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0,
    },
    notifMsg: { fontSize: 14, color: "#334155", margin: "0 0 8px", lineHeight: 1.5 },
    notifMeta: { display: "flex", alignItems: "center", gap: 5 },
    notifActions: { display: "flex", gap: 8, flexShrink: 0, alignItems: "center" },
    actionBtn: (bg, color) => ({
        display: "flex", alignItems: "center", gap: 5,
        padding: "6px 12px", background: bg, border: "none",
        borderRadius: 7, fontSize: 12, fontWeight: 600, color, cursor: "pointer",
    }),
    emptyState: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        padding: "64px 20px", textAlign: "center", color: "#94a3b8",
        fontSize: 15, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12,
    },
};