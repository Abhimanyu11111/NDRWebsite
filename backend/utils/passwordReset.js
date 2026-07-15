import crypto from "crypto";

export const PASSWORD_RESET_TTL_MINUTES = 30;

export const generatePasswordResetToken = () => crypto.randomBytes(32).toString("hex");

export const hashPasswordResetToken = (token) =>
  crypto.createHash("sha256").update(String(token || "")).digest("hex");

export const getPasswordResetExpiry = (now = new Date()) =>
  new Date(now.getTime() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

