import test from "node:test";
import assert from "node:assert/strict";
import {
  canReapply,
  hashRegistrationVerificationToken,
  isRegistrationVerificationValid,
  REGISTRATION_OTP_TTL_MS,
  wasVerificationJustUsed,
} from "../utils/registrationOtp.js";

const tokenHash = hashRegistrationVerificationToken("a".repeat(64));
const otherHash = hashRegistrationVerificationToken("b".repeat(64));
const now = Date.parse("2026-10-14T10:00:00Z");

// State of the OTP record right after a registration was saved with tokenHash
const consumedRecord = {
  verified_at: new Date(now - 60_000),
  consumed_at: new Date(now - 30_000),
  verification_token_hash: tokenHash,
  verification_expires_at: new Date(now - 30_000),
};

test("a retry with the token that just saved the registration is recognised", () => {
  assert.equal(wasVerificationJustUsed(consumedRecord, tokenHash, now), true);
});

test("a consumed token can never be used to create another registration", () => {
  assert.equal(isRegistrationVerificationValid(consumedRecord, tokenHash, now), false);
});

test("a different token, an unconsumed record or an old submission is not a retry", () => {
  assert.equal(wasVerificationJustUsed(consumedRecord, otherHash, now), false);
  assert.equal(wasVerificationJustUsed({ ...consumedRecord, consumed_at: null }, tokenHash, now), false);
  assert.equal(wasVerificationJustUsed(consumedRecord, tokenHash, now + REGISTRATION_OTP_TTL_MS), false);
  assert.equal(wasVerificationJustUsed(null, tokenHash, now), false);
});

test("pending and rejected applicants may submit again", () => {
  assert.equal(canReapply({ role: "USER", is_active: 0, approval_status: "PENDING" }), true);
  assert.equal(canReapply({ role: "USER", is_active: false, approval_status: "REJECTED" }), true);
});

test("approved, active or admin accounts may not be overwritten", () => {
  assert.equal(canReapply({ role: "USER", is_active: 1, approval_status: "APPROVED" }), false);
  assert.equal(canReapply({ role: "USER", is_active: 0, approval_status: "APPROVED" }), false);
  assert.equal(canReapply({ role: "USER", is_active: 1, approval_status: "PENDING" }), false);
  assert.equal(canReapply({ role: "ADMIN", is_active: 0, approval_status: "PENDING" }), false);
  assert.equal(canReapply(null), false);
});
