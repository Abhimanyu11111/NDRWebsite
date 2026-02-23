import { useEffect, useState, useCallback } from "react";
import {
    CreditCard, AlertCircle, RefreshCw, Filter,
    TrendingUp, TrendingDown, CheckCircle2, XCircle,
    Clock, DollarSign, Search, ChevronDown, X,
    Download, Eye, BarChart3
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;

export default function PaymentLogs() {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, pending: 0, totalRevenue: 0, failedAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPayments = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            setError(null);

            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (dateFrom) params.append("from", dateFrom);
            if (dateTo) params.append("to", dateTo);
            params.append("limit", "100");

            const [payRes, statsRes] = await Promise.allSettled([
                api.get(`/admin/dashboard/payments?${params}`),
                api.get("/admin/dashboard/payment-stats"),
            ]);

            if (payRes.status === "fulfilled" && payRes.value.data.success) {
                setPayments(payRes.value.data.payments || []);
            }
            if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
                setStats(statsRes.value.data.stats || {});
            }

            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load payment logs");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchPayments();
        const interval = setInterval(() => fetchPayments(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchPayments]);

    const clearFilters = () => {
        setStatusFilter("ALL");
        setDateFrom("");
        setDateTo("");
        setSearch("");
    };

    const filtered = payments.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.order_id?.toLowerCase().includes(q) ||
            p.booking_id?.toLowerCase().includes(q) ||
            p.userName?.toLowerCase().includes(q) ||
            p.userEmail?.toLowerCase().includes(q)
        );
    });

    if (loading) return (
        <>
            <AdminNavbar />
            <div style={styles.center}>
                <div style={styles.spinnerRing} />
                <p style={styles.loadingText}>Loading payment logs…</p>
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
                <button onClick={() => fetchPayments()} style={styles.retryBtn}>Retry</button>
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
                        <h1 style={styles.pageTitle}>Payment Logs</h1>
                        {lastUpdated && (
                            <p style={styles.subtitle}>Last updated: {lastUpdated.toLocaleTimeString("en-IN")}</p>
                        )}
                    </div>
                    <button onClick={() => fetchPayments(true)} style={styles.refreshBtn} disabled={refreshing}>
                        <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                </div>

                {/* STAT CARDS */}
                <div style={styles.statsGrid}>
                    <StatCard label="Total Revenue" value={`₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`} icon={DollarSign} color="#10b981" />
                    <StatCard label="Successful" value={stats.success || 0} icon={CheckCircle2} color="#3b82f6" />
                    <StatCard label="Failed" value={stats.failed || 0} icon={XCircle} color="#ef4444" />
                    <StatCard label="Pending" value={stats.pending || 0} icon={Clock} color="#f59e0b" />
                    <StatCard label="Failed Amount" value={`₹${Number(stats.failedAmount || 0).toLocaleString("en-IN")}`} icon={TrendingDown} color="#f97316" />
                    <StatCard label="Total Transactions" value={stats.total || 0} icon={BarChart3} color="#8b5cf6" />
                </div>

                {/* FILTERS */}
                <div style={styles.filterBar}>
                    {/* Search */}
                    <div style={styles.searchBox}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search by order ID, booking, user…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} style={styles.clearBtn}><X size={14} /></button>
                        )}
                    </div>

                    {/* Status tabs */}
                    <div style={styles.filterRow}>
                        {["ALL", "SUCCESS", "FAILED", "PENDING"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                style={styles.filterBtn(statusFilter === s, s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Date Range */}
                    <div style={styles.dateRow}>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={styles.dateInput}
                        />
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={styles.dateInput}
                        />
                        {(dateFrom || dateTo || search || statusFilter !== "ALL") && (
                            <button onClick={clearFilters} style={styles.clearAllBtn}>
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* RESULTS COUNT */}
                <div style={styles.resultsRow}>
                    <span style={styles.resultsText}>
                        Showing <strong>{filtered.length}</strong> of <strong>{payments.length}</strong> transactions
                    </span>
                </div>

                {/* TABLE */}
                {filtered.length === 0 ? (
                    <div style={styles.emptyState}>
                        <CreditCard size={40} color="#cbd5e1" />
                        <p>No payment records found</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHead}>
                                    {["Order ID", "Booking ID", "User", "Amount", "Status", "Attempts", "Gateway", "Date"].map((h) => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.order_id} style={{
                                        ...styles.tr,
                                        background: p.status === "FAILED" ? "#fff5f5" : "white"
                                    }}>
                                        <td style={styles.td}>
                                            <code style={styles.code}>{p.order_id}</code>
                                        </td>
                                        <td style={styles.td}>
                                            <code style={{ ...styles.code, background: "#eff6ff", color: "#1e40af" }}>{p.booking_id}</code>
                                        </td>
                                        <td style={styles.td}>
                                            <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{p.userName || "—"}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{p.userEmail || ""}</p>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                                                ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                                            </span>
                                        </td>
                                        <td style={styles.td}><StatusBadge status={p.status} /></td>
                                        <td style={styles.td}>
                                            {p.fail_count > 0 ? (
                                                <span style={styles.failBadge}>{p.fail_count}x failed</span>
                                            ) : (
                                                <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ fontSize: 13, color: "#64748b" }}>{p.gateway || "Razorpay"}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                                                {new Date(p.created_at).toLocaleDateString("en-IN")}
                                            </p>
                                            <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                                                {new Date(p.created_at).toLocaleTimeString("en-IN")}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

function StatusBadge({ status }) {
    const map = {
        SUCCESS: ["#dcfce7", "#166534"],
        FAILED: ["#fee2e2", "#991b1b"],
        PENDING: ["#fef3c7", "#92400e"],
        REFUNDED: ["#dbeafe", "#1e40af"],
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
    refreshBtn: {
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", background: "white", border: "1px solid #e2e8f0",
        borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569",
        cursor: "pointer",
    },
    statsGrid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 32,
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
    filterBar: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        padding: "20px 24px", marginBottom: 20,
        display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    searchBox: {
        display: "flex", alignItems: "center", gap: 10,
        border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px",
        background: "#f8fafc", flex: "1 1 280px",
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
    filterBtn: (active, status) => {
        const colorMap = {
            SUCCESS: "#10b981", FAILED: "#ef4444", PENDING: "#f59e0b", ALL: "#3b82f6"
        };
        const color = colorMap[status] || "#3b82f6";
        return {
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: active ? `1px solid ${color}` : "1px solid #e2e8f0",
            background: active ? color : "white",
            color: active ? "white" : "#64748b", cursor: "pointer",
        };
    },
    dateRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    dateInput: {
        padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 8,
        fontSize: 13, color: "#334155", background: "#f8fafc", fontFamily: "inherit",
        outline: "none",
    },
    clearAllBtn: {
        display: "flex", alignItems: "center", gap: 5,
        padding: "7px 14px", background: "#fef2f2", border: "1px solid #fecaca",
        borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#dc2626", cursor: "pointer",
    },
    resultsRow: { marginBottom: 12 },
    resultsText: { fontSize: 13, color: "#64748b" },
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
    code: { fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569" },
    failBadge: {
        fontSize: 11, fontWeight: 700, padding: "3px 8px",
        borderRadius: 5, background: "#fee2e2", color: "#991b1b",
    },
    emptyState: {
        background: "white", borderRadius: 14, border: "1px solid #e2e8f0",
        padding: "64px 20px", textAlign: "center", color: "#94a3b8",
        fontSize: 15, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12,
    },
};