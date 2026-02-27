import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axiosClient";
import styles from "../Component/Styles/BookVDR.module.css";
import AvailabilityCalendar from "./AvailabilityCalendar";

/* ====================== CONSTANTS ====================== */
const DURATION_MAP = {
  FULL_DAY: 1440,
  MULTI_DAY: "range",
  ONE_WEEK: 10080,
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

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
    return date > checkIn && date < end;
  };

  return (
    <div className={styles.miniCal}>
      <div className={styles.calNav}>
        <button
          className={styles.calNavBtn}
          onClick={onPrev}
          disabled={isPrevDisabled}
          type="button"
        >
          ‹
        </button>
        <span className={styles.calMonthTitle}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button className={styles.calNavBtn} onClick={onNext} type="button">
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
              onClick={() => !disabled && onDayClick(date)}
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
  const [durationType, setDurationType] = useState("FULL_DAY");

  // Data Catalogue
  const [dataCategory, setDataCategory] = useState("");
  const [dataSubCategory, setDataSubCategory] = useState("");
  const [dataRequirements, setDataRequirements] = useState("");

  // Calendar
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [selectingFor, setSelectingFor] = useState("checkin"); // 'checkin' | 'checkout'
  const [hoverDate, setHoverDate] = useState(null);
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);

  const [calendarBookings, setCalendarBookings] = useState([]);
  const [weekendNotice, setWeekendNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const calRef = useRef(null);
  const bookingFormRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  /* --- Min bookable date: today + 3 days --- */
  const minDate = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3);
    return d;
  })();

  /* --- Init view month --- */
  useEffect(() => {
    setViewYear(minDate.getFullYear());
    setViewMonth(minDate.getMonth());
  }, []);

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
    const events = ["mousedown","mousemove","keypress","scroll","touchstart","click"];
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
      setRooms(res.data.rooms || []);
      if (res.data.rooms?.length) setRoomId(res.data.rooms[0].id);
    };
    fetchRooms();
  }, []);

  /* --- Fetch calendar bookings --- */
  const fetchCalendar = async (room_id) => {
    const res = await axios.get(`/booking/calendar?room_id=${room_id}`);
    setCalendarBookings(res.data.bookings || []);
  };
  useEffect(() => {
    if (roomId) fetchCalendar(roomId);
  }, [roomId]);

  /* --- Close calendar on outside click --- */
  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) {
        setCalOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* --- Duration change: reset dates --- */
  const handleDurationChange = (val) => {
    setDurationType(val);
    setCheckIn(null);
    setCheckOut(null);
    setCalOpen(false);
  };

  /* --- Open calendar for checkin or checkout --- */
  const openCal = (for_) => {
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
  };

  /* --- Day click logic --- */
  const handleDayClick = (date) => {
    if (durationType === "FULL_DAY") {
      // Auto checkout = +1 day
      const co = new Date(date);
      co.setDate(co.getDate() + 1);
      setCheckIn(date);
      setCheckOut(co);
      setCalOpen(false);
    } else if (durationType === "ONE_WEEK") {
      // Auto checkout = +7 days
      const co = new Date(date);
      co.setDate(co.getDate() + 7);
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

  /* --- Slot blocked check (for FULL_DAY / ONE_WEEK) --- */
  const isDateRangeBlocked = () => {
    if (!checkIn || !checkOut) return false;
    return calendarBookings.some(
      (b) =>
        new Date(b.start_datetime) < checkOut &&
        new Date(b.end_datetime) > checkIn
    );
  };

  /* --- Booking summary values --- */
  const durationLabel = {
    FULL_DAY: "24 Hours",
    MULTI_DAY: "Multiple Days",
    ONE_WEEK: "1 Week",
  }[durationType];

  const diffDays =
    checkIn && checkOut
      ? Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      : null;

  const isReady = checkIn && checkOut && !isDateRangeBlocked() && 
                  dataCategory && dataRequirements.trim().length >= 50;

  /* --- Handle date selection from availability calendar --- */
  const handleDateSelectFromCalendar = (selection) => {
    // Set the selected room
    setRoomId(selection.room.id);
    
    // Set the check-in date
    const selectedDate = new Date(selection.date);
    setCheckIn(selectedDate);
    
    // Auto-set checkout based on booking type
    if (durationType === "FULL_DAY") {
      const co = new Date(selectedDate);
      co.setDate(co.getDate() + 1);
      setCheckOut(co);
    } else if (durationType === "ONE_WEEK") {
      const co = new Date(selectedDate);
      co.setDate(co.getDate() + 7);
      setCheckOut(co);
    } else {
      setCheckOut(null);
    }
    
    // Scroll to booking form
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
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
        start_datetime: checkIn,
        end_datetime: checkOut,
        weekendNotice,
        data_category: dataCategory,
        data_subcategory: dataSubCategory,
        data_requirements: dataRequirements,
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

      {/* AVAILABILITY CALENDAR - NEW SECTION */}
      <div className={styles.availabilitySection}>
        <AvailabilityCalendar onDateSelect={handleDateSelectFromCalendar} />
      </div>

      {/* BOOKING FORM SECTION */}
      <div className={styles.bookingGrid} ref={bookingFormRef}>
        {/* LEFT */}
        <div>
          {/* ROOM + DURATION */}
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

            <div className={styles.formGroup}>
              <label>Booking Type</label>
              <div className={styles.durationTabs}>
                {[
                  { val: "FULL_DAY", label: "⚡ 24 Hours" },
                  { val: "MULTI_DAY", label: "📅 Multiple Days" },
                  { val: "ONE_WEEK",  label: "🗓️ 1 Week" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.durationTab} ${durationType === val ? styles.durationTabActive : ""}`}
                    onClick={() => handleDurationChange(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DATA CATALOGUE SECTION - NEW */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Data Catalogue</h3>
            <p className={styles.cardSubtitle}>Select the data you wish to access in VDR</p>

            <div className={styles.formGroup}>
              <label>Main Category <span className={styles.required}>*</span></label>
              <select
                className={styles.formSelect}
                value={dataCategory}
                onChange={(e) => {
                  setDataCategory(e.target.value);
                  setDataSubCategory(""); // Reset subcategory when main changes
                }}
              >
                <option value="">Select Category...</option>
                <option value="sedimentary_basins">Sedimentary Basins</option>
                <option value="seismic_data">Seismic Data</option>
                <option value="well_data">Well Data</option>
                <option value="geological_maps">Geological Maps</option>
                <option value="production_data">Production Data</option>
                <option value="other">Other</option>
              </select>
            </div>

            {dataCategory && dataCategory !== "other" && (
              <div className={styles.formGroup}>
                <label>Sub-Category <span className={styles.required}>*</span></label>
                <select
                  className={styles.formSelect}
                  value={dataSubCategory}
                  onChange={(e) => setDataSubCategory(e.target.value)}
                >
                  <option value="">Select Sub-Category...</option>
                  {dataCategory === "sedimentary_basins" && (
                    <>
                      <option value="krishna_godavari">Krishna-Godavari Basin</option>
                      <option value="mumbai_offshore">Mumbai Offshore Basin</option>
                      <option value="cauvery">Cauvery Basin</option>
                      <option value="cambay">Cambay Basin</option>
                      <option value="assam_arakan">Assam-Arakan Basin</option>
                      <option value="rajasthan">Rajasthan Basin</option>
                    </>
                  )}
                  {dataCategory === "seismic_data" && (
                    <>
                      <option value="2d_seismic">2D Seismic</option>
                      <option value="3d_seismic">3D Seismic</option>
                      <option value="4d_seismic">4D Seismic</option>
                      <option value="avo_analysis">AVO Analysis</option>
                    </>
                  )}
                  {dataCategory === "well_data" && (
                    <>
                      <option value="well_logs">Well Logs</option>
                      <option value="core_data">Core Data</option>
                      <option value="drill_stem_test">Drill Stem Test</option>
                      <option value="completion_data">Completion Data</option>
                    </>
                  )}
                  {dataCategory === "geological_maps" && (
                    <>
                      <option value="structural_maps">Structural Maps</option>
                      <option value="isopach_maps">Isopach Maps</option>
                      <option value="facies_maps">Facies Maps</option>
                      <option value="bathymetry">Bathymetry Maps</option>
                    </>
                  )}
                  {dataCategory === "production_data" && (
                    <>
                      <option value="daily_production">Daily Production</option>
                      <option value="reservoir_performance">Reservoir Performance</option>
                      <option value="decline_curves">Decline Curves</option>
                      <option value="pvt_analysis">PVT Analysis</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>
                Data Requirements Detail <span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHelper}>
                Please provide detailed information about the specific data you need to access
              </p>
              <textarea
                className={styles.formTextarea}
                placeholder="Example: I need 3D seismic data for Block KG-DWN-2005/1 covering the period 2018-2023, including processed volumes and interpretation reports. Also require well log data from wells KG-A1, KG-A2, and KG-A3 with gamma ray, resistivity, and sonic logs."
                value={dataRequirements}
                onChange={(e) => setDataRequirements(e.target.value)}
                rows={6}
                required
              />
              <div className={styles.charCount}>
                {dataRequirements.length} / 1000 characters
              </div>
            </div>
          </div>

          {/* DATE PICKER — MakeMyTrip Style */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Select Dates</h3>
            <p className={styles.cardSubtitle}>
              {durationType === "FULL_DAY" && "Pick check-in date — checkout auto set to next day"}
              {durationType === "MULTI_DAY" && "Pick check-in then check-out date"}
              {durationType === "ONE_WEEK" && "Pick start date — checkout auto set to +7 days"}
            </p>

            {/* Date Fields */}
            <div className={styles.dateFieldsRow} ref={calRef}>
              {/* Check-in */}
              <div
                className={`${styles.dateField} ${calOpen && selectingFor === "checkin" ? styles.dateFieldActive : ""}`}
                onClick={() => openCal("checkin")}
              >
                <div className={styles.dateFieldLabel}>
                  <span className={styles.dateFieldIcon}>✈</span> Check-in
                </div>
                {checkIn ? (
                  <>
                    <div className={styles.dateFieldValue}>{formatDisplay(checkIn)}</div>
                    <div className={styles.dateFieldDay}>
                      {checkIn.toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                  </>
                ) : (
                  <div className={styles.dateFieldPlaceholder}>Add Date</div>
                )}
              </div>

              <div className={styles.dateFieldDivider}>→</div>

              {/* Check-out */}
              <div
                className={`${styles.dateField} ${
                  durationType === "MULTI_DAY" && calOpen && selectingFor === "checkout"
                    ? styles.dateFieldActive : ""
                } ${durationType !== "MULTI_DAY" ? styles.dateFieldReadonly : ""}`}
                onClick={() => durationType === "MULTI_DAY" && checkIn && openCal("checkout")}
              >
                <div className={styles.dateFieldLabel}>
                  <span className={styles.dateFieldIcon}>🏁</span> Check-out
                </div>
                {checkOut ? (
                  <>
                    <div className={styles.dateFieldValue}>{formatDisplay(checkOut)}</div>
                    <div className={styles.dateFieldDay}>
                      {checkOut.toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                  </>
                ) : (
                  <div className={styles.dateFieldPlaceholder}>
                    {durationType === "MULTI_DAY" ? "Add Date" : "Auto"}
                  </div>
                )}
              </div>

              {/* Calendar Dropdown */}
              {calOpen && viewYear !== null && (
                <div className={styles.calDropdown}>
                  {/* Info strip */}
                  <div className={styles.calInfoStrip}>
                    <span>📌</span>
                    <span>
                      Earliest bookable: <strong>{formatDisplay(minDate)}</strong>
                      &nbsp;|&nbsp; Bookings open 3 days in advance
                    </span>
                  </div>

                  {/* Selecting label */}
                  <div className={styles.calSelectingLabel}>
                    {selectingFor === "checkin"
                      ? "🟦 Select Check-in Date"
                      : "🟩 Select Check-out Date"}
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
                ✅ <strong>{diffDays} {diffDays === 1 ? "Day" : "Days"}</strong> &nbsp;·&nbsp;
                {formatFull(checkIn)} → {formatFull(checkOut)}
                {isDateRangeBlocked() && (
                  <span className={styles.blockedWarning}> &nbsp;⚠️ These dates overlap with an existing booking</span>
                )}
              </div>
            )}
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
                    <span>Type:</span>
                    <strong>{durationLabel}</strong>
                  </div>
                  <div className={styles.previewDivider} />
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
                  
                  {dataCategory && (
                    <>
                      <div className={styles.previewDivider} />
                      <div className={styles.previewRow}>
                        <span>Data Category:</span>
                        <strong style={{ textTransform: 'capitalize' }}>
                          {dataCategory.replace(/_/g, ' ')}
                        </strong>
                      </div>
                    </>
                  )}
                  
                  {dataSubCategory && (
                    <>
                      <div className={styles.previewDivider} />
                      <div className={styles.previewRow}>
                        <span>Sub-Category:</span>
                        <strong style={{ textTransform: 'capitalize' }}>
                          {dataSubCategory.replace(/_/g, ' ')}
                        </strong>
                      </div>
                    </>
                  )}
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
                  {!dataCategory
                    ? "Please select a data category to proceed"
                    : !dataRequirements || dataRequirements.trim().length < 50
                    ? "Please provide detailed data requirements (minimum 50 characters)"
                    : !checkIn
                    ? "Please select a check-in date"
                    : !checkOut
                    ? "Please select a check-out date"
                    : "Selected dates are unavailable"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}