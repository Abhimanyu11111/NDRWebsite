import nodemailer from "nodemailer";
import "../config/env.js";

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
const smtpRequireTls = String(process.env.SMTP_REQUIRE_TLS || "").toLowerCase() === "true";
const mailFrom = process.env.SMTP_FROM || `"VDR Booking System" <${process.env.SMTP_USER}>`;

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
    await transporter.sendMail(mailOptions);
    console.log(successMessage);
    return true;
  } catch (error) {
    console.error(errorMessage, error);
    return false;
  }
};

/**
 * Send booking confirmation email
 * @param {Object} data - { email, name, bookingId, room, startDate, endDate, totalPrice }
 */
const sendBookingConfirmation = async (data) => {
  const { email, name, bookingId, room, startDate, endDate, totalPrice } = data;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: `Booking Confirmed - ${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">Booking Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Your VDR booking has been confirmed successfully.</p>

        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Room:</strong> ${room}</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          <p><strong>End Date:</strong> ${endDate}</p>
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

/**
 * Send registration OTP verification email
 * @param {Object} data - { email, otp }
 */
const sendRegistrationOtp = async (data) => {
  const { email, otp } = data;

  const mailOptions = {
    from: mailFrom,
    to: email,
    subject: "Verify your email - NDR Registration OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d47a1;">Email Verification</h2>
        <p>Use the code below to verify your email and complete your registration.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0d47a1;">${otp}</span>
        </div>
        <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>NDR Team</p>
      </div>
    `,
  };

  return sendMail(
    mailOptions,
    `Registration OTP sent to ${email}`,
    "Error sending registration OTP email:"
  );
};

export {
  sendBookingConfirmation,
  sendSlotAvailableNotification,
  sendBookingCancellation,
  sendRegistrationOtp,
};
