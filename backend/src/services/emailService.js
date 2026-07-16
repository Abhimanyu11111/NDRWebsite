import nodemailer from "nodemailer";
import "../config/env.js";

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
const smtpRequireTls = String(process.env.SMTP_REQUIRE_TLS || "").toLowerCase() === "true";
const mailFromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
const mailFromName = String(process.env.SMTP_FROM_NAME || "National Data Repository").replace(/["\r\n]/g, "");
const mailFrom = String(mailFromAddress || "").includes("<")
  ? mailFromAddress
  : `"${mailFromName}" <${mailFromAddress}>`;
const mailReplyTo = process.env.SMTP_REPLY_TO || mailFromAddress;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpRequireTls,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const isSmtpConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD);

const sendMail = async (mailOptions, successMessage, errorMessage) => {
  if (!isSmtpConfigured()) {
    console.warn("SMTP email not sent: SMTP_USER and SMTP_PASSWORD are not configured.");
    return false;
  }

  try {
    await transporter.sendMail({ replyTo: mailReplyTo, ...mailOptions });
    console.log(successMessage);
    return true;
  } catch (error) {
    console.error(errorMessage, error);
    return false;
  }
};

const escapeHtml = (value) => String(value || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const sendPasswordResetEmail = async ({ email, name, resetUrl, expiresMinutes }) => {
  const safeName = escapeHtml(name || "User");
  const safeResetUrl = escapeHtml(resetUrl);
  const textName = String(name || "User").replace(/[\r\n]/g, " ");

  return sendMail(
    {
      from: mailFrom,
      to: email,
      subject: "Reset your NDR account password",
      text: `Dear ${textName},\n\nWe received a request to reset your National Data Repository account password.\n\nReset your password: ${resetUrl}\n\nThis link expires in ${Number(expiresMinutes)} minutes and can be used only once. If you did not request this change, ignore this email.\n\nRegards,\nNDR Support Team`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#172033;line-height:1.6">
          <h2 style="color:#1858a5">Password reset request</h2>
          <p>Dear ${safeName},</p>
          <p>We received a request to reset your National Data Repository account password.</p>
          <p style="margin:28px 0">
            <a href="${safeResetUrl}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#1858a5;color:#fff;text-decoration:none;font-weight:700">Reset password</a>
          </p>
          <p>This secure link expires in ${Number(expiresMinutes)} minutes and can be used only once.</p>
          <p>If you did not request this change, you can safely ignore this email. Your existing password will continue to work.</p>
          <p style="color:#6f7d90;font-size:13px">For security, do not forward this email or share the reset link.</p>
          <p>Regards,<br/>NDR Support Team</p>
        </div>
      `,
    },
    `Password reset email sent to ${email}`,
    "Error sending password reset email:"
  );
};

const sendRegistrationOtpEmail = async ({ email, otp, expiresMinutes }) => {
  const safeOtp = escapeHtml(otp);

  return sendMail(
    {
      from: mailFrom,
      to: email,
      subject: "Verify your email for NDR registration",
      text: `Your NDR registration verification code is ${otp}. This code expires in ${Number(expiresMinutes)} minutes and can be used only once. Do not share this code with anyone.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#172033;line-height:1.6">
          <h2 style="color:#1858a5">Verify your email address</h2>
          <p>Use the following one-time verification code to continue your National Data Repository registration:</p>
          <div style="margin:24px 0;padding:18px;text-align:center;border:1px solid #cbd9ec;border-radius:10px;background:#f5f9ff">
            <span style="font-size:30px;font-weight:700;letter-spacing:8px;color:#173f77">${safeOtp}</span>
          </div>
          <p>This code expires in <strong>${Number(expiresMinutes)} minutes</strong> and can be used only once.</p>
          <p>If you did not request this code, ignore this email.</p>
          <p style="color:#6f7d90;font-size:13px">For security, never share this code with anyone, including NDR support staff.</p>
          <p>Regards,<br/>NDR Support Team</p>
        </div>
      `,
    },
    `Registration OTP email sent to ${email}`,
    "Error sending registration OTP email:"
  );
};

/**
 * Send booking confirmation email
 * @param {Object} data - { email, name, bookingId, room, startDate, endDate, durationLabel, totalPrice }
 */
const sendBookingConfirmation = async (data) => {
  const { email, name, bookingId, room, startDate, endDate, durationLabel, totalPrice } = data;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Booking Created - Payment Required - ${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">Booking Created</h2>
        <p>Dear ${name},</p>
        <p>Your VDR booking has been created. Please complete payment within 15 minutes to confirm it.</p>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Room:</strong> ${room}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>End Date:</strong> ${endDate}</p>
          <p><strong>Duration:</strong> ${durationLabel || "As selected"}</p>
          <p><strong>Total Amount:</strong> Rs. ${Number(totalPrice || 0).toLocaleString("en-IN")}</p>
        </div>

        <p>Thank you for using our Virtual Data Room booking system.</p>
        <p>Best regards,<br/>VDR Team</p>
      </div>
    `,
  };

  return sendMail(
    mailOptions,
    `Booking confirmation email sent to ${email}`,
    "Error sending booking confirmation email:"
  );
};

const sendBookingPaymentConfirmation = async (data) => {
  const { email, name, bookingId, room, startDate, endDate, durationLabel, totalPrice } = data;
  return sendMail(
    {
      from: mailFrom,
      to: email,
      subject: `Payment Successful - Booking Confirmed - ${bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #15803d;">Booking Confirmed</h2>
          <p>Dear ${name},</p>
          <p>Your payment was successful and your VDR booking is now confirmed.</p>
          <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #22c55e;">
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Room:</strong> ${room}</p>
            <p><strong>Start:</strong> ${startDate}</p>
            <p><strong>End:</strong> ${endDate}</p>
            <p><strong>Duration:</strong> ${durationLabel || "As selected"}</p>
            <p><strong>Amount Paid:</strong> Rs. ${Number(totalPrice || 0).toLocaleString("en-IN")}</p>
          </div>
          <p>Access will automatically close at the booking end time shown above.</p>
          <p>Best regards,<br/>VDR Team</p>
        </div>
      `,
    },
    `Payment confirmation email sent to ${email}`,
    "Error sending payment confirmation email:"
  );
};

/**
 * Send slot availability notification
 * @param {Object} data - { email, name, room, startDate, endDate }
 */
const sendSlotAvailableNotification = async (data) => {
  const { email, name, room, startDate, endDate } = data;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Slot Available - ${room}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #48bb78;">Good News! Slot is Now Available</h2>
        <p>Dear ${name},</p>
        <p>The slot you were waiting for is now available!</p>

        <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
          <h3 style="margin-top: 0;">Available Slot Details</h3>
          <p><strong>Room:</strong> ${room}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>End Date:</strong> ${endDate}</p>
        </div>

        <p>
          <a href="${process.env.FRONTEND_URL}/book-vdr"
             style="display: inline-block; background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Book Now
          </a>
        </p>

        <p style="color: #718096; font-size: 14px;">
          Please note: This slot is available on a first-come, first-served basis.
        </p>

        <p>Best regards,<br/>VDR Team</p>
      </div>
    `,
  };

  return sendMail(
    mailOptions,
    `Slot available notification sent to ${email}`,
    "Error sending slot notification email:"
  );
};

/**
 * Send booking cancellation email
 * @param {Object} data - { email, name, bookingId, room }
 */
const sendBookingCancellation = async (data) => {
  const { email, name, bookingId, room } = data;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Booking Cancelled - ${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53e3e;">Booking Cancelled</h2>
        <p>Dear ${name},</p>
        <p>Your booking has been cancelled.</p>

        <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Room:</strong> ${room}</p>
        </div>

        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br/>VDR Team</p>
      </div>
    `,
  };

  return sendMail(
    mailOptions,
    `Cancellation email sent to ${email}`,
    "Error sending cancellation email:"
  );
};

export {
  sendRegistrationOtpEmail,
  sendPasswordResetEmail,
  sendBookingConfirmation,
  sendBookingPaymentConfirmation,
  sendSlotAvailableNotification,
  sendBookingCancellation,
};
