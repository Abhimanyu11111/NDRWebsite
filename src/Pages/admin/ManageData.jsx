import React, { useEffect, useState } from "react";
import { Hotel, Plus, Trash2, IndianRupee, Home } from "lucide-react";
import api from "../../api/axiosClient";
import AdminNavbar from "/src/component/AdminNavbar";

export default function ManageData() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [loading, setLoading] = useState(true);

  // ===== GET ROOMS =====
  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data || []);
    } catch (error) {
      console.log("Error Fetching Rooms", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== ADD ROOM =====
  const addRoom = async () => {
    console.log("add room button clicked")
    if (!newRoom.trim()) return;
    try {
      await api.post("/rooms", { title: newRoom });
      setNewRoom("");
      fetchRooms();
    } catch (error) {
      console.log("Error Adding Room", error);
    }
  };

  // ===== DELETE ROOM =====
  const deleteRoom = async (id) => {
    if (!window.confirm("Delete room permanently?")) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (error) {
      console.log("Error Deleting Room", error);
    }
  };

  // Load on page open
  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div style={loadingContainer}>
          <div style={spinnerWrapper}>
            <div style={spinner}></div>
            <p style={loadingText}>Loading rooms...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={pageWrapper}>
        {/* Header Section */}
        <div style={headerSection}>
          <div style={headerContent}>
            <div>
              <h1 style={pageTitle}>Manage Data Rooms</h1>
              <p style={pageSubtitle}>Add, edit, and manage data room</p>
            </div>
            <div style={headerStats}>
              <span style={totalCount}>{rooms.length}</span>
              <span style={totalLabel}>Total Rooms</span>
            </div>
          </div>
        </div>

        <div style={contentContainer}>
          {/* Add Room Card */}
          <div style={addRoomCard}>
            <h2 style={sectionTitle}>
              <Plus size={24} strokeWidth={2.5} style={{marginRight: "8px"}} />
              Add New Room
            </h2>
            <div style={addRoomForm}>
              <div style={inputWrapper}>
                <label style={inputLabel}>Data Room Name</label>
                <input
                  type="text"
                  placeholder="Enter room name (e.g., New Data Room)"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRoom()}
                  style={textInput}
                />
              </div>
              <button 
                onClick={addRoom} 
                style={addButton}
                disabled={!newRoom.trim()}
                onMouseEnter={(e) => newRoom.trim() && (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
              >
                <Plus size={20} strokeWidth={2.5} />
                Add Room
              </button>
            </div>
          </div>

          {/* Rooms List Card */}
          <div style={roomsCard}>
            <div style={roomsHeader}>
              <h2 style={sectionTitle}>
                <Hotel size={24} strokeWidth={2.5} style={{marginRight: "8px"}} />
                Room Inventory
              </h2>
              <span style={roomCount}>{rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}</span>
            </div>

            {rooms.length === 0 ? (
              <div style={emptyState}>
                <Hotel size={64} strokeWidth={1.5} style={{color: "#94a3b8", marginBottom: "16px"}} />
                <h3 style={emptyTitle}>No rooms available</h3>
                <p style={emptyText}>Add your first room to get started</p>
              </div>
            ) : (
              <div style={roomsGrid}>
                {rooms.map((r) => (
                  <RoomCard 
                    key={r.id} 
                    room={r} 
                    onDelete={deleteRoom} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function RoomCard({ room, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        ...roomCard,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 10px 25px rgba(0,0,0,0.1)' 
          : '0 1px 3px rgba(0,0,0,0.06)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={roomCardHeader}>
        <div style={roomIcon}>
          <Home size={24} strokeWidth={2.5} style={{color: "#3b82f6"}} />
        </div>
        <div style={roomInfo}>
          <h3 style={roomTitle}>{room.title}</h3>
          <p style={roomId}>Room ID: #{room.id}</p>
        </div>
      </div>

      <div style={roomCardBody}>
        <div style={priceSection}>
          <span style={priceLabel}>Price </span>
          <span style={priceValue}>
            <IndianRupee size={18} strokeWidth={2.5} style={{marginRight: "2px"}} />
            {room.price?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div style={roomCardFooter}>
        <button 
          onClick={() => onDelete(room.id)}
          style={deleteButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#dc2626";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fee2e2";
            e.currentTarget.style.color = "#dc2626";
          }}
        >
          <Trash2 size={16} strokeWidth={2.5} />
          Delete Room
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageWrapper = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc"
};

const loadingContainer = {
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const spinnerWrapper = {
  textAlign: "center"
};

const spinner = {
  width: "48px",
  height: "48px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto"
};

const loadingText = {
  marginTop: "16px",
  color: "#64748b",
  fontSize: "16px",
  fontWeight: "500"
};

const headerSection = {
  backgroundColor: "white",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
};

const headerContent = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "32px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "24px",
  flexWrap: "wrap"
};

const pageTitle = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 8px 0"
};

const pageSubtitle = {
  fontSize: "16px",
  color: "#64748b",
  margin: 0
};

const headerStats = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "4px"
};

const totalCount = {
  fontSize: "36px",
  fontWeight: "700",
  color: "#3b82f6",
  lineHeight: "1"
};

const totalLabel = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500"
};

const contentContainer = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "32px 24px"
};

const addRoomCard = {
  backgroundColor: "white",
  padding: "28px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginBottom: "32px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};

const sectionTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 20px 0",
  display: "flex",
  alignItems: "center"
};

const addRoomForm = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "16px",
  alignItems: "end"
};

const inputWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const inputLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155"
};

const textInput = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
  transition: "all 0.2s"
};

const addButton = {
  padding: "12px 28px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  whiteSpace: "nowrap"
};

const roomsCard = {
  backgroundColor: "white",
  padding: "28px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
};

const roomsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
};

const roomCount = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#64748b",
  backgroundColor: "#f1f5f9",
  padding: "6px 12px",
  borderRadius: "20px"
};

const emptyState = {
  textAlign: "center",
  padding: "60px 24px"
};

const emptyTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 8px 0"
};

const emptyText = {
  fontSize: "15px",
  color: "#64748b",
  margin: 0
};

const roomsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "20px"
};

const roomCard = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "20px",
  transition: "all 0.3s ease"
};

const roomCardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
  paddingBottom: "16px",
  borderBottom: "1px solid #f1f5f9"
};

const roomIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  backgroundColor: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const roomInfo = {
  flex: 1
};

const roomTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 4px 0"
};

const roomId = {
  fontSize: "13px",
  color: "#64748b",
  margin: 0
};

const roomCardBody = {
  marginBottom: "16px"
};

const priceSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px"
};

const priceLabel = {
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500"
};

const priceValue = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
  display: "flex",
  alignItems: "center"
};

const roomCardFooter = {
  display: "flex",
  gap: "8px"
};

const deleteButton = {
  flex: 1,
  padding: "10px 16px",
  backgroundColor: "#fee2e2",
  color: "#dc2626",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};