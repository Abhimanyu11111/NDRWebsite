import assert from "node:assert/strict";
import test from "node:test";
import {
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MINUTES,
} from "../utils/passwordReset.js";

test("password reset token is random and stored as a hash", () => {
  const first = generatePasswordResetToken();
  const second = generatePasswordResetToken();

  assert.equal(first.length, 64);
  assert.notEqual(first, second);
  assert.notEqual(hashPasswordResetToken(first), first);
  assert.equal(hashPasswordResetToken(first), hashPasswordResetToken(first));
});

test("password reset expiry uses the configured TTL", () => {
  const now = new Date("2026-07-15T10:00:00.000Z");
  const expiry = getPasswordResetExpiry(now);
  assert.equal(expiry.getTime() - now.getTime(), PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
});

