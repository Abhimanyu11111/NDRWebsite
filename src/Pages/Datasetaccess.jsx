import { useEffect, useState, useCallback } from "react";
import {
    Lock, Unlock, AlertCircle, RefreshCw, Search, X,
    Eye, Shield, User, Database, Clock, Filter,
    CheckCircle2, XCircle, Activity
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;

export default function DatasetAccessPage() {
    const [activeLocks, setActiveLocks] = useState([]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [stats, setStats] = useState({ activeLocks: 0, totalAccess: 0, uniqueUsers: 0, blockedAttempts: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("locks"); // locks | logs
    const [userFilter, setUserFilter] = useState("");
    const [search, setSearch] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [confirmUnlock, setConfirmUnlock] = useState(null);

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            setError(null);

            const [locksRes, logsRes, statsRes] = await Promise.allSettled([
                api.get("/admin/datasets/locks?status=ACTIVE"),
                api.get("/admin/datasets/logs?limit=100"),
                api.get("/admin/datasets/stats"),
            ]);

            if (locksRes.status === "fulfilled" && locksRes.value.data.success) {
                setActiveLocks(locksRes.value.data.locks || []);
            }
            if (logsRes.status === "fulfilled" && logsRes.value.data.success) {
                setAccessLogs(logsRes.value.data.logs || []);
            }
            if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
                setStats(statsRes.value.data.stats || {});
            }

            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load dataset access data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleUnlock = async (lockId) => {
        try {
            setActionLoading((p) => ({ ...p, [lockId]: true }));
            await api.patch(`/admin/datasets/locks/${lockId}/unlock`);
            setActiveLocks((prev) => prev.filter((l) => l.lock_id !== lockId));
            fetchData(true);
        } catch (err) {
            console.error("Unlock error:", err);
        } finally {
            setActionLoading((p) => ({ ...p, [lockId]: false }));
            setConfirmUnlock(null);
        }
    };

    const filteredLocks = activeLocks.filter((l) => {
        if (userFilter && !l.userName?.toLowerCase().includes(userFilter.toLowerCase()) &&
            !l.userEmail?.toLowerCase().includes(userFilter.toLowerCase())) return false;
        if (search) {
            const q = search.toLowerCase();
            return l.dataset_name?.toLowerCase().includes(q) ||
                l.userName?.toLowerCase().includes(q) ||
                l.lock_id?.toLowerCase().includes(q);
        }
        return true;
    });

    const filteredLogs = accessLogs.filter((log) => {
        if (userFilter && !log.userName?.toLowerCase().includes(userFilter.toLowerCase())) return false;
        if (search) {
            const q = search.toLowerCase();
            return log.dataset_name?.toLowerCase().includes(q) ||
                log.userName?.toLowerCase().includes(q) ||
                log.action?.toLowerCase().includes(q);
        }
        return true;
    });

    if (loading) return (
        <>
            <AdminNavbar />
            <div style={styles.center}>
                <div style={styles.spinnerRing} />
                <p style={styles.loadingText}>Loading dataset access data…</p>
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
                <button onClick={() => fetchData()} style={styles.retryBtn}>Retry</button>
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
                        <h1 style={styles.pageTitle}>Dataset Access</h1>
                        {lastUpdated && (
                            <p style={styles.subtitle}>Last updated: {lastUpdated.toLocaleTimeString("en-IN")}</p>
                        )}
                    </div>
                    <button onClick={() => fetchData(true)} style={styles.refreshBtn} disabled={refreshing}>
                        <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                </div>

                {/* STAT CARDS */}
                <div style={styles.statsGrid}>
                    <StatCard label="Active Locks" value={stats.activeLocks || activeLocks.length} icon={Lock} color="#6366f1" />
                    <StatCard label="Total Access" value={stats.totalAccess || accessLogs.length} icon={Activity} color="#3b82f6" />
                    <StatCard label="Unique Users" value={stats.uniqueUsers || 0} icon={User} color="#10b981" />
                    <StatCard label="Blocked Attempts" value={stats.blockedAttempts || 0} icon={Shield} color="#ef4444" />
                </div>

                {/* ALERT if active locks */}
                {activeLocks.length > 0 && (
                    <div style={styles.alertBanner}>
                        <Lock size={18} color="#7c3aed" />
                        <span style={{ fontWeight: 600, color: "#4c1d95" }}>
                            {activeLocks.length} dataset(s) currently locked
                        </span>
                    </div>
                )}

                {/* TABS */}
                <div style={styles.tabs}>
                    <button
                        onClick={() => setActiveTab("locks")}
                        style={styles.tab(activeTab === "locks")}
                    >
                        <Lock size={16} /> Active Locks
                        {activeLocks.length > 0 && (
                            <span style={styles.tabBadge}>{activeLocks.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("logs")}
                        style={styles.tab(activeTab === "logs")}
                    >
                        <Eye size={16} /> Access Logs
                    </button>
                </div>

                {/* FILTER BAR */}
                <div style={styles.filterBar}>
                    <div style={styles.searchBox}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder={activeTab === "locks" ? "Search by dataset, user, lock ID…" : "Search logs…"}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                        {search && <button onClick={() => setSearch("")} style={styles.clearBtn}><X size={14} /></button>}
                    </div>
                    <div style={styles.searchBox}>
                        <User size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Filter by user…"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            style={styles.searchInput}
                        />
                        {userFilter && <button onClick={() => setUserFilter("")} style={styles.clearBtn}><X size={14} /></button>}
                    </div>
                </div>

                {/* ACTIVE LOCKS TAB */}
                {activeTab === "locks" && (
                    <>
                        <div style={styles.resultsRow}>
                            <span style={styles.resultsText}>
                                Showing <strong>{filteredLocks.length}</strong> active lock(s)
                            </span>
                        </div>

                        {filteredLocks.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Unlock size={40} color="#cbd5e1" />
                                <p>No active dataset locks</p>
                            </div>
                        ) : (
                            <div style={styles.locksGrid}>
                                {filteredLocks.map((lock) => (
                                    <div key={lock.lock_id} style={styles.lockCard}>
                                        {/* Lock header */}
                                        <div style={styles.lockHeader}>
                                            <div style={styles.lockIconBox}>
                                                <Database size={20} color="#6366f1" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={styles.datasetName}>{lock.dataset_name || "Dataset"}</h3>
                                                <code style={styles.lockId}>{lock.lock_id}</code>
                                            </div>
                                            <span style={styles.activePill}>● Active</span>
                                        </div>

                                        {/* User info */}
                                        <div style={styles.lockInfo}>
                                            <div style={styles.lockRow}>
                                                <User size={14} color="#94a3b8" />
                                                <div>
                                                    <p style={styles.lockLabel}>Locked By</p>
                                                    <p style={styles.lockValue}>{lock.userName || "Unknown"}</p>
                                                    <p style={styles.lockSub}>{lock.userEmail || ""}</p>
                                                </div>
                                            </div>
                                            <div style={styles.lockRow}>
                                                <Clock size={14} color="#94a3b8" />
                                                <div>
                                                    <p style={styles.lockLabel}>Locked Since</p>
                                                    <p style={styles.lockValue}>{new Date(lock.locked_at).toLocaleDateString("en-IN")}</p>
                                                    <p style={styles.lockSub}>{new Date(lock.locked_at).toLocaleTimeString("en-IN")}</p>
                                                </div>
                                            </div>
                                            {lock.booking_id && (
                                                <div style={styles.lockRow}>
                                                    <Shield size={14} color="#94a3b8" />
                                                    <div>
                                                        <p style={styles.lockLabel}>Booking</p>
                                                        <code style={styles.code}>{lock.booking_id}</code>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Unlock button */}
                                        {confirmUnlock === lock.lock_id ? (
                                            <div style={styles.confirmRow}>
                                                <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>Confirm unlock?</span>
                                                <button
                                                    onClick={() => handleUnlock(lock.lock_id)}
                                                    style={styles.confirmYesBtn}
                                                    disabled={actionLoading[lock.lock_id]}
                                                >
                                                    {actionLoading[lock.lock_id] ? "Unlocking…" : "Yes, Unlock"}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmUnlock(null)}
                                                    style={styles.confirmNoBtn}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmUnlock(lock.lock_id)}
                                                style={styles.unlockBtn}
                                                disabled={actionLoading[lock.lock_id]}
                                            >
                                                <Unlock size={15} />
                                                Force Unlock
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ACCESS LOGS TAB */}
                {activeTab === "logs" && (
                    <>
                        <div style={styles.resultsRow}>
                            <span style={styles.resultsText}>
                                Showing <strong>{filteredLogs.length}</strong> of <strong>{accessLogs.length}</strong> log entries
                            </span>
                        </div>

                        {filteredLogs.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Activity size={40} color="#cbd5e1" />
                                <p>No access logs found</p>
                            </div>
                        ) : (
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHead}>
                                            {["Dataset", "User", "Action", "Status", "IP Address", "Booking", "Timestamp"].map((h) => (
                                                <th key={h} style={styles.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log, idx) => (
                                            <tr key={log.id || idx} style={styles.tr}>
                                                <td style={styles.td}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <Database size={14} color="#6366f1" />
                                                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{log.dataset_name || "—"}</span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{log.userName || "—"}</p>
                                                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{log.userEmail || ""}</p>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.actionPill(log.action)}>{log.action || "VIEW"}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <LogStatusBadge status={log.status} />
                                                </td>
                                                <td style={styles.td}>
                                                    <code style={styles.code}>{log.ip_address || "—"}</code>
                                                </td>
                                                <td style={styles.td}>
                                                    {log.booking_id
                                                        ? <code style={{ ...styles.code, background: "#eff6ff", color: "#1e40af" }}>{log.booking_id}</code>
                                                        : <span style={{ color: "#94a3b8" }}>—</span>
                                                    }
                                                </td>
                                                <td style={styles.td}>
                                                    <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                                                        {new Date(log.created_at).toLocaleDateString("en-IN")}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                                                        {new Date(log.created_at).toLocaleTimeString("en-IN")}
                                                    </p>
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

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div style={styles.statCard}>
            <div style={{ ...styles.iconBox, background: `${color}15` }}>
                <Icon size={22} style={{ color }} strokeWidth={2.5} />
            </div>
            <div>
                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
                <h3 style={{ fontSize: 24, fontWeight: 800, color, margin: 0 }}>{value}</h3>
            </div>
        </div>
    );
}

function LogStatusBadge({ status }) {
    const map = {
        SUCCESS: ["#dcfce7", "#166534"],
        DENIED: ["#fee2e2", "#991b1b"],
        BLOCKED: ["#fef3c7", "#92400e"],
    };
    const [bg, text] = map[status] || ["#f1f5f9", "#475569"];
    return (
        <span style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 0.5, background: bg, color: text
        }}>
            {status || "—"}
        </span>
    );
}

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
        border: "4px solid #e2e8f0", borderTop: "4px solid #6366f1",
        borderRadius: "50%", animation: "spin 1s linear infinite",
    },
    loadingText: { color: "#64748b", fontSize: 16, fontWeight: 500 },
    errorTitle: { fontSize: 24, fontWeight: 600, color: "#0f172a", margin: 0 },
    errorText: { fontSize: 16, color: "#64748b", textAlign: "center", maxWidth: 400 },
    retryBtn: {
        padding: "12px 24px", background: "#6366f1", color: "white",
        border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
    },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 32, flexWrap: "wrap", gap: 16,
    },
    pageTitle: { fontSize: 32, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: "#94a3b8", margin: "6px 0 0", fontWeight: 500 },
    refreshBtn: {
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", background: "white", border: "1px solid #e2e8f0",
        borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer",
    },
    statsGrid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 24,
    },
    statCard: {
        background: "white", padding: "18px 20px", borderRadius: 12,
        border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    iconBox: {
        width: 46, height: 46, borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    alertBanner: {
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 20px", borderRadius: 10, marginBottom: 20,
        background: "#f5f3ff", border: "1px solid #ddd6fe", fontSize: 14,
    },
    tabs: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "2px solid #e2e8f0" },
    tab: (active) => ({
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", border: "none", background: "none",
        fontSize: 14, fontWeight: 600, cursor: "pointer",
        color: active ? "#6366f1" : "#64748b",
        borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
        marginBottom: -2, transition: "all 0.15s",
    }),
    tabBadge: {
        background: "#ef4444", color: "white",
        fontSize: 11, fontWeight: 700, borderRadius: 10,
        padding: "1px 6px",
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
    resultsRow: { marginBottom: 12 },
    resultsText: { fontSize: 13, color: "#64748b" },
    locksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 },
    lockCard: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        padding: "22px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column", gap: 16,
    },
    lockHeader: { display: "flex", alignItems: "flex-start", gap: 12 },
    lockIconBox: {
        width: 44, height: 44, borderRadius: 10, background: "#f5f3ff",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    },
    datasetName: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
    lockId: { fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569" },
    activePill: {
        fontSize: 11, fontWeight: 700, padding: "4px 10px",
        background: "#fef3c7", color: "#92400e", borderRadius: 20,
        flexShrink: 0,
    },
    lockInfo: { display: "flex", flexDirection: "column", gap: 12 },
    lockRow: { display: "flex", alignItems: "flex-start", gap: 10 },
    lockLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.3 },
    lockValue: { fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 },
    lockSub: { fontSize: 12, color: "#94a3b8", margin: 0 },
    code: { fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569" },
    confirmRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    confirmYesBtn: {
        padding: "7px 14px", background: "#ef4444", color: "white",
        border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer",
    },
    confirmNoBtn: {
        padding: "7px 14px", background: "#f1f5f9", color: "#475569",
        border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer",
    },
    unlockBtn: {
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "10px", background: "#fef3c7", color: "#92400e",
        border: "1px solid #fde68a", borderRadius: 8, fontSize: 13,
        fontWeight: 700, cursor: "pointer", width: "100%",
    },
    tableContainer: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
    tableHead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
    th: {
        padding: "14px 18px", textAlign: "left",
        fontSize: 12, fontWeight: 700, color: "#64748b",
        textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap",
    },
    tr: { borderBottom: "1px solid #f1f5f9" },
    td: { padding: "14px 18px", fontSize: 14, color: "#334155" },
    actionPill: (action) => ({
        fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
        background: action === "LOCK" ? "#f5f3ff" : action === "UNLOCK" ? "#f0fdf4" : "#f8fafc",
        color: action === "LOCK" ? "#5b21b6" : action === "UNLOCK" ? "#15803d" : "#475569",
    }),
    emptyState: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        padding: "64px 20px", textAlign: "center", color: "#94a3b8",
        fontSize: 15, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12,
    },
};