import axios from "./axiosClient";

export const initiatePayment = async (bookingId, amount) => {
  const res = await axios.post("/payment/initiate", {
    bookingId,
    amount
  });
  return res.data;
};
