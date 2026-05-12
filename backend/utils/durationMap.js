// ─── Duration map ─────────────────────────────────────────────────────────────
export const DURATION_MAP = {
  MULTI_DAY: null,  // end_datetime - start_datetime (user picks range)
};

// Human-readable labels
export const DURATION_LABELS = {
  MULTI_DAY: "Multiple Days",
};

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

// ─── Working-day helpers ──────────────────────────────────────────────────────
export const countWorkingDays = (start, end, holidaySet = new Set()) => {
  let count = 0;
  const cur = toIndiaDateOnly(start);
  const endDay = toIndiaDateOnly(end);

  while (cur <= endDay) {
    const day = cur.getUTCDay();
    const dateStr = formatIndiaDateKey(cur);
    if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
};

export const MAX_FREE_WORKING_DAYS = 3;
export const EXTRA_RATE_PER_WORKING_DAY = 50;

export const calcWorkingDaySurcharge = (workingDays) => {
  const extra = Math.max(0, workingDays - MAX_FREE_WORKING_DAYS);
  return extra * EXTRA_RATE_PER_WORKING_DAY;
};
