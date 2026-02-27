import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosClient";
import styles from "./Styles/Account.module.css";

export default function Account() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [profileRes, bookingsRes, paymentsRes] = await Promise.all([
        axios.get("/user/profile"),
        axios.get("/user/bookings"),
        axios.get("/user/payments"),
      ]);
      setProfile(profileRes.data.user);
      setBookings(bookingsRes.data.bookings);
      setPayments(paymentsRes.data.payments);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (dt) =>
    new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const formatDateShort = (dt) =>
    new Date(dt).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const bookingTypeLabel = (type) => {
    const map = {
      FULL_DAY: "24 Hours",
      MULTI_DAY: "Multiple Days",
      ONE_WEEK: "1 Week",
      HOURLY: "Hourly",
      HALF_HOUR: "30 Minutes",
    };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading your account details...</p>
      </div>
    );
  }

  return (
    <div className={styles.accountContainer}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>My Account</h1>
            <p>Welcome back, <strong>{profile?.name}</strong></p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnSecondary}
              onClick={() => navigate("/book-vdr")}
            >
              New Booking
            </button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className={styles.pageBody}>

        {/* ── PROFILE CARD ── */}
        <div className={styles.profileCard}>
          <div className={styles.profileCardTitle}>Profile Information</div>
          <div className={styles.profileGrid}>
            {[
              { label: "Full Name",     value: profile?.name },
              { label: "Email Address", value: profile?.email },
              { label: "Phone Number",  value: profile?.phone   || "N/A" },
              { label: "Organisation",  value: profile?.company || "N/A" },
            ].map(({ label, value }) => (
              <div className={styles.profileItem} key={label}>
                <span className={styles.profileLabel}>{label}</span>
                <span className={styles.profileValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === "bookings" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            Booking Records
            <span className={styles.tabCount}>{bookings.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "payments" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payment History
            <span className={styles.tabCount}>{payments.length}</span>
          </button>
        </div>

        {/* ── BOOKINGS TAB ── */}
        {activeTab === "bookings" && (
          <div className={styles.tabContent}>
            {bookings.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No booking records found.</p>
                <button
                  className={styles.btnPrimary}
                  onClick={() => navigate("/book-vdr")}
                >
                  Create First Booking
                </button>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className={styles.monoCell}>{b.booking_id}</td>
                        <td>{b.Room?.title || "—"}</td>
                        <td>{bookingTypeLabel(b.booking_type)}</td>
                        <td>{formatDate(b.start_datetime)}</td>
                        <td>{formatDate(b.end_datetime)}</td>
                        <td className={styles.amountCell}>&#8377;{b.total_price}</td>
                        <td>
                          <span className={`${styles.badge} ${styles["pay" + b.payment_status]}`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles["status" + b.status]}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === "payments" && (
          <div className={styles.tabContent}>
            {payments.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No payment records found.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Room</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className={styles.monoCell}>{p.order_id}</td>
                        <td>{p.Booking?.Room?.title || "—"}</td>
                        <td>{formatDateShort(p.created_at)}</td>
                        <td className={styles.amountCell}>&#8377;{p.amount}</td>
                        <td>{p.payment_method || "—"}</td>
                        <td>
                          <span className={`${styles.badge} ${styles["status" + p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}