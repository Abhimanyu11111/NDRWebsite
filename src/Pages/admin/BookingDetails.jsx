import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Database,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import api from "../../api/axiosClient";
import AdminNavbar from "../../Component/AdminNavbar";

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatText = (value) => {
  if (value === null || value === undefined || value === "") return "Not available";
  return String(value);
};

function StatusPill({ value, toneMap }) {
  const tone = toneMap[value] || toneMap.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
        background: tone.bg,
        color: tone.text,
        border: `1px solid ${tone.border}`,
        textTransform: "uppercase",
      }}
    >
      {value || "UNKNOWN"}
    </span>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={{ ...styles.detailValue, ...(mono ? styles.mono : {}) }}>{formatText(value)}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionIcon}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {subtitle ? <p style={styles.sectionSubtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/booking/admin/${id}`);
        setBooking(res.data.booking);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const summaryCards = useMemo(() => {
    if (!booking) return [];
    return [
      {
        label: "Booking Status",
        value: booking.status,
        icon: ShieldCheck,
      },
      {
        label: "Payment Status",
        value: booking.payment_status,
        icon: CircleDollarSign,
      },
      {
        label: "Booking Type",
        value: booking.booking_type,
        icon: CalendarDays,
      },
      {
        label: "Total Amount",
        value: formatCurrency(booking.total_price),
        icon: FileText,
      },
    ];
  }, [booking]);

  return (
    <>
      <AdminNavbar />
      <div style={styles.page}>
        <div style={styles.topBar}>
          <button onClick={() => navigate("/admin/managebookings")} style={styles.backButton}>
            <ArrowLeft size={16} />
            Back to Bookings
          </button>
        </div>

        {loading ? (
          <div style={styles.stateCard}>
            <div style={styles.spinner} />
            <p style={styles.stateText}>Loading booking details...</p>
          </div>
        ) : error ? (
          <div style={styles.stateCard}>
            <p style={{ ...styles.stateText, color: "#b91c1c" }}>{error}</p>
            <button onClick={() => window.location.reload()} style={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : (
          <>
            <div style={styles.hero}>
              <div>
                <p style={styles.eyebrow}>Admin Booking Details</p>
                <h1 style={styles.title}>{booking.booking_id}</h1>
                <p style={styles.subtitle}>
                  View the customer, booking window, pricing, room assignment, payment records, and dataset locks.
                </p>
              </div>
              <div style={styles.heroMeta}>
                <StatusPill
                  value={booking.status}
                  toneMap={{
                    CONFIRMED: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
                    PENDING: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
                    CANCELLED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
                    COMPLETED: { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" },
                    EXPIRED: { bg: "#e5e7eb", text: "#374151", border: "#d1d5db" },
                    default: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
                  }}
                />
                <StatusPill
                  value={booking.payment_status}
                  toneMap={{
                    SUCCESS: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
                    FAILED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
                    PENDING: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
                    REFUNDED: { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
                    default: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
                  }}
                />
              </div>
            </div>

            <div style={styles.summaryGrid}>
              {summaryCards.map(({ label, value, icon: Icon }) => (
                <div key={label} style={styles.summaryCard}>
                  <div style={styles.summaryIcon}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p style={styles.summaryLabel}>{label}</p>
                    <h3 style={styles.summaryValue}>{formatText(value)}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.layout}>
              <div style={styles.mainColumn}>
                <SectionCard
                  icon={User}
                  title="User Information"
                  subtitle="The account that created this booking"
                >
                  <div style={styles.infoGrid}>
                    <DetailRow label="Full Name" value={booking.user?.name} />
                    <DetailRow label="Email" value={booking.user?.email} />
                    <DetailRow label="Phone" value={booking.user?.phone} />
                    <DetailRow label="Company" value={booking.user?.company} />
                    <DetailRow label="User Role" value={booking.user?.role} />
                    <DetailRow label="Account Active" value={booking.user?.is_active ? "Yes" : "No"} />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={CalendarDays}
                  title="Booking Timeline"
                  subtitle="Schedule, duration, and access window"
                >
                  <div style={styles.infoGrid}>
                    <DetailRow label="Booking ID" value={booking.booking_id} mono />
                    <DetailRow label="Booking Type" value={booking.booking_type} />
                    <DetailRow label="Start Date & Time" value={formatDateTime(booking.start_datetime)} />
                    <DetailRow label="End Date & Time" value={formatDateTime(booking.end_datetime)} />
                    <DetailRow label="Duration (Minutes)" value={booking.duration_minutes} />
                    <DetailRow label="Working Days" value={booking.working_days} />
                    <DetailRow label="First Accessed At" value={formatDateTime(booking.first_accessed_at)} />
                    <DetailRow label="Access Suspended" value={booking.access_suspended ? "Yes" : "No"} />
                    <DetailRow label="Created At" value={formatDateTime(booking.created_at)} />
                    <DetailRow label="Updated At" value={formatDateTime(booking.updated_at)} />
                  </div>
                </SectionCard>

                <SectionCard
                  icon={CircleDollarSign}
                  title="Payment & Pricing"
                  subtitle="Total cost and latest payment status"
                >
                  <div style={styles.infoGrid}>
                    <DetailRow label="Room Price" value={formatCurrency(booking.room_price)} />
                    <DetailRow label="Data Price" value={formatCurrency(booking.data_price)} />
                    <DetailRow label="Working Day Surcharge" value={formatCurrency(booking.working_day_surcharge)} />
                    <DetailRow label="Discount Amount" value={formatCurrency(booking.discount_amount)} />
                    <DetailRow label="Total Price" value={formatCurrency(booking.total_price)} />
                    <DetailRow label="Payment Status" value={booking.payment_status} />
                    <DetailRow label="Payment ID" value={booking.payment_id} mono />
                    <DetailRow label="Latest Order ID" value={booking.latestPayment?.order_id} mono />
                    <DetailRow label="Latest Transaction Status" value={booking.latestPayment?.status} />
                    <DetailRow label="Latest Payment Amount" value={formatCurrency(booking.latestPayment?.amount)} />
                  </div>

                  <div style={styles.tableWrap}>
                    <h3 style={styles.tableTitle}>Payment History</h3>
                    {booking.payments?.length ? (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Order ID</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.payments.map((payment) => (
                            <tr key={payment.id} style={styles.tr}>
                              <td style={{ ...styles.td, ...styles.mono }}>{payment.order_id}</td>
                              <td style={styles.td}>{payment.status}</td>
                              <td style={styles.td}>{formatCurrency(payment.amount)}</td>
                              <td style={styles.td}>{formatDateTime(payment.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={styles.emptyText}>No payment records found for this booking.</p>
                    )}
                  </div>
                </SectionCard>
              </div>

              <div style={styles.sideColumn}>
                <SectionCard
                  icon={MapPin}
                  title="Room Information"
                  subtitle="Assigned room and room settings"
                >
                  <div style={styles.infoGrid}>
                    <DetailRow label="Room Title" value={booking.room?.title} />
                    <DetailRow label="Room ID" value={booking.room?.id} />
                    <DetailRow label="Room Type" value={booking.room?.room_type || booking.room_type} />
                    <DetailRow label="Capacity" value={booking.room?.capacity} />
                    <DetailRow label="License Type" value={booking.room?.license_type || booking.license_type} />
                    <DetailRow label="Room Active" value={booking.room?.is_active ? "Yes" : "No"} />
                  </div>
                  <p style={styles.descriptionText}>
                    {booking.room?.description || "No room description available."}
                  </p>
                </SectionCard>

                <SectionCard
                  icon={Database}
                  title="Dataset Access"
                  subtitle="Selected datasets and lock status"
                >
                  <div style={styles.infoGrid}>
                    <DetailRow label="Dataset Locked" value={booking.dataset_locked ? "Yes" : "No"} />
                    <DetailRow label="Block Name" value={booking.block_name} />
                    <DetailRow label="Data Category" value={booking.data_category} />
                    <DetailRow label="Data Subcategory" value={booking.data_subcategory} />
                  </div>

                  <div style={styles.badgeRow}>
                    {(booking.data_catalogue || []).length ? (
                      booking.data_catalogue.map((item) => (
                        <span key={item} style={styles.datasetBadge}>{item}</span>
                      ))
                    ) : (
                      <span style={styles.emptyText}>No datasets selected.</span>
                    )}
                  </div>

                  <p style={styles.descriptionText}>
                    {booking.data_requirements || "No additional data requirements provided."}
                  </p>

                  <div style={styles.tableWrap}>
                    <h3 style={styles.tableTitle}>Dataset Locks</h3>
                    {booking.datasetLocks?.length ? (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Dataset</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Locked At</th>
                            <th style={styles.th}>Expires At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.datasetLocks.map((lock) => (
                            <tr key={lock.id} style={styles.tr}>
                              <td style={{ ...styles.td, ...styles.mono }}>{lock.dataset_id}</td>
                              <td style={styles.td}>{lock.status}</td>
                              <td style={styles.td}>{formatDateTime(lock.locked_at)}</td>
                              <td style={styles.td}>{formatDateTime(lock.expires_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={styles.emptyText}>No dataset locks found for this booking.</p>
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  icon={IdCard}
                  title="Notes"
                  subtitle="Special instructions and weekend notice"
                >
                  <div style={styles.noteBox}>
                    <Clock3 size={16} />
                    <span>{booking.weekend_notice || "No weekend notice added."}</span>
                  </div>
                  <div style={styles.quickLinks}>
                    <Link to="/admin/managebookings" style={styles.linkCard}>
                      <FileText size={16} />
                      View all bookings
                    </Link>
                    <a href={`mailto:${booking.user?.email || ""}`} style={styles.linkCard}>
                      <Mail size={16} />
                      Contact user
                    </a>
                    <a href={booking.user?.phone ? `tel:${booking.user.phone}` : "#"} style={styles.linkCard}>
                      <Phone size={16} />
                      Call user
                    </a>
                  </div>
                </SectionCard>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
    padding: "28px",
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  topBar: {
    maxWidth: 1380,
    margin: "0 auto 18px",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "white",
    color: "#334155",
    border: "1px solid #dbe3f0",
    borderRadius: 12,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  stateCard: {
    maxWidth: 1380,
    margin: "0 auto",
    minHeight: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    background: "white",
    borderRadius: 24,
    border: "1px solid #dbe3f0",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
  },
  stateText: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#475569",
  },
  retryButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  spinner: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "4px solid #dbeafe",
    borderTopColor: "#2563eb",
    animation: "spin 1s linear infinite",
  },
  hero: {
    maxWidth: 1380,
    margin: "0 auto 24px",
    padding: "28px 30px",
    borderRadius: 28,
    background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #38bdf8 100%)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    boxShadow: "0 24px 80px rgba(37, 99, 235, 0.28)",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: "0 0 8px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 800,
    letterSpacing: -1,
  },
  subtitle: {
    margin: 0,
    maxWidth: 720,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.84)",
    fontSize: 15,
  },
  heroMeta: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  summaryGrid: {
    maxWidth: 1380,
    margin: "0 auto 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  summaryCard: {
    background: "rgba(255,255,255,0.86)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(219, 227, 240, 0.95)",
    borderRadius: 20,
    padding: "18px 20px",
    display: "flex",
    gap: 14,
    alignItems: "center",
    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.07)",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  summaryLabel: {
    margin: "0 0 6px",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#64748b",
  },
  summaryValue: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  layout: {
    maxWidth: 1380,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 1fr)",
    gap: 22,
    alignItems: "start",
  },
  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  sectionCard: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(219, 227, 240, 0.95)",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
  },
  sectionHeader: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    margin: "0 0 4px",
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  detailRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "14px 16px",
    borderRadius: 16,
    background: "#f8fbff",
    border: "1px solid #e2e8f0",
  },
  detailLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: 800,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  mono: {
    fontFamily: "'Fira Code', monospace",
    fontSize: 13,
  },
  tableWrap: {
    marginTop: 22,
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
    background: "white",
  },
  tableTitle: {
    margin: 0,
    padding: "16px 18px",
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #eef2f7",
  },
  td: {
    padding: "12px 16px",
    fontSize: 13,
    color: "#1e293b",
    verticalAlign: "top",
  },
  emptyText: {
    margin: 0,
    padding: "18px 16px",
    color: "#64748b",
    fontSize: 14,
  },
  descriptionText: {
    margin: "16px 0 0",
    padding: "14px 16px",
    borderRadius: 14,
    background: "#f8fbff",
    border: "1px solid #e2e8f0",
    fontSize: 14,
    lineHeight: 1.7,
    color: "#334155",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  datasetBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "#dbeafe",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
  },
  noteBox: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "14px 16px",
    borderRadius: 14,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: 14,
    lineHeight: 1.7,
  },
  quickLinks: {
    display: "grid",
    gap: 10,
    marginTop: 18,
  },
  linkCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "#0f172a",
    padding: "12px 14px",
    borderRadius: 14,
    background: "#f8fbff",
    border: "1px solid #e2e8f0",
    fontSize: 14,
    fontWeight: 700,
  },
};
