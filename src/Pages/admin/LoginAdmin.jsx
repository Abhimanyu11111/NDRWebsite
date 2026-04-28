import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle, Sparkles } from "lucide-react";
import api from "../../api/axiosClient";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/admin-login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      navigate("/admin/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      {/* Animated gradient background */}
      <div style={gradientBg}></div>
      <div style={meshPattern}></div>

      {/* MAIN CONTENT */}
      <div style={contentContainer}>
        {/* Admin Badge */}
        <div style={adminBadge}>
          <div style={shieldIcon}>
            <Shield size={28} strokeWidth={2.5} style={{ color: "#fff" }} />
          </div>
          <div>
            <h1 style={brandName}>Admin Portal</h1>
            <p style={brandTagline}>National Data Repository • Secure Access</p>
          </div>
        </div>

        <div style={loginCard}>
          <div style={cardGlow}></div>
          
          <div style={cardHeader}>
            <div style={iconBadge}>
              <Lock size={24} strokeWidth={2.5} style={{ color: "#dc2626" }} />
            </div>
            <div>
              <h2 style={cardTitle}>Administrator Login</h2>
              <p style={cardSubtitle}>Enter your admin credentials to access the dashboard</p>
            </div>
          </div>

          {error && (
            <div style={errorBox}>
              <AlertCircle size={18} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={form}>
            <div style={formGroup}>
              <label style={formLabel}>
                <Mail size={16} strokeWidth={2.5} />
                Admin Email
              </label>
              <div style={inputWrapper}>
                <input
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={formInput}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Lock size={16} strokeWidth={2.5} />
                Password
              </label>
              <div style={passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={formInput}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButton}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2.5} />
                  ) : (
                    <Eye size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                ...submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              disabled={loading}
            >
              <div style={buttonGlow}></div>
              {loading ? (
                <>
                  <div style={spinner}></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield size={18} strokeWidth={2.5} />
                  <span>Access Admin Dashboard</span>
                  <Sparkles size={16} strokeWidth={2.5} style={{ marginLeft: 'auto' }} />
                </>
              )}
            </button>
          </form>

          <div style={footer}>
            <div style={securityNote}>
              <Shield size={14} strokeWidth={2.5} style={{ color: "#dc2626" }} />
              <span style={securityNoteText}>Restricted Access • All login attempts are monitored</span>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div style={copyrightText}>
          © 2026 National Data Repository, Government of India
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          input:focus {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1), 0 8px 16px rgba(0,0,0,0.1) !important;
            transform: translateY(-1px);
          }

          button:hover:not(:disabled) {
            background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(220, 38, 38, 0.3) !important;
          }

          button:active:not(:disabled) {
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
}

// ================= PREMIUM STYLES =================

const pageWrapper = {
  minHeight: "100vh",
  backgroundColor: "#0f172a",
  fontFamily: "'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden"
};

const gradientBg = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #450a0a 100%)",
  backgroundSize: "200% 200%",
  animation: "gradientShift 15s ease infinite",
  opacity: 0.9
};

const meshPattern = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(127, 29, 29, 0.2) 0%, transparent 50%)`,
  opacity: 0.6
};

const contentContainer = {
  flex: 1,
  maxWidth: "460px",
  margin: "0 auto",
  padding: "60px 24px 40px 24px",
  width: "100%",
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const adminBadge = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "40px",
  animation: "pulse 2s ease-in-out infinite"
};

const shieldIcon = {
  width: "60px",
  height: "60px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 32px rgba(220, 38, 38, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)",
  border: "2px solid rgba(255,255,255,0.1)"
};

const brandName = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "700",
  color: "#ffffff",
  letterSpacing: "-0.5px",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
};

const brandTagline = {
  margin: "4px 0 0 0",
  fontSize: "13px",
  color: "rgba(255,255,255,0.7)",
  fontWeight: "500",
  letterSpacing: "0.3px"
};

const loginCard = {
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.2)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.5)",
  overflow: "hidden",
  backdropFilter: "blur(20px)",
  position: "relative"
};

const cardGlow = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "4px",
  background: "linear-gradient(90deg, #dc2626, #b91c1c, #dc2626)",
  backgroundSize: "200% 100%",
  animation: "gradientShift 3s ease infinite"
};

const cardHeader = {
  padding: "40px 36px 28px 36px",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
  display: "flex",
  alignItems: "flex-start",
  gap: "16px"
};

const iconBadge = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(220, 38, 38, 0.2)"
};

const cardTitle = {
  margin: "0 0 6px 0",
  fontSize: "26px",
  fontWeight: "700",
  color: "#0f172a",
  letterSpacing: "-0.5px"
};

const cardSubtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "500",
  letterSpacing: "0.2px"
};

const errorBox = {
  margin: "28px 36px 0 36px",
  padding: "16px 18px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "600",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)"
};

const form = {
  padding: "32px 36px 36px 36px"
};

const formGroup = {
  marginBottom: "24px"
};

const formLabel = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: "700",
  color: "#1e293b",
  marginBottom: "10px",
  letterSpacing: "0.2px"
};

const inputWrapper = {
  position: "relative"
};

const passwordWrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const formInput = {
  width: "100%",
  padding: "14px 18px",
  border: "2px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "15px",
  color: "#1e293b",
  outline: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontFamily: "inherit",
  backgroundColor: "#f8fafc",
  fontWeight: "500"
};

const eyeButton = {
  position: "absolute",
  right: "14px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px",
  borderRadius: "8px",
  transition: "all 0.2s ease"
};

const submitButton = {
  width: "100%",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 8px 20px rgba(220, 38, 38, 0.25)",
  marginTop: "12px",
  letterSpacing: "0.3px",
  position: "relative",
  overflow: "hidden"
};

const buttonGlow = {
  position: "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
  background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
  animation: "glow 2s ease-in-out infinite"
};

const spinner = {
  width: "18px",
  height: "18px",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};

const footer = {
  padding: "28px 36px 36px 36px"
};

const securityNote = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "12px",
  background: "rgba(220, 38, 38, 0.05)",
  borderRadius: "10px",
  border: "1px solid rgba(220, 38, 38, 0.1)"
};

const securityNoteText = {
  fontSize: "12px",
  color: "#dc2626",
  fontWeight: "600",
  letterSpacing: "0.2px"
};

const copyrightText = {
  marginTop: "32px",
  textAlign: "center",
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
  fontWeight: "500",
  letterSpacing: "0.3px"
};