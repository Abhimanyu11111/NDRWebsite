// src/services/pricing.service.js

/**
 * Returns room price based on booking type & working days
 */
export const getRoomPrice = (bookingType, workingDays) => {
  switch (bookingType) {
    case "HOURLY":
      // hourly ka case alag handle hoga (frontend hours bhejega)
      return 1000 * workingDays;

    case "HALF_DAY":
      return 4000 * workingDays;

    case "FULL_DAY":
      return 7000 * workingDays;

    case "MULTI_DAY":
      // base price
      let base = 7000 * workingDays;

      // discount for 3+ working days
      if (workingDays >= 3) {
        base = base - 2000;
      }
      return base;

    default:
      return 0;
  }
};
