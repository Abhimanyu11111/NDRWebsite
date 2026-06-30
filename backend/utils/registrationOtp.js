import crypto from "crypto";

const getSecret = () => process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;
const usedOtpTokens = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;

const cleanupUsedTokens = () => {
  const now = Date.now();
  for (const [token, expiresAt] of usedOtpTokens.entries()) {
    if (expiresAt <= now) usedOtpTokens.delete(token);
  }
};

const sign = (payload) => {
  const secret = getSecret();
  if (!secret) throw new Error("CAPTCHA_SECRET or JWT_SECRET is required");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

const randomOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

/**
 * Generates a 6-digit OTP for the given email. The OTP itself is only
 * delivered via email — the returned token is a signed reference (no OTP
 * inside) that the client must echo back along with the code it received.
 */
export const createRegistrationOtp = (email) => {
  cleanupUsedTokens();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const otp = randomOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const signature = sign(`${normalizedEmail}.${otp}.${expiresAt}.${nonce}`);

  return {
    otp,
    token: `${expiresAt}.${nonce}.${signature}`,
  };
};

export const verifyRegistrationOtp = ({ email, otp, token }) => {
  if (!token || !otp || !email) return false;

  const normalizedEmail = String(email).trim().toLowerCase();
  const [expiresAt, nonce, signature] = String(token).split(".");
  if (!expiresAt || !nonce || !signature || Number(expiresAt) < Date.now()) {
    return false;
  }

  cleanupUsedTokens();
  if (usedOtpTokens.has(token)) return false;

  const normalizedOtp = String(otp).trim();
  const expected = sign(`${normalizedEmail}.${normalizedOtp}.${expiresAt}.${nonce}`);
  if (signature.length !== expected.length) return false;

  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (isValid) usedOtpTokens.set(token, Number(expiresAt));
  return isValid;
};
