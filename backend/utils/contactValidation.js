import { DEFAULT_COUNTRY, findCountry } from "./countries.js";

// Postal codes worldwide are 2–10 letters/digits, optionally with a space or hyphen
// (e.g. "SW1A 1AA", "10115", "K1A-0B1").
const INTL_POSTAL_RE = /^[A-Z0-9][A-Z0-9 -]{1,9}$/;
const INDIA_PINCODE_RE = /^\d{6}$/;
const INDIA_MOBILE_RE = /^[6-9]\d{9}$/;
const MAX_E164_DIGITS = 15;

/**
 * Resolves the registration country. Missing → India, so older clients that
 * don't send a country keep working exactly as before.
 */
export const resolveCountry = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return findCountry(DEFAULT_COUNTRY);
  }
  return findCountry(value);
};

/**
 * Validates and normalises a phone number for the given country.
 *  - India: stored as the 10-digit mobile number (unchanged from before).
 *  - Others: stored in E.164 form, e.g. "+447911123456".
 * Returns { ok: true, value } or { ok: false, msg }.
 */
export const normalizePhone = (country, raw) => {
  const input = String(raw || "").trim();
  let digits = input.replace(/\D/g, "");

  if (country.name === DEFAULT_COUNTRY) {
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    return INDIA_MOBILE_RE.test(digits)
      ? { ok: true, value: digits }
      : { ok: false, msg: "Please enter a valid 10 digit Indian mobile number" };
  }

  // Number typed in international form ("+44…" or "0044…"): drop the country code.
  const international = input.startsWith("+") || digits.startsWith("00");
  if (international) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (!digits.startsWith(country.dial)) {
      return { ok: false, msg: `Phone number must start with +${country.dial} for ${country.name}` };
    }
    digits = digits.slice(country.dial.length);
  }
  // Drop a single national trunk prefix ("07911…" → "7911…").
  if (digits.startsWith("0")) digits = digits.slice(1);

  if (digits.length < 4 || country.dial.length + digits.length > MAX_E164_DIGITS) {
    return { ok: false, msg: `Please enter a valid phone number for ${country.name}` };
  }
  return { ok: true, value: `+${country.dial}${digits}` };
};

/**
 * Validates and normalises a postal code. Optional for every country.
 * Returns { ok: true, value } (value may be null) or { ok: false, msg }.
 */
export const normalizePostalCode = (country, raw) => {
  const value = String(raw || "").trim().toUpperCase().replace(/\s+/g, " ");
  if (!value) return { ok: true, value: null };

  if (country.name === DEFAULT_COUNTRY) {
    return INDIA_PINCODE_RE.test(value)
      ? { ok: true, value }
      : { ok: false, msg: "Please enter a valid 6 digit pincode" };
  }
  return INTL_POSTAL_RE.test(value)
    ? { ok: true, value }
    : { ok: false, msg: "Please enter a valid postal code (letters, numbers, spaces or hyphens, up to 10 characters)" };
};
