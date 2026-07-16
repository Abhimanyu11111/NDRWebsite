import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/axiosClient";
import styles from "../../Component/Styles/AdminLogin.module.css";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const navigate = useNavigate();

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const response = await api.get("/auth/captcha");
      setCaptcha(response.data.captcha);
      setCaptchaAnswer("");
    } catch {
      setError("Unable to load captcha. Please refresh the page.");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password || !captchaAnswer) {
      setError("Please enter your email, password and captcha answer.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/admin-login", {
        email,
        password,
        captchaToken: captcha?.token,
        captchaAnswer,
      });
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Invalid credentials. Please try again.");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.accent} />

        <div className={styles.content}>
          <header className={styles.header}>
            <span className={styles.shieldBadge}>
              <ShieldCheck size={24} aria-hidden="true" />
            </span>
            <span className={styles.portalTag}>Restricted portal</span>
            <h1>Administrator sign in</h1>
            <p>Use your authorized NDR administrator credentials to continue.</p>
          </header>

          {error && (
            <div className={styles.error} role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleLogin} autoComplete="off">
            <div className={styles.field}>
              <label htmlFor="admin-email">Admin email</label>
              <div className={styles.inputWrap}>
                <Mail size={18} aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@organization.gov.in"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password">Password</label>
              <div className={styles.inputWrap}>
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-captcha">Security verification (case-sensitive)</label>
              <div className={styles.captchaRow}>
                <div className={styles.captchaVisual} aria-live="polite">
                  {captcha?.image ? (
                    <img src={captcha.image} alt="Captcha verification code" />
                  ) : (
                    <span>{captcha?.question || "Loading captcha..."}</span>
                  )}
                </div>
                <button
                  className={styles.refreshButton}
                  type="button"
                  onClick={loadCaptcha}
                  disabled={loading || captchaLoading}
                  aria-label="Load a new captcha"
                >
                  <RefreshCw className={captchaLoading ? styles.rotating : ""} size={17} />
                  <span>New code</span>
                </button>
              </div>

              <div className={styles.inputWrap}>
                <ShieldCheck size={18} aria-hidden="true" />
                <input
                  id="admin-captcha"
                  type="text"
                  placeholder="Enter the code shown above"
                  value={captchaAnswer}
                  onChange={(event) => setCaptchaAnswer(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={6}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button className={styles.submitButton} type="submit" disabled={loading || captchaLoading}>
              {loading ? <span className={styles.spinner} /> : <ShieldCheck size={18} />}
              <span>{loading ? "Authenticating..." : "Access admin dashboard"}</span>
              {!loading && <ArrowRight className={styles.arrow} size={18} />}
            </button>
          </form>

          <div className={styles.restrictedNote}>
            <LockKeyhole size={15} aria-hidden="true" />
            <span>Restricted access. All sign-in attempts are securely monitored.</span>
          </div>

          <Link className={styles.userLoginLink} to="/login">Return to user login</Link>
        </div>

        <footer>© 2026 National Data Repository, Government of India</footer>
      </section>
    </main>
  );
}
