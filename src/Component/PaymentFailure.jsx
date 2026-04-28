import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Styles/PaymentResult.module.css";

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const orderId   = searchParams.get("order_id");
  const reason    = searchParams.get("reason");
  const canRetry  = searchParams.get("can_retry") !== "false"; // default true unless explicitly "false"

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconFailure}>✕</div>
        <h1 className={styles.title}>Payment Failed</h1>
        <p className={styles.message}>
          {canRetry
            ? "Unfortunately, your payment could not be processed. Please try again or contact support if the issue persists."
            : "Your payment has failed 3 times. This booking has been cancelled. Please create a new booking or contact support."}
        </p>

        {reason && (
          <p className={styles.reasonText}>Reason: {reason}</p>
        )}

        {bookingId && (
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span>Booking ID:</span>
              <strong>{bookingId}</strong>
            </div>
            {orderId && (
              <div className={styles.detailRow}>
                <span>Order ID:</span>
                <strong>{orderId}</strong>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {canRetry && (
            <button
              className={styles.btnPrimary}
              onClick={() => navigate("/account")}
            >
              Retry Payment
            </button>
          )}
          <button
            className={styles.btnSecondary}
            onClick={() => navigate("/account")}
          >
            Go to My Account
          </button>
        </div>
      </div>
    </div>
  );
}