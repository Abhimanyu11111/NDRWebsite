import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/book-vdr");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
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
        <div style={loginCard}>
          <div style={cardGlow}></div>
          
          <div style={cardHeader}>
            <div style={iconBadge}>
              <LogIn size={24} strokeWidth={2.5} style={{ color: "#0d47a1" }} />
            </div>
            <div>
              <h2 style={cardTitle}>Welcome Back</h2>
              <p style={cardSubtitle}>Enter your credentials to access your account</p>
            </div>
          </div>

          {error && (
            <div style={errorBox}>
              <AlertCircle size={18} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={form}>
            <div style={formGroup}>
              <label style={formLabel}>
                <Mail size={16} strokeWidth={2.5} />
                Email Address
              </label>
              <div style={inputWrapper}>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={formInput}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Lock size={16} strokeWidth={2.5} />
                Password
              </label>
              <div style={inputWrapper}>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={formInput}
                  disabled={loading}
                />
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
                  <LogIn size={18} strokeWidth={2.5} />
                  <span>Access Dashboard</span>
                  <Sparkles size={16} strokeWidth={2.5} style={{ marginLeft: 'auto' }} />
                </>
              )}
            </button>
          </form>

          <div style={footer}>
            <div style={divider}>
              <span style={dividerText}>or</span>
            </div>
            <div style={footerLinks}>
              <a href="/Register" style={footerLink}>
                <span style={linkDot}></span>
                Create New Account
              </a>
              <a href="/help" style={footerLink}>
                <span style={linkDot}></span>
                Need Help?
              </a>
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

          input:focus {
            border-color: #0d47a1 !important;
            box-shadow: 0 0 0 4px rgba(13, 71, 161, 0.1), 0 8px 16px rgba(0,0,0,0.1) !important;
            transform: translateY(-1px);
          }

          button:hover:not(:disabled) {
            background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(13, 71, 161, 0.3) !important;
          }

          button:active:not(:disabled) {
            transform: translateY(0);
          }

          a:hover {
            color: #0d47a1 !important;
            transform: translateX(4px);
          }
        `}
      </style>
    </div>
  );
}

export default Login;

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
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d47a1 100%)",
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
  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(13, 71, 161, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)`,
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
  background: "linear-gradient(90deg, #0d47a1, #1565c0, #0d47a1)",
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
  background: "linear-gradient(135deg, rgba(13, 71, 161, 0.1) 0%, rgba(21, 101, 192, 0.1) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(13, 71, 161, 0.2)"
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

const submitButton = {
  width: "100%",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)",
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
  boxShadow: "0 8px 20px rgba(13, 71, 161, 0.25)",
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

const divider = {
  position: "relative",
  textAlign: "center",
  marginBottom: "24px"
};

const dividerText = {
  position: "relative",
  display: "inline-block",
  padding: "0 16px",
  fontSize: "12px",
  color: "#94a3b8",
  fontWeight: "600",
  backgroundColor: "rgba(255,255,255,0.98)",
  zIndex: 1,
  letterSpacing: "0.5px",
  textTransform: "uppercase"
};

const footerLinks = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  alignItems: "center"
};

const footerLink = {
  color: "#475569",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const linkDot = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "#0d47a1",
  display: "inline-block"
};

const copyrightText = {
  marginTop: "32px",
  textAlign: "center",
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
  fontWeight: "500",
  letterSpacing: "0.3px"
};