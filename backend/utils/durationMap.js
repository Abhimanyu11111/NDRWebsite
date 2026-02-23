// ─── Duration map ─────────────────────────────────────────────────────────────
// Minutes → null means end_datetime is provided by user (MULTI_DAY)
// HALF_DAY → 240 min (4 hours, AM or PM session)

export const DURATION_MAP = {
  HALF_DAY:  240,   // ✅ NEW – 4-hour session
  HOURLY:     60,
  FULL_DAY: 1440,
  MULTI_DAY: null,  // end_datetime - start_datetime
};

// Human-readable labels
export const DURATION_LABELS = {
  HALF_DAY:  "Half Day (4 hrs)",
  HOURLY:    "Hourly",
  FULL_DAY:  "Full Day",
  MULTI_DAY: "Multi Day",
};

// Which slot does HALF_DAY fall in?
export const HALF_DAY_SLOTS = {
  AM: { start: "09:00", end: "13:00" },
  PM: { start: "14:00", end: "18:00" },
};

// ─── Working-day helpers ──────────────────────────────────────────────────────

/**
 * Count working days (Mon–Fri) between two Date objects, excluding holidays.
 * @param {Date}   start
 * @param {Date}   end
 * @param {Set}    holidaySet  – Set of 'YYYY-MM-DD' strings
 * @returns {number}
 */
export const countWorkingDays = (start, end, holidaySet = new Set()) => {
  let count = 0;
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cur <= endDay) {
    const day = cur.getDay();
    const dateStr = cur.toISOString().slice(0, 10);
    if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// Max working days included in base price before surcharge kicks in
export const MAX_FREE_WORKING_DAYS = 3;

// Extra charge per working day beyond MAX_FREE_WORKING_DAYS
export const EXTRA_RATE_PER_WORKING_DAY = 50; // ₹50 / day

/**
 * Calculate surcharge for extra working days beyond free limit.
 * @param {number} workingDays
 * @returns {number}
 */
export const calcWorkingDaySurcharge = (workingDays) => {
  const extra = Math.max(0, workingDays - MAX_FREE_WORKING_DAYS);
  return extra * EXTRA_RATE_PER_WORKING_DAY;
};