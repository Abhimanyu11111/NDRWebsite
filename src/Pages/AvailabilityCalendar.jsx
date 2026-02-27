import React, { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import styles from "../Component/Styles/AvailabilityCalendar.module.css";

/* ====================== DGH HOLIDAYS 2026 ====================== */
const DGH_HOLIDAYS_2026 = {
  // Government Holidays (GH)
  govtHolidays: [
    { date: "2026-01-26", name: "Republic Day" },
    { date: "2026-03-04", name: "Holi" },
    { date: "2026-03-21", name: "Id-ul-Fitr" },
    { date: "2026-03-26", name: "Ram Navami" },
    { date: "2026-03-31", name: "Mahavir Jayanti" },
    { date: "2026-04-03", name: "Good Friday" },
    { date: "2026-05-01", name: "Budhha Purnima" },
    { date: "2026-05-27", name: "Id-ul-Zuha (Bakrid)" },
    { date: "2026-06-26", name: "Muharram" },
    { date: "2026-08-15", name: "Independence Day" },
    { date: "2026-08-26", name: "Milad-Un-Nabi" },
    { date: "2026-09-04", name: "Janmashtami" },
    { date: "2026-10-02", name: "Gandhi Jayanti" },
    { date: "2026-10-20", name: "Dussehra" },
    { date: "2026-11-08", name: "Deepawali" },
    { date: "2026-11-24", name: "Guru Nanak B'day" },
    { date: "2026-12-25", name: "Christmas Day" },
  ],
  // Restricted Holidays (RH)
  restrictedHolidays: [
    { date: "2026-01-01", name: "New Year's Day" },
    { date: "2026-01-03", name: "Hazarat Ali's Birthday" },
    { date: "2026-01-14", name: "Magh Bihu/Makar Sankrti" },
    { date: "2026-01-23", name: "Basant Panchami" },
    { date: "2026-02-01", name: "Guru Ravi Das's B'day" },
    { date: "2026-02-12", name: "Swami Dayanad Jayanti" },
    { date: "2026-02-19", name: "Maha Shivratri" },
    { date: "2026-03-03", name: "Shiva ji Jayanti" },
    { date: "2026-03-19", name: "Dolyatra / Holika Dahan" },
    { date: "2026-04-05", name: "Gudi Parva / Ugadi" },
    { date: "2026-03-20", name: "Jamat-Ul-Vida" },
    { date: "2026-04-14", name: "Vaisakhi / Vishu/Meshadi" },
    { date: "2026-04-15", name: "Bahag Bihu (Assam)" },
    { date: "2026-05-09", name: "Guru Ravindranath B'day" },
    { date: "2026-07-16", name: "Rath Yatra" },
    { date: "2026-08-15", name: "Parsi New Year" },
    { date: "2026-08-26", name: "Onam / Thiru Onam Day" },
    { date: "2026-08-28", name: "Raksha Bandhan" },
    { date: "2026-09-14", name: "Ganesh Chaturthi" },
    { date: "2026-09-18", name: "Dussehra (Saptami)" },
    { date: "2026-09-19", name: "Dussehra (Mahashtami)" },
    { date: "2026-10-26", name: "Maharishi Valmiki's B'day" },
    { date: "2026-10-29", name: "Karwa Chouth" },
    { date: "2026-11-08", name: "Naraka Chaturdasi" },
    { date: "2026-11-09", name: "Govardhan Puja" },
    { date: "2026-11-11", name: "Bhai Duj" },
    { date: "2026-11-15", name: "Chhatt Puja" },
    { date: "2026-12-23", name: "Hazarat Ali's Birthday" },
    { date: "2026-12-24", name: "Christmas Eve" },
  ],
};

/* ====================== HELPER FUNCTIONS ====================== */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const isHoliday = (dateStr) => {
  const allHolidays = [
    ...DGH_HOLIDAYS_2026.govtHolidays,
    ...DGH_HOLIDAYS_2026.restrictedHolidays,
  ];
  return allHolidays.find((h) => h.date === dateStr);
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ====================== MAIN COMPONENT ====================== */
export default function AvailabilityCalendar({ onDateSelect }) {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // NEW: Track selected room

  /* --- Fetch rooms --- */
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/rooms");
        setRooms(res.data.rooms || []);
        // Auto-select first room
        if (res.data.rooms?.length) {
          setSelectedRoom(res.data.rooms[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  /* --- Fetch bookings for selected room only --- */
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedRoom) return;

      setLoading(true);
      try {
        const res = await axios.get(`/booking/calendar?room_id=${selectedRoom}`);
        setBookings({ [selectedRoom]: res.data.bookings || [] });
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [selectedRoom, currentMonth, currentYear]);

  /* --- Check if a date is booked for a room --- */
  const isDateBooked = (roomId, date) => {
    const dateKey = formatDateKey(date);
    const roomBookings = bookings[roomId] || [];

    return roomBookings.some((booking) => {
      // Only consider confirmed bookings
      if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
        return false;
      }

      const start = new Date(booking.start_datetime);
      const end = new Date(booking.end_datetime);

      // Set all dates to midnight for comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // Check if date falls within booking range
      return checkDate >= start && checkDate < end;
    });
  };

  /* --- Get cell status --- */
  const getCellStatus = (roomId, date) => {
    const dateKey = formatDateKey(date);
    const holiday = isHoliday(dateKey);
    const weekend = isWeekend(date);
    const booked = isDateBooked(roomId, date);

    if (booked) return "booked";
    if (holiday) return "holiday";
    if (weekend) return "weekend";
    return "available";
  };

  /* --- Generate calendar days with week structure --- */
  const generateCalendarGrid = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(currentYear, currentMonth, day));
    }
    
    return calendarDays;
  };

  // const calendarDays = generateCalendarGrid();
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  /* --- Handle cell click --- */
  // const handleCellClick = (date, status) => {
  //   if (status === "available" && onDateSelect && selectedRoom) {
  //     const room = rooms.find(r => r.id === selectedRoom);
  //     onDateSelect({
  //       room,
  //       date,
  //       dateString: formatDateKey(date),
  //     });
  //   }
  // };

  const calendarDays = generateCalendarGrid();
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

  /* --- Handle cell click --- */
  const handleCellClick = (date, status) => {
    if (status === "available" && onDateSelect && selectedRoom) {
      const room = rooms.find(r => r.id === selectedRoom);
      onDateSelect({
        room,
        date,
        dateString: formatDateKey(date),
      });
    }
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
            Select a room to view its availability
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.todayBtn} onClick={goToToday}>
            Today
          </button>
        </div>
      </div>

      {/* Room Selector */}
      <div className={styles.roomSelector}>
        <label className={styles.roomSelectorLabel}>Select Room:</label>
        <div className={styles.roomOptions}>
          {rooms.map((room) => (
            <label key={room.id} className={styles.roomOption}>
              <input
                type="radio"
                name="room"
                value={room.id}
                checked={selectedRoom === room.id}
                onChange={(e) => setSelectedRoom(room.id)}
                className={styles.roomRadio}
              />
              <span className={styles.roomOptionText}>{room.title}</span>
            </label>
          ))}
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
          <div className={`${styles.legendBox} ${styles.holiday}`}></div>
          <span>Holiday</span>
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

      {/* Calendar Grid */}
      {loading ? (
        <div className={styles.loading}>Loading availability...</div>
      ) : (
        <div className={styles.calendarGrid}>
          {/* Day Headers */}
          <div className={styles.dayHeaders}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className={styles.dayHeader}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={styles.daysGrid}>
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className={styles.emptyDay}></div>;
              }

              const dateKey = formatDateKey(date);
              const status = getCellStatus(selectedRoom, date);
              const holiday = isHoliday(dateKey);
              const past = isPastDate(date);
              const todayDate = isToday(date);
              const cellKey = `${selectedRoom}-${date.getTime()}`;
              const isHovered = hoveredCell === cellKey;

              let cellClass = `${styles.calendarDay} ${styles[status]}`;
              if (past) cellClass += ` ${styles.past}`;
              if (todayDate) cellClass += ` ${styles.today}`;
              if (status === "available" && !past) cellClass += ` ${styles.clickable}`;
              if (isHovered) cellClass += ` ${styles.hovered}`;

              return (
                <div
                  key={cellKey}
                  className={cellClass}
                  onClick={() => !past && handleCellClick(date, status)}
                  onMouseEnter={() => setHoveredCell(cellKey)}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={
                    past
                      ? "Past date"
                      : holiday
                      ? `Holiday: ${holiday.name}`
                      : status === "booked"
                      ? "Already booked"
                      : status === "weekend"
                      ? "Weekend"
                      : todayDate
                      ? "Today"
                      : "Click to book"
                  }
                >
                  <div className={styles.dayNumber}>{date.getDate()}</div>
                  {holiday && <div className={styles.holidayIndicator}>H</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className={styles.calendarFooter}>
        <p className={styles.footerNote}>
          <strong>Note:</strong> Click on any available (green) date to start booking. Bookings open 3 days in advance.
        </p>
      </div>
    </div>
  );
}