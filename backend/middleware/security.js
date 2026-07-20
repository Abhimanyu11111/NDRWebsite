const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://ndr.dghindia.gov.in",
];

export const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions = {
  origin(origin, callback) {
    const allowlist = allowedOrigins.length ? allowedOrigins : DEFAULT_ALLOWED_ORIGINS;
    if (!origin || allowlist.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

// CCAvenue posts the encrypted payment result from its own origin. CORS is a
// browser-origin policy, not callback authentication, so only this exact
// server-to-server/form callback is exempt. The controller still validates the
// encrypted response, stored order, booking and amount before confirming it.
export const shouldBypassCors = (req) =>
  req.method === "POST" && req.path === "/api/payment/callback";

export const securityHeaders = (req, res, next) => {
  res.removeHeader("X-Powered-By");
  // Defense in depth: strip/blank any "Server" banner so the underlying
  // runtime/version can't be fingerprinted from the HTTP response.
  res.removeHeader("Server");
  res.setHeader("Server", "");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader(
    "Content-Security-Policy",
    // img-src allows data: URIs — the captcha endpoint returns its image as a
    // base64 data: URI (see utils/captcha.js), which a stricter default-src
    // would otherwise block from rendering in the browser.
    "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
  );

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/admin") ||
    ["/login", "/Register", "/registration", "/account", "/book-vdr"].includes(req.path)
  ) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
};

export const rejectRequestSmuggling = (req, res, next) => {
  const headerNames = req.rawHeaders
    .filter((_, index) => index % 2 === 0)
    .map((name) => name.toLowerCase());
  const contentLengthCount = headerNames.filter((name) => name === "content-length").length;
  const transferEncoding = String(req.headers["transfer-encoding"] || "").toLowerCase();

  if (
    contentLengthCount > 1 ||
    (req.headers["content-length"] && transferEncoding) ||
    (transferEncoding && transferEncoding !== "chunked")
  ) {
    return res.status(400).json({ success: false, message: "Malformed request" });
  }

  next();
};

export const blockUnsafeMethods = (req, res, next) => {
  if (["TRACE", "TRACK", "HEAD"].includes(req.method)) {
    return res.status(405).json({ success: false, message: "HTTP method not allowed" });
  }
  next();
};

// Characters commonly used to build HTML/script/template-injection payloads
// (<script>, "><img onerror=...>, {{7*7}}, etc). None of the app's free-text
// fields (name, company, address, block/data descriptions, notification
// reasons, ...) have a legitimate need for these, so they are rejected
// outright rather than sanitized/escaped.
const DANGEROUS_CHARS_RE = /[<>{}"]/;

// Fields exempt from the character-level check above, because the character
// is part of their legitimate value and the value is never rendered as HTML:
//  - password / currentPassword / newPassword / confirmPassword: users may
//    legitimately choose any of these characters as part of a strong
//    password; the value is only ever hashed or bcrypt-compared server-side.
//  - captchaAnswer: the CAPTCHA alphabet includes "?" (see utils/captcha.js).
//  - captchaToken / any *Token / hash / signature: opaque, app-issued
//    strings (HMAC hex digests, JWTs, ...), never user-authored free text.
const CHAR_CHECK_EXEMPT_KEY_RE = /password|captchaanswer|token|hash|signature/i;

const hasUnsafeInput = (value, depth = 0, skipCharCheck = false) => {
  if (depth > 8) return true;
  if (typeof value === "string") {
    if (value.length > 5000) return true;
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) return true;
    if (/<\s*script\b|javascript\s*:|data\s*:\s*text\/html/i.test(value)) return true;
    if (!skipCharCheck && DANGEROUS_CHARS_RE.test(value)) return true;
    return false;
  }
  if (Array.isArray(value)) return value.some((item) => hasUnsafeInput(item, depth + 1, skipCharCheck));
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) => {
      if (key.length > 100 || key.includes("\0") || key.startsWith("__proto__") || key === "constructor") {
        return true;
      }
      return hasUnsafeInput(item, depth + 1, CHAR_CHECK_EXEMPT_KEY_RE.test(key));
    });
  }
  return false;
};

export const validateRequestPayload = (req, res, next) => {
  if (hasUnsafeInput(req.body) || hasUnsafeInput(req.query) || hasUnsafeInput(req.params)) {
    return res.status(400).json({ success: false, message: "Invalid request payload" });
  }
  next();
};

export const requireHttpsInProduction = (req, res, next) => {
  const host = String(req.headers.host || "");
  const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";

  if (
    process.env.NODE_ENV === "production" &&
    !isLocalhost &&
    !isHttps
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
};
