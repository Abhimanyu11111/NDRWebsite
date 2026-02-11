// src/services/date.service.js

/**
 * Calculate working days between two dates
 * Excludes Saturday & Sunday
 * startDate, endDate = YYYY-MM-DD
 */
export const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  let start = new Date(startDate);
  let end = new Date(endDate);

  // Ensure start <= end
  if (start > end) return 0;

  let count = 0;

  while (start <= end) {
    const day = start.getDay(); // 0 = Sunday, 6 = Saturday

    if (day !== 0 && day !== 6) {
      count++;
    }

    start.setDate(start.getDate() + 1); 
  }

  return count;
};
