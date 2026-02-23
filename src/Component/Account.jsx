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

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.accountContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>My Account</h1>
            <p>Welcome back, {profile?.name}!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={styles.btnSecondary}
              onClick={() => navigate('/book-vdr')}
            >
              New Booking
            </button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <h2>Profile Information</h2>
        <div className={styles.profileGrid}>
          <div className={styles.profileItem}>
            <span className={styles.label}>Name:</span>
            <span className={styles.value}>{profile?.name}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{profile?.email}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Phone:</span>
            <span className={styles.value}>{profile?.phone || 'N/A'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Company:</span>
            <span className={styles.value}>{profile?.company || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "bookings" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "payments" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          Payment History ({payments.length})
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className={styles.tabContent}>
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p className={styles.emptyState}>No bookings found. Create your first booking!</p>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <h3>{booking.Room?.title || 'Room'}</h3>
                    <span className={`${styles.badge} ${styles[`badge${booking.status}`]}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.detailRow}>
                      <span>Booking ID:</span>
                      <strong>{booking.booking_id}</strong>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Type:</span>
                      <strong>{booking.booking_type}</strong>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Start:</span>
                      <strong>{new Date(booking.start_datetime).toLocaleString()}</strong>
                    </div>
                    <div className={styles.detailRow}>
                      <span>End:</span>
                      <strong>{new Date(booking.end_datetime).toLocaleString()}</strong>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Amount:</span>
                      <strong>₹{booking.total_price}</strong>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Payment:</span>
                      <span className={`${styles.paymentBadge} ${styles[`payment${booking.payment_status}`]}`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className={styles.tabContent}>
          <h2>Payment History</h2>
          {payments.length === 0 ? (
            <p className={styles.emptyState}>No payment records found.</p>
          ) : (
            <div className={styles.paymentsTable}>
              <table>
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
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.order_id}</td>
                      <td>{payment.Booking?.Room?.title || 'N/A'}</td>
                      <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td>₹{payment.amount}</td>
                      <td>{payment.payment_method || 'N/A'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${payment.status}`]}`}>
                          {payment.status}
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
  );
}