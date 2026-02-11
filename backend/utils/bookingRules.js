export const MIN_ADVANCE_DAYS = 3;

export const isWeekend = (date) => {
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
};

export const violatesAdvanceRule = (startDatetime) => {
  const now = new Date();
  const minAllowed = new Date();
  minAllowed.setDate(now.getDate() + MIN_ADVANCE_DAYS);

  return startDatetime < minAllowed;
};

export const hasWeekendInRange = (start, end) => {
  const d = new Date(start);
  while (d <= end) {
    if (isWeekend(d)) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
};