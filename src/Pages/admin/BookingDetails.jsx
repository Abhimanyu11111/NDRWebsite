import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosClient";
import AdminNavbar from "/src/component/AdminNavbar";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/booking/admin/${id}`);
        setBooking(res.data);
      } catch (err) {
        console.log("Error fetching booking details:", err);
      }
    };

    fetchBooking();
  }, [id]);

  if (!booking) return <p>Loading booking...</p>;

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: 20 }}>
        <h2>Booking Details (#{id})</h2>

        <div style={{
          background: "#fafafa",
          padding: "20px",
          borderRadius: "8px",
          width: "100%",
          lineHeight: "1.8"
        }}>
          <p><b>Name:</b> {booking.user_name}</p>
          <p><b>Email:</b> {booking.user_email}</p>
          <p><b>Phone:</b> {booking.user_phone}</p>
          <p><b>Organisation:</b> {booking.user_org}</p>
          <p><b>Amount:</b> ₹{booking.amount}</p>
          <p><b>Status:</b> {booking.status}</p>
          <p><b>Room ID:</b> {booking.room_id}</p>
          <p><b>Slot ID:</b> {booking.slot_id}</p>
        </div>
      </div>
    </>
  );
}
