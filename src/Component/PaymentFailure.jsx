import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { startPayment } from "../api/ccavenue";
import styles from "./Styles/PaymentResult.module.css";

const ERROR_MESSAGES = {
  no_response:       "We did not receive a response from the payment gateway.",
  payment_not_found: "We could not find this payment. Please contact support.",
  booking_mismatch:  "The payment details did not match your booking. Please contact support.",
  amount_mismatch:   "The paid amount did not match your booking. Please contact support.",
  callback_exception: "Something went wrong while confirming your payment. Please contact support before paying again.",
};

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const orderId   = searchParams.get("order_id");
  const reason    = searchParams.get("reason");
  const errorCode = searchParams.get("error");
  const retriesExhausted = searchParams.get("retries_exhausted") === "1";
  const refundPending    = searchParams.get("refund") === "1";
  // Retry only when the server explicitly says the booking is still payable
  const canRetry  = !!bookingId && searchParams.get("can_retry") === "true";

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError("");
    try {
      await startPayment(bookingId);
      // Browser is navigating to the gateway
    } catch (err) {
      setRetryError(err.response?.data?.message || err.message || "Could not restart payment.");
      setRetrying(false);
    }
  };

  let message;
  if (refundPending) {
    message = "Your payment was received, but the selected slot was no longer available. The amount will be refunded to you.";
  } else if (retriesExhausted) {
    message = "Your payment has failed 3 times. This booking has been cancelled. Please create a new booking or contact support.";
  } else if (canRetry) {
    message = "Unfortunately, your payment could not be processed. Your slot is held for a short time – please try again.";
  } else if (errorCode) {
    message = ERROR_MESSAGES[errorCode] || "Your payment could not be processed. Please contact support.";
  } else {
    message = "This booking is no longer active. Please create a new booking.";
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconFailure}>✕</div>
        <h1 className={styles.title}>{refundPending ? "Booking Not Completed" : "Payment Failed"}</h1>
        <p className={styles.message}>{message}</p>

        {reason && !refundPending && (
          <p className={styles.reasonText}>Reason: {reason}</p>
        )}
        {retryError && <p className={styles.reasonText}>{retryError}</p>}

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
          {canRetry ? (
            <button
              className={styles.btnPrimary}
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? "Redirecting..." : "Retry Payment"}
            </button>
          ) : (
            <button
              className={styles.btnPrimary}
              onClick={() => navigate("/book-vdr")}
            >
              Make a New Booking
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
