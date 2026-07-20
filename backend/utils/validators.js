/**
 * Small, dependency-free request-validation helpers shared across controllers.
 * Kept intentionally simple (no schema library) to match the existing
 * hand-rolled regex validation style already used in authRoutes.js.
 */

/** True for a positive integer, whether passed as a Number or a numeric string. */
export const isPositiveInt = (value) => {
  if (value === undefined || value === null || value === "") return false;
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

/** True for an ISO-8601-ish date/datetime string that parses to a valid Date. */
export const isValidDateString = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

/** True for a HH:MM or HH:MM:SS 24-hour time string. */
export const isValidTimeString = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(value);

/** True when value is one of the allowed values (case-sensitive). */
export const isInEnum = (value, allowed) => allowed.includes(value);

/** True for a non-empty trimmed string no longer than maxLen. */
export const isNonEmptyString = (value, maxLen = 500) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= maxLen;

/** Optional-field string check: valid if absent/null, otherwise must satisfy isNonEmptyString-style length cap. */
export const isOptionalBoundedString = (value, maxLen = 500) =>
  value === undefined || value === null || value === "" ||
  (typeof value === "string" && value.length <= maxLen);

/** Clamp a page/limit query param to a safe integer range. */
export const toBoundedInt = (value, { def, min, max }) => {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return def;
  return Math.min(Math.max(n, min), max);
};

/** Build a standard 400 validation-error response body. */
export const validationError = (message) => ({ success: false, message });
