import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import styles from "../Component/Styles/AuthRecovery.module.css";
import { encryptPassword } from "../utils/passwordCrypto.js";

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

function PasswordField({ id, label, value, onChange, visible, onToggle, disabled }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <LockKeyhole size={18} />
        <input id={id} type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder="Enter a strong password" autoComplete="new-password" disabled={disabled} required />
        <button className={styles.toggle} type="button" onClick={onToggle} aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    axios.get(`${import.meta.env.VITE_API_URL}/auth/reset-password/validate`, { params: { token } })
      .then(() => active && setStatus("valid"))
      .catch(() => active && setStatus("invalid"));
    return () => { active = false; };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!strongPassword.test(password)) {
      setError("Use at least 12 characters with uppercase, lowercase, number and special character.");
      return;
    }
    if (password !== confirmation) {
      setError("Password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const encryptedPassword = await encryptPassword(password);
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { token, newPassword: encryptedPassword }, { withCredentials: true });
      setStatus("complete");
      window.setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.icon}><KeyRound size={24} /></span>
        {status === "checking" && <div className={styles.centerState}><span className={styles.darkSpinner} /><h1>Checking reset link</h1><p>Please wait a moment.</p></div>}
        {status === "invalid" && <div className={styles.centerState}><AlertCircle className={styles.invalidIcon} size={36} /><h1>Link expired or invalid</h1><p>Request a fresh password reset link to continue.</p><Link className={styles.primaryLink} to="/forgot-password">Request new link</Link></div>}
        {status === "complete" && <div className={styles.centerState}><CheckCircle2 className={styles.completeIcon} size={40} /><h1>Password reset complete</h1><p>Your password has been updated. Redirecting you to sign in...</p></div>}
        {status === "valid" && (
          <div className={styles.content}>
            <p className={styles.kicker}>Secure password reset</p>
            <h1>Create a new password</h1>
            <p className={styles.description}>Choose a password you have not used for this account before.</p>
            {error && <div className={styles.error} role="alert"><AlertCircle size={18} /><span>{error}</span></div>}
            <form className={styles.form} onSubmit={handleSubmit}>
              <PasswordField id="new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} visible={visible} onToggle={() => setVisible((value) => !value)} disabled={loading} />
              <PasswordField id="confirm-password" label="Confirm new password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} visible={visible} onToggle={() => setVisible((value) => !value)} disabled={loading} />
              <p className={styles.requirement}>Minimum 12 characters, including uppercase, lowercase, a number and a special character.</p>
              <button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? <><span className={styles.spinner} /> Updating...</> : "Reset password"}</button>
            </form>
          </div>
        )}
        {status !== "complete" && <Link className={styles.backLink} to="/login"><ArrowLeft size={16} /> Back to sign in</Link>}
      </section>
    </main>
  );
}

export default ResetPassword;

