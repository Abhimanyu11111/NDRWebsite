import axios from "./axiosClient";

/** Posts the encrypted request to CCAvenue (navigates away from the app). */
export const submitToCcavenue = ({ paymentUrl, encRequest, accessCode }) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;

  const fields = { encRequest, access_code: accessCode };
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

/** Starts (or retries) payment for an existing PENDING booking. Throws on failure. */
export const startPayment = async (bookingId) => {
  const res = await axios.post("/payment/initiate", { booking_id: bookingId });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Payment could not be started. Please try again.");
  }
  submitToCcavenue(res.data);
};
