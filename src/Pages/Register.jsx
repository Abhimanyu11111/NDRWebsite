import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  Building2, 
  Map, 
  Hash,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    id_proof_type: "",
    id_proof_number: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      {/* GOVERNMENT HEADER */}
      <div style={header}>
        <div style={headerContent}>
          <div style={govEmblem}>
            <Shield size={40} strokeWidth={2.5} style={{ color: "#ff6f00" }} />
          </div>
          <div style={headerText}>
            <h1 style={headerTitle}>National Data Repository</h1>
            <p style={headerSubtitle}>Government of India | User Registration Portal</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={contentContainer}>
        <div style={registrationCard}>
          <div style={cardHeader}>
            <User size={32} strokeWidth={2.5} style={{ color: "#0d47a1" }} />
            <div>
              <h2 style={cardTitle}>New User Registration</h2>
              <p style={cardSubtitle}>Create your account to access VDR booking services</p>
            </div>
          </div>

          {success && (
            <div style={successBox}>
              <CheckCircle size={18} strokeWidth={2.5} />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          {error && (
            <div style={errorBox}>
              <AlertCircle size={18} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={form}>
            {/* PERSONAL INFORMATION */}
            <div style={sectionHeader}>
              <h3 style={sectionTitle}>Personal Information</h3>
              <div style={sectionLine}></div>
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <User size={16} strokeWidth={2.5} />
                  Full Name <span style={requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Mail size={16} strokeWidth={2.5} />
                  Email Address <span style={requiredStar}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <Phone size={16} strokeWidth={2.5} />
                  Phone Number <span style={requiredStar}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                  maxLength="10"
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Lock size={16} strokeWidth={2.5} />
                  Password <span style={requiredStar}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* ADDRESS INFORMATION */}
            <div style={sectionHeader}>
              <h3 style={sectionTitle}>Address Details</h3>
              <div style={sectionLine}></div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <MapPin size={16} strokeWidth={2.5} />
                Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={handleChange}
                style={formInput}
                disabled={loading}
              />
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <Building2 size={16} strokeWidth={2.5} />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Map size={16} strokeWidth={2.5} />
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Hash size={16} strokeWidth={2.5} />
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={handleChange}
                style={formInput}
                disabled={loading}
                maxLength="6"
              />
            </div>

            {/* ID PROOF INFORMATION */}
            <div style={sectionHeader}>
              <h3 style={sectionTitle}>Identity Verification</h3>
              <div style={sectionLine}></div>
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <CreditCard size={16} strokeWidth={2.5} />
                  ID Proof Type
                </label>
                <select
                  name="id_proof_type"
                  value={formData.id_proof_type}
                  onChange={handleChange}
                  style={selectInput}
                  disabled={loading}
                >
                  <option value="">Select ID Proof Type</option>
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Driving Licence">Driving Licence</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Hash size={16} strokeWidth={2.5} />
                  ID Proof Number
                </label>
                <input
                  type="text"
                  name="id_proof_number"
                  placeholder="Enter ID proof number"
                  value={formData.id_proof_number}
                  onChange={handleChange}
                  style={formInput}
                  disabled={loading}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} strokeWidth={2.5} />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          <div style={footer}>
            <div style={divider}></div>
            <div style={footerText}>
              Already have an account?{" "}
              <a href="/login" style={footerLink}>
                Login here
              </a>
            </div>
          </div>
        </div>

        {/* SECURITY NOTICE */}
        <div style={securityNotice}>
          <Shield size={20} strokeWidth={2.5} style={{ color: "#0d47a1" }} />
          <div>
            <p style={securityTitle}>Secure Registration</p>
            <p style={securityText}>
              Your personal information is encrypted and stored securely. Fields marked with * are mandatory.
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

          input:focus, select:focus {
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

          @media (max-width: 768px) {
            .form-row {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Register;

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
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  gap: "20px"
};

const govEmblem = {
  width: "80px",
  height: "80px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
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
  maxWidth: "800px",
  margin: "0 auto",
  padding: "40px 24px",
  width: "100%"
};

const registrationCard = {
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

const successBox = {
  margin: "24px 32px 0 32px",
  padding: "14px 16px",
  backgroundColor: "#f0fdf4",
  border: "1px solid #86efac",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#166534",
  fontSize: "14px",
  fontWeight: "500"
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

const sectionHeader = {
  marginBottom: "20px",
  marginTop: "8px"
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const sectionLine = {
  height: "2px",
  backgroundColor: "#e2e8f0",
  borderRadius: "1px"
};

const formRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "20px"
};

const formGroup = {
  marginBottom: "20px"
};

const formLabel = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155",
  marginBottom: "8px"
};

const requiredStar = {
  color: "#dc2626",
  marginLeft: "2px"
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

const selectInput = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "15px",
  color: "#1e293b",
  outline: "none",
  transition: "all 0.2s",
  fontFamily: "inherit",
  backgroundColor: "white",
  cursor: "pointer"
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

const footerText = {
  textAlign: "center",
  fontSize: "14px",
  color: "#64748b"
};

const footerLink = {
  color: "#0d47a1",
  textDecoration: "none",
  fontWeight: "500",
  transition: "all 0.2s"
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