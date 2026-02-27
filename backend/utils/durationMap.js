// ─── Duration map ─────────────────────────────────────────────────────────────
export const DURATION_MAP = {
  HALF_DAY:  240,   // 4-hour session
  HOURLY:     60,
  FULL_DAY: 1440,
  MULTI_DAY: null,  // end_datetime - start_datetime (user picks range)
  ONE_WEEK: 10080,  // ✅ 7 days = 7 * 24 * 60
};

// Human-readable labels
export const DURATION_LABELS = {
  HALF_DAY:  "Half Day (4 hrs)",
  HOURLY:    "Hourly",
  FULL_DAY:  "24 Hours",
  MULTI_DAY: "Multiple Days",
  ONE_WEEK:  "1 Week",
};

// Which slot does HALF_DAY fall in?
export const HALF_DAY_SLOTS = {
  AM: { start: "09:00", end: "13:00" },
  PM: { start: "14:00", end: "18:00" },
};

// ─── Working-day helpers ──────────────────────────────────────────────────────
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

export const MAX_FREE_WORKING_DAYS = 3;
export const EXTRA_RATE_PER_WORKING_DAY = 50;

export const calcWorkingDaySurcharge = (workingDays) => {
  const extra = Math.max(0, workingDays - MAX_FREE_WORKING_DAYS);
  return extra * EXTRA_RATE_PER_WORKING_DAY;
};