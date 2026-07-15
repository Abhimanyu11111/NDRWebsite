import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from "lucide-react";
import styles from "../Component/Styles/AuthRecovery.module.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Unable to send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.icon}><KeyRound size={24} /></span>
        {sent ? (
          <div className={styles.content}>
            <p className={styles.kicker}>Check your inbox</p>
            <h1>Reset link requested</h1>
            <div className={styles.success} role="status">
              <CheckCircle2 size={20} />
              <span>If an active account exists for <strong>{email}</strong>, a reset link has been sent.</span>
            </div>
            <p className={styles.note}>The link expires in 30 minutes and works only once. Please also check your spam folder.</p>
            <button className={styles.secondaryButton} type="button" onClick={() => setSent(false)}>
              Try another email
            </button>
          </div>
        ) : (
          <div className={styles.content}>
            <p className={styles.kicker}>Account recovery</p>
            <h1>Forgot your password?</h1>
            <p className={styles.description}>Enter your registered email and we will send you a secure password reset link.</p>

            {error && <div className={styles.error} role="alert"><AlertCircle size={18} /><span>{error}</span></div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="recovery-email">Email address</label>
                <div className={styles.inputWrap}>
                  <Mail size={18} />
                  <input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@organization.com" autoComplete="email" disabled={loading} required />
                </div>
              </div>
              <button className={styles.primaryButton} type="submit" disabled={loading}>
                {loading ? <><span className={styles.spinner} /> Sending link...</> : <>Send reset link <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        )}
        <Link className={styles.backLink} to="/login"><ArrowLeft size={16} /> Back to sign in</Link>
      </section>
    </main>
  );
}

export default ForgotPassword;

