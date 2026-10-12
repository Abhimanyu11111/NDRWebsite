import React, { useMemo, useState } from "react";
import styles from "../Component/Styles/AvailabilityCalendar.module.css";

/* ====================== HELPER FUNCTIONS ====================== */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ====================== MAIN COMPONENT ====================== */
// Display-only: rooms, bookings and holidays are loaded by the parent (BookVDR)
// so this view and the booking form always agree on availability.
export default function AvailabilityCalendar({
  rooms = [],
  bookingsByRoom = {},
  loading = false,
  holidays = [],
  isSelectableDate,
  onDateSelect,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredCell, setHoveredCell] = useState(null);

  const holidayMap = useMemo(
    () => new Map(holidays.map((h) => [h.date, h])),
    [holidays]
  );
  const isGovtHoliday = (dateStr) => holidayMap.get(dateStr);

  /* --- Check if a date is booked for a room --- */
  const getDateBookingStatus = (roomId, date) => {
    const roomBookings = bookingsByRoom[String(roomId)] || [];
    let hasPartialBooking = false;
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    for (const booking of roomBookings) {
      if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
        continue;
      }

      const start = new Date(booking.start_datetime);
      const end = new Date(booking.end_datetime);
      if (start < dayEnd && end > dayStart) {
        if (booking.booking_type === "EIGHT_HOUR") hasPartialBooking = true;
        else return "booked";
      }
    }

    return hasPartialBooking ? "partial" : null;
  };

  /* --- Get cell status --- */
  const getCellStatus = (roomId, date) => {
    const dateKey = formatDateKey(date);
    const govtHoliday = isGovtHoliday(dateKey);
    const weekend = isWeekend(date);
    const bookingStatus = getDateBookingStatus(roomId, date);

    if (bookingStatus) return bookingStatus;
    if (govtHoliday) return "holiday";
    if (weekend) return "weekend";
    return "available";
  };

  /* --- Generate calendar days --- */
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(currentYear, currentMonth, d));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* --- Navigation --- */
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  /* --- Check if date is in the past --- */
  const isPastDate = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  /* --- Check if date is today --- */
  const isToday = (date) => {
    if (!date) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  /* ====================== RENDER ====================== */
  return (
    <div className={styles.calendarWrapper}>
      {/* Header */}
      <div className={styles.calendarHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.calendarTitle}>
            Room Availability Calendar
          </h2>
          <p className={styles.calendarSubtitle}>
            View availability for all rooms. Use the booking form below to select your dates.
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.todayBtn} onClick={goToToday}>
            Today
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.available}`}></div>
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.booked}`}></div>
          <span>Booked</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.partial}`}></div>
          <span>Partially Booked (8h)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.holiday}`}></div>
          <span>Govt Holiday</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.weekend}`}></div>
          <span>Weekend</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.past}`}></div>
          <span>Past</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.today}`}></div>
          <span>Today</span>
        </div>
      </div>

      {/* Month Navigation */}
      <div className={styles.monthNav}>
        <button className={styles.navBtn} onClick={goToPrevMonth}>
          ‹ Previous
        </button>
        <h3 className={styles.monthTitle}>
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button className={styles.navBtn} onClick={goToNextMonth}>
          Next ›
        </button>
      </div>

      {/* TABLE LAYOUT - ROOMS IN ROWS, DATES IN COLUMNS */}
      {/* Only show the loader on first load so month navigation doesn't flash */}
      {loading && Object.keys(bookingsByRoom).length === 0 ? (
        <div className={styles.loading}>Loading availability...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.calendarTable}>
            <thead>
              <tr>
                <th className={styles.roomHeader}>Room</th>
                {calendarDays.map((date) => (
                  <th key={date.getTime()} className={styles.dateHeader}>
                    <div className={styles.dateHeaderContent}>
                      <div className={styles.dateDay}>{DAYS_SHORT[date.getDay()]}</div>
                      <div className={styles.dateNumber}>{date.getDate()}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className={styles.roomCell}>
                    <strong>{room.title}</strong>
                  </td>
                  {calendarDays.map((date) => {
                    const dateKey = formatDateKey(date);
                    const status = getCellStatus(room.id, date);
                    const govtHoliday = isGovtHoliday(dateKey);
                    const past = isPastDate(date);
                    const todayDate = isToday(date);
                    const cellKey = `${room.id}-${date.getTime()}`;
                    const isHovered = hoveredCell === cellKey;
                    const selectable =
                      !!onDateSelect && !past && status !== "booked" &&
                      (!isSelectableDate || isSelectableDate(date));

                    let cellClass = `${styles.dateCell} ${styles[status]}`;
                    if (past) cellClass += ` ${styles.past}`;
                    if (todayDate) cellClass += ` ${styles.today}`;
                    if (selectable) cellClass += ` ${styles.selectable}`;
                    if (isHovered && selectable) cellClass += ` ${styles.hovered}`;

                    let tooltipText = "";
                    if (past) {
                      tooltipText = "Past date";
                    } else if (govtHoliday) {
                      tooltipText = `Govt Holiday: ${govtHoliday.name}`;
                    } else if (status === "booked") {
                      tooltipText = "Already booked";
                    } else if (status === "partial") {
                      tooltipText = "Partially booked - another 8-hour window may be available";
                    } else if (status === "weekend") {
                      tooltipText = "Weekend";
                    } else if (todayDate) {
                      tooltipText = "Today";
                    } else {
                      tooltipText = "Available";
                    }

                    return (
                      <td
                        key={cellKey}
                        className={cellClass}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={selectable ? () => onDateSelect({ room, date }) : undefined}
                        title={selectable ? `${tooltipText} – click to start a booking` : tooltipText}
                      >
                        {govtHoliday && <span className={styles.holidayMark}>H</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.calendarFooter}>
        <p className={styles.footerNote}>
          <strong>Tip:</strong> Click an open date to start a booking for that room, or use the form below.
        </p>
      </div>
    </div>
  );
}
