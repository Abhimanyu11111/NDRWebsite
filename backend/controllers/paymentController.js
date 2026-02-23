import sequelize from "../src/config/db.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Room from "../models/room.js";
import { encrypt, decrypt } from "../utils/ccavenue.js";
import qs from "querystring";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import { confirmBookingAfterPayment } from "./bookingController.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_PAYMENT_RETRIES = 3;

// ✅ Production vs sandbox gateway URL
const CCAVENUE_URL =
  process.env.NODE_ENV === "production"
    ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
    : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

// ─── INITIATE PAYMENT ─────────────────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { booking_id, user_id: userId },
      include: [{ model: Room, attributes: ["title", "id"] }],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
    }

    // ✅ Already paid guard
    if (booking.payment_status === "SUCCESS") {
      return res.status(400).json({ success: false, message: "This booking is already paid" });
    }

    // ✅ Cannot pay for cancelled/expired booking
    if (["CANCELLED", "COMPLETED", "EXPIRED"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is ${booking.status}. Payment not allowed.`,
      });
    }

    // ✅ Check retry limit – don't allow payment if already failed too many times
    const failedAttempts = await Payment.count({
      where: { booking_id, status: "FAILED" },
    });

    if (failedAttempts >= MAX_PAYMENT_RETRIES) {
      return res.status(400).json({
        success: false,
        message: `Payment has failed ${failedAttempts} times. Please contact support.`,
      });
    }

    const user    = await User.findByPk(userId);
    // ✅ Use server-computed amount – NEVER trust client-sent amount
    const amount  = parseFloat(booking.total_price);
    const orderId = `ORD_${Date.now()}_${booking_id}`;

    await Payment.create({
      order_id:   orderId,
      booking_id,
      user_id:    userId,
      amount,
      currency:   "INR",
      status:     "INITIATED",
    });

    const params = {
      merchant_id:      process.env.CCAVENUE_MERCHANT_ID,
      order_id:         orderId,
      currency:         "INR",
      amount:           amount.toFixed(2),   // ✅ Server-computed, not client
      redirect_url:     process.env.CCAVENUE_REDIRECT_URL,
      cancel_url:       process.env.CCAVENUE_CANCEL_URL,
      language:         "EN",
      billing_name:     user.name,
      billing_email:    user.email,
      billing_tel:      user.phone || "",
      billing_address:  user.company || "",
      billing_city:     "",
      billing_state:    "",
      billing_zip:      "",
      billing_country:  "India",
      delivery_name:    user.name,
      delivery_tel:     user.phone || "",
      merchant_param1:  booking_id,  // passed back in callback
      merchant_param2:  String(userId),
      // ✅ Store expected amount in merchant_param3 for callback verification
      merchant_param3:  amount.toFixed(2),
    };

    const encryptedData = encrypt(qs.stringify(params), process.env.CCAVENUE_WORKING_KEY);

    res.json({
      success:     true,
      encRequest:  encryptedData,
      accessCode:  process.env.CCAVENUE_ACCESS_CODE,
      paymentUrl:  CCAVENUE_URL,   // ✅ Auto-switches prod/sandbox
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ success: false, message: "Payment initiation failed", error: error.message });
  }
};

// ─── PAYMENT CALLBACK ─────────────────────────────────────────────────────────
export const paymentResponse = async (req, res) => {
  // ✅ Wrap in DB transaction – payment record + booking update + dataset lock = atomic
  const t = await sequelize.transaction();

  try {
    const encryptedResponse = req.body.encResp;
    if (!encryptedResponse) {
      await t.rollback();
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?error=no_response`);
    }

    const decrypted    = decrypt(encryptedResponse, process.env.CCAVENUE_WORKING_KEY);
    const responseData = qs.parse(decrypted);

    // ✅ Duplicate callback protection – check if this order was already processed
    const existingPayment = await Payment.findOne({
      where: { order_id: responseData.order_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!existingPayment) {
      await t.rollback();
      console.error("Payment record not found:", responseData.order_id);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?error=payment_not_found`);
    }

    // ✅ Idempotency – already processed, redirect safely
    if (existingPayment.status === "SUCCESS") {
      await t.rollback();
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?booking_id=${existingPayment.booking_id}&order_id=${responseData.order_id}`
      );
    }

    const bookingId = responseData.merchant_param1 || existingPayment.booking_id;

    // ✅ Amount verification – compare server-stored vs gateway-reported amount
    const expectedAmount = parseFloat(responseData.merchant_param3 || 0);
    const reportedAmount = parseFloat(responseData.amount || 0);

    if (expectedAmount > 0 && Math.abs(expectedAmount - reportedAmount) > 0.01) {
      await t.rollback();
      console.error(
        `[SECURITY] Amount mismatch on booking ${bookingId}: ` +
        `expected ₹${expectedAmount}, received ₹${reportedAmount}`
      );
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?error=amount_mismatch`);
    }

    // ─── SUCCESS ──────────────────────────────────────────────────────────────
    if (responseData.order_status === "Success") {
      existingPayment.status             = "SUCCESS";
      existingPayment.transaction_status = responseData.order_status;
      existingPayment.payment_method     = responseData.payment_mode || "CCAvenue";
      existingPayment.ccavenue_response  = decrypted;
      await existingPayment.save({ transaction: t });

      // ✅ Confirm booking + lock datasets (single atomic operation)
      const booking = await confirmBookingAfterPayment(bookingId, t);

      // Update payment_id on booking
      await Booking.update(
        { payment_id: responseData.tracking_id || responseData.order_id },
        { where: { booking_id: bookingId }, transaction: t }
      );

      await t.commit();

      // Generate invoice (non-critical – outside transaction)
      const fullBooking = await Booking.findOne({
        where:   { booking_id: bookingId },
        include: [
          { model: User, attributes: ["id", "name", "email", "phone", "company"] },
          { model: Room, attributes: ["id", "title", "description"] },
        ],
      });

      generateInvoicePDF({
        booking: fullBooking.toJSON(),
        user:    fullBooking.user.toJSON(),
        room:    fullBooking.room.toJSON(),
        payment: {
          order_id:     responseData.order_id,
          tracking_id:  responseData.tracking_id,
          payment_mode: responseData.payment_mode,
          trans_date:   responseData.trans_date,
        },
      }).catch((e) => console.error("Invoice generation failed:", e));

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success?booking_id=${bookingId}&order_id=${responseData.order_id}`
      );
    }

    // ─── FAILURE ─────────────────────────────────────────────────────────────
    existingPayment.status             = "FAILED";
    existingPayment.transaction_status = responseData.order_status;
    existingPayment.ccavenue_response  = decrypted;
    await existingPayment.save({ transaction: t });

    // ✅ Count total failures for this booking
    const failCount = await Payment.count({
      where: { booking_id: bookingId, status: "FAILED" },
      transaction: t,
    });

    if (failCount >= MAX_PAYMENT_RETRIES) {
      // ✅ Cancel only after max retries – not on first failure
      await Booking.update(
        { status: "CANCELLED", payment_status: "FAILED" },
        { where: { booking_id: bookingId }, transaction: t }
      );
      console.log(`Booking ${bookingId} cancelled after ${failCount} failed payment attempts.`);
    } else {
      // ✅ Keep PENDING – allow retry
      await Booking.update(
        { payment_status: "FAILED" },
        { where: { booking_id: bookingId }, transaction: t }
      );
      console.log(`Booking ${bookingId} payment failed (attempt ${failCount}/${MAX_PAYMENT_RETRIES}). Retry allowed.`);
    }

    await t.commit();

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-failure?booking_id=${bookingId}` +
      `&order_id=${responseData.order_id}` +
      `&reason=${encodeURIComponent(responseData.failure_message || "Payment failed")}` +
      `&can_retry=${failCount < MAX_PAYMENT_RETRIES}`
    );
  } catch (error) {
    await t.rollback();
    console.error("Payment callback error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?error=callback_exception`);
  }
};

// ─── RETRY PAYMENT ────────────────────────────────────────────────────────────
// ✅ NEW – explicit retry endpoint; same logic as initiate
export const retryPayment = async (req, res) => {
  return initiatePayment(req, res);
};