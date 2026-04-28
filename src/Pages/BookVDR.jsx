import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "../api/axiosClient";
import styles from "../Component/Styles/BookVDR.module.css";
import AvailabilityCalendar from "./AvailabilityCalendar";
import SearchableBlockDropdown from '../Component/SearchableBlockDropdown';

/* ====================== CONSTANTS ====================== */
const DURATION_MAP = {
  FULL_DAY: 1440,
  MULTI_DAY: "range",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

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
const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

/* ====================== MINI CALENDAR ====================== */
function MiniCalendar({
  viewYear, viewMonth, minDate, checkIn, checkOut,
  onDayClick, onPrev, onNext, isPrevDisabled, hoverDate, onDayHover,
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

  const isInRange = (date) => {
    if (!checkIn || !date) return false;
    const end = checkOut || hoverDate;
    if (!end) return false;
    return date >= checkIn && date <= end;
  };

  return (
    <div className={styles.miniCal}>
      <div className={styles.calNav}>
        <div className={styles.calMonthLabel}>
          <span className={styles.calMonthTitle}>
            {MONTHS[viewMonth].slice(0, 3)} {viewYear}
          </span>
          <span className={styles.calDropArrow}>∨</span>
        </div>
        <div className={styles.calNavBtns}>
          <button
            className={styles.calNavBtn}
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={isPrevDisabled}
            type="button"
          >‹</button>
          <button
            className={styles.calNavBtn}
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            type="button"
          >›</button>
        </div>
      </div>

      <div className={styles.calGrid}>
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className={styles.calDayHead}>{d}</div>
        ))}

        {cells.map(({ date, overflow }, idx) => {
          const disabled = overflow || date < minDate;
          const isStart = !overflow && checkIn && sameDay(date, checkIn);
          const isEnd = !overflow && checkOut && sameDay(date, checkOut);
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
                if (!overflow && !disabled) onDayClick(date);
              }}
              onMouseEnter={() => !overflow && !disabled && onDayHover(date)}
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
  /* --- State --- */
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [durationType, setDurationType] = useState("MULTI_DAY");

  //  License & Room Type
  const [licenseType, setLicenseType] = useState("");
  const [roomType, setRoomType] = useState("GENERAL");
  const [blockNames, setBlockNames] = useState([]);

  // Calendar -  FIX: Initialize with default values
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState("checkin");
  const [hoverDate, setHoverDate] = useState(null);

  //  FIX: Initialize with current date values
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [calendarBookings, setCalendarBookings] = useState([]);
  const [weekendNotice, setWeekendNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const calRef = useRef(null);
  const calDropdownRef = useRef(null);
  const bookingFormRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  /* --- Min bookable date: today + 3 days --- */
  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3);
    return d;
  }, []);

  /* --- Init view month --- */
  useEffect(() => {
    setViewYear(minDate.getFullYear());
    setViewMonth(minDate.getMonth());
  }, [minDate]);

  /* --- Auth check --- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

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

  /* --- Auto logout --- */
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();
      alert("You have been logged out due to inactivity.");
      window.location.href = "/login";
    };
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
      inactivityTimerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach((e) => document.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
    };
  }, []);

  /* --- Fetch rooms --- */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/rooms");
        const fetchedRooms = res.data.rooms || [];
        setRooms(fetchedRooms);
        if (fetchedRooms.length) {
          setRoomId(fetchedRooms[0].id);
          setLicenseType(extractLicense(fetchedRooms[0]));
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Failed to load rooms. Please refresh the page.");
      }
    };
    fetchRooms();
  }, []);

  /* --- Auto-fill license type on room change --- */
  useEffect(() => {
    if (!roomId || !rooms.length) return;
    const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));
    setLicenseType(extractLicense(selectedRoom));
  }, [roomId, rooms]);

  /* --- Fetch calendar bookings --- */
  const fetchCalendar = useCallback(async (room_id) => {
    const res = await axios.get(`/booking/calendar?room_id=${room_id}`);
    setCalendarBookings(res.data.bookings || []);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const load = async () => {
      await fetchCalendar(roomId);
    };
    load();
  }, [roomId, fetchCalendar]);

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

  /* --- Duration change: reset dates --- */
  const handleDurationChange = (val) => {
    setDurationType(val);
    setCheckIn(null);
    setCheckOut(null);
    setCalOpen(false);
    setError("");
  };

  /* --- Open calendar for checkin or checkout --- */
  const openCal = (for_, e) => {
    if (e) e.stopPropagation();
    setSelectingFor(for_);
    setCalOpen(true);
    if (for_ === "checkout" && checkOut) {
      setViewYear(checkOut.getFullYear());
      setViewMonth(checkOut.getMonth());
    } else if (for_ === "checkin" && checkIn) {
      setViewYear(checkIn.getFullYear());
      setViewMonth(checkIn.getMonth());
    } else {
      setViewYear(minDate.getFullYear());
      setViewMonth(minDate.getMonth());
    }
    setTimeout(() => {
      calDropdownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  /* --- Day click logic --- */
  const handleDayClick = (date) => {
    if (durationType === "FULL_DAY") {
      const co = new Date(date);
      co.setDate(co.getDate() + 1);
      setCheckIn(date);
      setCheckOut(co);
      setCalOpen(false);
    } else {
      // MULTI_DAY: user picks both
      if (selectingFor === "checkin" || !checkIn || date <= checkIn) {
        setCheckIn(date);
        setCheckOut(null);
        setSelectingFor("checkout");
      } else {
        setCheckOut(date);
        setCalOpen(false);
      }
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
  const isPrevDisabled =
    viewYear === minDate.getFullYear() && viewMonth <= minDate.getMonth();

  /* --- Slot blocked check --- */
  const isDateRangeBlocked = () => {
    if (!checkIn || !checkOut) return false;
    return calendarBookings.some(
      (b) =>
        new Date(b.start_datetime) < checkOut &&
        new Date(b.end_datetime) > checkIn
    );
  };

  /* --- Booking summary values --- */
  const diffDays =
    checkIn && checkOut
      ? durationType === "FULL_DAY"
        ? 1
        : Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)) + 1
      : null;

  /* --- Pricing --- */
  const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));
  const pricePerDay = selectedRoom ? (parseFloat(selectedRoom.full_day_rate) || 5000) : 5000;
  const totalPrice = diffDays ? diffDays * pricePerDay : null;

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const formatSummaryDates = (start, end) => {
    if (!start || !end) return "";
    const s = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const e = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${s} - ${e}`;
  };

  const isReady = checkIn && checkOut && !isDateRangeBlocked() && roomType;

  /* --- Handle date selection from availability calendar --- */
  const handleDateSelectFromCalendar = (selection) => {
    setRoomId(selection.room.id);
    const selectedDate = new Date(selection.date);
    setCheckIn(selectedDate);
    if (durationType === "FULL_DAY") {
      const co = new Date(selectedDate);
      co.setDate(co.getDate() + 1);
      setCheckOut(co);
    } else {
      setCheckOut(null);
    }
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* --- Create booking --- */
  const createBooking = async () => {
    if (!isReady) return;
    setCreating(true);
    setError("");
    try {
      const bookingRes = await axios.post("/booking/create", {
        room_id: roomId,
        bookingType: durationType,
        start_datetime: checkIn.toISOString(),
        end_datetime: checkOut.toISOString(),
        weekendNotice,
        license_type: licenseType,
        room_type: roomType,
        block_name: blockNames.join(', '),
      });
      const bookingId = bookingRes.data.booking_id;
      const paymentRes = await axios.post("/payment/initiate", { booking_id: bookingId });
      if (paymentRes.data.success) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paymentRes.data.paymentUrl;
        const enc = document.createElement("input");
        enc.type = "hidden"; enc.name = "encRequest";
        enc.value = paymentRes.data.encRequest;
        form.appendChild(enc);
        const ac = document.createElement("input");
        ac.type = "hidden"; ac.name = "access_code";
        ac.value = paymentRes.data.accessCode;
        form.appendChild(ac);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
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
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
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
        <AvailabilityCalendar onDateSelect={handleDateSelectFromCalendar} />
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
              <label className={styles.sectionLabel}>DATE RANGE</label>
              <div className={styles.dateRangeRow} ref={calRef}>
                <span className={styles.fromToText}>From</span>
                <div
                  className={`${styles.dateRangeInput} ${calOpen && selectingFor === "checkin" ? styles.dateRangeInputActive : ""}`}
                  onClick={(e) => openCal("checkin", e)}
                >
                  <span className={checkIn ? styles.dateRangeValue : styles.dateRangePlaceholder}>
                    {checkIn ? formatDisplay(checkIn) : "Select Date"}
                  </span>
                  <svg className={styles.calIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span className={styles.fromToText}>To</span>
                <div
                  className={`${styles.dateRangeInput} ${durationType === "MULTI_DAY" && calOpen && selectingFor === "checkout" ? styles.dateRangeInputActive : ""}`}
                  onClick={(e) => { if (durationType === "MULTI_DAY" && checkIn) openCal("checkout", e); }}
                >
                  <span className={checkOut ? styles.dateRangeValue : styles.dateRangePlaceholder}>
                    {checkOut ? formatDisplay(checkOut) : "Select Date"}
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
                      minDate={minDate}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      hoverDate={hoverDate}
                      onDayClick={handleDayClick}
                      onDayHover={setHoverDate}
                      onPrev={prevMonth}
                      onNext={nextMonth}
                      isPrevDisabled={isPrevDisabled}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Duration info */}
            {checkIn && checkOut && (
              <div className={styles.durationInfo}>
                <strong>{diffDays} {diffDays === 1 ? "Day" : "Days"}</strong> &nbsp;·&nbsp;
                {formatFull(checkIn)} → {formatFull(checkOut)}
                {isDateRangeBlocked() && (
                  <span className={styles.blockedWarning}> &nbsp;⚠️ These dates overlap with an existing booking</span>
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
                    <option key={r.id} value={r.id}>{r.title}</option>
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

            {isReady ? (
              <>
                {/* ROOM INFO */}
                <div className={styles.summarySection}>
                  <div className={styles.summaryLabel}>Room Info</div>
                  <div className={styles.summaryValue}>
                    {rooms.find((r) => String(r.id) === String(roomId))?.title}
                  </div>
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
                    <div className={styles.summaryValue}>
                      {formatSummaryDates(checkIn, checkOut)}
                    </div>
                  </div>
                  <div className={styles.summaryDurationBlock}>
                    <div className={styles.summaryLabel}>Duration</div>
                    <div className={styles.summaryValue}>
                      {diffDays} {diffDays === 1 ? "Day" : "Days"}
                    </div>
                  </div>
                </div>

                <div className={styles.summaryDividerThick} />

                {/* TOTAL */}
                <div className={styles.summaryTotalRow}>
                  <span className={styles.summaryTotalLabel}>Total Est.</span>
                  <span className={styles.summaryTotalAmount}>{formatINR(totalPrice)}</span>
                </div>

                <div className={styles.summaryDivider} />

                {/* Weekend notice */}
                <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                  <label>Weekend Notice (if applicable)</label>
                  <textarea
                    className={styles.formSelect}
                    placeholder="Reason for weekend booking..."
                    value={weekendNotice}
                    onChange={(e) => setWeekendNotice(e.target.value)}
                    rows={3}
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <button
                  className={styles.btnProceed}
                  disabled={creating}
                  onClick={createBooking}
                >
                  {creating ? "Processing..." : "Proceed to Payment →"}
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
                <p className={styles.noPreviewTitle}>No dates selected yet</p>
                <p className={styles.noPreviewDesc}>
                  {isDateRangeBlocked()
                    ? "Selected dates are unavailable — they overlap with an existing booking"
                    : "Select dates and room type to see your detailed booking summary and estimate costs."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}