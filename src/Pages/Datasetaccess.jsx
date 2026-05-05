import { useEffect, useState, useCallback } from "react";
import {
    Lock, Unlock, AlertCircle, RefreshCw, Search, X,
    Eye, Shield, User, Database, Clock, Activity
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;

export default function DatasetAccessPage() {
    const [activeLocks, setActiveLocks] = useState([]);
    const [accessLogs, setAccessLogs]   = useState([]);
    const [stats, setStats]             = useState({ activeLocks: 0, totalAccess: 0, uniqueUsers: 0, blockedAttempts: 0 });
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [error, setError]             = useState(null);
    const [activeTab, setActiveTab]     = useState("locks");
    const [userFilter, setUserFilter]   = useState("");
    const [search, setSearch]           = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [confirmUnlock, setConfirmUnlock] = useState(null);

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true); else setRefreshing(true);
            setError(null);
            const [locksRes, logsRes, statsRes] = await Promise.allSettled([
                api.get("/admin/datasets/locks?status=ACTIVE"),
                api.get("/admin/datasets/logs?limit=100"),
                api.get("/admin/datasets/stats"),
            ]);
            if (locksRes.status === "fulfilled" && locksRes.value.data.success) setActiveLocks(locksRes.value.data.locks || []);
            if (logsRes.status  === "fulfilled" && logsRes.value.data.success)  setAccessLogs(logsRes.value.data.logs   || []);
            if (statsRes.status === "fulfilled" && statsRes.value.data.success) setStats(statsRes.value.data.stats      || {});
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load dataset access data");
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleUnlock = async (lockId) => {
        try {
            setActionLoading(p => ({ ...p, [lockId]: true }));
            await api.patch(`/admin/datasets/locks/${lockId}/unlock`);
            setActiveLocks(prev => prev.filter(l => l.lock_id !== lockId));
            fetchData(true);
        } catch { /* ignore */ }
        finally { setActionLoading(p => ({ ...p, [lockId]: false })); setConfirmUnlock(null); }
    };

    const q = search.toLowerCase();
    const filteredLocks = activeLocks.filter(l => {
        if (userFilter && !l.userName?.toLowerCase().includes(userFilter.toLowerCase()) && !l.userEmail?.toLowerCase().includes(userFilter.toLowerCase())) return false;
        if (search) return l.dataset_name?.toLowerCase().includes(q) || l.userName?.toLowerCase().includes(q) || l.lock_id?.toLowerCase().includes(q);
        return true;
    });
    const filteredLogs = accessLogs.filter(log => {
        if (userFilter && !log.userName?.toLowerCase().includes(userFilter.toLowerCase())) return false;
        if (search) return log.dataset_name?.toLowerCase().includes(q) || log.userName?.toLowerCase().includes(q) || log.action?.toLowerCase().includes(q);
        return true;
    });

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <AdminNavbar />
            <div style={s.centerFlex}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading dataset access data…</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <AdminNavbar />
            <div style={s.centerFlex}>
                <AlertCircle size={48} color="#ef4444" />
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Failed to Load</h2>
                <p style={{ color: "#64748b", margin: 0 }}>{error}</p>
                <button onClick={() => fetchData()} style={s.retryBtn}>Retry</button>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <AdminNavbar />

            <div style={{ flex: 1, overflow: "auto" }}>

                {/* ── HERO BANNER ─────────────────────────────────────────── */}
                <div style={s.heroBanner}>
                    <div style={s.heroLeft}>
                        <div style={s.heroIconBox}>
                            <Database size={26} color="white" />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <h1 style={s.heroTitle}>Dataset Access</h1>
                                {activeLocks.length > 0 && (
                                    <span style={s.lockBadge}><Lock size={11} /> {activeLocks.length} locked</span>
                                )}
                            </div>
                            {lastUpdated && (
                                <p style={s.heroSub}>Last updated: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => fetchData(true)} disabled={refreshing} style={s.heroBtn}>
                        <RefreshCw size={15} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                </div>

                <div style={s.pageBody}>

                    {/* ── STATS ───────────────────────────────────────────── */}
                    <div style={s.statsGrid}>
                        {[
                            { label: "Active Locks",     value: stats.activeLocks    || activeLocks.length, color: "#6366f1", icon: Lock     },
                            { label: "Total Access",     value: stats.totalAccess    || accessLogs.length,  color: "#3b82f6", icon: Activity  },
                            { label: "Unique Users",     value: stats.uniqueUsers    || 0,                  color: "#10b981", icon: User      },
                            { label: "Blocked Attempts", value: stats.blockedAttempts|| 0,                  color: "#ef4444", icon: Shield    },
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

                    {/* ── TABS ────────────────────────────────────────────── */}
                    <div style={s.tabsWrapper}>
                        <button onClick={() => setActiveTab("locks")} style={s.tab(activeTab === "locks", "#6366f1")}>
                            <Lock size={15} />
                            Active Locks
                            {activeLocks.length > 0 && <span style={s.tabBadge}>{activeLocks.length}</span>}
                        </button>
                        <button onClick={() => setActiveTab("logs")} style={s.tab(activeTab === "logs", "#3b82f6")}>
                            <Eye size={15} />
                            Access Logs
                            {accessLogs.length > 0 && <span style={{ ...s.tabBadge, background: "#3b82f6" }}>{accessLogs.length}</span>}
                        </button>
                    </div>

                    {/* ── FILTER BAR ──────────────────────────────────────── */}
                    <div style={s.filterCard}>
                        <div style={s.searchBox}>
                            <Search size={15} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder={activeTab === "locks" ? "Search by dataset, user, lock ID…" : "Search logs…"}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={s.searchInput}
                            />
                            {search && <button onClick={() => setSearch("")} style={s.clearBtn}><X size={13} /></button>}
                        </div>
                        <div style={s.searchBox}>
                            <User size={15} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Filter by user…"
                                value={userFilter}
                                onChange={e => setUserFilter(e.target.value)}
                                style={s.searchInput}
                            />
                            {userFilter && <button onClick={() => setUserFilter("")} style={s.clearBtn}><X size={13} /></button>}
                        </div>
                    </div>

                    {/* ── ACTIVE LOCKS ────────────────────────────────────── */}
                    {activeTab === "locks" && (
                        <>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                                Showing <strong>{filteredLocks.length}</strong> active lock(s)
                            </p>

                            {filteredLocks.length === 0 ? (
                                <div style={s.emptyState}>
                                    <div style={s.emptyIconWrap}><Unlock size={36} color="#94a3b8" /></div>
                                    <h3 style={s.emptyTitle}>No active dataset locks</h3>
                                    <p style={s.emptyText}>All datasets are currently accessible</p>
                                </div>
                            ) : (
                                <div style={s.locksGrid}>
                                    {filteredLocks.map((lock) => (
                                        <div key={lock.lock_id} style={s.lockCard}>
                                            <div style={s.lockCardAccent} />
                                            <div style={s.lockCardInner}>
                                                <div style={s.lockHeader}>
                                                    <div style={s.lockIconBox}>
                                                        <Database size={20} color="#6366f1" />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h3 style={s.datasetName}>{lock.dataset_name || "Dataset"}</h3>
                                                        <code style={s.code}>{lock.lock_id}</code>
                                                    </div>
                                                    <span style={s.activePill}>● Active</span>
                                                </div>

                                                <div style={s.infoGrid}>
                                                    <div style={s.infoRow}>
                                                        <div style={s.infoIcon}><User size={13} color="#6366f1" /></div>
                                                        <div>
                                                            <p style={s.infoLabel}>Locked By</p>
                                                            <p style={s.infoVal}>{lock.userName || "Unknown"}</p>
                                                            <p style={s.infoSub}>{lock.userEmail || ""}</p>
                                                        </div>
                                                    </div>
                                                    <div style={s.infoRow}>
                                                        <div style={s.infoIcon}><Clock size={13} color="#6366f1" /></div>
                                                        <div>
                                                            <p style={s.infoLabel}>Locked Since</p>
                                                            <p style={s.infoVal}>{new Date(lock.locked_at).toLocaleDateString("en-IN")}</p>
                                                            <p style={s.infoSub}>{new Date(lock.locked_at).toLocaleTimeString("en-IN")}</p>
                                                        </div>
                                                    </div>
                                                    {lock.booking_id && (
                                                        <div style={s.infoRow}>
                                                            <div style={s.infoIcon}><Shield size={13} color="#6366f1" /></div>
                                                            <div>
                                                                <p style={s.infoLabel}>Booking</p>
                                                                <code style={s.code}>{lock.booking_id}</code>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {confirmUnlock === lock.lock_id ? (
                                                    <div style={s.confirmRow}>
                                                        <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Confirm unlock?</span>
                                                        <button onClick={() => handleUnlock(lock.lock_id)} disabled={actionLoading[lock.lock_id]} style={s.confirmYes}>
                                                            {actionLoading[lock.lock_id] ? "Unlocking…" : "Yes, Unlock"}
                                                        </button>
                                                        <button onClick={() => setConfirmUnlock(null)} style={s.confirmNo}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setConfirmUnlock(lock.lock_id)} disabled={actionLoading[lock.lock_id]} style={s.unlockBtn}>
                                                        <Unlock size={14} /> Force Unlock
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── ACCESS LOGS ─────────────────────────────────────── */}
                    {activeTab === "logs" && (
                        <>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                                Showing <strong>{filteredLogs.length}</strong> of <strong>{accessLogs.length}</strong> log entries
                            </p>

                            {filteredLogs.length === 0 ? (
                                <div style={s.emptyState}>
                                    <div style={s.emptyIconWrap}><Activity size={36} color="#94a3b8" /></div>
                                    <h3 style={s.emptyTitle}>No access logs found</h3>
                                    <p style={s.emptyText}>Try adjusting your search or user filter</p>
                                </div>
                            ) : (
                                <div style={s.tableCard}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                                        <thead>
                                            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                                {["Dataset", "User", "Action", "Status", "IP Address", "Booking", "Timestamp"].map(h => (
                                                    <th key={h} style={s.th}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.map((log, idx) => (
                                                <tr key={log.id || idx} style={{ borderBottom: "1px solid #f1f5f9", animation: `fadeIn 0.2s ease ${idx * 0.03}s both` }}>
                                                    <td style={s.td}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <Database size={13} color="#6366f1" />
                                                            <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{log.dataset_name || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td style={s.td}>
                                                        <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{log.userName || "—"}</p>
                                                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{log.userEmail || ""}</p>
                                                    </td>
                                                    <td style={s.td}><ActionPill action={log.action} /></td>
                                                    <td style={s.td}><LogStatusBadge status={log.status} /></td>
                                                    <td style={s.td}><code style={s.code}>{log.ip_address || "—"}</code></td>
                                                    <td style={s.td}>
                                                        {log.booking_id
                                                            ? <code style={{ ...s.code, background: "#eff6ff", color: "#1e40af" }}>{log.booking_id}</code>
                                                            : <span style={{ color: "#94a3b8" }}>—</span>
                                                        }
                                                    </td>
                                                    <td style={s.td}>
                                                        <p style={{ margin: 0, fontSize: 12, color: "#334155" }}>{new Date(log.created_at).toLocaleDateString("en-IN")}</p>
                                                        <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{new Date(log.created_at).toLocaleTimeString("en-IN")}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin   { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function ActionPill({ action }) {
    const map = {
        LOCK:   { bg: "#f5f3ff", color: "#5b21b6" },
        UNLOCK: { bg: "#f0fdf4", color: "#15803d" },
    };
    const c = map[action] || { bg: "#f8fafc", color: "#475569" };
    return <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 5, background: c.bg, color: c.color, letterSpacing: 0.4, textTransform: "uppercase" }}>{action || "VIEW"}</span>;
}

function LogStatusBadge({ status }) {
    const map = { SUCCESS: ["#dcfce7", "#166534"], DENIED: ["#fee2e2", "#991b1b"], BLOCKED: ["#fef3c7", "#92400e"] };
    const [bg, text] = map[status] || ["#f1f5f9", "#475569"];
    return <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, background: bg, color: text }}>{status || "—"}</span>;
}

const s = {
    centerFlex: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },
    spinner:    { width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #6366f1", borderRadius: "50%", animation: "spin 0.9s linear infinite" },
    loadingText:{ color: "#64748b", fontSize: 15, fontWeight: 600 },
    retryBtn:   { padding: "10px 26px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },

    heroBanner: { background: "linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%)", padding: "28px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    heroLeft:   { display: "flex", alignItems: "center", gap: 16 },
    heroIconBox:{ width: 52, height: 52, borderRadius: 13, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" },
    heroTitle:  { fontSize: 24, fontWeight: 800, color: "white", margin: 0 },
    heroSub:    { fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontWeight: 500 },
    lockBadge:  { display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "white", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20 },
    heroBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", backdropFilter: "blur(8px)" },

    pageBody:   { padding: "24px 28px", maxWidth: 1300, margin: "0 auto" },

    statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 20 },
    statCard:   { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    statIconBox:{ width: 44, height: 44, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    statValue:  { fontSize: 26, fontWeight: 800, display: "block", lineHeight: 1, marginBottom: 3 },
    statLabel:  { fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, display: "block" },

    tabsWrapper:{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "2px solid #e2e8f0" },
    tab: (active, color) => ({
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", border: "none", background: "none",
        fontSize: 13, fontWeight: 700, cursor: "pointer",
        color: active ? color : "#64748b",
        borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
        marginBottom: -2, transition: "all 0.15s",
    }),
    tabBadge:   { background: "#ef4444", color: "white", fontSize: 10, fontWeight: 800, borderRadius: 10, padding: "1px 7px" },

    filterCard: { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "16px 20px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    searchBox:  { display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", background: "#f8fafc", flex: "1 1 220px" },
    searchInput:{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#334155", flex: 1, fontWeight: 500 },
    clearBtn:   { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" },

    locksGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 },
    lockCard:   { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    lockCardAccent: { height: 4, background: "linear-gradient(90deg,#6366f1,#818cf8)" },
    lockCardInner:  { padding: "18px", display: "flex", flexDirection: "column", gap: 14 },
    lockHeader: { display: "flex", alignItems: "flex-start", gap: 12 },
    lockIconBox:{ width: 42, height: 42, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    datasetName:{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
    activePill: { fontSize: 10, fontWeight: 800, padding: "4px 10px", background: "#fef3c7", color: "#92400e", borderRadius: 20, flexShrink: 0, letterSpacing: 0.3 },
    infoGrid:   { display: "flex", flexDirection: "column", gap: 10 },
    infoRow:    { display: "flex", alignItems: "flex-start", gap: 10 },
    infoIcon:   { width: 28, height: 28, borderRadius: 7, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
    infoLabel:  { fontSize: 10, color: "#94a3b8", fontWeight: 700, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.4 },
    infoVal:    { fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 },
    infoSub:    { fontSize: 11, color: "#94a3b8", margin: 0 },
    code:       { fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569" },
    confirmRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px", background: "#fff5f5", borderRadius: 8, border: "1px solid #fecaca" },
    confirmYes: { padding: "6px 14px", background: "#ef4444", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" },
    confirmNo:  { padding: "6px 14px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
    unlockBtn:  { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "#fef3c7", color: "#92400e", border: "1.5px solid #fde68a", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer", width: "100%" },

    tableCard:    { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    th:           { padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" },
    td:           { padding: "13px 16px", fontSize: 13, color: "#334155" },

    emptyState:   { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "70px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    emptyIconWrap:{ width: 70, height: 70, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
    emptyTitle:   { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
    emptyText:    { fontSize: 13, color: "#94a3b8", margin: 0 },
};
