// ─── Constants ────────────────────────────────────────────────────────────────
export const MIN_ADVANCE_DAYS = 3;
export const MAX_ADVANCE_DAYS = 90; // ✅ NEW – cannot book more than 90 days ahead

// ─── Weekend helpers (unchanged) ─────────────────────────────────────────────
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const hasWeekendInRange = (start, end) => {
  const d = new Date(start);
  while (d <= end) {
    if (isWeekend(d)) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
};

// ─── Advance booking rules ────────────────────────────────────────────────────
export const violatesAdvanceRule = (startDatetime) => {
  const now = new Date();
  const minAllowed = new Date();
  minAllowed.setDate(now.getDate() + MIN_ADVANCE_DAYS);
  return startDatetime < minAllowed;
};

// ✅ NEW – blocks booking too far in the future
export const violatesMaxAdvanceRule = (startDatetime) => {
  const maxAllowed = new Date();
  maxAllowed.setDate(maxAllowed.getDate() + MAX_ADVANCE_DAYS);
  return startDatetime > maxAllowed;
};

// ─── Holiday calendar ─────────────────────────────────────────────────────────

// Static Indian public holidays (extend or load from DB as needed)
const STATIC_HOLIDAYS = new Set([
  "2025-01-26", // Republic Day
  "2025-03-17", // Holi
  "2025-04-14", // Dr. Ambedkar Jayanti
  "2025-04-18", // Good Friday
  "2025-05-01", // Labour Day
  "2025-08-15", // Independence Day
  "2025-10-02", // Gandhi Jayanti
  "2025-10-20", // Dussehra
  "2025-10-21", // Diwali
  "2025-11-05", // Diwali (Laxmi Puja)
  "2025-12-25", // Christmas
  "2026-01-01", // New Year
  "2026-01-26", // Republic Day
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
  "2026-12-25", // Christmas
]);

// In-memory cache so DB isn't hit on every request
let _cachedHolidays = null;
let _cacheExpiry    = null;
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000; // 24 h

/**
 * Returns a Set of 'YYYY-MM-DD' holiday strings.
 * Tries DB first (sequelize model), falls back to static list.
 * @param {import('sequelize').Model|null} HolidayModel
 */
export const getHolidaySet = async (HolidayModel = null) => {
  const now = Date.now();
  if (_cachedHolidays && _cacheExpiry && now < _cacheExpiry) {
    return _cachedHolidays;
  }

  let holidays = STATIC_HOLIDAYS;

  if (HolidayModel) {
    try {
      const rows = await HolidayModel.findAll({
        attributes: ["holiday_date"],
        raw: true,
      });
      holidays = new Set(rows.map((r) => r.holiday_date.toString().slice(0, 10)));
    } catch (err) {
      console.warn("[bookingRules] Holiday DB load failed, using static list:", err.message);
      holidays = STATIC_HOLIDAYS;
    }
  }

  _cachedHolidays = holidays;
  _cacheExpiry    = now + CACHE_TTL_MS;
  return holidays;
};

export const invalidateHolidayCache = () => {
  _cachedHolidays = null;
  _cacheExpiry    = null;
};

// ✅ NEW – is this date a public holiday?
export const isHoliday = async (date, HolidayModel = null) => {
  const holidays = await getHolidaySet(HolidayModel);
  const dateStr  = new Date(date).toISOString().slice(0, 10);
  return holidays.has(dateStr);
};

// ✅ NEW – is this date a non-working day (weekend OR holiday)?
export const isNonWorkingDay = async (date, HolidayModel = null) => {
  if (isWeekend(new Date(date))) return true;
  return isHoliday(date, HolidayModel);
};

// ─── Full booking validation ──────────────────────────────────────────────────

/**
 * Validates a booking request. Returns { valid, errors[] }.
 * @param {Object} params
 * @param {Date}   params.startDatetime
 * @param {string} params.bookingType
 * @param {string} [params.halfDaySlot]  – 'AM' or 'PM', required for HALF_DAY
 * @param {import('sequelize').Model} [params.HolidayModel]
 */
export const validateBookingRequest = async ({
  startDatetime,
  bookingType,
  halfDaySlot = null,
  HolidayModel = null,
}) => {
  const errors = [];
  const start  = new Date(startDatetime);

  // 1. Min advance
  if (violatesAdvanceRule(start)) {
    errors.push(`Booking must be made at least ${MIN_ADVANCE_DAYS} days in advance.`);
  }

  // 2. Max advance ✅
  if (violatesMaxAdvanceRule(start)) {
    errors.push(`Booking cannot be made more than ${MAX_ADVANCE_DAYS} days in advance.`);
  }

  // 3. Cannot start on weekend ✅
  if (isWeekend(start)) {
    errors.push("Booking start date cannot be a weekend.");
  }

  // 4. Cannot start on a public holiday ✅
  const holiday = await isHoliday(start, HolidayModel);
  if (holiday) {
    errors.push(`${start.toISOString().slice(0, 10)} is a public holiday. Please choose another date.`);
  }

  // 5. HALF_DAY slot check ✅
  if (bookingType === "HALF_DAY") {
    if (!halfDaySlot || !["AM", "PM"].includes(halfDaySlot.toUpperCase())) {
      errors.push("HALF_DAY booking requires a valid slot: AM or PM.");
    }
  }

  return { valid: errors.length === 0, errors };
};