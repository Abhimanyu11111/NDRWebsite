import test from "node:test";
import assert from "node:assert/strict";
import { resolveCountry, normalizePhone, normalizePostalCode } from "../utils/contactValidation.js";

const india = resolveCountry("India");
const uk = resolveCountry("United Kingdom");
const us = resolveCountry("United States");

test("missing country defaults to India (older clients keep working)", () => {
  assert.equal(resolveCountry(undefined).name, "India");
  assert.equal(resolveCountry("").name, "India");
});

test("country lookup is case-insensitive and rejects unknown names", () => {
  assert.equal(resolveCountry("united kingdom").name, "United Kingdom");
  assert.equal(resolveCountry("Atlantis"), null);
});

test("Indian mobile numbers keep the existing 10-digit format", () => {
  assert.deepEqual(normalizePhone(india, "9876543210"), { ok: true, value: "9876543210" });
  assert.deepEqual(normalizePhone(india, "+91 98765 43210"), { ok: true, value: "9876543210" });
  assert.equal(normalizePhone(india, "5876543210").ok, false);
  assert.equal(normalizePhone(india, "98765").ok, false);
});

test("international numbers are stored in E.164 form", () => {
  assert.deepEqual(normalizePhone(uk, "07911 123456"), { ok: true, value: "+447911123456" });
  assert.deepEqual(normalizePhone(uk, "7911123456"), { ok: true, value: "+447911123456" });
  assert.deepEqual(normalizePhone(uk, "+44 7911 123456"), { ok: true, value: "+447911123456" });
  assert.deepEqual(normalizePhone(uk, "0044 7911 123456"), { ok: true, value: "+447911123456" });
  assert.deepEqual(normalizePhone(us, "(415) 555-2671"), { ok: true, value: "+14155552671" });
});

test("rejects international numbers with the wrong code or length", () => {
  assert.equal(normalizePhone(uk, "+91 9876543210").ok, false);
  assert.equal(normalizePhone(uk, "123").ok, false);
  assert.equal(normalizePhone(uk, "1234567890123456").ok, false);
});

test("Indian pincode stays 6 digits; postal code is optional", () => {
  assert.deepEqual(normalizePostalCode(india, "110001"), { ok: true, value: "110001" });
  assert.equal(normalizePostalCode(india, "1100").ok, false);
  assert.deepEqual(normalizePostalCode(india, ""), { ok: true, value: null });
});

test("international postal codes are accepted and normalised", () => {
  assert.deepEqual(normalizePostalCode(uk, "sw1a  1aa"), { ok: true, value: "SW1A 1AA" });
  assert.deepEqual(normalizePostalCode(us, "94105-1234"), { ok: true, value: "94105-1234" });
  assert.equal(normalizePostalCode(uk, "SW1A 1AA 12345").ok, false);
  assert.equal(normalizePostalCode(uk, "AB<1").ok, false);
});
