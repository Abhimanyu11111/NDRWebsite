import crypto from "crypto";

/* global Buffer, process */

export const REGISTRATION_OTP_TTL_MINUTES = 30;
export const REGISTRATION_OTP_TTL_MS = REGISTRATION_OTP_TTL_MINUTES * 60 * 1000;
export const REGISTRATION_OTP_RESEND_SECONDS = 60;
export const REGISTRATION_OTP_MAX_ATTEMPTS = 5;

const getOtpSecret = () => {
  const secret = process.env.REGISTRATION_OTP_SECRET || process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("REGISTRATION_OTP_SECRET, CAPTCHA_SECRET or JWT_SECRET is required");
  return secret;
};

export const hashRegistrationOtp = (email, otp) => crypto
  .createHmac("sha256", getOtpSecret())
  .update(`${String(email).toLowerCase()}:${String(otp)}`)
  .digest("hex");

export const generateRegistrationOtp = (email, previousHash = null) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    if (hashRegistrationOtp(email, otp) !== previousHash) return otp;
  }
  throw new Error("Unable to generate a new registration OTP");
};

export const generateRegistrationVerificationToken = () => crypto.randomBytes(32).toString("hex");

export const hashRegistrationVerificationToken = (token) => crypto
  .createHash("sha256")
  .update(String(token || ""))
  .digest("hex");

export const safeHashEquals = (actual, expected) => {
  const actualBuffer = Buffer.from(String(actual || ""));
  const expectedBuffer = Buffer.from(String(expected || ""));
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
};

export const isRegistrationVerificationValid = (record, tokenHash, now = Date.now()) => Boolean(
  record?.verified_at
  && !record?.consumed_at
  && record?.verification_token_hash
  && new Date(record.verification_expires_at).getTime() > now
  && safeHashEquals(record.verification_token_hash, tokenHash)
);
