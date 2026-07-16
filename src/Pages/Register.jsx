import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileUp,
  Hash,
  LockKeyhole,
  Mail,
  Map,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  Upload,
  User,
  UsersRound,
} from "lucide-react";
import styles from "../Component/Styles/Register.module.css";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  company: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  id_proof_type: "",
  id_proof_number: "",
  identity_certificate: null,
};

const BLOCKED_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "rediffmail.com", "ymail.com", "aol.com", "icloud.com", "protonmail.com",
  "proton.me", "msn.com", "yahoo.in", "yahoo.co.in", "hotmail.co.in",
  "zohomail.com", "mail.com", "gmx.com", "inbox.com", "yandex.com",
];

function Field({ label, required, icon: Icon, children, className = "" }) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label className={styles.label}>
        {label}{required && <span aria-hidden="true">*</span>}
      </label>
      <div className={styles.control}>
        {Icon && <Icon className={styles.controlIcon} size={17} aria-hidden="true" />}
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className={styles.sectionTitle}>
      <span className={styles.sectionIcon}>{Icon && <Icon size={17} aria-hidden="true" />}</span>
      <h2>{children}</h2>
      <span className={styles.sectionLine} />
    </div>
  );
}

function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const normalizedEmail = formData.email.trim().toLowerCase();
  const emailVerified = Boolean(
    emailVerificationToken && verifiedEmail === normalizedEmail
  );

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCountdown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "identity_certificate") {
      const file = files?.[0] || null;
      if (file && file.size > 5 * 1024 * 1024) {
        event.target.value = "";
        setFormData((current) => ({ ...current, identity_certificate: null }));
        setError("Identity certificate must be smaller than 5 MB.");
        return;
      }
      setFormData((current) => ({ ...current, identity_certificate: file }));
    } else {
      setFormData((current) => ({ ...current, [name]: value }));
      if (name === "email") {
        setOtp("");
        setOtpSent(false);
        setResendCountdown(0);
        setVerifiedEmail("");
        setEmailVerificationToken("");
        setNotice("");
      }
    }
    setError("");
  };

  const isPersonalEmail = (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain ? BLOCKED_DOMAINS.includes(domain) : false;
  };

  const isStrongPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/.test(value);

  const sendOtp = async () => {
    setError("");
    setNotice("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail) || isPersonalEmail(normalizedEmail)) {
      setError("Please enter a valid official organization email before requesting an OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/registration-otp/send`,
        { email: normalizedEmail },
      );
      setOtp("");
      setOtpSent(true);
      setVerifiedEmail("");
      setEmailVerificationToken("");
      setResendCountdown(response.data?.resendAfterSeconds || 60);
      setNotice(`OTP sent to ${normalizedEmail}. It is valid for 30 minutes.`);
    } catch (requestError) {
      const retryAfter = Number(requestError.response?.data?.retryAfterSeconds || 0);
      if (retryAfter > 0) setResendCountdown(retryAfter);
      setError(requestError.response?.data?.msg || "Unable to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setNotice("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6 digit OTP sent to your email.");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/registration-otp/verify`,
        { email: normalizedEmail, otp },
      );
      setVerifiedEmail(normalizedEmail);
      setEmailVerificationToken(response.data.verificationToken);
      setNotice("Email verified successfully. You can now submit your registration.");
    } catch (requestError) {
      setEmailVerificationToken("");
      setVerifiedEmail("");
      setError(requestError.response?.data?.msg || "OTP verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Please verify your official email address before registering.");
      return;
    }

    if (isPersonalEmail(formData.email)) {
      setError("Please use your official organization email. Personal email addresses are not allowed.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10 digit Indian mobile number.");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError("Password must be at least 12 characters and include uppercase, lowercase, a number and a special character.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) data.append(key, value);
      });
      data.append("email_verification_token", emailVerificationToken);

      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 4000);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <span className={styles.brandIcon}><Building2 size={24} aria-hidden="true" /></span>
          <h1>Organization Registration</h1>
          <p>Please fill in your details to register.</p>
        </header>

        {success && (
          <div className={`${styles.message} ${styles.success}`} role="status">
            <CheckCircle2 size={18} />
            <span>Registration submitted successfully. Your account is pending admin approval. Redirecting to login...</span>
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.error}`} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {notice && !success && (
          <div className={`${styles.message} ${styles.success}`} role="status">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <section className={styles.section}>
            <SectionTitle icon={User}>Personal Information</SectionTitle>

            <div className={styles.twoColumns}>
              <Field label="Full Name" required icon={User}>
                <input name="name" value={formData.name} placeholder="Enter your full name" onChange={handleChange} required />
              </Field>
              <Field label="Email Address" required icon={Mail}>
                <input type="email" name="email" value={formData.email} placeholder="your.email@example.com" onChange={handleChange} required />
              </Field>
              <Field label="Phone Number" required icon={Phone}>
                <span className={styles.phonePrefix}>+91</span>
                <input className={styles.phoneInput} name="phone" value={formData.phone} placeholder="XXXXX XXXXX" onChange={handleChange} inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} required />
              </Field>
              <Field label="Password" required icon={LockKeyhole}>
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} placeholder="Create a strong password" onChange={handleChange} minLength={12} required />
                <button className={styles.passwordToggle} type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </Field>
            </div>

            <div className={`${styles.otpPanel} ${emailVerified ? styles.otpVerified : ""}`}>
              <div className={styles.otpPanelText}>
                <strong>{emailVerified ? "Official email verified" : "Verify your official email"}</strong>
                <span>
                  {emailVerified
                    ? normalizedEmail
                    : "We will send a single-use 6 digit OTP valid for 30 minutes."}
                </span>
              </div>

              {!otpSent && !emailVerified && (
                <button className={styles.otpAction} type="button" onClick={sendOtp} disabled={otpLoading || !normalizedEmail}>
                  {otpLoading ? <span className={styles.smallSpinner} /> : <Send size={16} />}
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              )}

              {otpSent && !emailVerified && (
                <div className={styles.otpControls}>
                  <input
                    className={styles.otpInput}
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6 digit OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    aria-label="Email verification OTP"
                  />
                  <button className={styles.otpAction} type="button" onClick={verifyOtp} disabled={otpLoading || otp.length !== 6}>
                    {otpLoading ? <span className={styles.smallSpinner} /> : <Check size={16} />}
                    Verify OTP
                  </button>
                  <button className={styles.resendButton} type="button" onClick={sendOtp} disabled={otpLoading || resendCountdown > 0}>
                    <RefreshCw size={14} />
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
                  </button>
                </div>
              )}

              {emailVerified && <CheckCircle2 className={styles.verifiedIcon} size={24} aria-hidden="true" />}
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle icon={Building2}>Address &amp; Organization Details</SectionTitle>

            <div className={styles.twoColumns}>
              <Field label="Street Address" icon={MapPin}>
                <input name="address" value={formData.address} placeholder="House/Flat No., Street Name" onChange={handleChange} />
              </Field>
              <Field label="Company / Organisation Name" required icon={Building2}>
                <input name="company" value={formData.company} placeholder="Enter your company or organisation name" onChange={handleChange} required />
              </Field>
            </div>

            <div className={styles.threeColumns}>
              <Field label="City" icon={Building2}>
                <input name="city" value={formData.city} placeholder="Enter city" onChange={handleChange} />
              </Field>
              <Field label="State" icon={Map}>
                <input name="state" value={formData.state} placeholder="Enter state" onChange={handleChange} />
              </Field>
              <Field label="Pincode" icon={Hash}>
                <input name="pincode" value={formData.pincode} placeholder="6-digit pincode" onChange={handleChange} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} />
              </Field>
            </div>

            <div className={styles.twoColumns}>
              <Field label="Organization Type" required icon={UsersRound}>
                <select name="id_proof_type" value={formData.id_proof_type} onChange={handleChange} required>
                  <option value="">Select Organization Type</option>
                  <option>Educational Institute</option>
                  <option>MSME</option>
                  <option>E&amp;P Organization</option>
                  <option>Service Provider</option>
                  <option>Investor</option>
                  <option>Others</option>
                </select>
                <ChevronDown className={styles.selectArrow} size={16} aria-hidden="true" />
              </Field>
              <Field label="ID Proof Number" required icon={FileUp}>
                <input name="id_proof_number" value={formData.id_proof_number} placeholder="Enter ID proof number (e.g., Registration No., GST No.)" onChange={handleChange} required />
              </Field>
            </div>

            <div className={styles.uploadField}>
              <label className={styles.label}>Identity Certificate<span aria-hidden="true">*</span></label>
              <button className={styles.uploadBox} type="button" onClick={() => fileInputRef.current?.click()}>
                <span className={styles.chooseFile}><Upload size={16} />Choose File</span>
                <span className={styles.fileName}>{formData.identity_certificate?.name || "No file chosen"}</span>
                <span className={styles.fileHint}>PDF, PNG, JPG (Max. 5MB)</span>
              </button>
              <input ref={fileInputRef} className={styles.hiddenFile} type="file" name="identity_certificate" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} required />
            </div>
          </section>

          <button className={styles.submitButton} type="submit" disabled={loading || success || !emailVerified}>
            {loading ? <span className={styles.spinner} /> : <Check size={17} />}
            {loading ? "Registering..." : emailVerified ? "Register" : "Verify Email to Continue"}
          </button>
        </form>

        <p className={styles.loginText}>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </main>
  );
}

export default Register;
