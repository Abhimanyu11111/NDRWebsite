// ─── Constants ────────────────────────────────────────────────────────────────
export const MIN_ADVANCE_DAYS = 3;
export const MAX_ADVANCE_DAYS = 90;
const INDIA_TIMEZONE = "Asia/Kolkata";

const getIndiaDateParts = (value) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(value));

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
};

const toIndiaDateOnly = (value) => {
  const { year, month, day } = getIndiaDateParts(value);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatIndiaDateKey = (value) => {
  const { year, month, day } = getIndiaDateParts(value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// ─── Weekend helpers ──────────────────────────────────────────────────────────
export const isWeekend = (date) => {
  const day = toIndiaDateOnly(date).getUTCDay();
  return day === 0 || day === 6;
};

export const hasWeekendInRange = (start, end) => {
  const d = toIndiaDateOnly(start);
  const endDay = toIndiaDateOnly(end);

  while (d <= endDay) {
    const day = d.getUTCDay();
    if (day === 0 || day === 6) return true;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return false;
};

// ─── Advance booking rules ────────────────────────────────────────────────────

//  Time strip karke sirf date compare karo
export const violatesAdvanceRule = (startDatetime) => {
  const today = toIndiaDateOnly(new Date());

  const minAllowed = new Date(today);
  minAllowed.setUTCDate(today.getUTCDate() + MIN_ADVANCE_DAYS);

  const startDay = toIndiaDateOnly(startDatetime);

  return startDay < minAllowed;
};

export const violatesMaxAdvanceRule = (startDatetime) => {
  const maxAllowed = toIndiaDateOnly(new Date());
  maxAllowed.setUTCDate(maxAllowed.getUTCDate() + MAX_ADVANCE_DAYS);

  const startDay = toIndiaDateOnly(startDatetime);

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
  const dateStr  = formatIndiaDateKey(date);
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
