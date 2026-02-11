import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { encrypt, decrypt } from "../utils/ccavenue.js";
import qs from "querystring";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import User from "../models/User.js";
import Room from "../models/room.js";


export const initiatePayment = async (req, res) => {
  const { bookingId, amount } = req.body;

  const orderId = "ORD_" + Date.now();

  await Payment.create({
    order_id: orderId,
    booking_id: bookingId,
    user_id: req.user.id,
    amount,
    status: "INITIATED",
  });

  const params = {
    merchant_id: process.env.CCAVENUE_MERCHANT_ID,
    order_id: orderId,
    currency: "INR",
    amount,
    redirect_url: process.env.CCAVENUE_REDIRECT_URL,
    cancel_url: process.env.CCAVENUE_CANCEL_URL,
    language: "EN",
  };

  const encryptedData = encrypt(
    qs.stringify(params),
    process.env.CCAVENUE_WORKING_KEY
  );

  res.json({
    encRequest: encryptedData,
    accessCode: process.env.CCAVENUE_ACCESS_CODE,
    paymentUrl:
      "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  });
};

export const paymentResponse = async (req, res) => {
  const encryptedResponse = req.body.encResp;

  const decrypted = decrypt(
    encryptedResponse,
    process.env.CCAVENUE_WORKING_KEY
  );

  const responseData = qs.parse(decrypted);

  const payment = await Payment.findOne({
    where: { order_id: responseData.order_id },
  });

  if (responseData.order_status === "Success") {
    payment.status = "SUCCESS";

    const booking = await Booking.findOne({
      where: { booking_id: payment.booking_id },
    });

    const user = await User.findByPk(booking.user_id);
    const room = await Room.findByPk(booking.room_id);

    await generateInvoicePDF({ booking, user, room });

    await Booking.update(
      { status: "CONFIRMED" },
      { where: { booking_id: payment.booking_id } }
    );
  } else {
    payment.status = "FAILED";

    await Booking.update(
      { status: "CANCELLED" },
      { where: { booking_id: payment.booking_id } }
    );
  }

  payment.ccavenue_response = decrypted;
  await payment.save();

  res.redirect(
    `${process.env.FRONTEND_URL}/payment-status?status=${payment.status}`
  );
};