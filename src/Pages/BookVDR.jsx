import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axiosClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../Component/Styles/BookVDR.module.css";

/* ====================== CONSTANTS ====================== */
const DURATION_MAP = {
  HALF_HOUR: 30,
  HOURLY: 60,
  FULL_DAY: 1440,
  MULTI_DAY: 10080,
};

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function BookVDR() {
  /* ====================== STATE ====================== */
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [durationType, setDurationType] = useState("HOURLY");
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekendNotice, setWeekendNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null); // ✅ NEW

  /* ====================== AUTO LOGOUT REFS ====================== */
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  /* ====================== AUTH CHECK ====================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  /* ====================== FETCH USER PROFILE ✅ NEW ====================== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/user/profile');
        setUserProfile(res.data.user);
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };
    fetchProfile();
  }, []);

  /* ====================== AUTO LOGOUT ON INACTIVITY ====================== */
  useEffect(() => {
    const handleLogoutDueToInactivity = () => {
      localStorage.removeItem("token");
      alert("You have been logged out due to inactivity.");
      window.location.href = "/login";
    };

    const showInactivityWarning = () => {
      const userResponse = window.confirm(
        "You've been inactive for 25 minutes. You'll be logged out in 5 minutes. Click OK to stay logged in."
      );
      
      if (userResponse) {
        resetInactivityTimer();
      }
    };

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      warningTimerRef.current = setTimeout(showInactivityWarning, 25 * 60 * 1000);
      inactivityTimerRef.current = setTimeout(handleLogoutDueToInactivity, INACTIVITY_TIMEOUT);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, []);

  /* ====================== FETCH ROOMS ====================== */
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await axios.get("/rooms");
      setRooms(res.data.rooms || []);
      if (res.data.rooms?.length) {
        setRoomId(res.data.rooms[0].id);
      }
    };
    fetchRooms();
  }, []);

  /* ====================== FETCH CALENDAR BOOKINGS ====================== */
  const fetchCalendar = async (room_id) => {
    const res = await axios.get(`/booking/calendar?room_id=${room_id}`);
    setCalendarBookings(res.data.bookings || []);
  };

  useEffect(() => {
    if (roomId) fetchCalendar(roomId);
  }, [roomId]);

  /* ====================== 3-DAY RULE ====================== */
  const minBookingDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d;
  };

  /* ====================== SLOT GENERATION ====================== */
  const generateSlots = (date) => {
    if (!date) return [];

    const duration = DURATION_MAP[durationType];

    if (durationType === "FULL_DAY") {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      end.setHours(0, 0, 0, 0);

      return [{ start, end }];
    }

    if (durationType === "MULTI_DAY") {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      end.setHours(0, 0, 0, 0);

      return [{ start, end }];
    }

    const slots = [];
    let start = new Date(date);
    start.setHours(9, 0, 0, 0);

    const endLimit = new Date(date);
    endLimit.setHours(21, 0, 0, 0);

    while (start.getTime() + duration * 60000 <= endLimit.getTime()) {
      const end = new Date(start.getTime() + duration * 60000);
      slots.push({ start: new Date(start), end });
      start = new Date(start.getTime() + 30 * 60000);
    }

    return slots;
  };

  /* ====================== SLOT BLOCK CHECK ====================== */
  const isSlotBlocked = (slot) => {
    return calendarBookings.some(
      (b) =>
        new Date(b.start_datetime) < slot.end &&
        new Date(b.end_datetime) > slot.start
    );
  };

  /* ====================== LOGOUT HANDLER ====================== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  /* ====================== CREATE BOOKING WITH PAYMENT ✅ UPDATED ====================== */
  const createBooking = async () => {
    if (!selectedSlot) return;

    setCreating(true);
    setError("");

    try {
      // Step 1: Create booking
      const bookingRes = await axios.post("/booking/create", {
        room_id: roomId,
        bookingType: durationType,
        start_datetime: selectedSlot.start,
        end_datetime: selectedSlot.end,
        weekendNotice,
      });

      const bookingId = bookingRes.data.booking_id;

      // Step 2: Initiate payment
      const paymentRes = await axios.post("/payment/initiate", {
        booking_id: bookingId,
      });

      if (paymentRes.data.success) {
        // Step 3: Redirect to CCAvenue
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentRes.data.paymentUrl;

        const encReqInput = document.createElement('input');
        encReqInput.type = 'hidden';
        encReqInput.name = 'encRequest';
        encReqInput.value = paymentRes.data.encRequest;
        form.appendChild(encReqInput);

        const accessCodeInput = document.createElement('input');
        accessCodeInput.type = 'hidden';
        accessCodeInput.name = 'access_code';
        accessCodeInput.value = paymentRes.data.accessCode;
        form.appendChild(accessCodeInput);

        document.body.appendChild(form);
        form.submit();
      }

    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      setCreating(false);
    }
  };

  /* ====================== FORMAT END DATE FOR DISPLAY ====================== */
  const getEndDateDisplay = () => {
    if (!selectedSlot) return null;
    
    if (durationType === "FULL_DAY") {
      const endDate = new Date(selectedSlot.start);
      endDate.setDate(endDate.getDate() + 1);
      return endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    if (durationType === "MULTI_DAY") {
      const endDate = new Date(selectedSlot.start);
      endDate.setDate(endDate.getDate() + 7);
      return endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return null;
  };

  /* ====================== UI ====================== */
  return (
    <div className={styles.bookingContainer}>
      {/* ✅ UPDATED HEADER WITH WELCOME MESSAGE & MY ACCOUNT BUTTON */}
      <div className={styles.bookingHeader}>
        <div className={styles.headerContent}>
          <div>
            <h1>Virtual Data Room Booking</h1>
            {userProfile && (
              <p>Welcome, <strong>{userProfile.name}</strong>! Select your room, duration, and available time slot</p>
            )}
            {!userProfile && (
              <p>Select your room, duration, and available time slot</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className={styles.btnAccount} 
              onClick={() => window.location.href = '/account'}
            >
              My Account
            </button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className={styles.bookingGrid}>
        {/* LEFT SIDE - MAIN FORM */}
        <div>
          {/* ROOM SELECTION CARD */}
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
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Duration Type</label>
              <select
                className={styles.formSelect}
                value={durationType}
                onChange={(e) => {
                  setDurationType(e.target.value);
                  setSelectedSlot(null);
                }}
              >
                <option value="HALF_HOUR">30 Minutes</option>
                <option value="HOURLY">1 Hour</option>
                <option value="FULL_DAY">24 Hours</option>
                <option value="MULTI_DAY">1 Week</option>
              </select>
            </div>
          </div>

          {/* DATE PICKER CARD */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Select Date</h3>
            <p className={styles.cardSubtitle}>
              {durationType === "MULTI_DAY" 
                ? "Choose start date for your 1-week booking (at least 3 days in advance)"
                : "Choose a date at least 3 days in advance"
              }
            </p>

            <div className={styles.datepickerWrapper}>
              <DatePicker
                inline
                selected={selectedDate}
                onChange={(d) => {
                  setSelectedDate(d);
                  setSelectedSlot(null);
                }}
                minDate={minBookingDate()}
              />
            </div>
          </div>

          {/* SLOTS CARD */}
          {selectedDate && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Available Time Slots</h3>
              <p className={styles.cardSubtitle}>
                {durationType === "MULTI_DAY" ? (
                  <>
                    Week: {selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} - {new Date(new Date(selectedDate).setDate(selectedDate.getDate() + 7)).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </>
                ) : durationType === "FULL_DAY" ? (
                  <>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} (Full 24 hours)
                  </>
                ) : (
                  selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                )}
              </p>

              <div className={styles.dataOptions}>
                {generateSlots(selectedDate).map((slot, i) => {
                  const blocked = isSlotBlocked(slot);
                  const isSelected = selectedSlot?.start?.getTime() === slot.start.getTime();

                  return (
                    <div
                      key={i}
                      className={`${styles.slot} ${blocked ? styles.blocked : styles.free
                        } ${isSelected ? styles.selected : ''}`}
                      onClick={() => !blocked && setSelectedSlot(slot)}
                      style={{
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        opacity: blocked ? 0.5 : 1,
                        border: isSelected ? '2px solid #2563eb' : undefined,
                        backgroundColor: isSelected ? '#dbeafe' : undefined,
                      }}
                    >
                      <div className={styles.checkboxContent}>
                        <span className={styles.dataType}>
                          {durationType === "FULL_DAY" ? (
                            "Full Day (00:00 - 23:59)"
                          ) : durationType === "MULTI_DAY" ? (
                            `1 Week (${slot.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${slot.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
                          ) : (
                            <>
                              {slot.start.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} – {slot.end.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </>
                          )}
                        </span>
                        <span className={styles.dataPrice}>
                          {blocked ? 'Booked' : 'Available'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - PREVIEW/CONFIRM */}
        <div className={styles.stickyCard}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Booking Summary</h3>
            <p className={styles.cardSubtitle}>Review your selection</p>

            {selectedSlot ? (
              <>
                <div className={styles.previewDetails}>
                  <div className={styles.previewRow}>
                    <span>Room:</span>
                    <strong>{rooms.find(r => r.id === roomId)?.title}</strong>
                  </div>
                  <div className={styles.previewDivider}></div>

                  <div className={styles.previewRow}>
                    <span>{durationType === "MULTI_DAY" ? "Start Date:" : "Date:"}</span>
                    <strong>
                      {selectedDate?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </strong>
                  </div>
                  
                  {(durationType === "FULL_DAY" || durationType === "MULTI_DAY") && (
                    <>
                      <div className={styles.previewDivider}></div>
                      <div className={styles.previewRow}>
                        <span>End Date:</span>
                        <strong>{getEndDateDisplay()}</strong>
                      </div>
                    </>
                  )}
                  
                  <div className={styles.previewDivider}></div>

                  {durationType !== "FULL_DAY" && durationType !== "MULTI_DAY" && (
                    <>
                      <div className={styles.previewRow}>
                        <span>Time:</span>
                        <strong>
                          {selectedSlot.start.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} – {selectedSlot.end.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </strong>
                      </div>
                      <div className={styles.previewDivider}></div>
                    </>
                  )}

                  <div className={styles.previewRow}>
                    <span>Duration:</span>
                    <strong>
                      {durationType === "HALF_HOUR" ? "30 Minutes" :
                       durationType === "HOURLY" ? "1 Hour" :
                       durationType === "FULL_DAY" ? "24 Hours" :
                       "1 Week"}
                    </strong>
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
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <button
                  className={styles.btnConfirm}
                  disabled={!selectedSlot || creating}
                  onClick={createBooking}
                >
                  {creating ? "Processing..." : "Proceed to Payment"}
                </button>
              </>
            ) : (
              <div className={styles.noPreview}>
                <p>Please select a date and time slot to proceed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}