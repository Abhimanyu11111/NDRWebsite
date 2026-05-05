import { useEffect, useState, useCallback } from "react";
import {
    CreditCard, AlertCircle, RefreshCw,
    TrendingDown, CheckCircle2, XCircle,
    Clock, Search, X, BarChart3, IndianRupee
} from "lucide-react";
import AdminNavbar from "/src/Component/AdminNavbar";
import api from "../api/axiosClient";

const REFRESH_INTERVAL_MS = 30_000;

export default function PaymentLogs() {
    const [payments, setPayments]     = useState([]);
    const [stats, setStats]           = useState({ total: 0, success: 0, failed: 0, pending: 0, totalRevenue: 0, failedAmount: 0 });
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]           = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch]         = useState("");
    const [dateFrom, setDateFrom]     = useState("");
    const [dateTo, setDateTo]         = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPayments = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true); else setRefreshing(true);
            setError(null);
            const params = new URLSearchParams();
            if (statusFilter !== "ALL") params.append("status", statusFilter);
            if (dateFrom) params.append("from", dateFrom);
            if (dateTo)   params.append("to", dateTo);
            params.append("limit", "100");

            const [payRes, statsRes] = await Promise.allSettled([
                api.get(`/admin/dashboard/payments?${params}`),
                api.get("/admin/dashboard/payment-stats"),
            ]);
            if (payRes.status === "fulfilled" && payRes.value.data.success)
                setPayments(payRes.value.data.payments || []);
            if (statsRes.status === "fulfilled" && statsRes.value.data.success)
                setStats(statsRes.value.data.stats || {});
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load payment logs");
        } finally { setLoading(false); setRefreshing(false); }
    }, [statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchPayments();
        const interval = setInterval(() => fetchPayments(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchPayments]);

    const clearFilters = () => { setStatusFilter("ALL"); setDateFrom(""); setDateTo(""); setSearch(""); };

    const filtered = payments.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return p.order_id?.toLowerCase().includes(q) || p.booking_id?.toLowerCase().includes(q) ||
            p.userName?.toLowerCase().includes(q) || p.userEmail?.toLowerCase().includes(q);
    });

    const inr = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

    if (loading) return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
            <AdminNavbar />
            <div style={s.centerFlex}>
                <div style={s.spinner} />
                <p style={s.loadingText}>Loading payment logs…</p>
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
                <button onClick={() => fetchPayments()} style={s.retryBtn}>Retry</button>
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
                            <CreditCard size={26} color="white" />
                        </div>
                        <div>
                            <h1 style={s.heroTitle}>Payment Logs</h1>
                            {lastUpdated && (
                                <p style={s.heroSub}>Last updated: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                            )}
                        </div>
                    </div>
                    <button onClick={() => fetchPayments(true)} disabled={refreshing} style={s.heroBtn}>
                        <RefreshCw size={15} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                </div>

                <div style={s.pageBody}>

                    {/* ── STATS ───────────────────────────────────────────── */}
                    <div style={s.statsGrid}>
                        {[
                            { label: "Total Revenue",      value: inr(stats.totalRevenue), color: "#10b981", icon: IndianRupee  },
                            { label: "Successful",         value: stats.success  || 0,     color: "#3b82f6", icon: CheckCircle2 },
                            { label: "Failed",             value: stats.failed   || 0,     color: "#ef4444", icon: XCircle      },
                            { label: "Pending",            value: stats.pending  || 0,     color: "#f59e0b", icon: Clock        },
                            { label: "Failed Amount",      value: inr(stats.failedAmount), color: "#f97316", icon: TrendingDown },
                            { label: "Total Transactions", value: stats.total    || 0,     color: "#8b5cf6", icon: BarChart3    },
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

                    {/* ── FILTER BAR ──────────────────────────────────────── */}
                    <div style={s.filterCard}>
                        <div style={s.searchBox}>
                            <Search size={15} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Search by order ID, booking, user…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={s.searchInput}
                            />
                            {search && <button onClick={() => setSearch("")} style={s.clearBtn}><X size={13} /></button>}
                        </div>

                        <div style={s.filterRow}>
                            {[
                                { key: "ALL",     color: "#3b82f6" },
                                { key: "SUCCESS", color: "#10b981" },
                                { key: "FAILED",  color: "#ef4444" },
                                { key: "PENDING", color: "#f59e0b" },
                            ].map(({ key, color }) => (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    style={{
                                        padding: "6px 14px", borderRadius: 7, fontSize: 11, fontWeight: 800,
                                        cursor: "pointer", letterSpacing: 0.3, transition: "all 0.18s",
                                        border: statusFilter === key ? `1.5px solid ${color}` : "1.5px solid #e2e8f0",
                                        background: statusFilter === key ? color : "white",
                                        color: statusFilter === key ? "white" : "#64748b",
                                    }}
                                >{key}</button>
                            ))}
                        </div>

                        <div style={s.filterRow}>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={s.dateInput} />
                            <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>to</span>
                            <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   style={s.dateInput} />
                            {(dateFrom || dateTo || search || statusFilter !== "ALL") && (
                                <button onClick={clearFilters} style={s.clearAllBtn}><X size={13} /> Clear all</button>
                            )}
                        </div>
                    </div>

                    {/* ── RESULTS ─────────────────────────────────────────── */}
                    <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>
                            Showing <strong>{filtered.length}</strong> of <strong>{payments.length}</strong> transactions
                        </span>
                    </div>

                    {/* ── TABLE ───────────────────────────────────────────── */}
                    {filtered.length === 0 ? (
                        <div style={s.emptyState}>
                            <div style={s.emptyIconWrap}><CreditCard size={38} color="#94a3b8" /></div>
                            <h3 style={s.emptyTitle}>No payment records found</h3>
                            <p style={s.emptyText}>Try adjusting your filters or date range</p>
                        </div>
                    ) : (
                        <div style={s.tableCard}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                        {["Order ID", "Booking ID", "User", "Amount", "Status", "Attempts", "Gateway", "Date"].map(h => (
                                            <th key={h} style={s.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p, idx) => (
                                        <tr key={p.order_id || idx} style={{
                                            borderBottom: "1px solid #f1f5f9",
                                            background: p.status === "FAILED" ? "#fff5f5" : "white",
                                            animation: `fadeIn 0.2s ease ${idx * 0.03}s both`,
                                        }}>
                                            <td style={s.td}><code style={s.code}>{p.order_id}</code></td>
                                            <td style={s.td}><code style={{ ...s.code, background: "#eff6ff", color: "#1e40af" }}>{p.booking_id}</code></td>
                                            <td style={s.td}>
                                                <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{p.userName || "—"}</p>
                                                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{p.userEmail || ""}</p>
                                            </td>
                                            <td style={s.td}>
                                                <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                                                    ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                                                </span>
                                            </td>
                                            <td style={s.td}><StatusBadge status={p.status} /></td>
                                            <td style={s.td}>
                                                {p.fail_count > 0
                                                    ? <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: "#fee2e2", color: "#991b1b" }}>{p.fail_count}x failed</span>
                                                    : <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
                                                }
                                            </td>
                                            <td style={s.td}><span style={{ fontSize: 12, color: "#64748b" }}>{p.gateway || "Razorpay"}</span></td>
                                            <td style={s.td}>
                                                <p style={{ margin: 0, fontSize: 12, color: "#334155" }}>{new Date(p.created_at).toLocaleDateString("en-IN")}</p>
                                                <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{new Date(p.created_at).toLocaleTimeString("en-IN")}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        SUCCESS:  ["#dcfce7", "#166534"],
        FAILED:   ["#fee2e2", "#991b1b"],
        PENDING:  ["#fef3c7", "#92400e"],
        REFUNDED: ["#dbeafe", "#1e40af"],
    };
    const [bg, text] = map[status] || ["#f3f4f6", "#374151"];
    return (
        <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, background: bg, color: text }}>
            {status}
        </span>
    );
}

const s = {
    centerFlex: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },
    spinner:    { width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.9s linear infinite" },
    loadingText:{ color: "#64748b", fontSize: 15, fontWeight: 600 },
    retryBtn:   { padding: "10px 26px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },

    heroBanner: { background: "linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%)", padding: "28px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
    heroLeft:   { display: "flex", alignItems: "center", gap: 16 },
    heroIconBox:{ width: 52, height: 52, borderRadius: 13, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" },
    heroTitle:  { fontSize: 24, fontWeight: 800, color: "white", margin: 0 },
    heroSub:    { fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontWeight: 500 },
    heroBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", backdropFilter: "blur(8px)" },

    pageBody:   { padding: "24px 28px", maxWidth: 1300, margin: "0 auto" },

    statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 20 },
    statCard:   { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    statIconBox:{ width: 44, height: 44, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    statValue:  { fontSize: 22, fontWeight: 800, display: "block", lineHeight: 1, marginBottom: 3 },
    statLabel:  { fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, display: "block" },

    filterCard: { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 22px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    searchBox:  { display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", background: "#f8fafc", flex: "1 1 240px" },
    searchInput:{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#334155", flex: 1, fontWeight: 500 },
    clearBtn:   { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" },
    filterRow:  { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    dateInput:  { padding: "7px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#334155", background: "#f8fafc", outline: "none" },
    clearAllBtn:{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 7, fontSize: 11, fontWeight: 700, color: "#dc2626", cursor: "pointer" },

    tableCard:  { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    th:         { padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" },
    td:         { padding: "13px 16px", fontSize: 13, color: "#334155" },
    code:       { fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#475569" },

    emptyState:   { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "70px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
    emptyIconWrap:{ width: 70, height: 70, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
    emptyTitle:   { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
    emptyText:    { fontSize: 13, color: "#94a3b8", margin: 0 },
};
