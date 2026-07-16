import React, { useEffect, useState } from "react";
import { Hotel, Plus, Trash2, Home, Database, Search } from "lucide-react";
import api from "../../api/axiosClient";
import AdminNavbar from "/src/Component/AdminNavbar";

// Temporary UI switch. Set to true when room creation should be available again.
const SHOW_ADD_ROOM = false;

export default function ManageData() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingRoom, setAddingRoom] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin/rooms/all");
      const data = res.data;
      if (Array.isArray(data)) setRooms(data);
      else if (data?.rooms && Array.isArray(data.rooms)) setRooms(data.rooms);
      else if (data?.data && Array.isArray(data.data)) setRooms(data.data);
      else { setRooms([]); }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async () => {
    if (!newRoom.trim()) return;
    setActionError(null);
    setAddingRoom(true);
    try {
      await api.post("/admin/rooms/create", { title: newRoom });
      setNewRoom("");
      fetchRooms();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to add room.");
    } finally {
      setAddingRoom(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Delete room permanently?")) return;
    setActionError(null);
    try {
      await api.delete(`/admin/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete room.");
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const filteredRooms = rooms.filter((r) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading rooms...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <div style={styles.loadingContainer}>
          <div style={{ textAlign: "center" }}>
            <Hotel size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Failed to Load Rooms</h2>
            <p style={{ color: "#64748b", marginBottom: 20 }}>{error}</p>
            <button onClick={() => { setError(null); setLoading(true); fetchRooms(); }} style={styles.retryBtn}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
      <AdminNavbar />
      <div style={{ flex: 1, overflow: "auto" }}>

        {/* Top Header Banner */}
        <div style={styles.heroBanner}>
          <div style={styles.heroLeft}>
            <div style={styles.heroIcon}>
              <Database size={28} color="white" />
            </div>
            <div>
              <h1 style={styles.heroTitle}>Manage Data Rooms</h1>
              <p style={styles.heroSubtitle}>View and manage your data rooms</p>
            </div>
          </div>
          <div style={styles.statBadge}>
            <span style={styles.statNumber}>{String(rooms.length).padStart(2, "0")}</span>
            <span style={styles.statLabel}>Total Rooms</span>
          </div>
        </div>

        <div style={styles.pageBody}>

          {/* Error Alert */}
          {actionError && (
            <div style={styles.alertBox}>
              <span>{actionError}</span>
              <button onClick={() => setActionError(null)} style={styles.alertClose}>×</button>
            </div>
          )}

          {/* Add Room Card */}
          {SHOW_ADD_ROOM && <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderIcon}>
                <Plus size={18} color="#2563eb" />
              </div>
              <h2 style={styles.cardTitle}>Add New Room</h2>
            </div>
            <div style={styles.addFormRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.inputLabel}>Data Room Name</label>
                <div style={styles.inputWithIcon}>
                  <Home size={18} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="e.g. VDR Room A – (DSG)"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addRoom()}
                    style={styles.textInput}
                  />
                </div>
              </div>
              <button
                onClick={addRoom}
                disabled={!newRoom.trim() || addingRoom}
                style={{
                  ...styles.addBtn,
                  opacity: !newRoom.trim() || addingRoom ? 0.6 : 1,
                  cursor: !newRoom.trim() || addingRoom ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => newRoom.trim() && !addingRoom && (e.currentTarget.style.background = "linear-gradient(135deg,#1d4ed8,#1e40af)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg,#2563eb,#1d4ed8)")}
              >
                <Plus size={18} />
                {addingRoom ? "Adding..." : "Add Room"}
              </button>
            </div>
          </div>}

          {/* Room Inventory */}
          <div style={styles.card}>
            <div style={styles.inventoryHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={styles.cardHeaderIcon}>
                  <Hotel size={18} color="#2563eb" />
                </div>
                <h2 style={styles.cardTitle}>Room Inventory</h2>
                <span style={styles.countPill}>{rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}</span>
              </div>

              {rooms.length > 0 && (
                <div style={styles.searchWrapper}>
                  <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              )}
            </div>

            {filteredRooms.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIconWrapper}>
                  <Hotel size={40} color="#94a3b8" />
                </div>
                <h3 style={styles.emptyTitle}>{searchQuery ? "No rooms match your search" : "No rooms available"}</h3>
                <p style={styles.emptyText}>{searchQuery ? "Try a different keyword" : "Add your first room to get started"}</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filteredRooms.map((r) => (
                  <RoomCard key={r.id} room={r} onDelete={deleteRoom} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [delHover, setDelHover] = useState(false);

  return (
    <div
      style={{
        ...styles.roomCard,
        boxShadow: hovered ? "0 8px 24px rgba(37,99,235,0.13)" : "0 1px 4px rgba(0,0,0,0.07)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        borderColor: hovered ? "#bfdbfe" : "#e2e8f0",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card Top Accent */}
      <div style={styles.roomCardAccent} />

      <div style={styles.roomCardInner}>
        <div style={styles.roomIconBox}>
          <Home size={22} color="#2563eb" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={styles.roomName}>{room.title}</h3>
          <span style={styles.roomIdBadge}>ID #{room.id}</span>
        </div>
      </div>

      <div style={styles.priceBand}>
        <span style={styles.priceBandLabel}>Price</span>
        <span style={styles.priceBandValue}>
          ₹ {room.price != null ? room.price.toLocaleString("en-IN") : "—"}
        </span>
      </div>

      <button
        onClick={() => onDelete(room.id)}
        style={{
          ...styles.deleteBtn,
          background: delHover ? "#dc2626" : "#fee2e2",
          color: delHover ? "#fff" : "#dc2626",
        }}
        onMouseEnter={() => setDelHover(true)}
        onMouseLeave={() => setDelHover(false)}
      >
        <Trash2 size={15} />
        Delete Room
      </button>
    </div>
  );
}

const styles = {
  loadingContainer: { minHeight: "100vh", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingBox: { textAlign: "center" },
  spinner: { width: 44, height: 44, border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" },
  loadingText: { marginTop: 14, color: "#64748b", fontSize: 15, fontWeight: 500 },
  retryBtn: { padding: "10px 28px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },

  heroBanner: {
    background: "linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)",
    padding: "32px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
  },
  heroLeft: { display: "flex", alignItems: "center", gap: 18 },
  heroIcon: { width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" },
  heroTitle: { fontSize: 26, fontWeight: 700, color: "white", margin: 0 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "4px 0 0" },
  statBadge: { background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 14, padding: "14px 24px", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)" },
  statNumber: { display: "block", fontSize: 34, fontWeight: 800, color: "white", lineHeight: 1 },
  statLabel: { display: "block", fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" },

  pageBody: { padding: "28px 32px", maxWidth: 1300, margin: "0 auto" },

  alertBox: { padding: "14px 18px", marginBottom: 20, background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, color: "#991b1b", fontWeight: 600, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  alertClose: { background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: 20, lineHeight: 1 },

  card: { background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", gap: 10, padding: "22px 24px 0" },
  cardHeaderIcon: { width: 34, height: 34, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 },

  addFormRow: { display: "flex", gap: 16, alignItems: "flex-end", padding: "18px 24px 24px" },
  inputLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 },
  inputWithIcon: { position: "relative" },
  textInput: { width: "100%", padding: "12px 14px 12px 42px", border: "1.5px solid #cbd5e1", borderRadius: 10, fontSize: 14, outline: "none", color: "#0f172a", boxSizing: "border-box", transition: "border 0.2s" },
  addBtn: { padding: "12px 26px", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", transition: "all 0.2s" },

  inventoryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "22px 24px 20px" },
  countPill: { fontSize: 12, fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 10px", borderRadius: 20 },
  searchWrapper: { position: "relative" },
  searchInput: { padding: "9px 14px 9px 36px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none", color: "#0f172a", width: 200 },

  emptyState: { textAlign: "center", padding: "60px 24px" },
  emptyIconWrapper: { width: 72, height: 72, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" },
  emptyText: { fontSize: 14, color: "#64748b", margin: 0 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, padding: "0 24px 24px" },

  roomCard: { background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", overflow: "hidden", transition: "all 0.25s ease", position: "relative" },
  roomCardAccent: { height: 4, background: "linear-gradient(90deg,#2563eb,#60a5fa)" },
  roomCardInner: { display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 18px 14px" },
  roomIconBox: { width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  roomName: { fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.3 },
  roomIdBadge: { fontSize: 11, fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "2px 8px" },
  priceBand: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "12px 18px" },
  priceBandLabel: { fontSize: 13, color: "#64748b", fontWeight: 500 },
  priceBandValue: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
  deleteBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "11px 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" },
};
