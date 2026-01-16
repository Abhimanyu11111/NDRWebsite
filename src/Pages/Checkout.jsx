import { useState } from "react";
import { initiatePayment } from "../api/payment";

const Checkout = ({ bookingId, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await initiatePayment(bookingId, amount);
      
      // Redirect to CCAvenue
      window.location.href = res.paymentUrl;

    } catch (err) {
      alert("Payment start failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? "Redirecting..." : "Pay Now"}
    </button>
  );
};

export default Checkout;
