import React, { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookVDR() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    org: "",
  });

  const [fullBookedDays, setFullBookedDays] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/rooms");
        setRooms(res.data);
        if (res.data.length > 0) setRoomId(res.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchDates = async () => {
      if (!roomId) return;
      try {
        const booked = await axios.get(`/booking/full-booked-dates?roomId=${roomId}`);
        const available = await axios.get(`/booking/available-dates?roomId=${roomId}`);

        setFullBookedDays(booked.data || []);
        setAvailableDays(available.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDates();
  }, [roomId]);

  const fetchSlots = async () => {
    if (!roomId || !date) return;
    setLoading(true);
    setMsg("");

    try {
      const res = await axios.get(`/slots?roomId=${roomId}&date=${date}`);
      setSlots(res.data || []);
      if (res.data.length === 0) setMsg("No slots available for this date");
    } catch (err) {
      console.error("Slot fetch error:", err);
      setMsg("Something went wrong fetching slots");
    }
    setLoading(false);
  };

  const submitBooking = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      return alert("Please fill all required fields");
    }

    try {
      const res = await axios.post("/booking/book", {
        room_id: roomId,
        slot_id: selectedSlot.id,
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        user_org: formData.org,
        amount: 5000,
      });

      const bookingId = res.data.bookingId;

      const pay = await axios.post("/payment/initiate", {
        bookingId,
        amount: 5000,
      });

      window.location.href = pay.data.paymentUrl;
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F1F6FF, #DCE6F9)",
      fontFamily: "Segoe UI, sans-serif",
      paddingBottom: "50px",
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg,#1E3C72,#2A5298)",
        color: "white",
        padding: "25px 40px",
        borderBottom: "5px solid #FF9933",
      }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 600 }}>
          Virtual Data Room Booking
        </h1>
        <p style={{ marginTop: "6px", opacity: 0.9 }}>
          Government of India | National Data Repository
        </p>
      </div>

      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 25px" }}>

        {/* Room + Calendar + Slots */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: "20px"
        }}>

          {/* LEFT: Calendar */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            height: "fit-content",
            position: "sticky",
            top: "20px"
          }}>
            <h3 style={{ marginTop: 0 }}>Select Date</h3>

            <label style={{ fontSize: "14px", fontWeight: 500 }}>Select Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #ccc",
                fontSize: "15px",
                marginBottom: "15px"
              }}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.title}
                </option>
              ))}
            </select>

            <DatePicker
              selected={date ? new Date(date) : null}
              onChange={(d) => {
                const formatted = d.toISOString().split("T")[0];
                setDate(formatted);
                fetchSlots();
              }}
              inline
              minDate={new Date()}
              dayClassName={(d) => {
                const f = d.toISOString().split("T")[0];
                if (fullBookedDays.includes(f)) return "booked-date";
                if (availableDays.includes(f)) return "available-date";
                return "";
              }}
              filterDate={(d) => {
                const f = d.toISOString().split("T")[0];
                return !fullBookedDays.includes(f);
              }}
            />
          </div>

          {/* RIGHT: Slots */}
          <div>
            <h2 style={{ color: "#1E3C72" }}>Available Time Slots</h2>

            {loading && <p>⏳ Checking slots...</p>}
            {msg && (
              <p style={{ background: "#FFF3CD", padding: "12px", borderRadius: 8 }}>
                {msg}
              </p>
            )}

            {!loading && slots.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: "15px",
                marginTop: "15px"
              }}>
                {slots.map((slot) => (
                  <div key={slot.id} style={{
                    border: `2px solid ${slot.status === "available" ? "#4CAF50" : "#999"}`,
                    background: slot.status === "available" ? "#E8F5E9" : "#F2F2F2",
                    padding: "18px",
                    borderRadius: "10px",
                  }}>
                    <h4 style={{ margin: 0 }}>
                      {slot.time_start} - {slot.time_end}
                    </h4>

                    {slot.status === "available" ? (
                      <button
                        onClick={() => { setSelectedSlot(slot); setShowForm(true); }}
                        style={{
                          marginTop: "12px",
                          width: "100%",
                          background: "#2E7D32",
                          color: "white",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Book Now
                      </button>
                    ) : (
                      <button disabled style={{
                        marginTop: "12px",
                        width: "100%",
                        background: "gray",
                        color: "white",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "none"
                      }}>
                        Booked
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "15px",
          zIndex: 999,
        }}>
          <div style={{
            background: "white",
            width: "380px",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
              Complete Booking
            </h3>

            <p style={{
              background: "#E3F2FD",
              padding: "10px",
              borderRadius: "6px",
              fontSize: "14px"
            }}>
              Slot: <strong>{selectedSlot.time_start} - {selectedSlot.time_end}</strong><br/>
              Fee: <strong>₹5,000</strong>
            </p>

            <input type="text" placeholder="Full Name" value={formData.name}
              onChange={(e)=> setFormData({...formData,name:e.target.value})}
              style={{ width:"100%",padding:"10px",border:"1px solid #ccc",borderRadius:"6px",marginTop:"10px" }} />

            <input type="email" placeholder="Email" value={formData.email}
              onChange={(e)=> setFormData({...formData,email:e.target.value})}
              style={{ width:"100%",padding:"10px",border:"1px solid #ccc",borderRadius:"6px",marginTop:"10px" }} />

            <input type="text" placeholder="Phone" value={formData.phone}
              onChange={(e)=> setFormData({...formData,phone:e.target.value})}
              style={{ width:"100%",padding:"10px",border:"1px solid #ccc",borderRadius:"6px",marginTop:"10px" }} />

            <input type="text" placeholder="Organization (optional)" value={formData.org}
              onChange={(e)=> setFormData({...formData,org:e.target.value})}
              style={{ width:"100%",padding:"10px",border:"1px solid #ccc",borderRadius:"6px",marginTop:"10px" }} />

            <button
              onClick={submitBooking}
              style={{
                marginTop:"15px",
                width:"100%",
                background:"#2E7D32",
                color:"white",
                padding:"10px",
                borderRadius:"6px",
                fontWeight:600,
                cursor:"pointer",
                border:"none"
              }}>
               Proceed to Pay
            </button>

            <button
              onClick={() => setShowForm(false)}
              style={{
                marginTop:"10px",
                width:"100%",
                background:"gray",
                color:"white",
                padding:"10px",
                borderRadius:"6px",
                cursor:"pointer",
                border:"none"
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .booked-date {
          background-color: #ffcccc !important;
          border-radius: 50% !important;
          color: #000 !important;
        }
        .available-date {
          background-color: #ccffcc !important;
          border-radius: 50% !important;
          color: #000 !important;
        }
      `}</style>

    </div>
  );
}
