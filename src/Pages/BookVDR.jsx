import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "../api/axiosClient";
import { startPayment } from "../api/ccavenue";
import styles from "../Component/Styles/BookVDR.module.css";
import AvailabilityCalendar from "./AvailabilityCalendar";
import SearchableBlockDropdown from '../Component/SearchableBlockDropdown';
import useBfcacheReload from "../utils/useBfcacheReload";

/* ====================== CONSTANTS ====================== */
const BOOKING_DURATIONS = [
  { value: "MULTI_DAY", label: "24 Hours / Multi-day", hint: "Choose a start and end date" },
  { value: "EIGHT_HOUR", label: "8 Hours", hint: "Choose one date and start time" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// Keep in sync with backend/utils/bookingRules.js and bookingDuration.js
const MIN_ADVANCE_DAYS = 3;
const MAX_ADVANCE_DAYS = 90;
const MAX_MULTI_DAY_DAYS = 4;

//  License Types
const LICENSE_TYPES = [
  { value: "DSG", label: "DSG (Desicion Space Geosciences)" },
  { value: "PETREL", label: "Petrel" },
  { value: "KINGDOM", label: "Kingdom" },
  { value: "GEOGRAPHIX", label: "GeoGraphix" },
  { value: "HAMPSON_RUSSELL", label: "Hampson-Russell" },
  { value: "OTHER", label: "Other" },
];

//  Room Types
const ROOM_TYPES = [
  { value: "OALP", label: "OALP (Open Acreage Licensing Policy)" },
  { value: "DSF", label: "DSF (Discovered Small Field)" },
  { value: "CBM", label: "CBM (Coal Bed Methane)" },
  { value: "GENERAL", label: "General Data Room" },
];

/* ====================== HELPERS ====================== */
// Calendar dates (startDate/endDate) are plain local dates used only for the
// picker. They are converted to exact IST instants before any comparison with
// bookings or any request to the backend.
const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Whole calendar days from a to b (DST-safe)
const dayDiff = (a, b) =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
      Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000
  );

const formatDisplay = (d) => {
  if (!d) return null;
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

const formatFull = (d) => {
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const buildIndiaDateTime = (date, time) =>
  new Date(`${toDateKey(date)}T${time}:00+05:30`);

const addHours = (date, hours) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

const formatIndiaTime = (date) =>
  date?.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatIndiaDate = (date) =>
  date?.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// Uses the browser/device clock and displays that instant in the booking timezone.
const getCurrentIndiaTimeValue = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  sessionStorage.clear();
};

/* ====================== MINI CALENDAR ====================== */
function MiniCalendar({
  viewYear, viewMonth, startDate, endDate, hoverDate, isDisabled,
  onDayClick, onPrev, onNext, isPrevDisabled, isNextDisabled, onDayHover,
}) {
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Build 42-cell grid: prev overflow + current month + next overflow
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i), overflow: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(viewYear, viewMonth, d), overflow: false });
  const trailing = 42 - cells.length;
  for (let d = 1; d <= trailing; d++)
    cells.push({ date: new Date(viewYear, viewMonth + 1, d), overflow: true });

  const rangeEnd = endDate || hoverDate;
  const isInRange = (date) =>
    !!startDate && !!rangeEnd && date >= startDate && date <= rangeEnd;

  return (
    <div className={styles.miniCal}>
      <div className={styles.calNav}>
        <div className={styles.calMonthLabel}>
          <span className={styles.calMonthTitle}>
            {MONTHS[viewMonth].slice(0, 3)} {viewYear}
          </span>
        </div>
        <div className={styles.calNavBtns}>
          <button
            className={styles.calNavBtn}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={isPrevDisabled}
            type="button"
            aria-label="Previous month"
          >‹</button>
          <button
            className={styles.calNavBtn}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={isNextDisabled}
            type="button"
            aria-label="Next month"
          >›</button>
        </div>
      </div>

      <div className={styles.calGrid}>
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className={styles.calDayHead}>{d}</div>
        ))}

        {cells.map(({ date, overflow }, idx) => {
          const disabled = overflow || isDisabled(date);
          const isStart = !overflow && sameDay(date, startDate);
          const isEnd = !overflow && sameDay(date, endDate);
          const inRange = !overflow && isInRange(date);
          const isToday = !overflow && sameDay(date, new Date());

          let cls = styles.calDay;
          if (overflow) {
            cls += ` ${styles.calDayOverflow}`;
          } else if (disabled) {
            cls += ` ${styles.calDayDisabled}`;
          } else {
            if (isStart) cls += ` ${styles.calDayStart}`;
            else if (isEnd) cls += ` ${styles.calDayEnd}`;
            else if (inRange) cls += ` ${styles.calDayInRange}`;
            if (isToday) cls += ` ${styles.calDayToday}`;
          }

          return (
            <div
              key={idx}
              className={cls}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onDayClick(date);
              }}
              onMouseEnter={() => !disabled && onDayHover(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ====================== LICENSE HELPERS ====================== */
const LICENSE_TITLE_KEYWORDS = {
  DSG:             ["DSG"],
  PETREL:          ["PETREL", "PETRAL", "PETRA"],
  KINGDOM:         ["KINGDOM"],
  GEOGRAPHIX:      ["GEOGRAPHIX", "GEOGRAPH"],
  HAMPSON_RUSSELL: ["HAMPSON", "RUSSELL", "HAMPSON_RUSSELL"],
};

const extractLicense = (room) => {
  if (!room) return "";
  if (room.license_type) return room.license_type;
  const title = (room.title || "").toUpperCase();
  const match = Object.entries(LICENSE_TITLE_KEYWORDS).find(([, keywords]) =>
    keywords.some((kw) => title.includes(kw))
  );
  return match ? match[0] : "";
};

/* ====================== MAIN COMPONENT ====================== */
export default function BookVDR() {
  useBfcacheReload();

  /* --- State --- */
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [durationType, setDurationType] = useState("MULTI_DAY");
  const [eightHourStartTime, setEightHourStartTime] = useState(() => getCurrentIndiaTimeValue());
  const [useDeviceTime, setUseDeviceTime] = useState(true);

  //  License & Room Type
  const [licenseType, setLicenseType] = useState("");
  const [roomType, setRoomType] = useState("GENERAL");
  const [blockNames, setBlockNames] = useState([]);

  // Calendar selection (local calendar dates; see helpers note)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState("checkin");
  const [hoverDate, setHoverDate] = useState(null);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const [bookingsByRoom, setBookingsByRoom] = useState({});
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [weekendNotice, setWeekendNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const calRef = useRef(null);
  const calDropdownRef = useRef(null);
  const bookingFormRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  /* --- Bookable range: today + 3 days ... today + 90 days --- */
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      minDate: addDays(today, MIN_ADVANCE_DAYS),
      maxDate: addDays(today, MAX_ADVANCE_DAYS),
    };
  }, []);

  const holidayMap = useMemo(
    () => new Map(holidays.map((h) => [h.date, h.name])),
    [holidays]
  );

  /* --- Init view month --- */
  useEffect(() => {
    setViewYear(minDate.getFullYear());
    setViewMonth(minDate.getMonth());
  }, [minDate]);

  /* --- Fetch profile --- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/user/profile");
        setUserProfile(res.data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, []);

  /* --- Fetch government holidays --- */
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get("/booking/holidays");
        setHolidays(res.data.holidays || []);
      } catch (err) {
        console.error("Holiday fetch error:", err);
      }
    };
    fetchHolidays();
  }, []);

  /* --- Logout --- */
  const logout = useCallback(async (message) => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // Continue client-side logout even if the session is already expired.
    }
    clearSession();
    if (message) alert(message);
    window.location.replace("/login");
  }, []);

  /* --- Auto logout --- */
  useEffect(() => {
    const showWarning = () => {
      const ok = window.confirm(
        "You've been inactive for 25 minutes. Click OK to stay logged in."
      );
      if (ok) resetTimer();
    };
    const resetTimer = () => {
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(showWarning, 25 * 60 * 1000);
      inactivityTimerRef.current = setTimeout(
        () => logout("You have been logged out due to inactivity."),
        INACTIVITY_TIMEOUT
      );
    };
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach((e) => document.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
    };
  }, [logout]);

  /* --- Bookings for all rooms (feeds both calendars and the overlap check) --- */
  const loadBookings = useCallback(async (roomList) => {
    if (!roomList.length) {
      setBookingsLoading(false);
      return;
    }
    setBookingsLoading(true);
    const entries = await Promise.all(
      roomList.map(async (room) => {
        try {
          const res = await axios.get(`/booking/calendar?room_id=${room.id}`);
          return [String(room.id), res.data.bookings || []];
        } catch (err) {
          console.error(`Failed to load bookings for room ${room.id}:`, err);
          return [String(room.id), []];
        }
      })
    );
    setBookingsByRoom(Object.fromEntries(entries));
    setBookingsLoading(false);
  }, []);

  /* --- Fetch rooms --- */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/rooms");
        const fetchedRooms = res.data.rooms || [];
        setRooms(fetchedRooms);
        if (fetchedRooms.length) setRoomId(String(fetchedRooms[0].id));
        loadBookings(fetchedRooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Failed to load rooms. Please refresh the page.");
        setBookingsLoading(false);
      }
    };
    fetchRooms();
  }, [loadBookings]);

  /* --- Refresh availability when the user comes back to the tab --- */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && rooms.length) loadBookings(rooms);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [rooms, loadBookings]);

  const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));

  /* --- Auto-fill license type on room change --- */
  useEffect(() => {
    setLicenseType(extractLicense(selectedRoom));
  }, [selectedRoom]);

  /* --- Close calendar on outside click --- */
  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) {
        setCalOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Keep the automatic start time current while the user has not picked one.
  useEffect(() => {
    if (durationType !== "EIGHT_HOUR" || !useDeviceTime) return undefined;
    const timer = window.setInterval(
      () => setEightHourStartTime(getCurrentIndiaTimeValue()),
      30 * 1000
    );
    return () => window.clearInterval(timer);
  }, [durationType, useDeviceTime]);

  /* --- Exact booking window (IST instants) --- */
  const bookingWindow = useMemo(() => {
    if (!startDate) return null;
    if (durationType === "EIGHT_HOUR") {
      const start = buildIndiaDateTime(startDate, eightHourStartTime);
      return { start, end: addHours(start, 8) };
    }
    if (!endDate) return null;
    // "To" date is inclusive: access runs until midnight IST after it.
    return {
      start: buildIndiaDateTime(startDate, "00:00"),
      end: buildIndiaDateTime(addDays(endDate, 1), "00:00"),
    };
  }, [startDate, endDate, durationType, eightHourStartTime]);

  const totalDays =
    durationType === "MULTI_DAY" && startDate && endDate
      ? dayDiff(startDate, endDate) + 1
      : null;

  /* --- Date rules for the picker --- */
  const isStartDisabled = useCallback(
    (date) => date < minDate || date > maxDate || holidayMap.has(toDateKey(date)),
    [minDate, maxDate, holidayMap]
  );

  const isDayDisabled = (date) => {
    if (durationType === "MULTI_DAY" && selectingFor === "checkout" && startDate && date >= startDate) {
      return dayDiff(startDate, date) + 1 > MAX_MULTI_DAY_DAYS;
    }
    return isStartDisabled(date);
  };

  /* --- Duration change: reset dates --- */
  const handleDurationChange = (val) => {
    setDurationType(val);
    if (val === "EIGHT_HOUR") {
      setEightHourStartTime(getCurrentIndiaTimeValue());
      setUseDeviceTime(true);
    }
    setStartDate(null);
    setEndDate(null);
    setSelectingFor("checkin");
    setCalOpen(false);
    setError("");
  };

  const handleEightHourTimeChange = (event) => {
    setUseDeviceTime(false);
    setEightHourStartTime(event.target.value);
  };

  const syncWithDeviceTime = () => {
    setUseDeviceTime(true);
    setEightHourStartTime(getCurrentIndiaTimeValue());
  };

  /* --- Open calendar for checkin or checkout --- */
  const openCal = (for_, e) => {
    if (e) e.stopPropagation();
    setSelectingFor(for_);
    setHoverDate(null);
    setCalOpen(true);
    const focus = (for_ === "checkout" ? endDate || startDate : startDate) || minDate;
    setViewYear(focus.getFullYear());
    setViewMonth(focus.getMonth());
    setTimeout(() => {
      calDropdownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  /* --- Day click logic --- */
  const handleDayClick = (date) => {
    setError("");
    if (durationType === "EIGHT_HOUR") {
      setStartDate(date);
      setEndDate(null);
      setCalOpen(false);
      return;
    }
    if (selectingFor === "checkin" || !startDate || date < startDate) {
      setStartDate(date);
      setEndDate(null);
      setSelectingFor("checkout");
    } else {
      setEndDate(date);
      setHoverDate(null);
      setCalOpen(false);
    }
  };

  /* --- Nav --- */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const lastSelectable = addDays(maxDate, MAX_MULTI_DAY_DAYS - 1);
  const isPrevDisabled =
    viewYear * 12 + viewMonth <= minDate.getFullYear() * 12 + minDate.getMonth();
  const isNextDisabled =
    viewYear * 12 + viewMonth >= lastSelectable.getFullYear() * 12 + lastSelectable.getMonth();

  /* --- Overlap with existing bookings for the selected room --- */
  const isDateRangeBlocked = useMemo(() => {
    if (!bookingWindow) return false;
    return (bookingsByRoom[String(roomId)] || []).some(
      (b) =>
        new Date(b.start_datetime) < bookingWindow.end &&
        new Date(b.end_datetime) > bookingWindow.start
    );
  }, [bookingWindow, bookingsByRoom, roomId]);

  /* --- Server-side price & rule preview (single source of truth) --- */
  useEffect(() => {
    if (!roomId || !bookingWindow) {
      setPreview(null);
      setPreviewError("");
      setPreviewLoading(false);
      return undefined;
    }
    let cancelled = false;
    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.post("/booking/preview", {
          room_id: Number(roomId),
          bookingType: durationType,
          start_datetime: bookingWindow.start.toISOString(),
          end_datetime: bookingWindow.end.toISOString(),
        });
        if (!cancelled) {
          setPreview(res.data.preview);
          setPreviewError("");
        }
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(err.response?.data?.message || "Could not calculate the price. Please try again.");
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [roomId, durationType, bookingWindow]);

  const pricing = preview?.pricing;
  const totalPrice = pricing ? Number(pricing.estimatedTotal) : null;
  const surcharge = pricing ? Number(pricing.workingDaySurcharge) : 0;
  const priceMissing = !!pricing && !(Number(pricing.roomPrice) > 0);
  const ruleWarnings = preview?.validationWarnings || [];
  const needsWeekendNotice = !!preview?.hasWeekend;
  const weekendNoticeMissing = needsWeekendNotice && !weekendNotice.trim();

  const canProceed =
    !!bookingWindow && !!preview && !previewLoading && !previewError &&
    !isDateRangeBlocked && !priceMissing && ruleWarnings.length === 0 &&
    !weekendNoticeMissing && !!roomType && !creating;

  const formatSummaryDates = () => {
    if (!bookingWindow) return "";
    if (durationType === "EIGHT_HOUR") {
      const { start, end } = bookingWindow;
      const endDay = formatIndiaDate(end);
      const sameIndiaDay = endDay === formatIndiaDate(start);
      return `${formatIndiaDate(start)}, ${formatIndiaTime(start)} – ${sameIndiaDay ? "" : `${endDay}, `}${formatIndiaTime(end)} IST`;
    }
    return `${formatFull(startDate)} – ${formatFull(endDate)}`;
  };

  /* --- Selectable cells in the availability calendar --- */
  const isSelectableDate = useCallback((date) => !isStartDisabled(date), [isStartDisabled]);

  /* --- Handle date selection from availability calendar --- */
  const handleDateSelectFromCalendar = ({ room, date }) => {
    setRoomId(String(room.id));
    setError("");
    setStartDate(date);
    setEndDate(null);
    setSelectingFor(durationType === "MULTI_DAY" ? "checkout" : "checkin");
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    bookingFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* --- Create booking --- */
  const createBooking = async () => {
    if (!canProceed) return;
    setCreating(true);
    setError("");
    let bookingId = null;
    try {
      const bookingRes = await axios.post("/booking/create", {
        room_id: Number(roomId),
        bookingType: durationType,
        start_datetime: bookingWindow.start.toISOString(),
        end_datetime: bookingWindow.end.toISOString(),
        weekendNotice: needsWeekendNotice ? weekendNotice.trim() : "",
        license_type: licenseType,
        room_type: roomType,
        block_name: blockNames.join(', '),
      });
      bookingId = bookingRes.data.booking_id;
      await startPayment(bookingId);
      // Browser is navigating to the gateway; keep the button disabled.
    } catch (err) {
      if (bookingId) {
        // Payment never started – release the hold so the slot (and a retry) is free.
        axios.put(`/booking/cancel/${encodeURIComponent(bookingId)}`).catch(() => {});
      }
      if (err.response?.status === 409) loadBookings(rooms);
      setError(err.response?.data?.message || err.message || "Booking failed");
      setCreating(false);
    }
  };

  /* ====================== RENDER ====================== */
  return (
    <div className={styles.bookingContainer}>
      {/* HEADER */}
      <div className={styles.bookingHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerTextGroup}>
            <div className={styles.headerLogo}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <h1>Virtual data room booking</h1>
              <p>
                {userProfile ? (
                  <>Welcome, <strong>{userProfile.name}</strong>, select your room and dates</>
                ) : (
                  "Select your room and dates"
                )}
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnAccount}
              onClick={() => (window.location.href = "/account")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              My Account
            </button>
            <button
              className={styles.btnLogout}
              onClick={() => logout()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* AVAILABILITY CALENDAR */}
      <div className={styles.availabilitySection}>
        <AvailabilityCalendar
          rooms={rooms}
          bookingsByRoom={bookingsByRoom}
          loading={bookingsLoading}
          holidays={holidays}
          isSelectableDate={isSelectableDate}
          onDateSelect={handleDateSelectFromCalendar}
        />
      </div>

      {/* BOOKING FORM SECTION */}
      <div className={styles.bookingGrid} ref={bookingFormRef}>
        {/* LEFT */}
        <div>
          {/*  DATE PICKER - Now appears FIRST */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Select Dates</h3>
            <p className={styles.cardSubtitle}>
              Specify the duration for your dedicated virtual space
            </p>

            <div className={styles.formGroup}>
              <label className={styles.sectionLabel}>BOOKING DURATION</label>
              <div className={styles.durationTabs}>
                {BOOKING_DURATIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.durationTab} ${durationType === option.value ? styles.durationTabActive : ""}`}
                    onClick={() => handleDurationChange(option.value)}
                  >
                    <span>{option.label}</span>
                    <small>{option.hint}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.sectionLabel}>
                {durationType === "EIGHT_HOUR" ? "BOOKING DATE & TIME" : "DATE RANGE"}
              </label>
              <div className={styles.dateRangeRow} ref={calRef}>
                <span className={styles.fromToText}>{durationType === "EIGHT_HOUR" ? "Date" : "From"}</span>
                <div
                  className={`${styles.dateRangeInput} ${calOpen && selectingFor === "checkin" ? styles.dateRangeInputActive : ""}`}
                  onClick={(e) => openCal("checkin", e)}
                >
                  <span className={startDate ? styles.dateRangeValue : styles.dateRangePlaceholder}>
                    {startDate ? formatDisplay(startDate) : "Select Date"}
                  </span>
                  <svg className={styles.calIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span className={styles.fromToText}>{durationType === "EIGHT_HOUR" ? "Ends" : "To"}</span>
                <div
                  className={`${styles.dateRangeInput} ${durationType === "MULTI_DAY" && calOpen && selectingFor === "checkout" ? styles.dateRangeInputActive : ""} ${durationType === "EIGHT_HOUR" ? styles.dateRangeInputReadonly : ""}`}
                  onClick={(e) => { if (durationType === "MULTI_DAY" && startDate) openCal("checkout", e); }}
                >
                  <span className={(durationType === "EIGHT_HOUR" ? bookingWindow : endDate) ? styles.dateRangeValue : styles.dateRangePlaceholder}>
                    {durationType === "EIGHT_HOUR"
                      ? bookingWindow
                        ? `${formatIndiaDate(bookingWindow.end)} ${formatIndiaTime(bookingWindow.end)}`
                        : "Auto-calculated"
                      : endDate ? formatDisplay(endDate) : "Select Date"}
                  </span>
                  <svg className={styles.calIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>

                {calOpen && (
                  <div
                    className={styles.calDropdown}
                    ref={calDropdownRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MiniCalendar
                      viewYear={viewYear}
                      viewMonth={viewMonth}
                      startDate={startDate}
                      endDate={durationType === "MULTI_DAY" ? endDate : null}
                      hoverDate={durationType === "MULTI_DAY" && selectingFor === "checkout" ? hoverDate : null}
                      isDisabled={isDayDisabled}
                      onDayClick={handleDayClick}
                      onDayHover={setHoverDate}
                      onPrev={prevMonth}
                      onNext={nextMonth}
                      isPrevDisabled={isPrevDisabled}
                      isNextDisabled={isNextDisabled}
                    />
                  </div>
                )}
              </div>

              <p className={styles.fieldHint}>
                Bookings open {MIN_ADVANCE_DAYS}–{MAX_ADVANCE_DAYS} days ahead
                {durationType === "MULTI_DAY" && <>, up to {MAX_MULTI_DAY_DAYS} days (both dates included)</>}.
                {" "}Government holidays can’t be a start date.
              </p>

              {durationType === "EIGHT_HOUR" && (
                <div className={styles.timeSelection}>
                  <label htmlFor="eight-hour-start">Start time (IST)</label>
                  <input
                    id="eight-hour-start"
                    type="time"
                    value={eightHourStartTime}
                    onChange={handleEightHourTimeChange}
                    step="60"
                  />
                  <button
                    type="button"
                    className={`${styles.deviceTimeButton} ${useDeviceTime ? styles.deviceTimeButtonActive : ""}`}
                    onClick={syncWithDeviceTime}
                  >
                    {useDeviceTime ? "Using device time" : "Use device time"}
                  </button>
                  <span>Access ends automatically after exactly 8 hours.</span>
                </div>
              )}
            </div>

            {/* Duration info */}
            {bookingWindow && (
              <div className={styles.durationInfo}>
                <strong>
                  {durationType === "EIGHT_HOUR"
                    ? "8 Hours"
                    : `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`}
                </strong> &nbsp;·&nbsp;
                {durationType === "EIGHT_HOUR"
                  ? formatSummaryDates()
                  : `${formatFull(startDate)} 00:00 → ${formatFull(endDate)} 23:59 IST`}
                {isDateRangeBlocked && (
                  <span className={styles.blockedWarning}> &nbsp;⚠️ This overlaps with an existing booking</span>
                )}
              </div>
            )}
          </div>

          {/* ROOM + DETAILS */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Select Room</h3>
            <p className={styles.cardSubtitle}>Configure Your environment based on regulatory needs</p>

            <div className={styles.roomGrid}>
              <div className={styles.formGroup}>
                <label>ROOM</label>
                <select
                  className={styles.formSelect}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                >
                  <option value="" disabled>Select specific room....</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={String(r.id)}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>TYPE OF THE DATA ROOM <span className={styles.required}>*</span></label>
                <select
                  className={styles.formSelect}
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  required
                >
                  <option value="" disabled>Select specific room....</option>
                  {ROOM_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Designated Block/Area */}
            <div className={styles.formGroup}>
              <label>DESIGNATED BLOCK/AREA</label>
              <SearchableBlockDropdown
                value={blockNames}
                onChange={(selected) => setBlockNames(selected)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — SUMMARY */}
        <div className={styles.stickyCard}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3 className={styles.summaryTitle}>Booking Summary</h3>
              <p className={styles.summarySubtitle}>Review your selection</p>
            </div>

            {bookingWindow && !isDateRangeBlocked ? (
              <>
                {/* ROOM INFO */}
                <div className={styles.summarySection}>
                  <div className={styles.summaryLabel}>Room Info</div>
                  <div className={styles.summaryValue}>{selectedRoom?.title}</div>
                  {roomType && (
                    <div className={styles.summaryValueSub}>
                      {ROOM_TYPES.find((rt) => rt.value === roomType)?.label}
                    </div>
                  )}
                </div>

                {/* LICENSE */}
                {licenseType && (
                  <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>License</div>
                    <div className={styles.summaryValue}>
                      {LICENSE_TYPES.find((lt) => lt.value === licenseType)?.label || licenseType}
                    </div>
                  </div>
                )}

                {/* BLOCK/AREA */}
                {blockNames.length > 0 && (
                  <div className={styles.summarySection}>
                    <div className={styles.summaryLabel}>Block/Area</div>
                    <div className={styles.summaryValue}>{blockNames.join(", ")}</div>
                  </div>
                )}

                <div className={styles.summaryDivider} />

                {/* DATES + DURATION */}
                <div className={styles.summaryDatesRow}>
                  <div>
                    <div className={styles.summaryLabel}>Dates</div>
                    <div className={styles.summaryValue}>{formatSummaryDates()}</div>
                  </div>
                  <div className={styles.summaryDurationBlock}>
                    <div className={styles.summaryLabel}>Duration</div>
                    <div className={styles.summaryValue}>
                      {durationType === "EIGHT_HOUR"
                        ? "8 Hours"
                        : `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`}
                    </div>
                  </div>
                </div>

                <div className={styles.summaryDividerThick} />

                {/* PRICE (from the server – this is exactly what will be charged) */}
                {previewLoading ? (
                  <p className={styles.summaryNote}>Calculating price…</p>
                ) : pricing ? (
                  <>
                    <div className={styles.summaryPriceRow}>
                      <span>Room charge</span>
                      <span>{formatINR(Number(pricing.roomPrice))}</span>
                    </div>
                    {surcharge > 0 && (
                      <div className={styles.summaryPriceRow}>
                        <span>Working-day surcharge ({preview.workingDays} working days)</span>
                        <span>{formatINR(surcharge)}</span>
                      </div>
                    )}
                    <div className={styles.summaryTotalRow}>
                      <span className={styles.summaryTotalLabel}>Total payable</span>
                      <span className={styles.summaryTotalAmount}>{formatINR(totalPrice)}</span>
                    </div>
                  </>
                ) : null}

                <div className={styles.summaryDivider} />

                {/* Weekend notice – required by the server when the range includes a weekend */}
                {needsWeekendNotice && (
                  <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                    <label htmlFor="weekend-notice">
                      Weekend Notice <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="weekend-notice"
                      className={styles.formTextarea}
                      placeholder="Your dates include a weekend. Please give the reason for weekend access..."
                      value={weekendNotice}
                      onChange={(e) => setWeekendNotice(e.target.value)}
                      maxLength={2000}
                      rows={3}
                    />
                  </div>
                )}

                {previewError && <p className={styles.errorMessage}>{previewError}</p>}
                {ruleWarnings.map((w) => (
                  <p key={w} className={styles.errorMessage}>{w}</p>
                ))}
                {priceMissing && (
                  <p className={styles.errorMessage}>
                    Pricing is not configured for this room. Please contact support.
                  </p>
                )}
                {error && <p className={styles.errorMessage}>{error}</p>}

                <button
                  className={styles.btnProceed}
                  disabled={!canProceed}
                  onClick={createBooking}
                >
                  {creating
                    ? "Processing..."
                    : weekendNoticeMissing
                      ? "Add weekend notice to continue"
                      : "Proceed to Payment →"}
                </button>
              </>
            ) : (
              <div className={styles.noPreview}>
                <svg className={styles.noPreviewIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p className={styles.noPreviewTitle}>
                  {isDateRangeBlocked ? "Dates unavailable" : "No dates selected yet"}
                </p>
                <p className={styles.noPreviewDesc}>
                  {isDateRangeBlocked
                    ? "Selected dates overlap with an existing booking. Please choose different dates or another room."
                    : "Select dates and room type to see your detailed booking summary and estimate costs."}
                </p>
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
