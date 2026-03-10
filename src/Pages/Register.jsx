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
  Upload,
  Shield,
  CheckCircle,
  AlertCircle
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
    id_proof_type: "",           // ✅ Fixed: organization_type → id_proof_type
    id_proof_number: "",          // ✅ Fixed: Added new field
    identity_certificate: null    // ✅ Fixed: certificate → identity_certificate
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "identity_certificate") {  // ✅ Fixed: certificate → identity_certificate
      setFormData({ ...formData, identity_certificate: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input:focus, select:focus {
            border-color: #0d47a1 !important;
            box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.1) !important;
          }
          
          button:hover:not(:disabled) {
            background-color: #1565c0 !important;
            transform: translateY(-1px);
            box-shadow: 0 5px 12px rgba(0,0,0,0.2) !important;
          }
          
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          a:hover {
            text-decoration: underline !important;
          }
        `}
      </style>

      {/* Header */}
      <div style={header}>
        <div style={headerContent}>
          <div style={govEmblem}>
            <Shield size={40} color="#0d47a1" />
          </div>
          <div style={headerText}>
            <h1 style={headerTitle}>Government of India</h1>
            <p style={headerSubtitle}>Ministry of Registration & Licensing</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={contentContainer}>
        <div style={registrationCard}>
          {/* Card Header */}
          <div style={cardHeader}>
            <User size={28} color="#0d47a1" />
            <div>
              <h2 style={cardTitle}>Organization Registration</h2>
              <p style={cardSubtitle}>Please fill in your details to register</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div style={successBox}>
              <CheckCircle size={18} />
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={errorBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={form}>
            {/* Personal Information Section */}
            <div style={sectionHeader}>
              <div style={sectionTitle}>Personal Information</div>
              <div style={sectionLine}></div>
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <User size={16} />
                  Full Name <span style={requiredStar}>*</span>
                </label>
                <input
                  style={formInput}
                  name="name"
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Mail size={16} />
                  Email Address <span style={requiredStar}>*</span>
                </label>
                <input
                  style={formInput}
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <Phone size={16} />
                  Phone Number <span style={requiredStar}>*</span>
                </label>
                <input
                  style={formInput}
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Lock size={16} />
                  Password <span style={requiredStar}>*</span>
                </label>
                <input
                  style={formInput}
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address Section */}
            <div style={sectionHeader}>
              <div style={sectionTitle}>Address Details</div>
              <div style={sectionLine}></div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <MapPin size={16} />
                Street Address
              </label>
              <input
                style={formInput}
                name="address"
                placeholder="House/Flat No., Street Name"
                onChange={handleChange}
              />
            </div>

            <div style={formRow}>
              <div style={formGroup}>
                <label style={formLabel}>
                  <Building2 size={16} />
                  City
                </label>
                <input
                  style={formInput}
                  name="city"
                  placeholder="Enter city"
                  onChange={handleChange}
                />
              </div>

              <div style={formGroup}>
                <label style={formLabel}>
                  <Map size={16} />
                  State
                </label>
                <input
                  style={formInput}
                  name="state"
                  placeholder="Enter state"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Hash size={16} />
                Pincode
              </label>
              <input
                style={formInput}
                name="pincode"
                placeholder="6-digit pincode"
                onChange={handleChange}
              />
            </div>

            {/* Organization Section */}
            <div style={sectionHeader}>
              <div style={sectionTitle}>Organization Details</div>
              <div style={sectionLine}></div>
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Building2 size={16} />
                Organization Type <span style={requiredStar}>*</span>
              </label>
              <select
                style={selectInput}
                name="id_proof_type"  // ✅ Fixed: organization_type → id_proof_type
                onChange={handleChange}
                required
              >
                <option value="">Select Organization Type</option>
                <option>Educational Institute</option>
                <option>MSME</option>
                <option>E&P Organization</option>
                <option>Service Provider</option>
                <option>Investor</option>
                <option>Others</option>
              </select>
            </div>

            {/* ✅ NEW FIELD ADDED */}
            <div style={formGroup}>
              <label style={formLabel}>
                <Hash size={16} />
                ID Proof Number <span style={requiredStar}>*</span>
              </label>
              <input
                style={formInput}
                name="id_proof_number"
                placeholder="Enter ID proof number (e.g., Registration No., GST No.)"
                onChange={handleChange}
                required
              />
            </div>

            <div style={formGroup}>
              <label style={formLabel}>
                <Upload size={16} />
                Identity Certificate <span style={requiredStar}>*</span>
              </label>
              <input
                style={formInput}
                type="file"
                name="identity_certificate"  // ✅ Fixed: certificate → identity_certificate
                accept=".pdf,.jpg,.png"
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" style={submitButton} disabled={loading}>
              {loading ? (
                <>
                  <div style={spinner}></div>
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Register
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={footer}>
            <div style={divider}></div>
            <p style={footerText}>
              Already have an account?{" "}
              <a href="/login" style={footerLink}>
                Login here
              </a>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div style={securityNotice}>
          <Shield size={20} color="#0d47a1" />
          <div>
            <div style={securityTitle}>Secure Registration</div>
            <p style={securityText}>
              Your information is encrypted and stored securely. All data is
              handled in accordance with government privacy policies.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div style={footerBar}>
        <div style={footerBarContent}>
          <p style={footerBarText}>
            © 2024 Government of India. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

// ================= PROFESSIONAL GOVERNMENT STYLES =================

const pageWrapper = {
  minHeight: "100vh",
  backgroundColor: "#f1f5f9",
  fontFamily: "'Segoe UI','Roboto',system-ui,-apple-system,sans-serif",
  display: "flex",
  flexDirection: "column"
};

const header = {
  backgroundColor: "#0d47a1",
  borderBottom: "4px solid #ff6f00",
  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  padding: "22px 0"
};

const headerContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  gap: "18px"
};

const govEmblem = {
  width: "72px",
  height: "72px",
  backgroundColor: "#fff",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
};

const headerText = { color: "#fff" };

const headerTitle = {
  margin: 0,
  fontSize: "26px",
  fontWeight: 600,
  letterSpacing: ".3px"
};

const headerSubtitle = {
  marginTop: 4,
  fontSize: "14px",
  opacity: 0.95
};

const contentContainer = {
  flex: 1,
  maxWidth: "820px",
  margin: "0 auto",
  padding: "36px 20px",
  width: "100%"
};

const registrationCard = {
  backgroundColor: "#fff",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  overflow: "hidden"
};

const cardHeader = {
  padding: "28px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  gap: "14px",
  alignItems: "center"
};

const cardTitle = {
  margin: 0,
  fontSize: "21px",
  fontWeight: 600,
  color: "#0f172a"
};

const cardSubtitle = {
  marginTop: 4,
  fontSize: "14px",
  color: "#64748b"
};

const successBox = {
  margin: "20px 28px 0",
  padding: "12px 14px",
  backgroundColor: "#ecfdf5",
  border: "1px solid #86efac",
  borderRadius: "6px",
  display: "flex",
  gap: "8px",
  color: "#166534",
  fontSize: "14px",
  fontWeight: 500
};

const errorBox = {
  margin: "20px 28px 0",
  padding: "12px 14px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "6px",
  display: "flex",
  gap: "8px",
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: 500
};

const form = { padding: "28px" };

const sectionHeader = { margin: "10px 0 18px" };

const sectionTitle = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#0f172a",
  marginBottom: "6px"
};

const sectionLine = {
  height: "2px",
  backgroundColor: "#e2e8f0",
  borderRadius: 2
};

const formRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
  marginBottom: "18px"
};

const formGroup = { marginBottom: "18px" };

const formLabel = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13.5px",
  fontWeight: 600,
  color: "#334155",
  marginBottom: "6px"
};

const requiredStar = { color: "#dc2626" };

const formInput = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  transition: "0.2s ease",
  backgroundColor: "#fff",
  boxSizing: "border-box"
};

const selectInput = {
  ...formInput,
  cursor: "pointer"
};

const submitButton = {
  width: "100%",
  padding: "13px",
  backgroundColor: "#0d47a1",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all .2s ease",
  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
  cursor: "pointer"
};

const spinner = {
  width: "16px",
  height: "16px",
  border: "2px solid rgba(255,255,255,0.4)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite"
};

const footer = { padding: "20px 28px 28px" };

const divider = {
  height: "1px",
  backgroundColor: "#e2e8f0",
  marginBottom: "16px"
};

const footerText = {
  textAlign: "center",
  fontSize: "13px",
  color: "#64748b",
  margin: 0
};

const footerLink = {
  color: "#0d47a1",
  fontWeight: 500,
  textDecoration: "none"
};

const securityNotice = {
  marginTop: "22px",
  padding: "16px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  display: "flex",
  gap: "12px"
};

const securityTitle = {
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: 4,
  margin: 0
};

const securityText = {
  fontSize: "13px",
  color: "#64748b",
  lineHeight: 1.5,
  margin: 0
};

const footerBar = {
  backgroundColor: "#1e293b",
  borderTop: "3px solid #ff6f00",
  padding: "16px 0"
};

const footerBarContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
  textAlign: "center"
};

const footerBarText = {
  margin: 0,
  fontSize: "12.5px",
  color: "#cbd5e1"
};