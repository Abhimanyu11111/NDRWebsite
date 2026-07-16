import crypto from "crypto";
import { createCaptchaPng } from "./captchaImage.js";

const getSecret = () => process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;
const usedCaptchaTokens = new Map();
const CAPTCHA_TTL_MS = 3 * 60 * 1000;
// Ambiguous characters (I, l, O, 0, 1) are intentionally excluded.
const CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%&?";

const cleanupUsedTokens = () => {
  const now = Date.now();
  for (const [token, expiresAt] of usedCaptchaTokens.entries()) {
    if (expiresAt <= now) usedCaptchaTokens.delete(token);
  }
};

const sign = (payload) => {
  const secret = getSecret();
  if (!secret) throw new Error("CAPTCHA_SECRET or JWT_SECRET is required");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

const randomCode = () => {
  return Array.from({ length: 6 }, () => CAPTCHA_ALPHABET[crypto.randomInt(0, CAPTCHA_ALPHABET.length)]).join("");
};

export const createCaptchaChallenge = () => {
  cleanupUsedTokens();
  const answer = randomCode();
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${answer}.${expiresAt}.${nonce}`;

  return {
    question: "Enter the case-sensitive code shown",
    image: createCaptchaPng(answer),
    token: `${expiresAt}.${nonce}.${sign(payload)}`,
  };
};

export const verifyCaptchaChallenge = ({ token, answer }) => {
  if (!token || answer == null) return false;

  const [expiresAt, nonce, signature] = String(token).split(".");
  if (!expiresAt || !nonce || !signature || Number(expiresAt) < Date.now()) {
    return false;
  }

  cleanupUsedTokens();
  if (usedCaptchaTokens.has(token)) return false;

  const normalizedAnswer = String(answer).trim();
  const expected = sign(`${normalizedAnswer}.${expiresAt}.${nonce}`);
  if (signature.length !== expected.length) return false;
  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (isValid) usedCaptchaTokens.set(token, Number(expiresAt));
  return isValid;
};
