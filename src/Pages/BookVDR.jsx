import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../Component/Styles/BookVDR.module.css";

/* ====================== CONSTANTS ====================== */
const DURATION_MAP = {
  HALF_HOUR: 30,
  HOURLY: 60,
  FULL_DAY: 1440,
  ONE_WEEK: 10080,
};

export default function BookVDR() {
  /* ====================== AUTH CHECK ====================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

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

  /* ====================== CREATE BOOKING ====================== */
  const createBooking = async () => {
    if (!selectedSlot) return;

    setCreating(true);
    setError("");

    try {
      await axios.post("/booking/create", {
        room_id: roomId,
        bookingType: durationType,
        start_datetime: selectedSlot.start,
        end_datetime: selectedSlot.end,
        weekendNotice,
      });

      alert("Booking created successfully");
      setSelectedSlot(null);
      fetchCalendar(roomId);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setCreating(false);
    }
  };

  /* ====================== UI ====================== */
  return (
    <div className={styles.bookingContainer}>
      {/* HEADER WITH LOGOUT */}
      <div className={styles.bookingHeader}>
        <div className={styles.headerContent}>
          <div>
            <h1>Virtual Data Room Booking</h1>
            <p>Select your room, duration, and available time slot</p>
          </div>
          <button className={styles.btnLogout} onClick={handleLogout}>
            Logout
          </button>
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
                onChange={(e) => setDurationType(e.target.value)}
              >
                <option value="HALF_HOUR">30 Minutes</option>
                <option value="HOURLY">1 Hour</option>
                <option value="FULL_DAY">24 Hours</option>
                <option value="ONE_WEEK">1 Week</option>
              </select>
            </div>
          </div>

          {/* DATE PICKER CARD */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Select Date</h3>
            <p className={styles.cardSubtitle}>Choose a date at least 3 days in advance</p>
            
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
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              
              <div className={styles.dataOptions}>
                {generateSlots(selectedDate).map((slot, i) => {
                  const blocked = isSlotBlocked(slot);
                  const isSelected = selectedSlot?.start?.getTime() === slot.start.getTime();

                  return (
                    <div
                      key={i}
                      className={`${styles.slot} ${
                        blocked ? styles.blocked : styles.free
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
                          {slot.start.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} – {slot.end.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
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
                    <span>Date:</span>
                    <strong>
                      {selectedDate?.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </strong>
                  </div>
                  <div className={styles.previewDivider}></div>
                  
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
                  
                  <div className={styles.previewRow}>
                    <span>Duration:</span>
                    <strong>{durationType.replace('_', ' ')}</strong>
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
                  {creating ? "Booking..." : "Confirm Booking"}
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