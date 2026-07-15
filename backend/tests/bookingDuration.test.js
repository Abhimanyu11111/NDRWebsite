import test from "node:test";
import assert from "node:assert/strict";
import {
  BOOKING_TYPES,
  calculateRoomPrice,
  resolveBookingWindow,
} from "../utils/bookingDuration.js";
import { countWorkingDays } from "../utils/durationMap.js";

test("resolves an exact eight-hour window", () => {
  const result = resolveBookingWindow({
    bookingType: BOOKING_TYPES.EIGHT_HOUR,
    startDatetime: "2026-08-01T04:00:00.000Z",
    endDatetime: "2026-08-01T12:00:00.000Z",
  });
  assert.equal(result.durationMinutes, 480);
  assert.equal(result.end.toISOString(), "2026-08-01T12:00:00.000Z");
});

test("rejects a manipulated eight-hour end time", () => {
  assert.throws(
    () => resolveBookingWindow({
      bookingType: BOOKING_TYPES.EIGHT_HOUR,
      startDatetime: "2026-08-01T04:00:00.000Z",
      endDatetime: "2026-08-01T13:00:00.000Z",
    }),
    /exactly 8 hours/
  );
});

test("uses eight times hourly rate when configured", () => {
  assert.equal(calculateRoomPrice({
    bookingType: BOOKING_TYPES.EIGHT_HOUR,
    durationMinutes: 480,
    room: { hourly_rate: 250, full_day_rate: 5000 },
  }), 2000);
});

test("falls back to one-third of full-day rate", () => {
  assert.equal(calculateRoomPrice({
    bookingType: BOOKING_TYPES.EIGHT_HOUR,
    durationMinutes: 480,
    room: { hourly_rate: 0, full_day_rate: 6000 },
  }), 2000);
});

test("does not count an exclusive midnight checkout as another working day", () => {
  const workingDays = countWorkingDays(
    "2026-08-03T00:00:00+05:30",
    "2026-08-04T00:00:00+05:30"
  );
  assert.equal(workingDays, 1);
});
