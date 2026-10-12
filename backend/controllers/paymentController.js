import sequelize from "../src/config/db.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Notification from "../models/Notification.js";
import { encrypt, decrypt } from "../utils/ccavenue.js";
import qs from "querystring";
import { Op } from "sequelize";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import { confirmBookingAfterPayment } from "./bookingController.js";
import { sendBookingPaymentConfirmation } from "../src/services/emailService.js";
import { getBookingDurationLabel } from "../utils/bookingDuration.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_PAYMENT_RETRIES = 3;

//  Use CCAVENUE_ENV=production to switch to live gateway; defaults to test
const CCAVENUE_URL =
  process.env.CCAVENUE_ENV === "production"
    ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
    : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

const frontendUrl = (path, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ).toString();
  return `${process.env.FRONTEND_URL}${path}${query ? `?${query}` : ""}`;
};

// A user cancelling on the gateway ("Aborted") is not a failed attempt and must
// not count towards the retry limit.
const countFailedAttempts = (bookingId, transaction) =>
  Payment.count({
    where: {
      booking_id: bookingId,
      status:     "FAILED",
      [Op.or]: [
        { transaction_status: { [Op.ne]: "Aborted" } },
        { transaction_status: null },
      ],
    },
    transaction,
  });

const notifyAdmin = (message, roomId) =>
  User.findOne({ where: { role: "ADMIN" } })
    .then((adminUser) => {
      if (!adminUser) return;
      return Notification.create({
        user_id:   adminUser.id,
        room_id:   roomId || null,
        message,
        type:      "PAYMENT",
        is_read:   false,
        is_active: true,
      });
    })
    .catch((e) => console.error("Admin notification error:", e));

