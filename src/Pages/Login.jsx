import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Shield, AlertCircle } from "lucide-react";
// import govtEmblemImg from "../assets/images/Emblem.png"
import govtEmblemImg from "../assets/images/emblem1.png"


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

      // save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // redirect to dashboard (BookVDR)
      navigate("/book-vdr");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      {/* GOVERNMENT HEADER */}
      <div style={header}>
        <div className = "container" style={headerContent}>
          <div style={govEmblem}>
            {/* <Shield size={40} strokeWidth={2.5} style={{ color: "#ff6f00" }} /> */}
            <img style = {{width : "100%" , height : "100%"}} src={govtEmblemImg} alt="" />
          </div>
          <div style={headerText}>
            <h1 style={headerTitle}>National Data Repository</h1>
            <p style={headerSubtitle}>Government of India | Secure Login Portal</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={contentContainer}>
        <div style={loginCard}>
          <div style={cardHeader}>
            <LogIn size={32} strokeWidth={2.5} style={{ color: "#0d47a1" }} />
            <div>
              <h2 style={cardTitle}>User Login</h2>
              <p style={cardSubtitle}>Enter your credentials to access the system</p>
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
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={formInput}
                disabled={loading}
              />
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Lock size={16} strokeWidth={2.5} />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={formInput}
                disabled={loading}
              />
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
              {loading ? (
                <>
                  <div style={spinner}></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} strokeWidth={2.5} />
                  <span>Login to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div style={footer}>
            <div style={divider}></div>
            <div style={footerLinks}>
              <a href="/Register" style={footerLink}>
                Create New Account
              </a>
              <span style={footerSeparator}>|</span>
              <a href="/help" style={footerLink}>
                Need Help?
              </a>
            </div>
          </div>
        </div>

        {/* SECURITY NOTICE */}
        <div style={securityNotice}>
          <Shield size={20} strokeWidth={2.5} style={{ color: "#0d47a1" }} />
          <div>
            <p style={securityTitle}>Secure Login</p>
            <p style={securityText}>
              This is a secure government portal. All login attempts are monitored and logged for security purposes.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div style={footerBar}>
        <div style={footerBarContent}>
          <p style={footerBarText}>
            © 2026 National Data Repository, Government of India. All rights reserved.
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          input:focus {
            border-color: #0d47a1 !important;
            box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.1) !important;
          }

          button:hover:not(:disabled) {
            background-color: #002171 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          }

          button:active:not(:disabled) {
            transform: translateY(0);
          }

          a:hover {
            color: #002171 !important;
            text-decoration: underline !important;
          }
        `}
      </style>
    </div>
  );
}

export default Login;

// ================= PROFESSIONAL GOVERNMENT STYLES =================

const pageWrapper = {
  minHeight: "100vh",
  backgroundColor: "#f1f5f9",
  fontFamily: "'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif",
  display: "flex",
  flexDirection: "column"
};

const header = {
  backgroundColor: "#0d47a1",
  borderBottom: "4px solid #ff6f00",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  padding: "24px 0"
};

const headerContent = {
  // maxWidth: "1200px",
  // margin: "0 auto",
  // padding: "0 24px",
  display: "flex",
  alignItems: "center",
  gap: "20px"
};

const govEmblem = {
  width: "80px",
  // height: "80px",
  // backgroundColor: "#ffffff",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
};

const headerText = {
  color: "white"
};

const headerTitle = {
  margin: "0 0 6px 0",
  fontSize: "28px",
  fontWeight: "600",
  letterSpacing: "0.3px"
};

const headerSubtitle = {
  margin: 0,
  fontSize: "15px",
  opacity: 0.95,
  fontWeight: "400"
};

const contentContainer = {
  flex: 1,
  maxWidth: "480px",
  margin: "0 auto",
  padding: "48px 24px",
  width: "100%"
};

const loginCard = {
  backgroundColor: "white",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  overflow: "hidden"
};

const cardHeader = {
  padding: "32px 32px 24px 32px",
  borderBottom: "2px solid #f1f5f9",
  display: "flex",
  alignItems: "flex-start",
  gap: "16px"
};

const cardTitle = {
  margin: "0 0 4px 0",
  fontSize: "22px",
  fontWeight: "600",
  color: "#0f172a"
};

const cardSubtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#64748b",
  fontWeight: "400"
};

const errorBox = {
  margin: "24px 32px 0 32px",
  padding: "14px 16px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "500"
};

const form = {
  padding: "32px"
};

const formGroup = {
  marginBottom: "24px"
};

const formLabel = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155",
  marginBottom: "8px"
};

const formInput = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "15px",
  color: "#1e293b",
  outline: "none",
  transition: "all 0.2s",
  fontFamily: "inherit",
  backgroundColor: "white"
};

const submitButton = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#0d47a1",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  transition: "all 0.2s",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  marginTop: "8px"
};

const spinner = {
  width: "16px",
  height: "16px",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};

const footer = {
  padding: "24px 32px 32px 32px"
};

const divider = {
  height: "1px",
  backgroundColor: "#e2e8f0",
  marginBottom: "20px"
};

const footerLinks = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
  fontSize: "14px"
};

const footerLink = {
  color: "#0d47a1",
  textDecoration: "none",
  fontWeight: "500",
  transition: "all 0.2s"
};

const footerSeparator = {
  color: "#cbd5e1",
  fontWeight: "300"
};

const securityNotice = {
  marginTop: "24px",
  padding: "20px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  display: "flex",
  gap: "14px",
  alignItems: "flex-start"
};

const securityTitle = {
  margin: "0 0 6px 0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a"
};

const securityText = {
  margin: 0,
  fontSize: "13px",
  color: "#64748b",
  lineHeight: "1.6"
};

const footerBar = {
  backgroundColor: "#1e293b",
  borderTop: "3px solid #ff6f00",
  padding: "20px 0"
};

const footerBarContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  textAlign: "center"
};

const footerBarText = {
  margin: 0,
  fontSize: "13px",
  color: "#cbd5e1",
  fontWeight: "400"
};