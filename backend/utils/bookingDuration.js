export const BOOKING_TYPES = Object.freeze({
  MULTI_DAY: "MULTI_DAY",
  EIGHT_HOUR: "EIGHT_HOUR",
});

export const EIGHT_HOUR_MINUTES = 8 * 60;

export const BOOKING_DURATION_LABELS = Object.freeze({
  [BOOKING_TYPES.MULTI_DAY]: "24 Hours / Multi-day",
  [BOOKING_TYPES.EIGHT_HOUR]: "8 Hours",
});

const invalidWindow = (message) => {
  const error = new Error(message);
  error.code = "INVALID_BOOKING_WINDOW";
  return error;
};

export const normalizeBookingType = (value) => {
  const type = value || BOOKING_TYPES.MULTI_DAY;
  if (!Object.values(BOOKING_TYPES).includes(type)) {
    throw invalidWindow("Unsupported booking duration selected");
  }
  return type;
};

export const resolveBookingWindow = ({ bookingType, startDatetime, endDatetime }) => {
  const type = normalizeBookingType(bookingType);
  const start = new Date(startDatetime);
  const requestedEnd = new Date(endDatetime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(requestedEnd.getTime())) {
    throw invalidWindow("Please provide valid booking start and end times");
  }

  if (requestedEnd <= start) {
    throw invalidWindow("Booking end time must be after the start time");
  }

  if (type === BOOKING_TYPES.EIGHT_HOUR) {
    const end = new Date(start.getTime() + EIGHT_HOUR_MINUTES * 60 * 1000);
    if (Math.abs(requestedEnd.getTime() - end.getTime()) > 1000) {
      throw invalidWindow("An 8-hour booking must be exactly 8 hours long");
    }
    return { bookingType: type, start, end, durationMinutes: EIGHT_HOUR_MINUTES };
  }

  const durationMinutes = Math.floor((requestedEnd - start) / 60000);
  return { bookingType: type, start, end: requestedEnd, durationMinutes };
};

export const calculateRoomPrice = ({ bookingType, durationMinutes, room }) => {
  const fullDayRate = Number(room?.full_day_rate || 0);
  const hourlyRate = Number(room?.hourly_rate || 0);

  if (bookingType === BOOKING_TYPES.EIGHT_HOUR) {
    const amount = hourlyRate > 0 ? hourlyRate * 8 : fullDayRate / 3;
    return Math.round(amount * 100) / 100;
  }

  return Math.ceil(durationMinutes / 1440) * fullDayRate;
};

export const getBookingDurationLabel = (bookingType, durationMinutes) => {
  if (bookingType === BOOKING_TYPES.EIGHT_HOUR) return "8 Hours";
  if (bookingType === "HOURLY") {
    const hours = Math.max(1, Math.ceil(Number(durationMinutes || 60) / 60));
    return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  }
  if (bookingType === "HALF_DAY") return "Half Day";
  if (bookingType === "FULL_DAY") return "Full Day";
  const days = Math.max(1, Math.ceil(Number(durationMinutes || 0) / 1440));
  return `${days} ${days === 1 ? "Day" : "Days"}`;
};