// ─── INITIATE PAYMENT ─────────────────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const userId = req.user.id;

    if (typeof booking_id !== "string" || !booking_id || booking_id.length > 50) {
      return res.status(400).json({ success: false, message: "A valid booking_id is required" });
    }

    const booking = await Booking.findOne({
      where: { booking_id, user_id: userId },
      include: [{ model: Room, as: "room", attributes: ["title", "id"] }],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
    }

    //  Already paid guard
    if (booking.payment_status === "SUCCESS") {
      return res.status(400).json({ success: false, message: "This booking is already paid" });
    }

    //  Only an active, unpaid hold can be paid for
    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Booking is ${booking.status.toLowerCase()}. Please create a new booking.`,
      });
    }

    if (new Date(booking.start_datetime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This booking's start time has already passed. Please create a new booking.",
      });
    }

    //Check retry limit – don't allow payment if already failed too many times
    const failedAttempts = await countFailedAttempts(booking_id);

    if (failedAttempts >= MAX_PAYMENT_RETRIES) {
      return res.status(400).json({
        success: false,
        message: `Payment has failed ${failedAttempts} times. Please contact support.`,
      });
    }

    const user    = await User.findByPk(userId);
    // International numbers are stored as "+447911…"; the gateway wants digits only.
    const billingTel = String(user.phone || "").replace(/\D/g, "");
    // use server-computed amount – NEVER trust client-sent amount
    const amount  = parseFloat(booking.total_price);
    if (!(amount > 0)) {
      return res.status(400).json({
        success: false,
        message: "This booking has no payable amount. Please contact support.",
      });
    }
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
      amount:           amount.toFixed(2),   //Server-computed, not client
      redirect_url:     process.env.CCAVENUE_REDIRECT_URL,
      cancel_url:       process.env.CCAVENUE_CANCEL_URL,
      language:         "EN",
      billing_name:     user.name,
      billing_email:    user.email,
      billing_tel:      billingTel,
      billing_address:  user.company || "",
      billing_city:     "",
      billing_state:    "",
      billing_zip:      "",
      billing_country:  user.country || "India",
      delivery_name:    user.name,
      delivery_tel:     billingTel,
      merchant_param1:  booking_id,  // passed back in callback
      merchant_param2:  String(userId),
      // Store expected amount in merchant_param3 for callback verification
      merchant_param3:  amount.toFixed(2),
    };

    const encryptedData = encrypt(qs.stringify(params), process.env.CCAVENUE_WORKING_KEY);

    res.json({
      success:     true,
      encRequest:  encryptedData,
      accessCode:  process.env.CCAVENUE_ACCESS_CODE,
      paymentUrl:  CCAVENUE_URL,   // Auto-switches prod/sandbox
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ success: false, message: "Payment initiation failed" });
  }
};

// ─── PAYMENT CALLBACK ─────────────────────────────────────────────────────────
export const paymentResponse = async (req, res) => {
  // Wrap in DB transaction – payment record + booking update + dataset lock = atomic
  const t = await sequelize.transaction();

  try {
    const encryptedResponse = req.body.encResp;
    if (!encryptedResponse) {
      await t.rollback();
      return res.redirect(frontendUrl("/payment-failure", { error: "no_response" }));
    }

    const decrypted    = decrypt(encryptedResponse, process.env.CCAVENUE_WORKING_KEY);
    const responseData = qs.parse(decrypted);
    const orderId      = responseData.order_id;

    // Duplicate callback protection – check if this order was already processed
    const existingPayment = await Payment.findOne({
      where: { order_id: orderId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!existingPayment) {
      await t.rollback();
      console.error("Payment record not found:", orderId);
      return res.redirect(frontendUrl("/payment-failure", { error: "payment_not_found" }));
    }

    // Booking and amount come from our own payment record – never from fields
    // echoed back by the gateway.
    const bookingId = existingPayment.booking_id;

    // Idempotency – already processed, redirect safely
    if (existingPayment.status === "SUCCESS") {
      await t.rollback();
      return res.redirect(frontendUrl("/payment-success", { booking_id: bookingId, order_id: orderId }));
    }

    if (responseData.merchant_param1 && responseData.merchant_param1 !== bookingId) {
      await t.rollback();
      console.error(
        `[SECURITY] Booking mismatch on order ${orderId}: ` +
        `stored ${bookingId}, gateway reported ${responseData.merchant_param1}`
      );
      return res.redirect(frontendUrl("/payment-failure", { error: "booking_mismatch" }));
    }

    // Amount verification – compare server-stored vs gateway-reported amount
    const expectedAmount = parseFloat(existingPayment.amount);
    const reportedAmount = parseFloat(responseData.amount);

    if (!Number.isFinite(reportedAmount) || Math.abs(expectedAmount - reportedAmount) > 0.01) {
      await t.rollback();
      console.error(
        `[SECURITY] Amount mismatch on booking ${bookingId}: ` +
        `expected ₹${expectedAmount}, received ₹${responseData.amount}`
      );
      return res.redirect(frontendUrl("/payment-failure", { error: "amount_mismatch" }));
    }

    // ─── SUCCESS ──────────────────────────────────────────────────────────────
    if (responseData.order_status === "Success") {
      const trackingId = responseData.tracking_id || orderId;

      existingPayment.status             = "SUCCESS";
      existingPayment.transaction_status = responseData.order_status;
      existingPayment.payment_method     = responseData.payment_mode || "CCAvenue";
      existingPayment.ccavenue_response  = decrypted;

      // Confirm booking + lock datasets (single atomic operation)
      let confirmation = null;
      try {
        confirmation = await confirmBookingAfterPayment(bookingId, t);
      } catch (err) {
        if (err.code !== "SLOT_UNAVAILABLE") throw err;
      }

      // Money was taken but can't be applied: either the hold expired and the
      // slot is gone, or another order already paid for this booking.
      if (!confirmation || confirmation.alreadyPaid) {
        existingPayment.transaction_status = "Success - REFUND REQUIRED";
        await existingPayment.save({ transaction: t });

        if (!confirmation) {
          await Booking.update(
            { payment_status: "SUCCESS", payment_id: trackingId },
            { where: { booking_id: bookingId }, transaction: t }
          );
        }
        await t.commit();

        const booking = await Booking.findOne({ where: { booking_id: bookingId }, attributes: ["room_id"] });
        const reason = confirmation
          ? "duplicate payment – booking was already paid"
          : "slot no longer available – booking hold had expired";
        notifyAdmin(
          `REFUND REQUIRED: order ${orderId} (tracking ${trackingId}) for booking ${bookingId}, ` +
          `₹${expectedAmount.toLocaleString("en-IN")} – ${reason}.`,
          booking?.room_id
        );
        console.error(`[Payment] Refund required for order ${orderId}: ${reason}`);

        if (confirmation) {
          return res.redirect(frontendUrl("/payment-success", {
            booking_id: bookingId, order_id: orderId, duplicate: "1",
          }));
        }
        return res.redirect(frontendUrl("/payment-failure", {
          booking_id: bookingId,
          order_id:   orderId,
          reason:     "The selected slot is no longer available. Your payment will be refunded.",
          can_retry:  "false",
          refund:     "1",
        }));
      }

      await existingPayment.save({ transaction: t });

      // Update payment_id and sync payment_status on booking
      await Booking.update(
        {
          payment_id:     trackingId,
          payment_status: "SUCCESS",
        },
        { where: { booking_id: bookingId }, transaction: t }
      );

      await t.commit();

      // Generate invoice (non-critical – outside transaction)
      const fullBooking = await Booking.findOne({
        where:   { booking_id: bookingId },
        include: [
          { model: User, as: "user", attributes: ["id", "name", "email", "phone", "company"] },
          { model: Room, as: "room", attributes: ["id", "title", "description"] },
        ],
      });

      generateInvoicePDF({
        booking: fullBooking.toJSON(),
        user:    fullBooking.user.toJSON(),
        room:    fullBooking.room.toJSON(),
        payment: {
          order_id:     orderId,
          tracking_id:  responseData.tracking_id,
          payment_mode: responseData.payment_mode,
          trans_date:   responseData.trans_date,
        },
      }).catch((e) => console.error("Invoice generation failed:", e));

      const durationLabel = getBookingDurationLabel(
        fullBooking.booking_type,
        fullBooking.duration_minutes
      );
      sendBookingPaymentConfirmation({
        email: fullBooking.user.email,
        name: fullBooking.user.name,
        bookingId,
        room: fullBooking.room.title,
        startDate: new Date(fullBooking.start_datetime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        endDate: new Date(fullBooking.end_datetime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        durationLabel,
        totalPrice: fullBooking.total_price,
      }).catch((e) => console.error("Payment confirmation email failed:", e));

      // Notify admin of completed booking for review
      const dateOpts  = { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
      const startDate = new Date(fullBooking.start_datetime).toLocaleString("en-IN", dateOpts);
      const endDate   = new Date(fullBooking.end_datetime).toLocaleString("en-IN", dateOpts);
      notifyAdmin(
        `New booking completed: ${bookingId} by ${fullBooking.user.name} (${fullBooking.user.email}) for ${fullBooking.room.title} (${startDate} – ${endDate}). Amount paid: ₹${Number(fullBooking.total_price).toLocaleString("en-IN")}.`,
        fullBooking.room_id
      );

      return res.redirect(frontendUrl("/payment-success", { booking_id: bookingId, order_id: orderId }));
    }

    // ─── FAILURE / ABORTED ───────────────────────────────────────────────────
    existingPayment.status             = "FAILED";
    existingPayment.transaction_status = responseData.order_status;
    existingPayment.ccavenue_response  = decrypted;
    await existingPayment.save({ transaction: t });

    //Count real failures for this booking (user aborts don't count)
    const failCount = await countFailedAttempts(bookingId, t);

    const booking = await Booking.findOne({
      where: { booking_id: bookingId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    let canRetry = false;
    let retriesExhausted = false;

    // Never downgrade a booking that another order has already paid for
    if (booking && booking.payment_status !== "SUCCESS") {
      if (failCount >= MAX_PAYMENT_RETRIES) {
        // Cancel only after max retries – not on first failure
        booking.status = booking.status === "PENDING" ? "CANCELLED" : booking.status;
        booking.payment_status = "FAILED";
        retriesExhausted = true;
        console.log(`Booking ${bookingId} cancelled after ${failCount} failed payment attempts.`);
      } else {
        // Keep PENDING – allow retry while the hold is still active
        booking.payment_status = "FAILED";
        canRetry = booking.status === "PENDING";
        console.log(`Booking ${bookingId} payment ${responseData.order_status} (failures ${failCount}/${MAX_PAYMENT_RETRIES}).`);
      }
      await booking.save({ transaction: t });
    }

    await t.commit();

    return res.redirect(frontendUrl("/payment-failure", {
      booking_id: bookingId,
      order_id:   orderId,
      reason:     responseData.order_status === "Aborted"
        ? "Payment was cancelled"
        : responseData.failure_message || "Payment failed",
      can_retry:  String(canRetry),
      retries_exhausted: retriesExhausted ? "1" : undefined,
    }));
  } catch (error) {
    await t.rollback();
    console.error("Payment callback error:", error);
    return res.redirect(frontendUrl("/payment-failure", { error: "callback_exception" }));
  }
};

// ─── RETRY PAYMENT ────────────────────────────────────────────────────────────
// NEW – explicit retry endpoint; same logic as initiate
export const retryPayment = async (req, res) => {
  return initiatePayment(req, res);
};
