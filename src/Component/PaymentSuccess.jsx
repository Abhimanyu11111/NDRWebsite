import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Styles/PaymentResult.module.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconSuccess}>✓</div>
        <h1 className={styles.title}>Payment Successful!</h1>
        <p className={styles.message}>
          Your booking has been confirmed successfully. We will get back to you with the room access details shortly.
        </p>
        
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Booking ID:</span>
            <strong>{bookingId}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Order ID:</span>
            <strong>{orderId}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.btnPrimary}
            onClick={() => navigate('/account')}
          >
            View My Bookings
          </button>
          <button 
            className={styles.btnSecondary}
            onClick={() => navigate('/book-vdr')}
          >
            Make Another Booking
          </button>
        </div>
      </div>
    </div>
  );
}