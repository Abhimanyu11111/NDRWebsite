import crypto from "crypto";

const getSecret = () => process.env.CAPTCHA_SECRET || process.env.JWT_SECRET;
const usedCaptchaTokens = new Map();
const CAPTCHA_TTL_MS = 3 * 60 * 1000;
const CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const cleanupUsedTokens = () => {
  const now = Date.now();
  for (const [token, expiresAt] of usedCaptchaTokens.entries()) {
    if (expiresAt <= now) usedCaptchaTokens.delete(token);
  }
};

const sign = (payload) => {
  const secret = getSecret();
  if (!secret) throw new Error("CAPTCHA_SECRET or JWT_SECRET is required");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

const randomCode = () => {
  return Array.from({ length: 6 }, () => CAPTCHA_ALPHABET[crypto.randomInt(0, CAPTCHA_ALPHABET.length)]).join("");
};

const escapeSvg = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const createCaptchaSvg = (code) => {
  const chars = [...code];
  const noise = Array.from({ length: 10 }, (_, index) => {
    const y1 = crypto.randomInt(8, 42);
    const y2 = crypto.randomInt(8, 42);
    const color = index % 2 === 0 ? "#94a3b8" : "#cbd5e1";
    return `<line x1="${crypto.randomInt(0, 30)}" y1="${y1}" x2="${crypto.randomInt(120, 160)}" y2="${y2}" stroke="${color}" stroke-width="1" opacity="0.55"/>`;
  }).join("");

  const text = chars.map((char, index) => {
    const x = 18 + index * 21;
    const y = crypto.randomInt(30, 39);
    const rotate = crypto.randomInt(-14, 15);
    return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})">${escapeSvg(char)}</text>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50" role="img" aria-label="captcha code">
    <rect width="160" height="50" rx="8" fill="#f8fafc"/>
    ${noise}
    <g font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#0f172a" letter-spacing="2">${text}</g>
    <path d="M8 39 C36 28, 55 47, 84 35 S127 28, 152 37" fill="none" stroke="#64748b" stroke-width="2" opacity="0.5"/>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

export const createCaptchaChallenge = () => {
  cleanupUsedTokens();
  const answer = randomCode();
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${answer}.${expiresAt}.${nonce}`;

  return {
    question: "Enter the code shown",
    image: createCaptchaSvg(answer),
    token: `${expiresAt}.${nonce}.${sign(payload)}`,
  };
};

export const verifyCaptchaChallenge = ({ token, answer }) => {
  if (!token || answer == null) return false;

  const [expiresAt, nonce, signature] = String(token).split(".");
  if (!expiresAt || !nonce || !signature || Number(expiresAt) < Date.now()) {
    return false;
  }

  cleanupUsedTokens();
  if (usedCaptchaTokens.has(token)) return false;

  const normalizedAnswer = String(answer).trim().toUpperCase();
  const expected = sign(`${normalizedAnswer}.${expiresAt}.${nonce}`);
  if (signature.length !== expected.length) return false;
  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (isValid) usedCaptchaTokens.set(token, Number(expiresAt));
  return isValid;
};
