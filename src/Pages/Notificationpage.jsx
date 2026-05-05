import { useEffect, useState, useCallback } from "react";
import {
    Bell, BellRing, AlertCircle, RefreshCw, Search,
    X, Trash2, CheckCheck, CreditCard, Calendar, Info,
    ShieldAlert, Clock, Download, Eye, Activity
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;
const ITEMS_PER_PAGE = 15;

const TYPE_CONFIG = {
    PAYMENT: { color: "#10b981", bg: "#ecfdf5", icon: CreditCard, label: "Payment", gradient: "linear-gradient(135deg,#10b981,#059669)" },
    BOOKING: { color: "#3b82f6", bg: "#eff6ff", icon: Calendar, label: "Booking", gradient: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    SYSTEM:  { color: "#f59e0b", bg: "#fef3c7", icon: ShieldAlert, label: "System",  gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
    INFO:    { color: "#8b5cf6", bg: "#f5f3ff", icon: Info,       label: "Info",    gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [refreshing, setRefreshing]       = useState(false);
    const [error, setError]                 = useState(null);
    const [successMsg, setSuccessMsg]       = useState(null);
    const [typeFilter, setTypeFilter]       = useState("ALL");
    const [readFilter, setReadFilter]       = useState("ALL");
    const [search, setSearch]               = useState("");
    const [lastUpdated, setLastUpdated]     = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [selectedNotifs, setSelectedNotifs] = useState(new Set());
    const [currentPage, setCurrentPage]     = useState(1);
    const [sortBy, setSortBy]               = useState("newest");

    useEffect(() => {
        if (successMsg) { const t = setTimeout(() => setSuccessMsg(null), 4000); return () => clearTimeout(t); }
    }, [successMsg]);
    useEffect(() => {
        if (error) { const t = setTimeout(() => setError(null), 7000); return () => clearTimeout(t); }
    }, [error]);

    const fetchNotifications = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true); else setRefreshing(true);
            setError(null);
            const res = await api.get("/admin/dashboard/notifications?limit=100");
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setLastUpdated(new Date());
            } else throw new Error("Failed to fetch");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load notifications");
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = async (id) => {
        try {
            setActionLoading(p => ({ ...p, [id]: "read" }));
            await api.patch(`/admin/dashboard/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setSuccessMsg("Marked as read");
        } catch { setError("Failed to mark as read"); }
        finally { setActionLoading(p => ({ ...p, [id]: null })); }
    };

    const markUnread = async (id) => {
        try {
            setActionLoading(p => ({ ...p, [id]: "unread" }));
            await api.patch(`/admin/dashboard/notifications/${id}/unread`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
            setSuccessMsg("Marked as unread");
        } catch { setError("Failed to mark as unread"); }
        finally { setActionLoading(p => ({ ...p, [id]: null })); }
    };

    const deleteNotif = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            setActionLoading(p => ({ ...p, [id]: "delete" }));
            await api.delete(`/admin/dashboard/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setSelectedNotifs(prev => { const s = new Set(prev); s.delete(id); return s; });
            setSuccessMsg("Notification deleted");
        } catch { setError("Failed to delete"); }
        finally { setActionLoading(p => ({ ...p, [id]: null })); }
    };

    const markAllRead = async () => {
        try {
            await api.patch("/admin/dashboard/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setSuccessMsg("All notifications marked as read");
        } catch { setError("Failed to mark all as read"); }
    };

    const bulkMarkRead = async () => {
        try {
            await Promise.all(Array.from(selectedNotifs).map(id => api.patch(`/admin/notifications/${id}/read`)));
            setNotifications(prev => prev.map(n => selectedNotifs.has(n.id) ? { ...n, is_read: true } : n));
            setSuccessMsg(`${selectedNotifs.size} marked as read`);
            setSelectedNotifs(new Set());
        } catch { setError("Failed to bulk mark read"); }
    };

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedNotifs.size} notifications?`)) return;
        try {
            await Promise.all(Array.from(selectedNotifs).map(id => api.delete(`/admin/notifications/${id}`)));
            setNotifications(prev => prev.filter(n => !selectedNotifs.has(n.id)));
            setSuccessMsg(`${selectedNotifs.size} notifications deleted`);
            setSelectedNotifs(new Set());
        } catch { setError("Failed to bulk delete"); }
    };

    const toggleSelect = (id) => setSelectedNotifs(prev => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
    });

    const filtered = notifications
        .filter(n => {
            if (typeFilter !== "ALL" && n.type !== typeFilter) return false;
            if (readFilter === "UNREAD" && n.is_read) return false;
            if (readFilter === "READ" && !n.is_read) return false;
            if (search && !n.message?.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === "unread") return a.is_read === b.is_read ? 0 : a.is_read ? 1 : -1;
            return 0;
        });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const stats = {
        total:   notifications.length,
        unread:  unreadCount,
        read:    notifications.length - unreadCount,
        payment: notifications.filter(n => n.type === "PAYMENT").length,
        booking: notifications.filter(n => n.type === "BOOKING").length,
        system:  notifications.filter(n => n.type === "SYSTEM").length,
    };

    const exportToCSV = () => {
        const csv = [
            ["ID", "Type", "Message", "Status", "Created At"],
            ...filtered.map(n => [n.id, n.type, n.message.replace(/,/g, ";"), n.is_read ? "Read" : "Unread", new Date(n.created_at).toLocaleString("en-IN")])
        ].map(r => r.join(",")).join("\n");
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `notifications-${new Date().toISOString().split("T")[0]}.csv` });
        a.click();
        setSuccessMsg("Exported successfully");
    };

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <AdminNavbar />
            <div style={s.centerFlex}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading notifications…</p>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <AdminNavbar />

            <div style={{ flex: 1, overflow: "auto" }}>

                {/* ── HERO BANNER ───────────────────────────────────────────── */}
                <div style={s.heroBanner}>
                    <div style={s.heroLeft}>
                        <div style={s.heroIconBox}>
                            <Bell size={26} color="white" />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <h1 style={s.heroTitle}>Notifications</h1>
                                {unreadCount > 0 && (
                                    <span style={s.unreadBadge}>{unreadCount} unread</span>
                                )}
                            </div>
                            {lastUpdated && (
                                <p style={s.heroSub}>
                                    Last updated: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <button onClick={exportToCSV} style={s.heroBtn}>
                            <Download size={15} /> Export
                        </button>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ ...s.heroBtn, background: "rgba(16,185,129,0.25)", borderColor: "rgba(16,185,129,0.5)" }}>
                                <CheckCheck size={15} /> Mark all read
                            </button>
                        )}
                        <button onClick={() => fetchNotifications(true)} disabled={refreshing} style={s.heroBtn}>
                            <RefreshCw size={15} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                            {refreshing ? "Refreshing…" : "Refresh"}
                        </button>
                    </div>
                </div>

                <div style={s.pageBody}>

                    {/* ── TOASTS ─────────────────────────────────────────────── */}
                    {successMsg && (
                        <div style={s.toast("success")}>
                            <CheckCheck size={16} /><span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg(null)} style={s.toastClose}><X size={13} /></button>
                        </div>
                    )}
                    {error && (
                        <div style={s.toast("error")}>
                            <AlertCircle size={16} /><span>{error}</span>
                            <button onClick={() => setError(null)} style={s.toastClose}><X size={13} /></button>
                        </div>
                    )}

                    {/* ── STATS ──────────────────────────────────────────────── */}
                    <div style={s.statsGrid}>
                        {[
                            { label: "Total",    value: stats.total,   color: "#3b82f6", icon: Activity   },
                            { label: "Unread",   value: stats.unread,  color: "#f59e0b", icon: BellRing   },
                            { label: "Read",     value: stats.read,    color: "#10b981", icon: Eye        },
                            { label: "Payments", value: stats.payment, color: "#10b981", icon: CreditCard },
                            { label: "Bookings", value: stats.booking, color: "#3b82f6", icon: Calendar   },
                            { label: "System",   value: stats.system,  color: "#f59e0b", icon: ShieldAlert},
                        ].map(({ label, value, color, icon: Icon }) => (
                            <div key={label} style={s.statCard}>
                                <div style={{ ...s.statIconBox, background: `${color}18` }}>
                                    <Icon size={20} color={color} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span style={{ ...s.statValue, color }}>{value}</span>
                                    <span style={s.statLabel}>{label.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── FILTER BAR ─────────────────────────────────────────── */}
                    <div style={s.filterCard}>
                        {/* Search */}
                        <div style={s.searchBox}>
                            <Search size={15} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Search notifications…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                style={s.searchInput}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={s.clearBtn}><X size={13} /></button>
                            )}
                        </div>

                        <div style={s.filterRow}>
                            <span style={s.filterLabel}>TYPE:</span>
                            {["ALL", "BOOKING", "PAYMENT", "SYSTEM", "INFO"].map(t => (
                                <button key={t} onClick={() => { setTypeFilter(t); setCurrentPage(1); }} style={s.chip(typeFilter === t)}>{t}</button>
                            ))}
                        </div>

                        <div style={s.filterRow}>
                            <span style={s.filterLabel}>STATUS:</span>
                            {["ALL", "UNREAD", "READ"].map(r => (
                                <button key={r} onClick={() => { setReadFilter(r); setCurrentPage(1); }} style={s.chip(readFilter === r)}>{r}</button>
                            ))}
                        </div>

                        <div style={s.filterRow}>
                            <span style={s.filterLabel}>SORT:</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={s.select}>
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="unread">Unread first</option>
                            </select>
                        </div>
                    </div>

                    {/* ── BULK BAR ───────────────────────────────────────────── */}
                    {selectedNotifs.size > 0 && (
                        <div style={s.bulkBar}>
                            <span style={s.bulkText}><CheckCheck size={15} /> {selectedNotifs.size} selected</span>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={bulkMarkRead} style={s.bulkBtn("#10b981")}><Eye size={13} /> Mark read</button>
                                <button onClick={bulkDelete}   style={s.bulkBtn("#ef4444")}><Trash2 size={13} /> Delete</button>
                                <button onClick={() => setSelectedNotifs(new Set())} style={s.bulkBtn("#64748b")}><X size={13} /> Clear</button>
                            </div>
                        </div>
                    )}

                    {/* ── RESULTS ROW ────────────────────────────────────────── */}
                    <div style={s.resultsRow}>
                        <span style={s.resultsText}>
                            Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong> notifications
                        </span>
                        {filtered.length > 0 && (
                            <button
                                onClick={() => selectedNotifs.size === filtered.length
                                    ? setSelectedNotifs(new Set())
                                    : setSelectedNotifs(new Set(filtered.map(n => n.id)))
                                }
                                style={s.selectAllBtn}
                            >
                                <CheckCheck size={13} />
                                {selectedNotifs.size === filtered.length ? "Deselect all" : "Select all"}
                            </button>
                        )}
                    </div>

                    {/* ── NOTIFICATION LIST ──────────────────────────────────── */}
                    {paginated.length === 0 ? (
                        <div style={s.emptyState}>
                            <div style={s.emptyIconWrap}><Bell size={40} color="#94a3b8" /></div>
                            <h3 style={s.emptyTitle}>
                                {search || typeFilter !== "ALL" || readFilter !== "ALL" ? "No notifications found" : "No notifications yet"}
                            </h3>
                            <p style={s.emptyText}>
                                {search || typeFilter !== "ALL" || readFilter !== "ALL" ? "Try adjusting your filters" : "New notifications will appear here"}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {paginated.map((n, idx) => {
                                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG["INFO"];
                                const Icon = cfg.icon;
                                const acting = actionLoading[n.id];
                                const selected = selectedNotifs.has(n.id);

                                return (
                                    <div key={n.id} style={{
                                        ...s.notifCard,
                                        background: selected ? "#eff6ff" : n.is_read ? "white" : "#fefce8",
                                        borderLeftColor: cfg.color,
                                        opacity: acting === "delete" ? 0.4 : 1,
                                        animation: `slideIn 0.25s ease ${idx * 0.04}s both`,
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleSelect(n.id)}
                                            style={s.checkbox}
                                        />

                                        <div style={{ ...s.notifIconBox, background: cfg.gradient }}>
                                            <Icon size={19} color="white" strokeWidth={2.5} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                                <span style={{ ...s.typePill, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                                {!n.is_read && <span style={s.newBadge}>NEW</span>}
                                            </div>
                                            <p style={s.notifMsg}>{n.message}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Clock size={12} color="#94a3b8" />
                                                <span style={s.notifTime}>
                                                    {new Date(n.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={s.notifActions}>
                                            {n.is_read ? (
                                                <button onClick={() => markUnread(n.id)} disabled={!!acting} style={s.actionBtn("#eff6ff", "#3b82f6")}>
                                                    {acting === "unread" ? <MiniSpinner /> : <><BellRing size={13} /> Unread</>}
                                                </button>
                                            ) : (
                                                <button onClick={() => markRead(n.id)} disabled={!!acting} style={s.actionBtn("#ecfdf5", "#10b981")}>
                                                    {acting === "read" ? <MiniSpinner /> : <><CheckCheck size={13} /> Read</>}
                                                </button>
                                            )}
                                            <button onClick={() => deleteNotif(n.id)} disabled={!!acting} style={s.actionBtn("#fef2f2", "#dc2626")}>
                                                {acting === "delete" ? <MiniSpinner /> : <Trash2 size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── PAGINATION ─────────────────────────────────────────── */}
                    {totalPages > 1 && (
                        <div style={s.pagination}>
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} style={s.pageBtn(false)}>← Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .reduce((acc, p, i, arr) => {
                                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "..." ? (
                                        <span key={`e${i}`} style={{ color: "#94a3b8", padding: "0 4px" }}>…</span>
                                    ) : (
                                        <button key={p} onClick={() => setCurrentPage(p)} style={s.pageBtn(currentPage === p)}>{p}</button>
                                    )
                                )
                            }
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} style={s.pageBtn(false)}>Next →</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function MiniSpinner() {
    return <div style={{ width: 12, height: 12, border: "2px solid rgba(0,0,0,0.15)", borderTop: "2px solid currentColor", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
    centerFlex: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },
    spinner:    { width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.9s linear infinite" },
    loadingText:{ color: "#64748b", fontSize: 15, fontWeight: 600 },

    heroBanner: {
        background: "linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%)",
        padding: "28px 36px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
    },
    heroLeft:   { display: "flex", alignItems: "center", gap: 16 },
    heroIconBox:{ width: 52, height: 52, borderRadius: 13, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" },
    heroTitle:  { fontSize: 24, fontWeight: 800, color: "white", margin: 0 },
    heroSub:    { fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontWeight: 500 },
    unreadBadge:{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, letterSpacing: 0.4 },
    heroBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", backdropFilter: "blur(8px)" },

    pageBody:   { padding: "24px 28px", maxWidth: 1260, margin: "0 auto" },

    toast: (type) => ({
        marginBottom: 16, padding: "12px 16px", borderRadius: 10,
        background: type === "success" ? "#ecfdf5" : "#fef2f2",
        border: `1.5px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
        color: type === "success" ? "#166534" : "#991b1b",
        display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600,
    }),
    toastClose: { background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: "auto", display: "flex", alignItems: "center" },

    statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 20 },
    statCard:   { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    statIconBox:{ width: 44, height: 44, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    statValue:  { fontSize: 26, fontWeight: 800, display: "block", lineHeight: 1, marginBottom: 3 },
    statLabel:  { fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, display: "block" },

    filterCard: { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 22px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    searchBox:  { display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", background: "#f8fafc", flex: "1 1 240px" },
    searchInput:{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#334155", flex: 1, fontWeight: 500 },
    clearBtn:   { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" },
    filterRow:  { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    filterLabel:{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: 0.6, whiteSpace: "nowrap" },
    chip: (active) => ({
        padding: "6px 13px", borderRadius: 7, fontSize: 11, fontWeight: 800, letterSpacing: 0.3, cursor: "pointer",
        border: active ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0",
        background: active ? "#2563eb" : "white",
        color: active ? "white" : "#64748b",
        transition: "all 0.18s",
    }),
    select:     { padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", cursor: "pointer", outline: "none" },

    bulkBar:    { background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius: 11, padding: "12px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" },
    bulkText:   { color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 },
    bulkBtn:    (color) => ({ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", background: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, color, cursor: "pointer" }),

    resultsRow: { marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
    resultsText:{ fontSize: 13, color: "#64748b", fontWeight: 500 },
    selectAllBtn:{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer" },

    notifCard:  { background: "white", borderRadius: 13, border: "1.5px solid #e2e8f0", borderLeft: "4px solid", padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" },
    checkbox:   { width: 16, height: 16, cursor: "pointer", marginTop: 3, accentColor: "#2563eb", flexShrink: 0 },
    notifIconBox:{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.12)" },
    typePill:   { fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 5, letterSpacing: 0.8, textTransform: "uppercase" },
    newBadge:   { fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: "#f59e0b", color: "white", letterSpacing: 0.5 },
    notifMsg:   { fontSize: 13, color: "#334155", margin: "0 0 8px", lineHeight: 1.6, fontWeight: 500 },
    notifTime:  { fontSize: 11, color: "#94a3b8" },
    notifActions:{ display: "flex", gap: 7, flexShrink: 0, alignItems: "center" },
    actionBtn:  (bg, color) => ({ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", background: bg, border: "none", borderRadius: 7, fontSize: 11, fontWeight: 700, color, cursor: "pointer", transition: "all 0.2s" }),

    emptyState:  { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "70px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    emptyIconWrap:{ width: 70, height: 70, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
    emptyTitle:  { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
    emptyText:   { fontSize: 13, color: "#94a3b8", margin: 0 },

    pagination:  { display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 28, paddingBottom: 16 },
    pageBtn:     (active) => ({
        minWidth: 38, height: 38, padding: "0 12px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "#2563eb" : "white",
        border: active ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0",
        color: active ? "white" : "#475569",
        boxShadow: active ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
    }),
};
