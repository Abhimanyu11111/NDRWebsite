import { useState } from "react";
import { initiatePayment } from "../api/payment";

const Checkout = ({ bookingId, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await initiatePayment(bookingId, amount);

      // CCAvenue requires a POST form submission with encRequest + access_code
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.paymentUrl;

      const encReqField = document.createElement("input");
      encReqField.type = "hidden";
      encReqField.name = "encRequest";
      encReqField.value = res.encRequest;
      form.appendChild(encReqField);

      const accessCodeField = document.createElement("input");
      accessCodeField.type = "hidden";
      accessCodeField.name = "access_code";
      accessCodeField.value = res.accessCode;
      form.appendChild(accessCodeField);

      document.body.appendChild(form);
      form.submit();
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
