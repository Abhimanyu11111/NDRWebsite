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
      const [profileRes, bookingsRes, paymentsRes] = await Promise.allSettled([
        axios.get("/user/profile"),
        axios.get("/user/bookings"),
        axios.get("/user/payments"),
      ]);

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data.user);
      } else {
        console.error("Profile fetch failed:", profileRes.reason);
      }

      if (bookingsRes.status === "fulfilled") {
        setBookings(bookingsRes.value.data.bookings);
      } else {
        console.error("Bookings fetch failed:", bookingsRes.reason);
      }

      if (paymentsRes.status === "fulfilled") {
        setPayments(paymentsRes.value.data.payments);
      } else {
        console.error("Payments fetch failed:", paymentsRes.reason);
      }
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

  const handlePayNow = async (bookingId) => {
    try {
      const paymentRes = await axios.post("/payment/initiate", { booking_id: bookingId });
      if (paymentRes.data.success) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paymentRes.data.paymentUrl;
        const enc = document.createElement("input");
        enc.type = "hidden"; enc.name = "encRequest"; enc.value = paymentRes.data.encRequest;
        form.appendChild(enc);
        const ac = document.createElement("input");
        ac.type = "hidden"; ac.name = "access_code"; ac.value = paymentRes.data.accessCode;
        form.appendChild(ac);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
    }
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
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div>
              <h1>My Account</h1>
              <p>Welcome back, <strong>{profile?.name}</strong></p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnNewBooking}
              onClick={() => navigate("/book-vdr")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px'}}>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8v-2h2V9h2v2h2v2h-2v4z"/>
              </svg>
              New Booking
            </button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px'}}>
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
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
            Booking Records ({bookings.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "payments" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payment History ({payments.length})
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
                      <th>No. of Days</th>
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
                        <td className={styles.centerCell}>
                          {b.working_days != null
                            ? String(b.working_days).padStart(2, "0")
                            : "—"}
                        </td>
                        <td className={styles.amountCell}>$ {Number(b.total_price).toFixed(2)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles["pay" + b.payment_status]}`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td>
                          {b.status === "CONFIRMED" && b.payment_status === "PENDING" ? (
                            <button
                              className={styles.btnConfirm}
                              onClick={() => handlePayNow(b.booking_id)}
                            >
                              CONFIRM
                            </button>
                          ) : (
                            <span className={`${styles.badge} ${styles["status" + b.status]}`}>
                              {b.status}
                            </span>
                          )}
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
                        <td className={styles.amountCell}>$ {Number(p.amount).toFixed(2)}</td>
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
