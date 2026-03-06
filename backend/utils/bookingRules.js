// ─── Constants ────────────────────────────────────────────────────────────────
export const MIN_ADVANCE_DAYS = 3;
export const MAX_ADVANCE_DAYS = 90;

// ─── Weekend helpers ──────────────────────────────────────────────────────────
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

//  Time strip karke sirf date compare karo
export const violatesAdvanceRule = (startDatetime) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minAllowed = new Date(today);
  minAllowed.setDate(today.getDate() + MIN_ADVANCE_DAYS);

  const startDay = new Date(startDatetime);
  startDay.setHours(0, 0, 0, 0);

  return startDay < minAllowed;
};

export const violatesMaxAdvanceRule = (startDatetime) => {
  const maxAllowed = new Date();
  maxAllowed.setHours(0, 0, 0, 0);
  maxAllowed.setDate(maxAllowed.getDate() + MAX_ADVANCE_DAYS);

  const startDay = new Date(startDatetime);
  startDay.setHours(0, 0, 0, 0);

  return startDay > maxAllowed;
};

// ─── Holiday calendar ─────────────────────────────────────────────────────────
const STATIC_HOLIDAYS = new Set([
  "2025-01-26",
  "2025-03-17",
  "2025-04-14",
  "2025-04-18",
  "2025-05-01",
  "2025-08-15",
  "2025-10-02",
  "2025-10-20",
  "2025-10-21",
  "2025-11-05",
  "2025-12-25",
  "2026-01-01",
  "2026-01-26",
  "2026-08-15",
  "2026-10-02",
  "2026-12-25",
]);

let _cachedHolidays = null;
let _cacheExpiry    = null;
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000;

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

export const isHoliday = async (date, HolidayModel = null) => {
  const holidays = await getHolidaySet(HolidayModel);
  const dateStr  = new Date(date).toISOString().slice(0, 10);
  return holidays.has(dateStr);
};

export const isNonWorkingDay = async (date, HolidayModel = null) => {
  if (isWeekend(new Date(date))) return true;
  return isHoliday(date, HolidayModel);
};

// ─── Full booking validation ──────────────────────────────────────────────────
export const validateBookingRequest = async ({
  startDatetime,
  bookingType,
  halfDaySlot = null,
  HolidayModel = null,
}) => {
  const errors = [];
  const start  = new Date(startDatetime);

  // 1. Min advance check
  if (violatesAdvanceRule(start)) {
    errors.push(`Booking must be made at least ${MIN_ADVANCE_DAYS} days in advance.`);
  }

  // 2. Max advance check
  if (violatesMaxAdvanceRule(start)) {
    errors.push(`Booking cannot be made more than ${MAX_ADVANCE_DAYS} days in advance.`);
  }

  // 3.  Weekend ALLOWED — advance notice ke saath book ho sakta hai
  //    weekendNotice validation bookingController.js mein hoti hai
  //    Yahan weekend ko BLOCK nahi karte

  // 4. Public holiday — BLOCK karo
  const holiday = await isHoliday(start, HolidayModel);
  if (holiday) {
    errors.push(`${start.toISOString().slice(0, 10)} is a public holiday. Please choose another date.`);
  }

  // 5. HALF_DAY slot check
  if (bookingType === "HALF_DAY") {
    if (!halfDaySlot || !["AM", "PM"].includes(halfDaySlot.toUpperCase())) {
      errors.push("HALF_DAY booking requires a valid slot: AM or PM.");
    }
  }

  return { valid: errors.length === 0, errors };
};