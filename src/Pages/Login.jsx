import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Database,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import styles from "../Component/Styles/Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const navigate = useNavigate();

  const openHelpGuide = () => {
    const width = Math.min(1100, window.screen.availWidth - 40);
    const height = Math.min(820, window.screen.availHeight - 60);
    const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));

    window.open(
      "/documents/NDR-Help-User-Guide.pdf",
      "ndr-help-user-guide",
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );
  };

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/captcha`);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password || !captchaAnswer) {
      setError("Please enter your email, password and captcha answer.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password, captchaToken: captcha?.token, captchaAnswer },
        { withCredentials: true }
      );
      navigate("/book-vdr");
    } catch (requestError) {
      setError(requestError.response?.data?.msg || "Login failed. Please try again.");
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.formPanel}>
          <div className={styles.formWrap}>
            <header className={styles.formHeader}>
              <span className={styles.mobileLogo}><Database size={22} /></span>
              <p className={styles.kicker}>Welcome back</p>
              <h2>Sign in to your account</h2>
              <p>Enter your registered credentials to continue.</p>
            </header>

            {error && (
              <div className={styles.error} role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.field}>
                <label htmlFor="login-email">Email address</label>
                <div className={styles.inputWrap}>
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label htmlFor="login-password">Password</label>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
                <div className={styles.inputWrap}>
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    id="login-password"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="captcha-answer">Security verification (case-sensitive)</label>
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
                    id="captcha-answer"
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
                {loading ? <span className={styles.spinner} /> : <span>Sign in securely</span>}
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
                {loading && <span>Signing in...</span>}
              </button>
            </form>

            <div className={styles.registerPrompt}>
              <span>New to NDR?</span>
              <Link to="/Register">Create an organization account</Link>
            </div>

            <p className={styles.helpText}>
              Need assistance?{" "}
              <button type="button" className={styles.helpLink} onClick={openHelpGuide}>
                Visit the help centre
              </button>
            </p>
          </div>

          <footer className={styles.copyright}>
            © 2026 National Data Repository, Government of India
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Login;
