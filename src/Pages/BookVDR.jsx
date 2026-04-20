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
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    days.push(new Date(viewYear, viewMonth, d));

  const isInRange = (date) => {
    if (!checkIn || !date) return false;
    const end = checkOut || hoverDate;
    if (!end) return false;
    return date >= checkIn && date <= end;
  };

  return (
    <div className={styles.miniCal}>
      <div className={styles.calNav}>
        <button
          className={styles.calNavBtn}
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          disabled={isPrevDisabled}
          type="button"
        >
          ‹
        </button>
        <span className={styles.calMonthTitle}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          className={styles.calNavBtn}
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          type="button"
        >
          ›
        </button>
      </div>

      <div className={styles.calGrid}>
        {DAYS_SHORT.map((d) => (
          <div key={d} className={styles.calDayHead}>{d}</div>
        ))}

        {days.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;

          const disabled = date < minDate;
          const isStart = checkIn && sameDay(date, checkIn);
          const isEnd = checkOut && sameDay(date, checkOut);
          const inRange = isInRange(date);
          const isToday = sameDay(date, new Date());

          let cls = styles.calDay;
          if (disabled) cls += ` ${styles.calDayDisabled}`;
          else {
            if (isStart) cls += ` ${styles.calDayStart}`;
            else if (isEnd) cls += ` ${styles.calDayEnd}`;
            else if (inRange) cls += ` ${styles.calDayInRange}`;
            if (isToday) cls += ` ${styles.calDayToday}`;
          }

          return (
            <div
              key={date.getTime()}
              className={cls}
              onClick={(e) => {
                e.stopPropagation();
                !disabled && onDayClick(date);
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
      const res = await axios.get("/rooms");
      const fetchedRooms = res.data.rooms || [];
      setRooms(fetchedRooms);
      if (fetchedRooms.length) {
        setRoomId(fetchedRooms[0].id);
        if (fetchedRooms[0].license_type) {
          setLicenseType(fetchedRooms[0].license_type);
        }
      }
    };
    fetchRooms();
  }, []);

  /* --- Auto-fill license type on room change --- */
  useEffect(() => {
    if (!roomId || !rooms.length) return;
    const selectedRoom = rooms.find((r) => String(r.id) === String(roomId));
    if (selectedRoom?.license_type) {
      setLicenseType(selectedRoom.license_type);
    }
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

  const isReady = checkIn && checkOut && !isDateRangeBlocked() &&
    licenseType && roomType;

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
          <div>
            <h1>Virtual Data Room Booking</h1>
            <p>
              {userProfile ? (
                <>Welcome, <strong>{userProfile.name}</strong>! </>
              ) : null}
              Select your room and dates
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className={styles.btnAccount}
              onClick={() => (window.location.href = "/account")}
            >
              My Account
            </button>
            <button
              className={styles.btnLogout}
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
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
              {durationType === "MULTI_DAY" && "Pick start then end date"}
            </p>

            <div className={styles.dateFieldsRow} ref={calRef}>
              {/* Start Date */}
              <div
                className={`${styles.dateField} ${calOpen && selectingFor === "checkin" ? styles.dateFieldActive : ""}`}
                onClick={(e) => openCal("checkin", e)}
              >
                {checkIn ? (
                  <>
                    <div className={styles.dateFieldValue}>{formatDisplay(checkIn)}</div>
                    <div className={styles.dateFieldDay}>
                      {checkIn.toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                  </>
                ) : (
                  <div className={styles.dateFieldPlaceholder}>Select Start Date</div>
                )}
              </div>

              <div className={styles.dateFieldDivider}>→</div>

              {/* End Date */}
              <div
                className={`${styles.dateField} ${durationType === "MULTI_DAY" && calOpen && selectingFor === "checkout"
                    ? styles.dateFieldActive : ""
                  }`}
                onClick={(e) => {
                  if (durationType === "MULTI_DAY" && checkIn) openCal("checkout", e);
                }}
              >
                {checkOut ? (
                  <>
                    <div className={styles.dateFieldValue}>{formatDisplay(checkOut)}</div>
                    <div className={styles.dateFieldDay}>
                      {checkOut.toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                  </>
                ) : (
                  <div className={styles.dateFieldPlaceholder}>Select End Date</div>
                )}
              </div>

              {/*  CALENDAR DROPDOWN - Fixed condition */}
              {calOpen && (
                <div
                  className={styles.calDropdown}
                  ref={calDropdownRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.calInfoStrip}>
                    <span>📌</span>
                    <span>
                      Earliest bookable: <strong>{formatDisplay(minDate)}</strong>
                      &nbsp;|&nbsp; Bookings open 3 days in advance
                    </span>
                  </div>

                  <div className={styles.calSelectingLabel}>
                    {selectingFor === "checkin"
                      ? "🟦 Select Start Date"
                      : "🟩 Select End Date"}
                  </div>

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
            <p className={styles.cardSubtitle}>Choose your preferred VDR</p>

            <div className={styles.formGroup}>
              <label>Room</label>
              <select
                className={styles.formSelect}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            {/*  License Type */}
            <div className={styles.formGroup}>
              <label>License Type <span className={styles.required}>*</span></label>
              <select
                className={styles.formSelect}
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                required
              >
                <option value="">Select License...</option>
                {LICENSE_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>{lt.label}</option>
                ))}
              </select>
            </div>

            {/*  Room Type */}
            <div className={styles.formGroup}>
              <label>Type of Data Room <span className={styles.required}>*</span></label>
              <select
                className={styles.formSelect}
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                required
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>

            {/* Designated Block/Area - UPDATED */}
            <div className={styles.formGroup}>
              <label>Designated Block/Area</label>
              <SearchableBlockDropdown
                value={blockNames}
                onChange={(selected) => setBlockNames(selected)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — SUMMARY */}
        <div className={styles.stickyCard}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Booking Summary</h3>
            <p className={styles.cardSubtitle}>Review your selection</p>

            {isReady ? (
              <>
                <div className={styles.previewDetails}>
                  <div className={styles.previewRow}>
                    <span>Room:</span>
                    <strong>{rooms.find((r) => r.id === roomId)?.title}</strong>
                  </div>
                  <div className={styles.previewDivider} />

                  <div className={styles.previewRow}>
                    <span>License:</span>
                    <strong>{LICENSE_TYPES.find(lt => lt.value === licenseType)?.label}</strong>
                  </div>
                  <div className={styles.previewDivider} />

                  <div className={styles.previewRow}>
                    <span>Room Type:</span>
                    <strong>{ROOM_TYPES.find(rt => rt.value === roomType)?.label}</strong>
                  </div>
                  <div className={styles.previewDivider} />

                  {blockNames.length > 0 && (
                    <>
                      <div className={styles.previewRow}>
                        <span>Block/Area:</span>
                        <strong>{blockNames.join(', ')}</strong>
                      </div>
                      <div className={styles.previewDivider} />
                    </>
                  )}

                  <div className={styles.previewRow}>
                    <span>Check-in:</span>
                    <strong>{formatFull(checkIn)}</strong>
                  </div>
                  <div className={styles.previewDivider} />

                  <div className={styles.previewRow}>
                    <span>Check-out:</span>
                    <strong>{formatFull(checkOut)}</strong>
                  </div>
                  <div className={styles.previewDivider} />

                  <div className={styles.previewRow}>
                    <span>Duration:</span>
                    <strong>{diffDays} {diffDays === 1 ? "Day" : "Days"}</strong>
                  </div>
                </div>

                <div className={styles.formGroup}>
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
                  className={styles.btnConfirm}
                  disabled={creating}
                  onClick={createBooking}
                >
                  {creating ? "Processing..." : "Proceed to Payment →"}
                </button>
              </>
            ) : (
              <div className={styles.noPreview}>
                <p>
                  {isDateRangeBlocked()
                    ? "Selected dates are unavailable — they overlap with an existing booking"
                    : !checkIn
                      ? "Please select a check-in date"
                      : !checkOut
                        ? "Please select a check-out date"
                        : !licenseType
                          ? "Please select a license type to proceed"
                          : "Please select room type"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}