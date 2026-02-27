import { useEffect, useState, useCallback, useRef } from "react";
import {
    Bell, BellRing, AlertCircle, RefreshCw, Search,
    X, Trash2, CheckCheck, CreditCard, Calendar, Info,
    ShieldAlert, Filter, Clock, ChevronDown, Download,
    Archive, MoreVertical, Eye, EyeOff, Sparkles, Zap,
    User, LogOut, Settings, TrendingUp, Activity
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

// ─── Constants ────────────────────────────────────────────────────────────────
const REFRESH_INTERVAL_MS = 30_000;
const ITEMS_PER_PAGE = 15;

const TYPE_CONFIG = {
    PAYMENT: { 
        color: "#10b981", 
        bg: "#ecfdf5", 
        icon: CreditCard, 
        label: "Payment",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    BOOKING: { 
        color: "#3b82f6", 
        bg: "#eff6ff", 
        icon: Calendar, 
        label: "Booking",
        gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    SYSTEM: { 
        color: "#f59e0b", 
        bg: "#fef3c7", 
        icon: ShieldAlert, 
        label: "System",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    INFO: { 
        color: "#8b5cf6", 
        bg: "#f5f3ff", 
        icon: Info, 
        label: "Info",
        gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
};

export default function NotificationsPage() {
    // ─── State Management ─────────────────────────────────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [readFilter, setReadFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [selectedNotifs, setSelectedNotifs] = useState(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest"); // newest | oldest | unread
    const [viewMode, setViewMode] = useState("comfortable"); // comfortable | compact | spacious
    const [showUserMenu, setShowUserMenu] = useState(false);

    const userMenuRef = useRef(null);
    const bulkActionsRef = useRef(null);

    // ─── Auto-dismiss messages ────────────────────────────────────────────────
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // ─── Fetch notifications ──────────────────────────────────────────────────
    const fetchNotifications = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            setError(null);

            const res = await api.get("/admin/dashboard/notifications?limit=100");
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setLastUpdated(new Date());
            } else {
                throw new Error("Failed to fetch notifications");
            }
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

    // ─── Actions ──────────────────────────────────────────────────────────────
    const markRead = async (id) => {
        try {
            setActionLoading((p) => ({ ...p, [id]: "read" }));
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
            );
            setSuccessMsg("Notification marked as read");
        } catch (err) {
            setError("Failed to mark notification as read");
        } finally {
            setActionLoading((p) => ({ ...p, [id]: null }));
        }
    };

    const markUnread = async (id) => {
        try {
            setActionLoading((p) => ({ ...p, [id]: "unread" }));
            await api.patch(`/admin/notifications/${id}/unread`);
            setNotifications((prev) =>
                prev.map((n) => n.id === id ? { ...n, is_read: false } : n)
            );
            setSuccessMsg("Notification marked as unread");
        } catch (err) {
            setError("Failed to mark notification as unread");
        } finally {
            setActionLoading((p) => ({ ...p, [id]: null }));
        }
    };

    const deleteNotif = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notification?")) return;
        
        try {
            setActionLoading((p) => ({ ...p, [id]: "delete" }));
            await api.delete(`/admin/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setSelectedNotifs((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            setSuccessMsg("Notification deleted successfully");
        } catch (err) {
            setError("Failed to delete notification");
        } finally {
            setActionLoading((p) => ({ ...p, [id]: null }));
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch("/admin/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setSuccessMsg("All notifications marked as read");
        } catch (err) {
            setError("Failed to mark all as read");
        }
    };

    const bulkMarkRead = async () => {
        try {
            await Promise.all(
                Array.from(selectedNotifs).map(id => 
                    api.patch(`/admin/notifications/${id}/read`)
                )
            );
            setNotifications((prev) =>
                prev.map((n) => selectedNotifs.has(n.id) ? { ...n, is_read: true } : n)
            );
            setSelectedNotifs(new Set());
            setSuccessMsg(`${selectedNotifs.size} notifications marked as read`);
        } catch (err) {
            setError("Failed to mark selected as read");
        }
    };

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedNotifs.size} notifications?`)) return;
        
        try {
            await Promise.all(
                Array.from(selectedNotifs).map(id => 
                    api.delete(`/admin/notifications/${id}`)
                )
            );
            setNotifications((prev) => prev.filter((n) => !selectedNotifs.has(n.id)));
            setSelectedNotifs(new Set());
            setSuccessMsg(`${selectedNotifs.size} notifications deleted`);
        } catch (err) {
            setError("Failed to delete selected notifications");
        }
    };

    // ─── Selection handlers ───────────────────────────────────────────────────
    const toggleSelect = (id) => {
        setSelectedNotifs((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedNotifs(new Set(filtered.map(n => n.id)));
    };

    const deselectAll = () => {
        setSelectedNotifs(new Set());
    };

    // ─── Logout handler ───────────────────────────────────────────────────────
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.clear();
        window.location.href = "/login";
    };

    // ─── Click outside handlers ───────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
            if (bulkActionsRef.current && !bulkActionsRef.current.contains(e.target)) {
                setShowBulkActions(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ─── Filtering and sorting ────────────────────────────────────────────────
    const filtered = notifications
        .filter((n) => {
            if (typeFilter !== "ALL" && n.type !== typeFilter) return false;
            if (readFilter === "UNREAD" && n.is_read) return false;
            if (readFilter === "READ" && !n.is_read) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!n.message?.toLowerCase().includes(q)) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === "unread") return (a.is_read === b.is_read) ? 0 : a.is_read ? 1 : -1;
            return 0;
        });

    // ─── Pagination ───────────────────────────────────────────────────────────
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedNotifs = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ─── Stats ────────────────────────────────────────────────────────────────
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const stats = {
        total: notifications.length,
        unread: unreadCount,
        read: notifications.length - unreadCount,
        payment: notifications.filter(n => n.type === "PAYMENT").length,
        booking: notifications.filter(n => n.type === "BOOKING").length,
        system: notifications.filter(n => n.type === "SYSTEM").length,
    };

    // ─── Export to CSV ────────────────────────────────────────────────────────
    const exportToCSV = () => {
        const csv = [
            ["ID", "Type", "Message", "Status", "Created At"],
            ...filtered.map(n => [
                n.id,
                n.type,
                n.message.replace(/,/g, ";"),
                n.is_read ? "Read" : "Unread",
                new Date(n.created_at).toLocaleString("en-IN")
            ])
        ].map(row => row.join(",")).join("\n");
        
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `notifications-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        setSuccessMsg("Notifications exported successfully");
    };

    // ─── Loading State ────────────────────────────────────────────────────────
    if (loading) return (
        <>
            <AdminNavbar />
            <div style={styles.center}>
                <div style={styles.spinnerRing} />
                <p style={styles.loadingText}>Loading notifications…</p>
            </div>
        </>
    );

    return (
        <>
            <AdminNavbar />
            <div style={styles.page}>
                
                {/* ── SUCCESS MESSAGE ──────────────────────────────────────────── */}
                {successMsg && (
                    <div style={styles.toast("success")} role="alert">
                        <CheckCheck size={18} />
                        <span>{successMsg}</span>
                        <button onClick={() => setSuccessMsg(null)} style={styles.toastClose}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ── ERROR MESSAGE ────────────────────────────────────────────── */}
                {error && (
                    <div style={styles.toast("error")} role="alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} style={styles.toastClose}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* ── HEADER ───────────────────────────────────────────────────── */}
                <div style={styles.header}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <h1 style={styles.pageTitle}>
                                <Bell size={32} style={{ marginRight: 8 }} />
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <span style={styles.unreadBadge}>
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        {lastUpdated && (
                            <p style={styles.subtitle}>
                                Last updated: {lastUpdated.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                })}
                            </p>
                        )}
                    </div>
                    
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        {/* Export Button */}
                        <button onClick={exportToCSV} style={styles.exportBtn}>
                            <Download size={16} />
                            Export
                        </button>

                        {/* Mark All Read */}
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={styles.markAllBtn}>
                                <CheckCheck size={16} /> Mark all read
                            </button>
                        )}

                        {/* Refresh */}
                        <button 
                            onClick={() => fetchNotifications(true)} 
                            style={styles.refreshBtn} 
                            disabled={refreshing}
                        >
                            <RefreshCw 
                                size={16} 
                                style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} 
                            />
                            {refreshing ? "Refreshing…" : "Refresh"}
                        </button>

                        {/* User Menu */}
                        <div style={{ position: "relative" }} ref={userMenuRef}>
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)} 
                                style={styles.userBtn}
                            >
                                <User size={20} color="#64748b" />
                            </button>

                            {showUserMenu && (
                                <div style={styles.userMenu}>
                                    <div style={styles.userMenuHeader}>
                                        <div style={styles.userAvatar}>
                                            <User size={20} color="#3b82f6" />
                                        </div>
                                        <div>
                                            <p style={styles.userName}>Admin User</p>
                                            <p style={styles.userRole}>Administrator</p>
                                        </div>
                                    </div>
                                    <div style={styles.userMenuDivider} />
                                    <button 
                                        style={styles.userMenuItem}
                                        onClick={() => window.location.href = "/admin/dashboard"}
                                    >
                                        <Activity size={16} />
                                        <span>Dashboard</span>
                                    </button>
                                    <button 
                                        style={styles.userMenuItem}
                                        onClick={() => window.location.href = "/admin/settings"}
                                    >
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </button>
                                    <div style={styles.userMenuDivider} />
                                    <button 
                                        style={{ ...styles.userMenuItem, color: "#ef4444" }}
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── STATS ROW ────────────────────────────────────────────────── */}
                <div style={styles.statsGrid}>
                    <StatCard label="Total" value={stats.total} color="#3b82f6" icon={Activity} />
                    <StatCard label="Unread" value={stats.unread} color="#f59e0b" icon={BellRing} />
                    <StatCard label="Read" value={stats.read} color="#10b981" icon={Eye} />
                    <StatCard label="Payments" value={stats.payment} color="#10b981" icon={CreditCard} />
                    <StatCard label="Bookings" value={stats.booking} color="#3b82f6" icon={Calendar} />
                    <StatCard label="System" value={stats.system} color="#f59e0b" icon={ShieldAlert} />
                </div>

                {/* ── FILTER & SEARCH BAR ──────────────────────────────────────── */}
                <div style={styles.filterBar}>
                    {/* Search */}
                    <div style={styles.searchBox}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search notifications…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={styles.searchInput}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} style={styles.clearBtn}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Type Filter */}
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Type:</span>
                        <div style={styles.filterRow}>
                            {["ALL", "BOOKING", "PAYMENT", "SYSTEM", "INFO"].map((t) => (
                                <button 
                                    key={t} 
                                    onClick={() => {
                                        setTypeFilter(t);
                                        setCurrentPage(1);
                                    }} 
                                    style={styles.filterBtn(typeFilter === t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Read Filter */}
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Status:</span>
                        <div style={styles.filterRow}>
                            {["ALL", "UNREAD", "READ"].map((r) => (
                                <button 
                                    key={r} 
                                    onClick={() => {
                                        setReadFilter(r);
                                        setCurrentPage(1);
                                    }}
                                    style={styles.filterBtn(readFilter === r)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort */}
                    <div style={styles.filterGroup}>
                        <span style={styles.filterLabel}>Sort:</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.select}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="unread">Unread first</option>
                        </select>
                    </div>
                </div>

                {/* ── BULK ACTIONS BAR ─────────────────────────────────────────── */}
                {selectedNotifs.size > 0 && (
                    <div style={styles.bulkBar}>
                        <span style={styles.bulkText}>
                            <CheckCheck size={16} />
                            {selectedNotifs.size} selected
                        </span>
                        <div style={styles.bulkActions}>
                            <button onClick={bulkMarkRead} style={styles.bulkBtn("#10b981")}>
                                <Eye size={14} /> Mark as read
                            </button>
                            <button onClick={bulkDelete} style={styles.bulkBtn("#ef4444")}>
                                <Trash2 size={14} /> Delete
                            </button>
                            <button onClick={deselectAll} style={styles.bulkBtn("#64748b")}>
                                <X size={14} /> Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* ── RESULTS INFO ─────────────────────────────────────────────── */}
                <div style={styles.resultsRow}>
                    <span style={styles.resultsText}>
                        Showing <strong>{paginatedNotifs.length}</strong> of <strong>{filtered.length}</strong> notifications
                        {filtered.length !== notifications.length && (
                            <> (filtered from <strong>{notifications.length}</strong> total)</>
                        )}
                    </span>
                    
                    {filtered.length > 0 && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button 
                                onClick={selectedNotifs.size === filtered.length ? deselectAll : selectAll}
                                style={styles.selectAllBtn}
                            >
                                {selectedNotifs.size === filtered.length ? (
                                    <><X size={14} /> Deselect all</>
                                ) : (
                                    <><CheckCheck size={14} /> Select all</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── NOTIFICATION LIST ────────────────────────────────────────── */}
                {paginatedNotifs.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>
                            <Bell size={48} color="#cbd5e1" />
                        </div>
                        <h3 style={styles.emptyTitle}>
                            {search || typeFilter !== "ALL" || readFilter !== "ALL"
                                ? "No notifications found"
                                : "No notifications yet"
                            }
                        </h3>
                        <p style={styles.emptyText}>
                            {search || typeFilter !== "ALL" || readFilter !== "ALL"
                                ? "Try adjusting your filters or search query"
                                : "New notifications will appear here"
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={styles.notifList}>
                            {paginatedNotifs.map((n, idx) => {
                                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG["INFO"];
                                const Icon = config.icon;
                                const isActing = actionLoading[n.id];
                                const isSelected = selectedNotifs.has(n.id);
                                
                                return (
                                    <div
                                        key={n.id}
                                        style={{
                                            ...styles.notifCard,
                                            background: isSelected 
                                                ? "#eff6ff" 
                                                : n.is_read ? "white" : "#fefce8",
                                            borderLeft: `4px solid ${config.color}`,
                                            opacity: isActing === "delete" ? 0.4 : 1,
                                            transform: isSelected ? "scale(0.98)" : "scale(1)",
                                            animation: `slideIn 0.3s ease ${idx * 0.05}s both`,
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(n.id)}
                                            style={styles.checkbox}
                                            aria-label={`Select notification ${n.id}`}
                                        />

                                        {/* Icon */}
                                        <div style={{ 
                                            ...styles.notifIconBox, 
                                            background: config.gradient 
                                        }}>
                                            <Icon size={20} style={{ color: "white" }} strokeWidth={2.5} />
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={styles.notifTopRow}>
                                                <span style={{ 
                                                    ...styles.typePill, 
                                                    background: config.bg, 
                                                    color: config.color 
                                                }}>
                                                    {config.label}
                                                </span>
                                                {!n.is_read && (
                                                    <span style={styles.newBadge}>NEW</span>
                                                )}
                                            </div>
                                            <p style={styles.notifMsg}>{n.message}</p>
                                            <div style={styles.notifMeta}>
                                                <Clock size={12} color="#94a3b8" />
                                                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                                                    {new Date(n.created_at).toLocaleString("en-IN", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
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
                                                    {isActing === "unread" ? (
                                                        <div style={styles.miniSpinner} />
                                                    ) : (
                                                        <><BellRing size={14} /> Unread</>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => markRead(n.id)}
                                                    style={styles.actionBtn("#ecfdf5", "#10b981")}
                                                    title="Mark as read"
                                                    disabled={!!isActing}
                                                >
                                                    {isActing === "read" ? (
                                                        <div style={styles.miniSpinner} />
                                                    ) : (
                                                        <><CheckCheck size={14} /> Read</>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotif(n.id)}
                                                style={styles.actionBtn("#fef2f2", "#dc2626")}
                                                title="Delete"
                                                disabled={!!isActing}
                                            >
                                                {isActing === "delete" ? (
                                                    <div style={styles.miniSpinner} />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── PAGINATION ───────────────────────────────────────────── */}
                        {totalPages > 1 && (
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin { 
                    to { transform: rotate(360deg); } 
                }
                @keyframes slideIn { 
                    from { opacity: 0; transform: translateY(12px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                @keyframes slideDown { 
                    from { opacity: 0; transform: translateY(-12px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                /* Import Google Font */
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
            `}</style>
        </>
    );
}

// ─── Pagination Component ─────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push("...");
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        }
    }

    return (
        <div style={styles.pagination}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={styles.paginationBtn}
            >
                Previous
            </button>

            {pages.map((page, idx) => (
                page === "..." ? (
                    <span key={`ellipsis-${idx}`} style={styles.paginationEllipsis}>
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={{
                            ...styles.paginationBtn,
                            ...(currentPage === page ? styles.paginationBtnActive : {})
                        }}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={styles.paginationBtn}
            >
                Next
            </button>
        </div>
    );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon }) {
    return (
        <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, background: `${color}15` }}>
                <Icon size={20} style={{ color }} strokeWidth={2.5} />
            </div>
            <div>
                <span style={{ ...styles.statValue, color }}>{value}</span>
                <span style={styles.statLabel}>{label}</span>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    page: {
        maxWidth: 1280, 
        margin: "0 auto", 
        padding: "40px 28px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
        minHeight: "100vh",
        fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    center: {
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        justifyContent: "center", 
        minHeight: "80vh", 
        gap: 16,
    },
    spinnerRing: {
        width: 48, 
        height: 48,
        border: "4px solid #e2e8f0", 
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%", 
        animation: "spin 0.8s linear infinite",
    },
    miniSpinner: {
        width: 14, 
        height: 14,
        border: "2px solid rgba(255,255,255,0.3)", 
        borderTop: "2px solid currentColor",
        borderRadius: "50%", 
        animation: "spin 0.6s linear infinite",
    },
    loadingText: { 
        color: "#64748b", 
        fontSize: 16, 
        fontWeight: 600,
        letterSpacing: -0.3,
    },
    toast: (type) => ({
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        background: type === "success" ? "#ecfdf5" : "#fef2f2",
        color: type === "success" ? "#166534" : "#991b1b",
        padding: "14px 18px",
        borderRadius: 12,
        border: `2px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        animation: "slideDown 0.3s ease",
        maxWidth: 420,
    }),
    toastClose: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        opacity: 0.7,
        display: "flex",
        alignItems: "center",
        padding: 4,
        marginLeft: 8,
    },
    header: {
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: 32, 
        flexWrap: "wrap", 
        gap: 16,
    },
    pageTitle: { 
        fontSize: 36, 
        fontWeight: 800, 
        color: "#0f172a", 
        margin: 0, 
        letterSpacing: -1,
        display: "flex",
        alignItems: "center",
    },
    subtitle: { 
        fontSize: 13, 
        color: "#94a3b8", 
        margin: "8px 0 0", 
        fontWeight: 500 
    },
    unreadBadge: {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
        color: "white",
        fontSize: 12, 
        fontWeight: 800, 
        padding: "4px 12px",
        borderRadius: 20, 
        letterSpacing: 0.5,
        boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
    },
    exportBtn: {
        display: "flex", 
        alignItems: "center", 
        gap: 6,
        padding: "9px 16px", 
        background: "white", 
        border: "2px solid #e2e8f0",
        borderRadius: 10, 
        fontSize: 13, 
        fontWeight: 700, 
        color: "#475569", 
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    markAllBtn: {
        display: "flex", 
        alignItems: "center", 
        gap: 6,
        padding: "9px 16px", 
        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", 
        border: "2px solid #bbf7d0",
        borderRadius: 10, 
        fontSize: 13, 
        fontWeight: 700, 
        color: "#166534", 
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 2px 8px rgba(16,185,129,0.15)",
    },
    refreshBtn: {
        display: "flex", 
        alignItems: "center", 
        gap: 6,
        padding: "9px 16px", 
        background: "white", 
        border: "2px solid #e2e8f0",
        borderRadius: 10, 
        fontSize: 13, 
        fontWeight: 700, 
        color: "#475569", 
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    userBtn: {
        width: 44, 
        height: 44, 
        borderRadius: 12,
        background: "white", 
        border: "2px solid #e2e8f0",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    userMenu: {
        position: "absolute",
        top: 52,
        right: 0,
        width: 220,
        background: "white",
        borderRadius: 14,
        border: "2px solid #e2e8f0",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        zIndex: 999,
        animation: "slideDown 0.2s ease",
        overflow: "hidden",
    },
    userMenuHeader: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px",
        background: "#f8fafc",
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    userName: {
        fontSize: 14,
        fontWeight: 700,
        color: "#0f172a",
        margin: 0,
    },
    userRole: {
        fontSize: 12,
        color: "#64748b",
        margin: 0,
    },
    userMenuDivider: {
        height: 1,
        background: "#f1f5f9",
        margin: "4px 0",
    },
    userMenuItem: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        color: "#475569",
        textAlign: "left",
        transition: "background 0.15s",
    },
    statsGrid: {
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: 16, 
        marginBottom: 32,
    },
    statCard: {
        background: "white",
        borderRadius: 14,
        border: "2px solid #e2e8f0",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.2s",
    },
    statIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 800,
        display: "block",
        lineHeight: 1,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        display: "block",
    },
    filterBar: {
        background: "white", 
        borderRadius: 16, 
        border: "2px solid #e2e8f0",
        padding: "20px 24px", 
        marginBottom: 20,
        display: "flex", 
        flexWrap: "wrap", 
        gap: 20, 
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    searchBox: {
        display: "flex", 
        alignItems: "center", 
        gap: 10,
        border: "2px solid #e2e8f0", 
        borderRadius: 10, 
        padding: "10px 14px",
        background: "#f8fafc", 
        flex: "1 1 280px",
        transition: "all 0.2s",
    },
    searchInput: {
        border: "none", 
        outline: "none", 
        background: "transparent",
        fontSize: 14, 
        color: "#334155", 
        flex: 1, 
        fontFamily: "inherit",
        fontWeight: 500,
    },
    clearBtn: {
        background: "none", 
        border: "none", 
        cursor: "pointer",
        color: "#94a3b8", 
        display: "flex", 
        alignItems: "center", 
        padding: 2,
    },
    filterGroup: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    filterRow: { 
        display: "flex", 
        gap: 8, 
        flexWrap: "wrap" 
    },
    filterBtn: (active) => ({
        padding: "7px 14px", 
        borderRadius: 8, 
        fontSize: 12, 
        fontWeight: 700,
        border: active ? "2px solid #3b82f6" : "2px solid #e2e8f0",
        background: active ? "#3b82f6" : "white",
        color: active ? "white" : "#64748b", 
        cursor: "pointer",
        transition: "all 0.2s",
        letterSpacing: 0.3,
    }),
    select: {
        padding: "7px 12px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        border: "2px solid #e2e8f0",
        background: "white",
        color: "#475569",
        cursor: "pointer",
        outline: "none",
        fontFamily: "inherit",
    },
    bulkBar: {
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        borderRadius: 12,
        padding: "14px 20px",
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
    },
    bulkText: {
        color: "white",
        fontSize: 14,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    bulkActions: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
    },
    bulkBtn: (color) => ({
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        background: "white",
        border: "none",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        color,
        cursor: "pointer",
        transition: "all 0.2s",
    }),
    resultsRow: { 
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
    },
    resultsText: { 
        fontSize: 13, 
        color: "#64748b",
        fontWeight: 500,
    },
    selectAllBtn: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        background: "white",
        border: "2px solid #e2e8f0",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        color: "#475569",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    notifList: { 
        display: "flex", 
        flexDirection: "column", 
        gap: 12 
    },
    notifCard: {
        background: "white", 
        borderRadius: 14, 
        border: "2px solid #e2e8f0",
        padding: "18px 20px", 
        display: "flex", 
        alignItems: "flex-start",
        gap: 16, 
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.2s",
    },
    checkbox: {
        width: 18,
        height: 18,
        cursor: "pointer",
        marginTop: 2,
        accentColor: "#3b82f6",
    },
    notifIconBox: {
        width: 48, 
        height: 48, 
        borderRadius: 12, 
        flexShrink: 0,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    notifTopRow: { 
        display: "flex", 
        alignItems: "center", 
        gap: 8, 
        marginBottom: 8 
    },
    typePill: {
        fontSize: 10, 
        fontWeight: 800, 
        padding: "3px 10px",
        borderRadius: 6, 
        letterSpacing: 0.8, 
        textTransform: "uppercase",
    },
    newBadge: {
        fontSize: 9,
        fontWeight: 800,
        padding: "2px 6px",
        borderRadius: 4,
        background: "#f59e0b",
        color: "white",
        letterSpacing: 0.5,
        animation: "pulse 2s ease-in-out infinite",
    },
    unreadDot: {
        width: 8, 
        height: 8, 
        borderRadius: "50%", 
        background: "#3b82f6", 
        flexShrink: 0,
    },
    notifMsg: { 
        fontSize: 14, 
        color: "#334155", 
        margin: "0 0 10px", 
        lineHeight: 1.6,
        fontWeight: 500,
    },
    notifMeta: { 
        display: "flex", 
        alignItems: "center", 
        gap: 6 
    },
    notifActions: { 
        display: "flex", 
        gap: 8, 
        flexShrink: 0, 
        alignItems: "center",
        flexWrap: "wrap",
    },
    actionBtn: (bg, color) => ({
        display: "flex", 
        alignItems: "center", 
        gap: 5,
        padding: "7px 12px", 
        background: bg, 
        border: "none",
        borderRadius: 8, 
        fontSize: 12, 
        fontWeight: 700, 
        color, 
        cursor: "pointer",
        transition: "all 0.2s",
    }),
    emptyState: {
        background: "white", 
        borderRadius: 16, 
        border: "2px solid #e2e8f0",
        padding: "80px 20px", 
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 700,
        color: "#0f172a",
        margin: "0 0 8px",
    },
    emptyText: {
        fontSize: 14,
        color: "#94a3b8",
        margin: 0,
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 32,
        padding: "20px 0",
    },
    paginationBtn: {
        minWidth: 40,
        height: 40,
        padding: "0 12px",
        background: "white",
        border: "2px solid #e2e8f0",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        color: "#475569",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    paginationBtnActive: {
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        borderColor: "#3b82f6",
        color: "white",
        boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
    },
    paginationEllipsis: {
        padding: "0 8px",
        color: "#94a3b8",
        fontSize: 16,
        fontWeight: 700,
    },
};